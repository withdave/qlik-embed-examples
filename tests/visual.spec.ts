import { test, expect } from '@playwright/test';

// Visual regression test for the GitHub Pages site

test('Qlik Sense All Charts App visual regression', async ({ page }) => {
  await page.goto('https://withdave.github.io/qlik-sense-charts/');
  // Wait for the main header to appear
  await expect(page.locator('h1')).toHaveText('Qlik Sense All Charts App');
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
  expect(screenshot).toMatchSnapshot('main-container.png');
});
