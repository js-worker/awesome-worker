// 鉴权私钥，请自行设定并防止泄漏
const PK = '0123456789';
// 签名的有效时间（秒）
const TTL = 14400;

const KEY_NAME = 'key';
const SUFFIX_LIST = ['.m3u8', '.ts'];

addEventListener('fetch', event => {
  handleEvent(event);
});

async function handleEvent(event) {
  try {
    const { request } = event;
    const urlInfo = new URL(request.url);
    const suffix = getSuffix(urlInfo.pathname);

    if (!SUFFIX_LIST.includes(suffix)) {
      return;
    }

    const checkResult = await checkTypeA(urlInfo);
    if (!checkResult.flag) {
      const response = new Response(null, {
        status: 403,
        headers: {
          'X-Auth-Err': checkResult.message,
        },
      });
      return event.respondWith(response);
    }

    if (suffix === '.m3u8') {
      const response = await fetchM3u8({
        request,
        querySign: {
          basePath: urlInfo.pathname.substring(0, urlInfo.pathname.lastIndexOf('/')),
          ...checkResult.querySign,
        },
      });
      return event.respondWith(response);
    }

    if (suffix === '.ts') {
      return;
    }
  } catch (error) {
    return new Response(null, { status: 590 });
  }

  return;
}

async function checkTypeA(urlInfo) {
  const sign = urlInfo.searchParams.get(KEY_NAME) || '';
  const elements = sign.split('-');

  if (elements.length !== 4) {
    return {
      flag: false,
      message: 'Invalid Sign Format',
    };
  }

  const [ts, rand, uid, md5hash] = elements;
  if (ts === undefined || rand === undefined || uid === undefined || md5hash === undefined) {
    return {
      flag: false,
      message: 'Invalid Sign Format',
    };
  }

  if (!isNumber(ts)) {
    return {
      flag: false,
      message: 'Sign Expired',
    };
  }

  if (Date.now() > (Number(ts) + TTL) * 1000) {
    return {
      flag: false,
      message: 'Sign Expired',
    };
  }

  const hash = await md5([urlInfo.pathname, ts, rand, uid, PK].join('-'));
  if (hash !== md5hash) {
    return {
      flag: false,
      message: 'Verify Sign Failed',
    };
  }
  return {
    flag: true,
    message: 'success',
    querySign: {
      rand,
      uid,
      md5hash,
      ts,
    },
  };
}

async function fetchM3u8({ request, querySign }) {
  let response = null;
  request.headers.delete('Range');

  try {
    response = await fetch(request);
    if (response.status !== 200) {
      return response;
    }
  } catch (error) {
    return new Response('', {
      status: 504,
      headers: { 'X-Fetch-Err': 'Invalid Origin' },
    });
  }

  const content = await response.text();
  const lines = content.split('\n');

  const contentArr = await Promise.all(lines.map(line => rewriteLine({ line, querySign })));

  return new Response(contentArr.join('\n'), {
    headers: response.headers,
  });
}

async function rewriteLine({ line, querySign }) {
  if (/^\s*$/.test(line)) {
    return line;
  }

  if (line.charAt(0) === '#') {
    if (line.startsWith('#EXT-X-MAP')) {
      const key = await createSign(querySign, line);
      line = line.replace(/URI="([^"]+)"/, (matched, p1) => {
        return p1 ? matched.replace(p1, `${p1}?key=${key}`) : matched;
      });
    }
    return line;
  }

  const key = await createSign(querySign, line);

  return `${line}?${KEY_NAME}=${key}`;
}

async function createSign(querySign, line) {
  const { ts, rand, uid = 0 } = querySign;
  const pathname = `${querySign.basePath}/${line}`;

  const md5hash = await md5([pathname, ts, rand, uid, PK].join('-'));
  const key = [ts, rand, uid, md5hash].join('-');

  return key;
}

function getSuffix(pathname) {
  const suffix = pathname.match(/\.([^\.]+)$/);
  return suffix ? `.${suffix[1]}` : null;
}

function isNumber(num) {
  return Number.isInteger(Number(num));
}

function bufferToHex(arr) {
  return Array.prototype.map.call(arr, x => (x >= 16 ? x.toString(16) : `0${x.toString(16)}`)).join('');
}

async function md5(text) {
  const buffer = await crypto.subtle.digest('MD5', TextEncoder().encode(text));
  return bufferToHex(new Uint8Array(buffer));
}
