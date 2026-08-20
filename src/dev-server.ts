import { Hono } from "hono";

export const app = new Hono();

app.get("/", (context) =>
  context.html(`<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#f4f2ec" />
    <meta name="description" content="200色の白だけで描くペイントアプリ" />
    <title>200 WHITES — 白だけのペイント</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>`),
);

app.get("/health", (context) => context.json({ status: "ok" }));

export default app;
