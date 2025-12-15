export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let pathname = url.pathname;

    // Serve static assets directly (images, fonts, etc)
    if (pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf)$/)) {
      return env.ASSETS.fetch(request);
    }

    // If the URL explicitly ends with .html, serve that HTML file
    if (pathname.endsWith('.html')) {
      return env.ASSETS.fetch(request);
    }

    // For all other routes (like /post/another or /), serve index.html
    url.pathname = '/index.html';
    return env.ASSETS.fetch(new Request(url, request));
  }
}
