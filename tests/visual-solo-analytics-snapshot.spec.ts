import { test, expect } from '@playwright/test';

test('Visual regression - solo-analytics-snapshot', async ({ page }, testInfo) => {
  await page.goto('solo-analytics-snapshot.html');
  // Wait for the main header to appear
  await expect(page.locator('h1')).toHaveText('analytics/snapshot via qlik/embed-web-components');
  // Wait for the qlik-embed element with data-testid to be present
  const qlikEmbed = page.locator('qlik-embed[data-testid="snapshot"]');
  await expect(qlikEmbed).toBeVisible();
  // Wait for 2 seconds to ensure rendering is complete
  await page.waitForTimeout(3000);
  // Take a screenshot of the main container and compare it with the baseline
  const screenshot = await page.locator('.main-container').screenshot();
  expect(screenshot).toMatchSnapshot('solo-analytics-snapshot.png');
});
