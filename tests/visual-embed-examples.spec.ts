import { test, expect, type Page } from '@playwright/test';

type EmbedExample = {
  path: string;
  snapshot: string;
  title: string;
  attributes: Record<string, string>;
  selector?: string;
  appId?: boolean;
  maxDiffPixels?: number;
};

const examples: EmbedExample[] = [
  {
    path: 'solo-classic-app.html',
    snapshot: 'solo-classic-app.png',
    title: 'classic/app via qlik/embed-web-components',
    attributes: {
      ui: 'classic/app',
      'sheet-id': '7dd685d5-529e-41ea-bbd5-87b4c0dbbf9f',
    },
  },
  {
    path: 'dual-classic-app.html',
    snapshot: 'dual-classic-app.png',
    title: 'classic/app via qlik/embed-web-components and qlik/api',
    attributes: {
      ui: 'classic/app',
      'sheet-id': '7dd685d5-529e-41ea-bbd5-87b4c0dbbf9f',
      'host-config': 'anon',
    },
  },
  {
    path: 'solo-analytics-snapshot.html',
    snapshot: 'solo-analytics-snapshot.png',
    title: 'analytics/snapshot via qlik/embed-web-components',
    selector: 'qlik-embed[data-testid="snapshot"]',
    attributes: { ui: 'analytics/snapshot', 'data-testid': 'snapshot' },
    appId: false,
  },
  {
    path: 'solo-classic-chart.html',
    snapshot: 'solo-classic-chart.png',
    title: 'classic/chart via qlik/embed-web-components',
    attributes: { ui: 'classic/chart', 'object-id': 'UyDxThT' },
  },
  {
    path: 'solo-analytics-chart.html',
    snapshot: 'solo-analytics-chart.png',
    title: 'analytics/chart via qlik/embed-web-components',
    attributes: { ui: 'analytics/chart', 'object-id': 'UyDxThT' },
  },
  {
    path: 'solo-analytics-chart-preview.html',
    snapshot: 'solo-analytics-chart-preview.png',
    title: 'analytics/chart preview via qlik/embed-web-components',
    attributes: { ui: 'analytics/chart', 'object-id': 'UyDxThT', preview: 'true' },
  },
  {
    path: 'solo-analytics-sheet-preview.html',
    snapshot: 'solo-analytics-sheet-preview.png',
    title: 'analytics/sheet preview via qlik/embed-web-components',
    attributes: {
      ui: 'analytics/sheet',
      'sheet-id': '7dd685d5-529e-41ea-bbd5-87b4c0dbbf9f',
      preview: 'true',
    },
    maxDiffPixels: 240_000,
  },
];

async function expectEmbedConfiguration(page: Page, example: EmbedExample) {
  await expect(page).toHaveTitle(example.title);
  await expect(page.locator('h1')).toHaveText(example.title);

  const embed = page.locator(example.selector ?? 'qlik-embed');
  for (const [attribute, value] of Object.entries(example.attributes)) {
    await expect(embed).toHaveAttribute(attribute, value);
  }
  if (example.appId !== false) {
    await expect(embed).toHaveAttribute('app-id', /.+/);
  }
}

async function captureStableScreenshot(page: Page) {
  const container = page.locator('.main-container');
  let previous = await container.screenshot();

  for (let attempt = 0; attempt < 6; attempt++) {
    await page.waitForTimeout(500);
    const current = await container.screenshot();
    if (current.equals(previous)) return current;
    previous = current;
  }

  return previous;
}

for (const example of examples) {
  test(`visual embed example - ${example.path}`, async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__qlikEmbedReady = false;
      (window as any).__qlikSheetLoaded = false;
      document.addEventListener('qlik-embed:ready', (event) => {
        if (event.target instanceof HTMLElement && event.target.matches('qlik-embed')) {
          (window as any).__qlikEmbedReady = true;
          if (event.target.getAttribute('ui') === 'analytics/sheet') {
            (window as any).__qlikSheetLoaded = true;
          }
        }
      }, true);

    });

    await page.goto(example.path);
    await expectEmbedConfiguration(page, example);
    await page.waitForFunction(() => (window as any).__qlikEmbedReady, undefined, { timeout: 30_000 });
    if (example.attributes.ui === 'analytics/sheet') {
      await page.waitForFunction(() => (window as any).__qlikSheetLoaded, undefined, { timeout: 30_000 });
    }
    await page.waitForTimeout(5000);

    const screenshot = await captureStableScreenshot(page);
    expect(screenshot).toMatchSnapshot(example.snapshot, {
      maxDiffPixels: example.maxDiffPixels ?? 10_000,
    });
  });
}