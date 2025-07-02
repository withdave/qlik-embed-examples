// @ts-check
/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: './tests',
  use: {
    screenshot: 'only-on-failure',
    baseURL: 'https://withdave.github.io/qlik-embed-examples/',
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
