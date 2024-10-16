// RSA 公钥
const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
...
-----END PUBLIC KEY-----`;

function stringToArrayBuffer(str) {
  const buffer = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buffer);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buffer;
}

function urlSafeBase64ToBase64(urlSaveBase64) {
  return urlSaveBase64.replace(/-/g, '+').replace(/_/g, '=').replace(/~/g, '/');
}

function base64ToString(base64) {
  return atob(base64);
}

function pemToArrayBuffer(pem) {
  const pemContent = pem.split('\n').slice(1, -1).join('');
  const pemContentString = base64ToString(pemContent);

  return stringToArrayBuffer(pemContentString);
}

function getCookieValue(cookies, key) {
  const cookiesArray = cookies.split('; ');

  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < cookiesArray.length; i++) {
    const cookie = cookiesArray[i];
    const cookieParts = cookie.split('=');

    if (cookieParts[0] === key) {
      return cookieParts[1];
    }
  }

  return null;
}

async function verifySignature(request) {
  const cookies = request.headers.get('Cookie');
  const eoSignature = getCookieValue(cookies, 'EO-Signature');
  const eoPolicy = getCookieValue(cookies, 'EO-Policy');

  if (!eoSignature || !eoPolicy) {
    return null;
  }

  const signatureBase64 = urlSafeBase64ToBase64(eoSignature);
  const signatureString = base64ToString(signatureBase64);
  const signatureBuffer = stringToArrayBuffer(signatureString);

  const policyBase64 = urlSafeBase64ToBase64(eoPolicy);
  const policyString = base64ToString(policyBase64);
  const policyBuffer = stringToArrayBuffer(policyString);

  const publicKeyBuffer = pemToArrayBuffer(PUBLIC_KEY_PEM);

  const publicKey = await crypto.subtle.importKey(
    'spki',
    publicKeyBuffer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-1',
    },
    true,
    ['verify'],
  );

  const signatureValid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', publicKey, signatureBuffer, policyBuffer);

  if (!signatureValid) {
    return null;
  }

  return JSON.parse(policyString);
}

function verifyPolicy(request, policy) {
  const { pathname } = new URL(request.url);
  const { Statement } = policy;

  const now = Math.floor(Date.now() / 1000);

  for (const statement of Statement) {
    if (statement.Resource === pathname) {
      const dateGreaterThan = statement.Condition.DateGreaterThan.EpochTime;
      const dateLessThan = statement.Condition.DateLessThan.EpochTime;

      if (now > dateGreaterThan && now < dateLessThan) {
        return true;
      }
      return false;
    }
  }

  return true;
}

async function handleEvent(event) {
  const { request } = event;

  const policy = await verifySignature(request);
  if (!policy) {
    return event.respondWith(new Response(null, { status: 401 }));
  }
  const valid = verifyPolicy(request, policy);
  if (!valid) {
    return event.respondWith(new Response(null, { status: 403 }));
  }

  const res = await fetch(request);
  event.respondWith(res);
}

addEventListener('fetch', event => {
  handleEvent(event);
});
