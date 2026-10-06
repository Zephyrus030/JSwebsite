import { expect, test } from '@playwright/test';

for (const width of [1440, 390]) {
  test(`INTERICH footer divider is not covered at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/brands/interich');
    const footer = page.getByRole('contentinfo');
    await footer.scrollIntoViewIfNeeded();
    await footer.evaluate((element) => window.scrollBy(0, element.getBoundingClientRect().top - 150));
    const geometry = await footer.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const main = document.querySelector('main');
      const style = getComputedStyle(element);
      return {
        top: bounds.top,
        mainBottom: main.getBoundingClientRect().bottom,
        borderWidth: parseFloat(style.borderTopWidth),
        borderStyle: style.borderTopStyle,
        uncovered: element.contains(document.elementFromPoint(bounds.left + 20, bounds.top + 0.5)),
      };
    });
    expect(geometry.borderWidth).toBeGreaterThan(0);
    expect(geometry.borderStyle).toBe('solid');
    expect(geometry.top).toBeGreaterThanOrEqual(geometry.mainBottom - 0.5);
    expect(geometry.uncovered).toBe(true);
  });
}

test('footer social icons open platform homepages in new tabs', async ({ page, context }) => {
  await page.goto('/brands/interich');
  for (const [name, href] of [
    ['TikTok', 'https://www.tiktok.com/'],
    ['Instagram', 'https://www.instagram.com/'],
    ['小红书', 'https://www.xiaohongshu.com/'],
  ]) {
    await context.route(href, (route) => route.fulfill({ body: '<html><body>Platform homepage</body></html>', contentType: 'text/html' }));
    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('contentinfo').getByRole('link', { name, exact: true }).click();
    const popup = await popupPromise;
    await expect(popup).toHaveURL(href);
    await popup.close();
  }
});
