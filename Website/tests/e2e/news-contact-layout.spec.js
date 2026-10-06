import { expect, test } from '@playwright/test';

for (const width of [375, 768, 1024, 1440, 1920]) {
  test(`News and Contact editorial layouts fit ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });

    for (const route of ['news', 'contact']) {
      await page.goto(`/${route}`);
      await page.evaluate(() => document.fonts.ready);
      const articles = page.locator('main article');
      await expect(articles).toHaveCount(route === 'news' ? 5 : 3);

      for (const article of await articles.all()) {
        await article.scrollIntoViewIfNeeded();
        await expect(article.getByRole('heading', { level: 2 })).toBeVisible();
        for (const image of await article.locator('img').all()) {
          await expect(image).toBeVisible();
          await expect.poll(() => image.evaluate((element) => element.complete && element.naturalWidth > 0)).toBe(true);
        }
      }

      expect(await page.evaluate(() => document.documentElement.scrollWidth))
        .toBeLessThanOrEqual(width);

      if (width >= 1024) {
        const firstArticle = articles.first();
        const images = await firstArticle.locator('img').all();
        const firstImage = await images[0].boundingBox();
        const secondImage = await images[1].boundingBox();
        const heading = await firstArticle.getByRole('heading', { level: 2 }).boundingBox();
        if (route === 'news') {
          expect(firstImage.x + firstImage.width).toBeLessThan(heading.x);
          expect((await firstArticle.boundingBox()).height).toBeGreaterThanOrEqual(448);
        } else {
          expect(heading.x + heading.width).toBeLessThan(firstImage.x);
          expect(firstImage.y).toBe(secondImage.y);
          expect(firstImage.x + firstImage.width).toBeLessThan(secondImage.x);
        }
      }

      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: testInfo.outputPath(`${route}-${width}.png`), fullPage: true });
    }
  });
}
