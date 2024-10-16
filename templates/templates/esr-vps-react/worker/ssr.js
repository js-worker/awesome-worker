import { renderPage } from 'vite-plugin-ssr/server';

export { handleSsr };

async function handleSsr(url) {
  const pageContextInit = {
    urlOriginal: url,
  };
  const pageContext = await renderPage(pageContextInit);
  const { httpResponse } = pageContext;
  if (!httpResponse) {
    return null;
  }
  const { body, statusCode, contentType } = httpResponse;
  return new Response(body, {
    headers: { 'content-type': contentType },
    status: statusCode,
  });
}