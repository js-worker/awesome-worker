const REDIRECT = 'https://www.tencentcloud.com/';

async function handleEvent(event) {
  const { request } = event;
  const url = new URL(request.url);

  if (url.pathname === '/') {
    event.respondWith(Response.redirect(REDIRECT));
  }

  return;
}

addEventListener('fetch', handleEvent);
