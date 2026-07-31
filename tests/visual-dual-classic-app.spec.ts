import { test, expect } from '@playwright/test';

test('Visual regression - dual-classic-app', async ({ page }, testInfo) => {
  // Capture qlik-embed lifecycle events fired on the classicApp element before navigating,
  // so we don't miss events that fire early during page load.
  await page.addInitScript(() => {
    (window as any).__qlikEvents = new Set<string>();
    document.addEventListener('qlik-embed:ready', () => (window as any).__qlikEvents.add('ready'), true);
  });

  await page.goto('dual-classic-app.html');
  console.log('Page URL:', page.url());
  // Measure and log the page load time
  const pageLoadTime = await page.evaluate(() => {
    const navigationEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    return navigationEntry ? navigationEntry.loadEventEnd : 0;
  });
  console.log(`Page load finished at: ${pageLoadTime}`);
  testInfo.attach('Page Load Time', { body: `Page load finished at: ${pageLoadTime}`, contentType: 'text/plain' });

  // Wait for the main header to appear
  await expect(page.locator('h1')).toHaveText('classic/app via qlik/embed-web-components and qlik/api');
  // Wait for the classic/app embed to report it has finished its first render
  // (first load establishes the engine session, so give it longer)
  await page.waitForFunction(() => (window as any).__qlikEvents.has('ready'), { timeout: 15_000 });
  // Take a screenshot of the main container and compare it with the baseline
  const screenshot = await page.locator('.main-container').screenshot();
  expect(screenshot).toMatchSnapshot('dual-classic-app.png');
});
