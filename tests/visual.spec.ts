import { test, expect } from '@playwright/test';

// Visual regression test for the GitHub Pages site

test('Visual regression - dual-classic-app', async ({ page }, testInfo) => {
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
  const actualH1 = await page.locator('h1').textContent();
  await expect(page.locator('h1')).toHaveText('classic/chart via qlik/embed-web-components and qlik/api');
  console.log('Actual <h1> text on page:', actualH1);
  // Wait for the qlik-embed element to be present
  await expect(page.locator('qlik-embed')).toBeVisible();
  // Access the iframe by its data-testid
  const iframe = await page.frameLocator('[data-testid="qlik-embed-iframe"]');
  // Check for the specific data-test-id within the iframe
  const element = iframe.locator('[data-testid="item-thumbnail-7dd685d5-529e-41ea-bbd5-87b4c0dbbf9f"]');
  await expect(element).toBeVisible({ timeout: 15_000 });
  // Wait for 3 seconds to ensure the page is fully loaded
  await page.waitForTimeout(3000);
  // Take a screenshot of the main container and compare it with the baseline
  const screenshot = await page.locator('.main-container').screenshot();
  expect(screenshot).toMatchSnapshot('dual-classic-app.png');
});

test('Visual regression - solo-classic-app', async ({ page }, testInfo) => {
  await page.goto('solo-classic-app.html');
  console.log('Page URL:', page.url());
  // Measure and log the page load time
  const pageLoadTime = await page.evaluate(() => {
    const navigationEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    return navigationEntry ? navigationEntry.loadEventEnd : 0;
  });
  console.log(`Page load finished at: ${pageLoadTime}`);
  testInfo.attach('Page Load Time', { body: `Page load finished at: ${pageLoadTime}`, contentType: 'text/plain' });
  
  // Wait for the main header to appear
  const actualH1 = await page.locator('h1').textContent();
  await expect(page.locator('h1')).toHaveText('classic/chart via qlik/embed-web-components');
  // Wait for the qlik-embed element to be present
  await expect(page.locator('qlik-embed')).toBeVisible();
  // Access the iframe by its data-testid
  const iframe = await page.frameLocator('[data-testid="qlik-embed-iframe"]');
  // Check for the specific data-test-id within the iframe
  const element = iframe.locator('[data-testid="item-thumbnail-7dd685d5-529e-41ea-bbd5-87b4c0dbbf9f"]');
  await expect(element).toBeVisible({ timeout: 15_000 });
  // Wait for 3 seconds to ensure the page is fully loaded
  await page.waitForTimeout(3000);
  // Take a screenshot of the main container and compare it with the baseline
  const screenshot = await page.locator('.main-container').screenshot();
  expect(screenshot).toMatchSnapshot('solo-classic-app.png');
});

test('Visual regression - solo-analytics-snapshot', async ({ page }, testInfo) => {
  await page.goto('solo-analytics-snapshot.html');
  // Wait for the main header to appear
  await expect(page.locator('h1')).toHaveText('analytics/snapshot via qlik/embed-web-components');
  // Wait for the qlik-embed element with data-testid to be present
  const qlikEmbed = page.locator('qlik-embed[data-testid="snapshot"]');
  await expect(qlikEmbed).toBeVisible();
  // Wait for 2 seconds to ensure rendering is complete
  await page.waitForTimeout(2000);
  // Take a screenshot of the main container and compare it with the baseline
  const screenshot = await page.locator('.main-container').screenshot();
  expect(screenshot).toMatchSnapshot('solo-analytics-snapshot.png');
});