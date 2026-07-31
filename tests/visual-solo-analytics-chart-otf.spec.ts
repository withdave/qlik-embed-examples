import { test, expect } from '@playwright/test';

test.setTimeout(300000); // Set timeout to 300s to cover all technique/type/state combinations

test('Visual regression - solo-analytics-chart-otf', async ({ page }) => {
  // The page fully recreates #chartEmbed on every technique/type/state change (see
  // renderChartEmbed in the page), so it's a fresh mount each time and 'ready' fires
  // again for every change, not just once. Track counts so we can wait for a NEW
  // 'ready' after each change, not just "has ever fired".
  await page.addInitScript(() => {
    (window as any).__qlikReadyCount = { selectionsEmbed: 0, chartEmbed: 0 };
    document.addEventListener('qlik-embed:ready', (e) => {
      const id = (e.target as HTMLElement)?.id;
      if (id && (window as any).__qlikReadyCount[id] !== undefined) {
        (window as any).__qlikReadyCount[id]++;
      }
    }, true);
  });

  const waitForNextChartReady = async (prevCount: number) => {
    await page.waitForFunction(
      (prev) => (window as any).__qlikReadyCount.chartEmbed > prev,
      prevCount,
      { timeout: 30_000 },
    );
    // Small buffer for rendering to settle after the ready event fires
    await page.waitForTimeout(1000);
  };

  await page.goto('solo-analytics-chart-otf.html');
  // Wait for the main header to appear
  await expect(page.locator('h1')).toHaveText('analytics/chart on-the-fly via qlik/embed-web-components');

  // Wait for the chart embed to report it has finished its first render
  // (first load establishes the engine session, so give it longer)
  await waitForNextChartReady(0);

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

    const readyCountBefore = await page.evaluate(() => (window as any).__qlikReadyCount.chartEmbed);
    await radio.check();
    await waitForNextChartReady(readyCountBefore);

    const screenshot = await page.locator('.main-container').screenshot();
    expect(screenshot).toMatchSnapshot(`solo-analytics-chart-otf-technique-${value}.png`);
  }

  // Reset to the 'simple' technique before exercising the chart type control
  let readyCountBefore = await page.evaluate(() => (window as any).__qlikReadyCount.chartEmbed);
  await page.locator('input[name="technique"][value="simple"]').check();
  await waitForNextChartReady(readyCountBefore);

  // Loop through each chart type, skipping the one already selected
  const chartTypeSelect = page.locator('#chartType');
  const options = await chartTypeSelect.locator('option').all();
  const selectedType = await chartTypeSelect.inputValue();
  for (const option of options) {
    const value = await option.getAttribute('value');
    if (!value || value === selectedType) continue;

    readyCountBefore = await page.evaluate(() => (window as any).__qlikReadyCount.chartEmbed);
    await chartTypeSelect.selectOption(value);
    await waitForNextChartReady(readyCountBefore);

    const screenshot = await page.locator('.main-container').screenshot();
    expect(screenshot).toMatchSnapshot(`solo-analytics-chart-otf-type-${value}.png`);
  }

  // Reset to the bar chart before exercising the alternate state control
  readyCountBefore = await page.evaluate(() => (window as any).__qlikReadyCount.chartEmbed);
  await chartTypeSelect.selectOption('barchart');
  await waitForNextChartReady(readyCountBefore);

  // Toggle the alternate state checkbox and compare against its own baseline
  readyCountBefore = await page.evaluate(() => (window as any).__qlikReadyCount.chartEmbed);
  await page.locator('#altState').check();
  await waitForNextChartReady(readyCountBefore);

  const altStateScreenshot = await page.locator('.main-container').screenshot();
  expect(altStateScreenshot).toMatchSnapshot('solo-analytics-chart-otf-altstate.png');
});
