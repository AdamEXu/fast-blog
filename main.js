// if ?sa=1 then skip all animation
const animate = !new URLSearchParams(window.location.search).get('sa');

// capture all links to /blog-post or whatever and make them not redirect

let originalUrl = '';

function openPost(ele, url, a) {
  closeAllPosts(a);
  const postContent = ele.querySelector('.post-content');
  const postMorph = ele.querySelector('.post-morph');
  const rect = ele.getBoundingClientRect();
  ele.style.position = 'fixed';
  // ele.style.top = '0';
  // ele.style.left = '0';
  // calculate elements position on screen and make it look like it is in the same place and size (width)
  ele.style.top = `${rect.top}px`;
  ele.style.left = `${rect.left}px`;
  ele.style.width = `${rect.width}px`;
  ele.style.height = `${rect.height}px`;
  // don't show overflow
  ele.style.overflow = 'hidden';
  // add spacer where element used to be to keep layout the same
  const spacer = document.createElement('div');
  spacer.style.height = `${rect.height}px`;
  ele.parentNode.insertBefore(spacer, ele);
  // return;
  // now we make it stuck in the :active state and remove the href from the link
  // ele is the post-link
  // store the original url
  originalUrl = ele.href;
  ele.href = '';
  ele.style.backgroundColor = 'var(--background)';
  postMorph.style.backgroundColor = 'var(--background)';
  postMorph.style.color = 'var(--text)';
  postMorph.style.border = 'var(--accent) 0 solid';
  postMorph.style.height = '100%';
  postMorph.style.overflow = 'auto';

  // now we set to transition the below properties
  if (a) {
    ele.style.transition = 'top 0.2s ease, left 0.2s ease, width 0.2s ease, height 0.2s ease';
  }
  // now we animate the post morph to take up the whole screen except for the header
  const headerHeight = document.querySelector('.blog-header').offsetHeight;
  ele.style.top = `${headerHeight}px`;
  ele.style.left = '0';
  ele.style.width = '100vw';
  // now get the post content from the url and put it into the post-content div (if it's not already there)
  if (postContent.innerHTML === '') {
    // Convert /post/name to /posts/name.html
    const fetchUrl = url.replace('/post/', '/posts/') + '.html';
    fetch(fetchUrl)
      .then(response => response.text())
      .then(data => {
        postContent.innerHTML = data;
      });
  }
  // and we now set the height of ele to the screen height minus the header height and increase the z index to be on top of everything else
  ele.style.height = `${window.innerHeight - headerHeight}px`;
  ele.style.zIndex = '100';
  ele.style.backgroundColor = 'var(--background)';
  // now we need to calculate what the height of the post content would be if we set height to 'auto' and set it to that (browsers don't animate height: auto)
  postContent.style.display = 'block';
  postContent.style.height = 'auto';
  postContent.style.opacity = '0';
  const postContentHeight = postContent.offsetHeight;
  postContent.style.height = '0';
  postContent.style.opacity = '1';
  postContent.style.display = 'block';
  // now we animate the height
  if (a) {
    postContent.style.transition = 'height 0.2s ease';
  }
  postContent.style.height = `${postContentHeight}px`;
  setTimeout(() => {
    postContent.style.height = 'auto';
    postContent.style.transition = '';
  }, 200*(a ? 1 : 0));
}

function closeAllPosts(a) {
  // Find all open posts (fixed position post-links)
  const openPosts = document.querySelectorAll('a[style*="position: fixed"]');

  console.log(`closing ${openPosts.length} posts`);
  
  openPosts.forEach(ele => {
    console.log(`closing post with title ${ele.querySelector('h2').innerText}`);
    const postContent = ele.querySelector('.post-content');
    const postMorph = ele.querySelector('.post-morph');
    
    // Find and remove the spacer that was created
    const spacer = ele.previousElementSibling;
    if (spacer && spacer.style.height) {
      const originalRect = {
        top: parseFloat(spacer.getBoundingClientRect().top),
        left: parseFloat(spacer.getBoundingClientRect().left),
        width: parseFloat(spacer.offsetWidth),
        height: parseFloat(spacer.style.height)
      };
      
      // Animate post content closing
      if (a) {
        postContent.style.transition = 'height 0.2s ease';
      }
      postContent.style.height = '0';
      postContent.style.overflow = 'hidden';
      
      // Animate element back to original position
      if (a) {
        ele.style.transition = 'top 0.2s ease, left 0.2s ease, width 0.2s ease, height 0.2s ease, border 0.2s ease, background-color 0.2s ease';
      }
      ele.style.top = `${originalRect.top}px`;
      ele.style.left = `${originalRect.left}px`;
      ele.style.width = `${originalRect.width}px`;
      ele.style.height = `${originalRect.height}px`;
      ele.style.overflow = 'hidden';
      postMorph.style.border = 'var(--text) 4px solid';
      postMorph.style.backgroundColor = 'var(--text)';
      postMorph.style.color = 'var(--background)';
      
      // After animation completes, clean up
      // After animation completes, clean up ONLY the positioning/animation styles
      setTimeout(() => {
        ele.style = '';
        postMorph.style = '';
        postContent.style = 'height: 0; overflow: hidden;';
        
        // Restore the href
        ele.href = originalUrl;
        
        // Remove the spacer
        spacer.remove();
      }, 200 * (a ? 1 : 0));
    }
  });
}

const internalLinks = Array.from(document.querySelectorAll('a[href]')).filter(isInternalLink);

internalLinks.forEach(link => {
  link.addEventListener('click', handleInternalLinkClick);
});

function isInternalLink(link) {
  try {
    const url = new URL(link.getAttribute('href'), window.location.href);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
}

function handleInternalLinkClick(event) {
  const link = event.currentTarget;
  const url = new URL(link.href);

  // Let browser handle non-page navigations
  if (shouldBypassRouter(url)) return;

  event.preventDefault();

  if (isPostLink(url)) {
    navigateToPost(link, url);
    return;
  }

  if (isHomeLink(url)) {
    navigateHome();
    return;
  }
}

function shouldBypassRouter(url) {
  return (
    url.hash ||
    url.protocol !== 'http:' && url.protocol !== 'https:'
  );
}

function isPostLink(url) {
  return url.pathname.includes('/post/');
}

function isHomeLink(url) {
  return url.pathname === '/';
}

function navigateToPost(link, url) {
  const pathname = url.pathname.replace('.html', '');
  const search = window.location.search;

  history.pushState({}, '', `${pathname}${search}`);
  // openPost(link, url.href, animate);
  renderPostFromURL(url, animate);
}

function navigateHome() {
  const search = window.location.search;
  history.pushState({}, '', `/${search}`);
  closeAllPosts(animate);
}


// on hover of a link AND it is a blog post link, fetch the html for the post and put it into the post-content div
const postLinks = document.getElementsByClassName('post-link');
for (const link of postLinks) {
  link.addEventListener('mouseover', (event) => {
    // Convert /post/name to /posts/name.html
    const fetchUrl = link.href.replace('/post/', '/posts/') + '.html';
    fetch(fetchUrl)
      .then(response => response.text())
      .then(data => {
        const postContent = link.querySelector('.post-content');
        postContent.innerHTML = data;
      });
  });
}

// set margin top of home container to height of header
// const headerHeight = document.querySelector('.blog-header').offsetHeight;
// document.querySelector('.home-container').style.marginTop = `${headerHeight}px`;

function onLoad() {
  const headerHeight = document.querySelector('.blog-header').offsetHeight;
  document.querySelector('.home-container').style.marginTop = `${headerHeight}px`;

  handleRouteChange(false); // always instantly render post
}

window.onload = onLoad;

function handleRouteChange(a = animate) {
  const url = new URL(window.location.href);

  if (isPostLink(url)) {
    renderPostFromURL(url, a);
    return;
  }

  if (isHomeLink(url)) {
    closeAllPosts(animate);
    return;
  }
}

function renderPostFromURL(url) {
  const postLink = document.querySelector(`a[href="${url.pathname}"]`);
  if (postLink) {
    openPost(postLink, url.href, animate);
  }
}

window.addEventListener('popstate', handleRouteChange);

