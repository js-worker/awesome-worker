// Type C鉴权私钥，请自行设定并防止泄漏
const PK = 'YOUR_SECRET_KEY';
// 加密校验 key 的有效时间（秒）
const TTL = 1440;
const SUFFIX_LIST = ['.m3u8', '.ts'];

addEventListener('fetch', event => {
  handleEvent(event);
});

async function handleEvent(event) {
  try {
    const { request } = event;
    const urlInfo = new URL(request.url);
    const suffix = getSuffix(urlInfo.pathname);
    const pathParts = urlInfo.pathname.split('/');

    if (!SUFFIX_LIST.includes(suffix)) {
      return;
    }

    const checkResult = await checkTypeC(urlInfo);
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
        pathSign: {
          basePath: `/${pathParts.slice(3, -1).join('/')}`,
          ...checkResult.pathSign,
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

async function checkTypeC(urlInfo) {
  const pathnameParts = urlInfo.pathname.split('/');

  if (pathnameParts.length < 3) {
    return {
      flag: false,
      message: 'Invalid Sign Format',
    };
  }

  const md5hash = pathnameParts[1];
  const hexTimestamp = pathnameParts[2];
  const timestamp = parseInt(hexTimestamp, 16);
  const filename = pathnameParts.slice(3).join('/');
  const path = `/${filename}`;

  if (timestamp === undefined || md5hash === undefined) {
    return {
      flag: false,
      message: 'Invalid Sign Format',
    };
  }

  if (!isNumber(timestamp)) {
    return {
      flag: false,
      message: 'Sign Expired',
    };
  }

  if (Date.now() > (Number(timestamp) + TTL) * 1000) {
    return {
      flag: false,
      message: 'Sign Expired',
    };
  }

  const hash = await md5(`${PK}${path}${hexTimestamp}`);
  if (hash !== md5hash) {
    return {
      flag: false,
      message: 'Verify Sign Failed',
    };
  }

  return {
    flag: true,
    message: 'success',
    pathSign: {
      PK,
      hexTimestamp,
    },
  };
}

async function fetchM3u8({ request, pathSign }) {
  let response = null;
  request.headers.delete('Range');
  try {
    response = await fetch(request);
    if (response.status !== 200) {
      return response;
    }
  } catch (error) {
    console.log(error);
    return new Response('', {
      status: 504,
      headers: { 'X-Fetch-Err': 'Invalid Origin' },
    });
  }

  const content = await response.text();
  const lines = content.split('\n');

  const contentArr = await Promise.all(lines.map(line => rewriteLine({ line, pathSign })));

  return new Response(contentArr.join('\n'), response);
}

async function rewriteLine({ line, pathSign }) {
  const { PK, hexTimestamp } = pathSign;

  if (/^\s*$/.test(line)) {
    return line;
  }

  if (line.charAt(0) === '#') {
    // Process #EXT-X-MAP.
    if (line.startsWith('#EXT-X-MAP')) {
      const key = await createSignTypeC(pathSign, line);
      line = line.replace(/URI="([^"]+)"/, (matched, p1) => {
        return p1 ? matched.replace(p1, `/${key}/${hexTimestamp}${pathSign.basePath}/${p1}`) : matched;
      });
    }
    return line;
  }

  const key = await createSignTypeC(pathSign, line);
  return `/${key}/${hexTimestamp}${pathSign.basePath}/${line}`;
}

async function createSignTypeC(pathSign, line) {
  const { PK, hexTimestamp } = pathSign;
  const pathname = `${pathSign.basePath}/${line}`;

  const key = await md5(`${PK}${pathname}${hexTimestamp}`);

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
