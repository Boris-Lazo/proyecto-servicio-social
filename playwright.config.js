// playwright.config.js
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testMatch: '**/*.spec.js',
  use: {
    baseURL: 'http://localhost:4000',
  },
  webServer: {
    command: 'cd private && npm start',
    url: 'http://localhost:4000',
    reuseExistingServer: !process.env.CI,
  },
});
