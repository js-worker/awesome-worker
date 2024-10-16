const SECRET_KEY = 'YOUR_SECRET_KEY';

async function handleRequest(request) {
  const url = new URL(request.url);
  const authKey = url.searchParams.get('auth_key');

  if (!authKey) {
    return new Response(null, { status: 401 });
  }

  const [timestamp, nonce, signature] = authKey.split('-');
  const now = Math.floor(Date.now() / 1000);

  if (now > Number(timestamp)) {
    return new Response(null, { status: 401 });
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(`${url.pathname}-${timestamp}-${nonce}-${SECRET_KEY}`);
  const hashBuffer = await crypto.subtle.digest('MD5', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  if (signature !== expectedSignature) {
    return new Response(null, { status: 401 });
  }

  return await fetch(request);
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});
