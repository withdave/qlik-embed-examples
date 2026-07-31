import { test, expect } from '@playwright/test';

test.setTimeout(150000); // Set timeout to 150s

test('Visual regression - solo-analytics-sheet-selections', async ({ page }, testInfo) => {
  // Each dropdown change re-creates the #appSheets element (see renderSheetEmbed in the page),
  // so it's a fresh mount each time and 'ready' fires again for every selection, not just once.
  await page.addInitScript(() => {
    (window as any).__qlikReadyCount = { selectionsEmbed: 0, appSheets: 0 };
    document.addEventListener('qlik-embed:ready', (e) => {
      const id = (e.target as HTMLElement)?.id;
      if (id && (window as any).__qlikReadyCount[id] !== undefined) {
        (window as any).__qlikReadyCount[id]++;
      }
    }, true);
  });

  await page.goto('solo-analytics-sheet-selections.html');
  // Wait for the main header to appear
  await expect(page.locator('h1')).toHaveText('analytics/sheet and analytics/selections via qlik/embed-web-components and refApi');

  // Wait for the initial sheet embed to report it has finished its first render
  // (first load establishes the engine session, so give it longer)
  await page.waitForFunction(() => (window as any).__qlikReadyCount.appSheets >= 1, { timeout: 30_000 });

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

    // Select the option, then wait for the newly mounted sheet embed to report ready
    const readyCountBefore = await page.evaluate(() => (window as any).__qlikReadyCount.appSheets);
    await dropdown.selectOption(value);
    await page.waitForFunction(
      (prev) => (window as any).__qlikReadyCount.appSheets > prev,
      readyCountBefore,
      { timeout: 30_000 },
    );

    // Take a screenshot and compare with a snapshot for this option
    const screenshot = await page.locator('.main-container').screenshot();
    expect(screenshot).toMatchSnapshot(`solo-analytics-sheet-selections-${value}.png`);
  }
});
