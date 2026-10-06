import { expect, test } from '@playwright/test';

for (const width of [375, 759, 1440]) {
  for (const route of ['/news', '/contact']) {
    test(route + ' uses uniform photo frames at ' + width + 'px', async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      if (route === '/news') {
        expect(await page.locator('h1').innerText()).not.toContain('acrossthe');
        await expect(page.getByTestId('news-card')).toHaveCount(5);
      } else {
        await expect(page.locator('main article')).toHaveCount(3);
        for (const location of await page.locator('main article').all()) {
          await expect(location.locator('img')).toHaveCount(2);
        }
        await expect(page.getByRole('heading', { level: 2, name: '578 Interiors', exact: true })).toBeVisible();
      }

      for (const image of await page.locator('main article img').all()) {
        await image.scrollIntoViewIfNeeded();
        await expect.poll(() => image.evaluate((element) => element.complete && element.naturalWidth > 0)).toBe(true);
        expect(await image.evaluate((element, currentRoute) => {
          const style = getComputedStyle(element);
          const renderedRatio = element.clientWidth / element.clientHeight;
          return style.clipPath === 'none'
            && style.objectFit === 'cover'
            && (currentRoute === '/news' || Math.abs(renderedRatio - 4 / 3) < 0.02);
        }, route)).toBe(true);
      }

      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      expect(errors).toEqual([]);
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
      await page.screenshot({ path: '.visual-review/news-contact/' + route.slice(1) + '-' + width + '.png', fullPage: true });
    });
  }
}
