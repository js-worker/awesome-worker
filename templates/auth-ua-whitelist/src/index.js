const ALLOWED_UA = ['Mobile/15E148'];

async function handleRequest(request) {
  const userAgent = request.headers.get('User-Agent') || '';

  if (ALLOWED_UA.some(allowedUA => userAgent.includes(allowedUA))) {
    return await fetch(request);
  }
  return new Response(null, { status: 403 });
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});
