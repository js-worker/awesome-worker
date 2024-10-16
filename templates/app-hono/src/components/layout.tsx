import { html } from 'hono/html';

export const Layout = (props: { title: string; children?: any }) => {
  return html`<!doctype html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${props.title}</title>
        <style>
          header {
            margin-bottom: 50px;
          }
          footer {
            font-size: 16px;
            margin-top: 50px;
          }
        </style>
      </head>
      <body style="padding: 10px">
        <header>
          <h1>EdgeFunctions with Hono</h1>
        </header>
        ${props.children}
        <footer>
          <p>
            Built with <a href="https://cloud.tencent.com/document/product/1552/81344">EdgeFunctions</a> &
            <a href="https://hono.dev/">Hono</a>
          </p>
        </footer>
      </body>
    </html>`;
};
