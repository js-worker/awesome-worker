import React from 'react';
import { renderToString } from 'react-dom/server.browser';
import { Route, Routes } from 'react-router-dom';
import { StaticRouter } from 'react-router-dom/server';

import Blog from './components/Blog';
import Home from './components/Home';
import logger from './utils/logger';

function App() {
  return (
    <html>
      <head>
        <title>ESR - REACT-SERVER - EdgeFunctions</title>
      </head>
      <body style={{ padding: '40px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
        </Routes>
      </body>
    </html>
  );
}

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
