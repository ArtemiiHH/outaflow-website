import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  timeout: 30000,
  use: {
    browserName: "chromium",
    headless: true,
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    },
  },
  webServer: [
    {
      command: "node tests/serve.mjs signup",
      url: "http://127.0.0.1:4176",
      reuseExistingServer: false,
    },
    {
      command: "node tests/serve.mjs opening",
      url: "http://127.0.0.1:4173",
      reuseExistingServer: false,
    },
    {
      command: "node tests/serve.mjs preview",
      url: "http://127.0.0.1:4174",
      reuseExistingServer: false,
    },
    {
      command: "node tests/serve.mjs live",
      url: "http://127.0.0.1:4175",
      reuseExistingServer: false,
    },
  ],
  reporter: "list",
});
