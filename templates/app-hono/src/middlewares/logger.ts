const getPath = (request: Request) => {
  const match = request.url.match(/^https?:\/\/[^/]+(\/[^?]*)/);
  return match ? match[1] : '';
};

const humanize = (times: string[]) => {
  const [delimiter, separator] = [',', '.'];
  const orderTimes = times.map(v => v.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, `$1${delimiter}`));
  return orderTimes.join(separator);
};

const time = (start: number) => {
  const delta = Date.now() - start;
  return humanize([delta < 1e3 ? `${delta}ms` : `${Math.round(delta / 1e3)}s`]);
};

function log(prefix: '<--' | '-->', method: string, path: string, status = 0, elapsed?) {
  const out = prefix === '<--' ? `${prefix} ${method} ${path}` : `${prefix} ${method} ${path} ${status} ${elapsed}`;
  console.log(out);
}

export const logger = () => {
  return async function logger(c, next) {
    const { method } = c.req;
    const path = getPath(c.req.raw);
    log('<--', method, path);
    const start = Date.now();
    await next();
    log('-->', method, path, c.res.status, time(start));
  };
};
