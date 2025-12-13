// capture all links to /blog-post or whatever and make them not redirect

const Links = document.querySelectorAll('a[href^="/"]');
Links.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    // push the url to the history stack
    // history.pushState({}, '', link.href);
    // alert('You clicked a link, this would show the post (without redirecting and thus being faster)');
  });
});


// on hover of a link AND it is a blog post link, fetch the html for the post and put it into the post-content div
const postLinks = document.getElementsByClassName('post-link');
for (const link of postLinks) {
  link.addEventListener('mouseover', (event) => {
    fetch(link.href)
      .then(response => response.text())
      .then(data => {
        const postContent = link.querySelector('.post-content');
        postContent.innerHTML = data;
      });
  });
}