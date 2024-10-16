const REDIRECT = 'https://tencent.com/';

async function handleEvent(event) {
  const { request } = event;
  const url = new URL(request.url);

  const res = await fetch(`${REDIRECT}${url.pathname}${url.search}`, request);
  event.respondWith(res);
}

addEventListener('fetch', handleEvent);
