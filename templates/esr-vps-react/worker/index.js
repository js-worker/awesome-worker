import { handleSsr } from './ssr';

addEventListener('fetch', event => {
  try {
    event.respondWith(handleFetchEvent(event));
  } catch (e) {
    console.error(e.stack);
    event.respondWith(new Response('Internal Error', { status: 500 }));
  }
});

async function handleFetchEvent(event) {
  if (!isAssetUrl(event.request.url)) {
    try {
      const response = await handleSsr(event.request.url);
      if (response !== null) {
        return response;
      }
      return new Response(`handleSsr return ${response}`);
    } catch (e) {
      return new Response(`handleFetchEvent Error ${e}`, { status: 500 });
    }
  }
  // 静态资源直接回源
  return fetch(event.request);
}

function isAssetUrl(url) {
  const { pathname } = new URL(url);
  return pathname.startsWith('/assets/');
}
