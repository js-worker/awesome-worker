const crypto = require('crypto');

const SECRET_KEY = 'YOUR_SECRET_KEY';

function generateSignedUrl(urlToSign, secretKey, duration = 1800) {
  const timestamp = Math.floor(Date.now() / 1000) + duration;

  const toSign = `${urlToSign}-${timestamp}-0-${secretKey}`;
  const signature = crypto.createHash('md5').update(toSign).digest('hex');
  const signedUrl = `${urlToSign}?auth_key=${timestamp}-0-${signature}`;

  return signedUrl;
}

const urlToSign = '/TencentCloud.svg';
const signedUrl = generateSignedUrl(urlToSign, SECRET_KEY);

console.log(signedUrl);
