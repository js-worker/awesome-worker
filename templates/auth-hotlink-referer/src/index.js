// 重定向 url
const HOMEPAGE_URL = '...';

async function handleRequest(request) {
  const referer = request.headers.get('Referer');

  if (!referer) {
    return new Response(null, {
      headers: { Location: HOMEPAGE_URL },
      status: 302,
    });
  }

  const urlInfo = new URL(request.url);
  const isHostMatch = new RegExp(`^http?:\\/\\/${urlInfo.hostname}`).test(referer);

  if (!isHostMatch) {
    return new Response(null, {
      headers: { Location: HOMEPAGE_URL },
      status: 302,
    });
  }

  return await fetch(request);
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});
