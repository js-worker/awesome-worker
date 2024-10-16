const crypto = require('crypto');

const PK = '0123456789';

function generateSignedUrl(urlToSign) {
  const uid = 0;
  const random = 0;
  const timestamp = Math.floor(Date.now() / 1000);

  const toSign = `${urlToSign}-${timestamp}-${random}-${uid}-${PK}`;
  const signature = crypto.createHash('md5').update(toSign).digest('hex');
  const signedUrl = `?key=${timestamp}-${random}-${uid}-${signature}`;

  return signedUrl;
}

const urlToSign = '/resource/video/m3u8/demo-1.m3u8';

const signedUrl = generateSignedUrl(urlToSign);
console.log(signedUrl);
