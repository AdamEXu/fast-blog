import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import nunjucks from 'nunjucks';
import { minify as minifyJS } from 'terser';
import { minify as minifyHTML } from 'html-minifier-terser';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

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
    const slug = `/posts/${file.replace('.md', '')}.html`;

    return {
      title: metadata.title || slug,
      description: metadata.description || '',
      date: metadata.date || '',
      url: `/${slug}`,
      slug,
      content: html
    };
  });

  console.log(`found ${posts.length} posts`);

  const mainJS = readFileSync('main.js', 'utf-8');
  const minifiedJS = await minifyJS(mainJS, {
    compress: true,
    mangle: true
  });

  if (!minifiedJS.code) {
    throw new Error('js couldnt be minified :(');
  }

  console.log('js minified');

  const css = readFileSync('style.css', 'utf-8');
  console.log('found the css file');

  let html = readFileSync('index.html', 'utf-8');

  html = html.replace(
    /<link rel="stylesheet" href="\/style\.css">/,
    `<style>${css}</style>`
  );

  html = html.replace(
    /<script src="\/main\.js"><\/script>/,
    `<script>${minifiedJS.code}</script>`
  );

  nunjucks.configure({ autoescape: false });

  const templateData = {
    'blog_name': config['blog-name'],
    'blog_description': config['blog-description'],
    'blog_url': config['blog-url'],
    'logo_url': config['blog-logo'],
    links: config['other-links'],
    posts: posts
  };

  const rendered = nunjucks.renderString(html, templateData);
  console.log('done with filling in the template');

  const minifiedHTML = await minifyHTML(rendered, {
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true,
    minifyJS: true
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

  posts.forEach(post => {
    const postHTML = post.content;
    writeFileSync(`dist${post.slug}`, postHTML);
  });
  console.log(`done writing ${posts.length} html codes... and were done!!! yippeeee`);
}

build().catch(err => {
  console.error('build failed:', err);
  process.exit(1);
});
