import { expect, test } from '@playwright/test';

for (const width of [390, 1526]) {
  for (const route of ['/', '/about', '/brands/ioak', '/brands/flux', '/brands/interich', '/brands/s-project', '/experience', '/news', '/contact']) {
    test('editorial text uses three close brown tones on ' + route + ' at ' + width + 'px', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      const result = await page.evaluate(() => {
        const palette = ['rgb(111, 73, 37)', 'rgb(122, 80, 41)', 'rgb(134, 88, 45)'];
        const nodes = [...document.querySelectorAll('main h1, main h2, main h3, main p, main a, main span, main strong, main label, main legend, footer p, footer h2, footer h3, footer a, footer span, footer strong')];
        const elements = nodes.filter((element) => {
          const box = element.getBoundingClientRect();
          return box.width > 2 && box.height > 2 && element.textContent.trim() && !element.closest('[data-hero-layout], [data-surface="hero"], [role="alert"]') && getComputedStyle(element).display !== 'none';
        });
        return {
          count: elements.length,
          mismatches: elements.filter((element) => !palette.includes(getComputedStyle(element).color)).map((element) => ({ text: element.textContent.slice(0, 65), color: getComputedStyle(element).color })),
          faded: elements.filter((element) => Number(getComputedStyle(element).opacity) < 1).map((element) => ({ text: element.textContent.slice(0, 65), opacity: getComputedStyle(element).opacity })),
        };
      });
      expect(result.count).toBeGreaterThan(10);
      expect(result.mismatches).toEqual([]);
      expect(result.faded).toEqual([]);
    });
  }
}

test('homepage Discover more actions open the corresponding brand pages', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [name, path] of [['S Project', '/brands/s-project'], ['INTERICH', '/brands/interich'], ['IOAK', '/brands/ioak'], ['FLUX', '/brands/flux']]) {
    await page.goto('/');
    const card = page.getByRole('heading', { level: 3, name, exact: true }).locator('..');
    await expect(card).toHaveAttribute('href', path);
    await card.getByText('DISCOVER MORE').click();
    await expect(page).toHaveURL(new RegExp(path + '$'));
    await expect(page.getByRole('heading', { level: 1, name, exact: true })).toBeVisible();
  }
});

test('About location names and addresses share the site typeface and regular weight', async ({ page }) => {
  await page.goto('/about');
  await page.evaluate(() => document.fonts.ready);
  const locations = page.getByRole('region', { name: 'Our locations' });
  const typography = await locations.locator('address strong, address span').evaluateAll((elements) => elements.map((element) => {
    const styles = getComputedStyle(element);
    return { family: styles.fontFamily, weight: styles.fontWeight, style: styles.fontStyle };
  }));
  expect(typography).toHaveLength(6);
  for (const styles of typography) {
    expect(styles.family).toContain('Libre Baskerville');
    expect(styles.weight).toBe('400');
    expect(styles.style).toBe('normal');
  }
});
