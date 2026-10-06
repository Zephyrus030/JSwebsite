import { expect, test } from '@playwright/test';

for (const width of [390, 1526, 1920]) {
  test('News text scales to 90 percent without scaling images or shared chrome at ' + width + 'px', async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/news');
    await page.evaluate(() => document.fonts.ready);
    const measure = () => page.evaluate(() => ({
      text: [...document.querySelectorAll('main h1, main h2, main p, main time')].map((element) => parseFloat(getComputedStyle(element).fontSize)),
      images: [...document.querySelectorAll('main img')].map((element) => ({ width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height })),
      chrome: [...document.querySelectorAll('body > #root [data-page-viewport] > header a, footer p, footer a, footer h2, footer h3, footer small')].map((element) => parseFloat(getComputedStyle(element).fontSize)),
    }));
    const scaled = await measure();
    await page.locator('main').evaluate((element) => element.style.setProperty('--news-text-scale', '1'));
    const original = await measure();
    for (const [index, size] of scaled.text.entries()) {
      expect(size).toBeCloseTo(original.text[index] * 0.9, 2);
    }
    for (const [index, image] of scaled.images.entries()) {
      expect(image.width).toBeCloseTo(original.images[index].width, 2);
      expect(image.height).toBeCloseTo(original.images[index].height, 2);
    }
    expect(scaled.chrome).toEqual(original.chrome);
  });
}

test('News preserves the requested factory crop and IOAK image order', async ({ page }) => {
  await page.setViewportSize({ width: 1526, height: 752 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/news');

  const factoryStory = page.locator('[data-story-id="interich"]');
  await expect(factoryStory.locator('img').first()).toHaveAttribute('src', '/assets/update1001/interich-news-1.webp');
  await expect(factoryStory.locator('img').nth(2)).toHaveAttribute('src', '/assets/update922/contact-interich-1.webp');
  await expect(factoryStory.locator('img').nth(2)).toHaveCSS('object-position', '30% 50%');

  const ioakImages = page.locator('[data-story-id="ioak"] img');
  await expect(ioakImages).toHaveCount(3);
  expect(await ioakImages.evaluateAll((images) => images.map((image) => image.getAttribute('src'))))
    .toEqual([
      '/assets/update922/ioak-news-2.webp',
      '/assets/update922/ioak-news-1.webp',
      '/assets/update922/ioak-news-3.webp',
    ]);
});

for (const [width, topMargin, leftPadding] of [
  [375, 0, 0],
  [759, 0, 0],
  [768, 0, 20],
  [1024, -64, 25.6],
  [1526, -117, 38],
  [1920, -117, 38],
]) {
  test('News introduction and footer boundary fit ' + width + 'px', async ({ page }) => {
    await page.setViewportSize({ width, height: 752 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/news');
    await page.evaluate(() => document.fonts.ready);
    const intro = await page.locator('main > header').boundingBox();
    const stories = await page.getByRole('region', { name: 'Latest news' }).boundingBox();
    expect(intro.width).toBeCloseTo(Math.min(stories.width, 1205.72), 1);
    expect(intro.x + intro.width / 2).toBeCloseTo(stories.x + stories.width / 2, 1);

    const lastStory = page.locator('main article').last();
    await lastStory.scrollIntoViewIfNeeded();
    const lastBox = await lastStory.boundingBox();
    const footer = page.getByRole('contentinfo');
    const footerBox = await footer.boundingBox();
    expect(footerBox.y).toBeCloseTo(lastBox.y + lastBox.height, 1);
    await expect(lastStory).toHaveCSS('border-bottom-width', '0px');
    await expect(footer).toHaveCSS('border-top-width', '1px');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });

  test('News story annotations adapt at ' + width + 'px', async ({ page }) => {
    await page.setViewportSize({ width, height: 752 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/news');
    await page.evaluate(() => document.fonts.ready);
    const stories = page.locator('main article');
    await expect(stories).toHaveCount(5);

    for (const story of await stories.all()) {
      await story.scrollIntoViewIfNeeded();
      const layout = await story.evaluate((element) => {
        const images = element.children[0];
        const content = element.children[1];
        const style = getComputedStyle(content);
        return {
          marginTop: parseFloat(style.marginTop),
          marginRight: parseFloat(style.marginRight),
          paddingLeft: parseFloat(style.paddingLeft),
          width: content.getBoundingClientRect().width,
          columnWidth: parseFloat(getComputedStyle(element).gridTemplateColumns.split(' ').at(-1)),
          titleSize: parseFloat(getComputedStyle(content.querySelector('h2')).fontSize),
          contentTop: content.getBoundingClientRect().top,
          contentBottom: content.getBoundingClientRect().bottom,
          imagesBottom: images.getBoundingClientRect().bottom,
          storyTop: element.getBoundingClientRect().top,
          storyBottom: element.getBoundingClientRect().bottom,
        };
      });
      expect(layout.marginTop).toBe(topMargin);
      expect(layout.marginRight).toBe(width < 768 ? 0 : -10);
      expect(layout.paddingLeft).toBeCloseTo(leftPadding, 1);
      expect(layout.width).toBeCloseTo(layout.columnWidth - (width < 768 ? 0 : 10), 1);
      expect(layout.contentTop).toBeGreaterThanOrEqual(layout.storyTop);
      expect(layout.contentBottom).toBeLessThanOrEqual(layout.storyBottom);
      if (width < 768) expect(layout.contentTop - layout.imagesBottom).toBeGreaterThanOrEqual(31);
      if (width === 1526) expect(layout.titleSize).toBeCloseTo(34.15 * 0.9, 1);
    }

    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: '.visual-review/news-annotations/news-' + width + '.png', fullPage: true });
  });
}
