import { describe, expect, it } from "vitest";
import { app } from "./dev-server.ts";

describe("開発用Honoサーバー", () => {
  it("ペイントアプリのHTMLを返す", async () => {
    const response = await app.request("/");
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
    expect(html).toContain('<div id="app"></div>');
    expect(html).toContain('src="/src/main.ts"');
  });

  it("ヘルスチェック結果を返す", async () => {
    const response = await app.request("/health");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "ok" });
  });
});
