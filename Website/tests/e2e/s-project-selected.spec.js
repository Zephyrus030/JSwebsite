import { expect, test } from '@playwright/test';

for (const width of [390, 1440, 1920]) {
  test('residential feature image fills its frame without an exposed edge at ' + width + 'px', async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/brands/s-project');
    const frame = page.locator('[data-section-id="s-project-feature"] > figure');
    await frame.scrollIntoViewIfNeeded();
    const image = frame.locator('img');
    await expect.poll(() => image.evaluate((element) => element.complete && element.naturalWidth > 0)).toBe(true);
    await expect(image).toHaveCSS('object-position', '50% 50%');
    await expect(image).toHaveCSS('object-fit', 'cover');
    const bounds = await frame.boundingBox();
    const imageBounds = await image.boundingBox();
    expect(imageBounds.x).toBeCloseTo(bounds.x, 1);
    expect(imageBounds.y).toBeCloseTo(bounds.y, 1);
    expect(imageBounds.width).toBeCloseTo(bounds.width, 1);
    expect(imageBounds.height).toBeCloseTo(bounds.height, 1);
  });

  test('Design and Build fills its centered image frame at ' + width + 'px', async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/brands/s-project');
    const cards = page.locator('[data-section-id="s-project-collections"] article');
    const middle = cards.nth(1);
    await middle.scrollIntoViewIfNeeded();
    await expect(middle.locator('img')).toHaveCSS('object-position', '50% 50%');
    await expect(middle.locator('img')).toHaveCSS('object-fit', 'cover');
    const frames = await cards.locator('[data-ratio="portrait"]').evaluateAll((elements) => elements.map((element) => {
      const frame = element.getBoundingClientRect();
      const card = element.parentElement.getBoundingClientRect();
      return { width: frame.width, height: frame.height, centerOffset: frame.x + frame.width / 2 - card.x - card.width / 2 };
    }));
    for (const frame of frames) {
      expect(frame.width).toBeCloseTo(frames[0].width, 1);
      expect(frame.height).toBeCloseTo(frames[0].height, 1);
      expect(frame.centerOffset).toBeCloseTo(0, 1);
    }
  });
}

test('selected projects spread horizontally with generous spacing and restrained height', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/brands/s-project');
  const section = page.getByRole('region', { name: 'Selected Projects' });
  const sizing = await section.evaluate((element) => ({
    width: element.getBoundingClientRect().width,
    heading: parseFloat(getComputedStyle(element.querySelector('h2')).fontSize),
    caption: parseFloat(getComputedStyle(element.querySelector('figcaption')).fontSize),
    imageHeight: element.querySelector('button').getBoundingClientRect().height,
    imageGap: element.querySelectorAll('button')[1].getBoundingClientRect().left - element.querySelector('button').getBoundingClientRect().right,
  }));
  expect(sizing.width).toBeGreaterThanOrEqual(1440);
  expect(sizing.imageGap).toBeGreaterThanOrEqual(96);
  expect(sizing.heading).toBeLessThanOrEqual(28);
  expect(sizing.caption).toBeLessThanOrEqual(16);
  expect(sizing.imageHeight).toBeLessThanOrEqual(390);
});

for (const width of [390, 759, 1440, 1920]) {
  test('all pages restore the original spacious footer at ' + width + 'px', async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ['/brands/s-project', '/about', '/news', '/contact', '/', '/brands/ioak', '/brands/interich', '/brands/flux', '/experience']) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      const spacing = await page.getByRole('contentinfo').evaluate((element) => {
        const main = element.firstElementChild;
        const mainStyle = getComputedStyle(main);
        const viewport = element.closest('[data-page-viewport]');
        return {
          width: main.getBoundingClientRect().width,
          paddingTop: parseFloat(mainStyle.paddingTop),
          paddingBottom: parseFloat(mainStyle.paddingBottom),
          linksMinHeight: parseFloat(getComputedStyle(element.querySelector('nav a')).minHeight),
          headingMargin: parseFloat(getComputedStyle(element.querySelector('nav h2')).marginBottom),
          copyrightBottom: parseFloat(getComputedStyle(element.lastElementChild).paddingBottom),
          zoom: getComputedStyle(element).zoom,
          viewportWidth: viewport.clientWidth,
        };
      });
      expect(spacing.width).toBeCloseTo(width, 0);
      expect(spacing.paddingTop).toBeCloseTo(route === '/' ? (spacing.viewportWidth <= 640 ? 48 : Math.max(56, Math.min(width * 0.05, 96))) : 40, 1);
      expect(spacing.paddingBottom).toBe(40);
      expect(spacing.linksMinHeight).toBe(44);
      expect(spacing.headingMargin).toBe(spacing.viewportWidth <= 640 ? 16 : 24);
      expect(spacing.copyrightBottom).toBe(32);
      expect(spacing.zoom).toBe('1');
    }
  });
}

test('selected projects crossfade independently over 0.7 seconds and restore on mouse leave', async ({ page }) => {
  await page.setViewportSize({ width: 1512, height: 1000 });
  await page.goto('/brands/s-project');
  const section = page.getByRole('region', { name: 'Selected Projects' });
  await section.scrollIntoViewIfNeeded();
  const cards = section.locator('figure');
  const leftImage = cards.nth(0).locator('img').nth(1);
  const rightImage = cards.nth(1).locator('img').nth(1);
  await expect(leftImage).toHaveCSS('opacity', '0');
  await expect(leftImage).toHaveCSS('transition-duration', '0.7s');
  const bounds = await cards.evaluateAll((elements) => elements.map((element) => {
    const { x, y, width } = element.getBoundingClientRect();
    return { x, y, width };
  }));
  expect(bounds[0].y).toBeCloseTo(bounds[1].y, 0);
  expect(bounds[1].x).toBeGreaterThan(bounds[0].x + bounds[0].width);
  for (const image of await section.locator('img').all()) {
    await expect.poll(() => image.evaluate((element) => element.complete && element.naturalWidth > 0)).toBe(true);
  }
  await cards.nth(0).hover();
  await expect.poll(() => leftImage.evaluate((element) => Number(getComputedStyle(element).opacity))).toBeGreaterThan(0);
  expect(await leftImage.evaluate((element) => Number(getComputedStyle(element).opacity))).toBeLessThan(1);
  await expect(leftImage).toHaveCSS('opacity', '1');
  await expect(rightImage).toHaveCSS('opacity', '0');
  await cards.nth(1).hover();
  await expect(leftImage).toHaveCSS('opacity', '0');
  await expect(rightImage).toHaveCSS('opacity', '1');
  await section.getByRole('heading').hover();
  await expect(rightImage).toHaveCSS('opacity', '0');
  await cards.nth(0).getByRole('button').focus();
  await expect(leftImage).toHaveCSS('opacity', '1');
});

test('selected projects stack on mobile and allow tap previews', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/brands/s-project');
  const section = page.getByRole('region', { name: 'Selected Projects' });
  await section.scrollIntoViewIfNeeded();
  const cards = section.locator('figure');
  const bounds = await cards.evaluateAll((elements) => elements.map((element) => {
    const { x, y, bottom } = element.getBoundingClientRect();
    return { x, y, bottom };
  }));
  expect(bounds[1].x).toBeCloseTo(bounds[0].x, 0);
  expect(bounds[1].y).toBeGreaterThan(bounds[0].bottom);
  const button = cards.nth(0).getByRole('button');
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('selected projects respect reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/brands/s-project');
  const section = page.getByRole('region', { name: 'Selected Projects' });
  const duration = await section.locator('img').nth(1).evaluate((element) => (
    parseFloat(getComputedStyle(element).transitionDuration)
  ));
  expect(duration).toBeLessThanOrEqual(0.001);
});
