import { defineConfig } from "@playwright/test";
import { readFileSync } from "node:fs";
const source =
  process.env.TEST_DATABASE_URL ||
  readFileSync("../backend/.env", "utf8")
    .match(/^DATABASE_URL=(.*)$/m)![1]
    .trim();
const database = new URL(source);
database.pathname = "/equiflow_test";
export default defineConfig({
  testDir: "./tests",
  workers: 1,
  retries: 0,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:3001", trace: "retain-on-failure" },
  webServer: {
    command: "node ../backend/dist/main.js",
    url: "http://127.0.0.1:3001/api/status",
    reuseExistingServer: false,
    env: {
      DATABASE_URL: database.toString(),
      PORT: "3001",
      APP_ORIGIN: "http://127.0.0.1:3001",
      NODE_ENV: "test",
    },
  },
});
