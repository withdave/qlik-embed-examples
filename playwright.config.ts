// @ts-check
/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: './tests',
  // Without an explicit reporter, Playwright only prints to the console and never
  // writes an HTML report, so the CI workflow has nothing to upload as an artifact.
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    screenshot: 'only-on-failure',
    baseURL: 'http://localhost:3000/',
    trace: 'on-first-retry',
    viewport: { width: 1900, height: 1600 },
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' },
    },
    {
      name: 'webkit',
      use: { browserName: 'webkit' },
    },
  ],
};

export default config;
