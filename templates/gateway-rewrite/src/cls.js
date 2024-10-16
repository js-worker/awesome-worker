import { AsyncClient, Content, LogGroup, LogItem, PutLogsRequest } from '@tencent/edgefunction-cls-sdk';

/** CONFIG START */

const TENCENT_SECRET_ID = 'xxxxx';
const TENCENT_SECRET_KEY = 'xxxxx';

const CLS_END_POINT = 'ap-xxxxx.cls.tencentcs.com';
const CLS_TOPIC_ID = 'xxxxx';

/** CONFIG END */

const clsAsyncClient = new AsyncClient({
  endpoint: CLS_END_POINT,
  secretId: TENCENT_SECRET_ID,
  secretKey: TENCENT_SECRET_KEY,
  sourceIp: 'edge',
  retry_times: 1,
});

async function clsUpload(data) {
  const logGroup = new LogGroup();
  const logItem = new LogItem();
  const logTime = Math.floor(Date.now() / 1000);
  const logContent = new Content('__CONTENT__', JSON.stringify(data));

  logItem.setTime(logTime);
  logItem.pushBack(logContent);
  logGroup.addLogs(logItem);

  const clsRequest = new PutLogsRequest(CLS_TOPIC_ID, logGroup);
  const clsResponse = await clsAsyncClient.PutLogs(clsRequest);

  return console.log(`cls upload response: ${JSON.stringify(clsResponse)}`);
}

async function doClsUpload(request) {
  try {
    const data = await request.clone().text();
    await clsUpload(data);
  } catch (err) {
    console.error(`cls upload error: ${err}`);
  }
}

async function handleRequest(event) {
  const { request } = event;
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json') || contentType.includes('text/plain')) {
    // 用于通知边缘函数等待 Promise 完成，可延长事件处理的生命周期，不阻塞 fetch(request) 的返回。
    event.waitUntil(doClsUpload(request));
  }

  return;
}

addEventListener('fetch', handleRequest);
