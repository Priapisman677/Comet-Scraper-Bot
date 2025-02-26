import { defineConfig } from '@playwright/test';

export default defineConfig({
  testMatch: ["tests/play-wright-tests/main.spec.ts"],
  use: {
    headless: false,
  },
  retries: 0,
  reporter: [
    ["dot"],
    ["json", { outputFile: "tesjsonReoprts/jsonReport.json" }],
    ["html", { open: "never" }]
  ]
});
