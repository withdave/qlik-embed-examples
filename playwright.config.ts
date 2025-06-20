// @ts-check
/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: './tests',
  use: {
    screenshot: 'only-on-failure',
    baseURL: 'https://withdave.github.io/qlik-sense-charts/',
    trace: 'on-first-retry',
    viewport: { width: 1900, height: 1600 },
  },
};

export default config;
