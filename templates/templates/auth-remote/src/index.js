// 鉴权 url
const AUTH_URL = '...';

async function handleRequest(request) {
  const checkAuthRes = await fetch(AUTH_URL, {
    headers: request.headers,
  });
  if (checkAuthRes.status === 200) {
    return await fetch(request);
  }
  return new Response(null, {
    status: checkAuthRes.status,
    statusText: checkAuthRes.statusText,
  });
}

addEventListener('fetch', e => {
  e.respondWith(handleRequest(e.request));
});
