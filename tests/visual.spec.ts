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

test('Visual regression - solo-analytics-sheet-selections', async ({ page }, testInfo) => {
  await page.goto('solo-analytics-sheet-selections.html');
  // Wait for the main header to appear
  await expect(page.locator('h1')).toHaveText('analytics/sheet and analytics/selections via qlik/embed-web-components and refApi');
  // Wait for the qlik-embed element with data-testid to be present
  const qlikEmbed = page.locator('qlik-embed[data-testid="selections"]');
  await expect(qlikEmbed).toBeVisible();
  // Wait for the sheetEmbed element to be visible
  const sheetEmbed = page.locator('[data-testid="sheetEmbed"]');
  await expect(sheetEmbed).toBeVisible({ timeout: 10000 });
  // Wait until there are no ongoing network requests (network idle)
  await page.waitForLoadState('networkidle');
  // Wait another moment for good measure/ slow compute
  // Not good practice, but necessary for some slow environments
  await page.waitForTimeout(2000);
  // Take a screenshot of the main container and compare it with the baseline (default state)
  const defaultScreenshot = await page.locator('.main-container').screenshot();
  expect(defaultScreenshot).toMatchSnapshot('solo-analytics-sheet-selections-default.png');

  // Loop through each option in the dropdown and take a snapshot after selection, skipping the currently selected option
  const dropdown = page.locator('[data-testid="dropdown"]');
  const options = await dropdown.locator('option').all();
  const selectedValue = await dropdown.inputValue();
  for (const option of options) {
    const value = await option.getAttribute('value');
    if (!value || value === selectedValue) continue;
    // Select the option
    await dropdown.selectOption(value);
    // Wait for the sheetEmbed to be visible
    const sheetEmbed = page.locator('[data-testid="sheetEmbed"]');
    await expect(sheetEmbed).toBeVisible({ timeout: 10000 });

    // Wait until there are no ongoing network requests (network idle)
    await page.waitForLoadState('networkidle');

    // Wait another moment for good measure/ slow compute
    // Not good practice, but necessary for some slow environments
    await page.waitForTimeout(3000);

    // Take a screenshot and compare with a snapshot for this option
    const screenshot = await page.locator('.main-container').screenshot();
    expect(screenshot).toMatchSnapshot(`solo-analytics-sheet-selections-${value}.png`);
  }
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