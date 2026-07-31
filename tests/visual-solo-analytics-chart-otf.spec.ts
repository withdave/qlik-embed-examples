import { test, expect } from '@playwright/test';

test.setTimeout(300000); // Set timeout to 300s to cover all technique/type/state combinations

test('Visual regression - solo-analytics-chart-otf', async ({ page }) => {
  // Capture qlik-embed lifecycle events before navigating, so we don't miss events
  // that fire early during page load.
  await page.addInitScript(() => {
    (window as any).__qlikEvents = new Set<string>();
    document.addEventListener('qlik-embed:ready', (e) => {
      const target = e.target as HTMLElement;
      (window as any).__qlikEvents.add(target?.id);
    }, true);
  });

  await page.goto('solo-analytics-chart-otf.html');
  // Wait for the main header to appear
  await expect(page.locator('h1')).toHaveText('analytics/chart on-the-fly via qlik/embed-web-components');

  // Wait for the chart embed to report it has finished its first render
  // (first load establishes the engine session, so give it longer). 'ready' only fires
  // once per mount, so subsequent attribute changes below still rely on a fixed wait.
  await page.waitForFunction(() => (window as any).__qlikEvents.has('chartEmbed'), { timeout: 30_000 });

  // Take a screenshot of the main container and compare it with the baseline (default 'simple' technique)
  const defaultScreenshot = await page.locator('.main-container').screenshot();
  expect(defaultScreenshot).toMatchSnapshot('solo-analytics-chart-otf-default.png');

  // Loop through each dimension/measure technique, skipping the one already selected
  const techniqueRadios = page.locator('input[name="technique"]');
  const techniqueCount = await techniqueRadios.count();
  for (let i = 0; i < techniqueCount; i++) {
    const radio = techniqueRadios.nth(i);
    if (await radio.isChecked()) continue;
    const value = await radio.getAttribute('value');

    await radio.check();
    await page.waitForTimeout(20000);

    const screenshot = await page.locator('.main-container').screenshot();
    expect(screenshot).toMatchSnapshot(`solo-analytics-chart-otf-technique-${value}.png`);
  }

  // Reset to the 'simple' technique before exercising the chart type control
  await page.locator('input[name="technique"][value="simple"]').check();
  await page.waitForTimeout(20000);

  // Loop through each chart type, skipping the one already selected
  const chartTypeSelect = page.locator('#chartType');
  const options = await chartTypeSelect.locator('option').all();
  const selectedType = await chartTypeSelect.inputValue();
  for (const option of options) {
    const value = await option.getAttribute('value');
    if (!value || value === selectedType) continue;

    await chartTypeSelect.selectOption(value);
    await page.waitForTimeout(20000);

    const screenshot = await page.locator('.main-container').screenshot();
    expect(screenshot).toMatchSnapshot(`solo-analytics-chart-otf-type-${value}.png`);
  }

  // Reset to the bar chart before exercising the alternate state control
  await chartTypeSelect.selectOption('barchart');
  await page.waitForTimeout(20000);

  // Toggle the alternate state checkbox and compare against its own baseline
  await page.locator('#altState').check();
  await page.waitForTimeout(20000);

  const altStateScreenshot = await page.locator('.main-container').screenshot();
  expect(altStateScreenshot).toMatchSnapshot('solo-analytics-chart-otf-altstate.png');
});
