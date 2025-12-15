import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import nunjucks from 'nunjucks';
import { minify as minifyJS } from 'terser';
import { minify as minifyHTML } from 'html-minifier-terser';
import MarkdownIt from 'markdown-it';
import { minify as minifyCSS } from 'csso';

const md = new MarkdownIt();

// Simple CSS class renamer
const classNameMap: Record<string, string> = {};
let classCounter = 0;

function generateShortClassName(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  let num = classCounter++;
  
  if (num === 0) return 'a';
  
  while (num >= 0) {
    result = chars[num % chars.length] + result;
    num = Math.floor(num / chars.length) - 1;
  }
  
  return result;
}

function extractAndRenameClasses(css: string): string {
  // Find all class selectors
  const classRegex = /\.([a-zA-Z_-][a-zA-Z0-9_-]*)/g;
  let match;
  
  while ((match = classRegex.exec(css)) !== null) {
    const className = match[1];
    if (!classNameMap[className]) {
      classNameMap[className] = generateShortClassName();
    }
  }
  
  // Replace class names in CSS
  let result = css;
  Object.keys(classNameMap).forEach(original => {
    const shortened = classNameMap[original];
    result = result.replace(new RegExp(`\\.${original}\\b`, 'g'), `.${shortened}`);
  });
  
  return result;
}

function renameClassesInHTML(html: string): string {
  let result = html;

  // Replace class attributes
  Object.keys(classNameMap).forEach(original => {
    const shortened = classNameMap[original];

    // Match class="original" or class="other original another"
    result = result.replace(
      new RegExp(`class="([^"]*\\s)?${original}(\\s[^"]*)?`, 'g'),
      (match, before = '', after = '') => {
        const beforeTrimmed = before.trim();
        const afterTrimmed = after.trim();
        const parts = [beforeTrimmed, shortened, afterTrimmed].filter(Boolean);
        return `class="${parts.join(' ')}`;
      }
    );

    // Also handle class='...'
    result = result.replace(
      new RegExp(`class='([^']*\\s)?${original}(\\s[^']*)?`, 'g'),
      (match, before = '', after = '') => {
        const beforeTrimmed = before.trim();
        const afterTrimmed = after.trim();
        const parts = [beforeTrimmed, shortened, afterTrimmed].filter(Boolean);
        return `class='${parts.join(' ')}`;
      }
    );
  });

  return result;
}

function renameClassesInJS(js: string): string {
  let result = js;

  // Replace class references in querySelector, querySelectorAll, getElementsByClassName, etc.
  Object.keys(classNameMap).forEach(original => {
    const shortened = classNameMap[original];

    // Replace '.classname' in querySelector/querySelectorAll
    result = result.replace(
      new RegExp(`\\.${original}(['"\`])`, 'g'),
      `.${shortened}$1`
    );

    // Replace 'classname' in getElementsByClassName
    result = result.replace(
      new RegExp(`getElementsByClassName\\((['"\`])${original}\\1`, 'g'),
      `getElementsByClassName($1${shortened}$1`
    );
  });

  return result;
}

async function build() {
  console.log('starting build');

  const config = JSON.parse(readFileSync('config.json', 'utf-8'));

  const postsDir = 'posts';
  const postFiles = readdirSync(postsDir).filter(file => file.endsWith('.md'));

  const posts = postFiles.map(file => {
    const content = readFileSync(join(postsDir, file), 'utf-8');

    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    let metadata: any = {};
    let markdownContent = content;

    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      markdownContent = frontmatterMatch[2];

      frontmatter.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length) {
          metadata[key.trim()] = valueParts.join(':').trim();
        }
      });
    }

    const html = md.render(markdownContent);
    const postName = file.replace('.md', '');
    const slug = `/post/${postName}`;  // Pretty URL for links
    const filePath = `/posts/${postName}.html`;  // Where the HTML file is stored

    let metadata_formatted: any = {};
    Object.keys(metadata).forEach(key => {
      if (key === 'tags') {
        metadata_formatted[key] = metadata[key].split(',');
      } else {
        metadata_formatted[key] = metadata[key].replace(/"/g, '');
      }
    });

    return {
      slug,
      filePath,
      content: html,
      ...metadata_formatted
    };
  });

  console.log(`found ${posts.length} posts`);

  // Read and process CSS first to build classNameMap
  const css = readFileSync('style.css', 'utf-8');

  // Rename classes first
  const renamedCSS = extractAndRenameClasses(css);

  // Then minify
  const minified = minifyCSS(renamedCSS);
  const minifiedCSS = minified.css;

  console.log('css minified and classes renamed');
  console.log(`class mappings: ${JSON.stringify(classNameMap, null, 2)}`);

  // Aggressively minify JS (after renaming classes to match CSS)
  const mainJS = readFileSync('main.js', 'utf-8');
  const renamedJS = renameClassesInJS(mainJS);
  const minifiedJS = await minifyJS(renamedJS, {
    compress: {
      dead_code: true,
      drop_console: false,
      drop_debugger: true,
      passes: 3,
      unsafe: true,
      unsafe_comps: true,
      unsafe_math: true,
      unsafe_proto: true,
      unsafe_regexp: true,
      booleans_as_integers: true
    },
    mangle: {
      toplevel: true,
      properties: {
        regex: /^_/
      }
    },
    format: {
      comments: false
    }
  });

  if (!minifiedJS.code) {
    throw new Error('js couldnt be minified :(');
  }

  console.log('js minified');

  let html = readFileSync('index.html', 'utf-8');

  nunjucks.configure({ autoescape: false });

  const templateData = {
    'blog_name': config['blog-name'],
    'blog_description': config['blog-description'],
    'blog_url': config['blog-url'],
    'logo_url': config['blog-logo'],
    links: config['other-links'],
    posts: posts
  };

  // Render template first
  let rendered = nunjucks.renderString(html, templateData);

  // Rename classes in HTML to match CSS
  rendered = renameClassesInHTML(rendered);

  // Inline CSS and JS
  rendered = rendered.replace(
    /<link rel="stylesheet" href="\/style\.css">/,
    `<style>${minifiedCSS}</style>`
  );

  rendered = rendered.replace(
    /<script src="\/main\.js"><\/script>/,
    `<script>${minifiedJS.code}</script>`
  );

  console.log('done with filling in the template');

  // Minify HTML
  const minifiedHTML = await minifyHTML(rendered, {
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true,
    minifyJS: true,
    removeAttributeQuotes: true,
    removeRedundantAttributes: true,
    removeEmptyAttributes: true,
    sortAttributes: true,
    sortClassName: true,
    collapseBooleanAttributes: true,
    decodeEntities: true,
    removeOptionalTags: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true
  });

  console.log('minified html');

  if (!existsSync('dist')) {
    mkdirSync('dist', { recursive: true });
  }

  writeFileSync('dist/index.html', minifiedHTML);
  console.log('finished writing the html file');

  if (!existsSync('dist/posts')) {
    mkdirSync('dist/posts', { recursive: true });
  }

  for (const post of posts) {
    let postHTML = renameClassesInHTML(post.content);
    const minifiedPost = await minifyHTML(postHTML, {
      collapseWhitespace: true,
      minifyCSS: true,
      removeComments: true
    });
    writeFileSync(`dist${post.filePath}`, minifiedPost);
  }
  
  console.log(`done writing ${posts.length} html codes... and were done!!! yippeeee`);
  console.log(`${Object.keys(classNameMap).length} classes renamed`);
}

build().catch(err => {
  console.error('build failed:', err);
  process.exit(1);
});