export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Serve static assets directly (images, fonts, etc)
    // CSS and JS are inlined, so no need to serve them
    if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf)$/)) {
      return env.ASSETS.fetch(request);
    }

    // For all other routes, serve index.html (SPA routing)
    const indexUrl = new URL(request.url);
    indexUrl.pathname = '/index.html';

    return env.ASSETS.fetch(new Request(indexUrl, request));
  }
}
