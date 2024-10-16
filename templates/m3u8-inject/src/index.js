addEventListener('fetch', async event => {
  const res = await handleEvent(event);
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', '*');
  event.respondWith(res);
});

async function fetchOrigin(request) {
  let response = null;

  try {
    response = await fetch(request);
  } catch (err) {
    response = new Response(null, {
      status: 591,
      headers: { 'X-Fetch-Debug': `Fetch Origin Error: ${err?.message}` },
    });
  }

  return response;
}

async function handleEvent(event) {
  try {
    const { request } = event;
    const urlInfo = new URL(request.url);

    const suffix = getSuffix(urlInfo.pathname);

    if (suffix === '.m3u8') {
      return await fetchM3u8(request);
    }

    return await fetchOrigin(request);
  } catch (err) {
    return new Response(err?.message, {
      status: 590,
      headers: {
        'X-M3U8-Debug': `Unexpected Error: ${err?.message}`,
      },
    });
  }
}

async function fetchM3u8(request) {
  request.headers.delete('Accept-Encoding');

  const response = await fetchOrigin(request);
  if (response.status !== 200) {
    return response;
  }

  const originalM3u8 = await response.text();

  const adM3u8 = `#EXTINF:10.000000,
http://m3u8-1251557890.cos.ap-guangzhou.myqcloud.com/apple_watch_apple_watch_hermes184006680.ts
#EXTINF:10.000000,
http://m3u8-1251557890.cos.ap-guangzhou.myqcloud.com/apple_watch_apple_watch_hermes184006681.ts
#EXTINF:10.000000,
http://m3u8-1251557890.cos.ap-guangzhou.myqcloud.com/apple_watch_apple_watch_hermes184006682.ts
#EXT-X-DISCONTINUITY`;

  const modifiedM3u8 = originalM3u8.replace('#EXT-X-MEDIA-SEQUENCE:0', `#EXT-X-MEDIA-SEQUENCE:0\n${adM3u8}`);

  return new Response(modifiedM3u8, response);
}

function getSuffix(pathname) {
  const suffix = pathname.match(/\.m3u8|\.ts$/);
  return suffix ? suffix[0] : null;
}
