import devServer from "@hono/vite-dev-server";
import { defineConfig } from "vitest/config";

export default defineConfig(({ command }) => ({
  plugins:
    command === "serve"
      ? [
          devServer({
            entry: "src/dev-server.ts",
          }),
        ]
      : [],
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
  },
  test: {
    environment: "node",
  },
}));
