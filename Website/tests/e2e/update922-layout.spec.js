import { expect, test } from '@playwright/test';

test('IOAK introduction paragraphs form a readable stack on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/brands/ioak');

  const statement = page.locator('[data-statement-variant="split"]');
  await statement.scrollIntoViewIfNeeded();
  const paragraphs = statement.locator(':scope > p');
  const [lead, detail] = await Promise.all([
    paragraphs.nth(0).boundingBox(),
    paragraphs.nth(1).boundingBox(),
  ]);

  expect(lead.y + lead.height).toBeLessThanOrEqual(detail.y);
  expect(detail.x + detail.width).toBeLessThanOrEqual(1440);
});

test('IOAK introduction remains compact and overflow-free on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/brands/ioak');

  const statement = page.locator('[data-statement-variant="split"]');
  await statement.scrollIntoViewIfNeeded();
  const paragraphs = statement.locator(':scope > p');
  const fontSizes = await paragraphs.evaluateAll((items) => (
    items.map((item) => Number.parseFloat(getComputedStyle(item).fontSize))
  ));

  expect(Math.max(...fontSizes)).toBeLessThanOrEqual(20);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});
