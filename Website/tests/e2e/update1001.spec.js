import { expect, test } from '@playwright/test';

for (const width of [375, 768, 1440]) {
  test(`578 entrance fills its frame without cropping or offsets at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/experience');
    const image = page.getByRole('img', { name: 'Entrance to the 578 Experience showroom' });
    await image.scrollIntoViewIfNeeded();
    await expect(image).toHaveJSProperty('complete', true);
    const dimensions = await image.evaluate((element) => {
      const imageBounds = element.getBoundingClientRect();
      const frameBounds = element.parentElement.getBoundingClientRect();
      return {
        naturalRatio: element.naturalWidth / element.naturalHeight,
        renderedRatio: imageBounds.width / imageBounds.height,
        leftOffset: imageBounds.left - frameBounds.left,
        widthDifference: frameBounds.width - imageBounds.width,
        heightDifference: frameBounds.height - imageBounds.height,
      };
    });
    expect(dimensions.naturalRatio).toBeGreaterThan(0);
    expect(dimensions.renderedRatio).toBeCloseTo(dimensions.naturalRatio, 2);
    expect(Math.abs(dimensions.leftOffset)).toBeLessThan(1);
    expect(Math.abs(dimensions.widthDifference)).toBeLessThan(1);
    expect(Math.abs(dimensions.heightDifference)).toBeLessThan(1);
    if (width >= 1000) {
      const imageBounds = await image.boundingBox();
      const copy = image.locator('xpath=../..').locator('header p, header h2');
      for (const paragraph of await copy.all()) {
        const copyBounds = await paragraph.boundingBox();
        expect(copyBounds.x + copyBounds.width).toBeLessThan(imageBounds.x - 16);
      }
    }
    await image.locator('xpath=../..').screenshot({ path: testInfo.outputPath(`experience-${width}.png`) });
  });

  test(`October images load and factory triptych keeps its intended placement at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const route of ['/news', '/contact']) {
      await page.goto(route);
      const replacements = page.locator('main img[src*="/update1001/"]');
      expect(await replacements.count()).toBeGreaterThan(0);
      for (const image of await replacements.all()) {
        await image.scrollIntoViewIfNeeded();
        await expect.poll(() => image.evaluate((element) => element.complete && element.naturalWidth > 0)).toBe(true);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      if (route === '/news') {
        const factory = page.getByRole('article', { name: 'Factory tours coming soon.' });
        const images = factory.getByRole('img');
        await expect(images.nth(0)).toHaveAttribute('src', '/assets/update1001/interich-news-1.webp');
        await expect(images.nth(2)).toHaveAttribute('src', '/assets/update922/contact-interich-1.webp');
        const mainBounds = await images.nth(0).boundingBox();
        const upperBounds = await images.nth(1).boundingBox();
        const lowerBounds = await images.nth(2).boundingBox();
        expect(lowerBounds.x).toBeGreaterThan(mainBounds.x);
        expect(lowerBounds.y).toBeGreaterThan(upperBounds.y);
        expect(mainBounds.height).toBeGreaterThan(lowerBounds.height);
        await factory.screenshot({ path: testInfo.outputPath(`factory-${width}.png`) });
        await page.locator('[data-story-id="s-project"]').screenshot({ path: testInfo.outputPath(`s-project-${width}.png`) });
      } else {
        await page.getByRole('article', { name: '578 Interiors' }).screenshot({ path: testInfo.outputPath(`contact-${width}.png`) });
      }
    }
  });
}
