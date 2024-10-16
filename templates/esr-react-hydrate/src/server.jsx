import React from 'react';
import { renderToString } from 'react-dom/server.browser';
import { StaticRouter } from 'react-router-dom/server';

import App from './App';
import logger from './utils/logger';

async function handleEvent(event) {
  try {
    const url = new URL(event.request.url);
    const path = url.pathname;

    const html = renderToString(
      <StaticRouter location={path}>
        <App />
      </StaticRouter>,
    );

    const res = new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });

    event.respondWith(res);
  } catch (err) {
    logger.error(err);

    const res = new Response(`Internal Error: ${err?.message}`, { status: 500 });
    event.respondWith(res);
  }
}

addEventListener('fetch', handleEvent);
