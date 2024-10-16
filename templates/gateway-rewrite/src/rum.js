const AEGIS_ID = 'okl8RhbrgpOZomOqPQ';

async function handleEvent(event) {
  const { request } = event;
  const response = await fetch(request);

  if (response.status !== 200 || response.headers.get('Content-Type') !== 'text/html') {
    return response;
  }

  const aegisScript = `<script src="https://tam.cdn-go.cn/aegis-sdk/latest/aegis.min.js"></script>
<script>
  const aegis = new Aegis({
    id: '${AEGIS_ID}',
    env: Aegis.environment.gray,
    reportApiSpeed: true,
    reportAssetSpeed: true,
    webVitals: true,
    spa: true,
    hostUrl: 'https://rumt-zh.com',
  });
</script>
`;
  let resBody = await response.clone().text();
  resBody = resBody.replace('</title>', `</title>\n${aegisScript}`);

  const modifiedRes = new Response(resBody, response);
  event.respondWith(modifiedRes);
}

addEventListener('fetch', handleEvent);
