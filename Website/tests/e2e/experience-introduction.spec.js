import { expect, test } from '@playwright/test';

test('Experience introduction uses the revised desktop copy and image composition', async ({ page }) => {
  await page.setViewportSize({ width: 1526, height: 752 });
  await page.goto('/experience');
  await page.evaluate(() => document.fonts.ready);
  const image = page.getByRole('img', { name: 'Entrance to the 578 Experience showroom' });
  const section = image.locator('..').locator('..');
  const heading = section.getByRole('heading', { level: 2 });
  const paragraphs = section.locator('header > div > p');
  await expect(paragraphs.nth(0)).toHaveText('Set within a 1000m² experience centre, 578 Interiors brings INTERICH, FLUX and IOAK together in one considered space. Explore cabinetry, tapware and timber flooring in an environment designed to show how materials, finishes and craftsmanship work together.');
  await expect(paragraphs.nth(1)).toHaveText('With our designers based in the showroom, every detail can be considered together. From material selection and cabinetry to finishes and overall interior direction, we provide a more complete and coordinated solution — always with our clients’ needs, lifestyle and vision at the centre of the process.');
  expect(await heading.evaluate((element) => parseFloat(getComputedStyle(element).width))).toBeCloseTo(406.27, 1);
  expect(await paragraphs.nth(0).evaluate((element) => parseFloat(getComputedStyle(element).width))).toBeCloseTo(459.27, 1);
  expect(await paragraphs.nth(1).evaluate((element) => parseFloat(getComputedStyle(element).width))).toBeCloseTo(466.28, 1);
  await expect(paragraphs.nth(1)).toHaveCSS('margin-top', '17px');
  await expect(section.locator('header')).toHaveCSS('margin-left', '0px');
  await expect(image).toHaveCSS('margin-left', '0px');
  await expect(image).toHaveAttribute('src', '/assets/update1001/578-interiors-1.webp');
  const metrics = await section.evaluate((element) => {
    const styles = getComputedStyle(element);
    const image = element.querySelector('figure img');
    const imageStyles = getComputedStyle(image);
    return { top: parseFloat(styles.paddingTop), bottom: parseFloat(styles.paddingBottom), imageWidth: parseFloat(imageStyles.width), imageHeight: parseFloat(imageStyles.height), figureWidth: parseFloat(getComputedStyle(image.parentElement).width) };
  });
  expect(metrics.top).toBeCloseTo(133.71, 1);
  expect(metrics.bottom).toBeCloseTo(99.71, 1);
  expect(metrics.imageWidth).toBeCloseTo(metrics.figureWidth, 1);
  expect(metrics.imageWidth / metrics.imageHeight).toBeCloseTo(1621 / 970, 2);
});

for (const width of [390, 768, 1024, 1280, 1526]) {
  test('Experience introduction stays readable without overlap at ' + width + 'px', async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/experience');
    await page.evaluate(() => document.fonts.ready);
    const image = page.getByRole('img', { name: 'Entrance to the 578 Experience showroom' });
    await image.scrollIntoViewIfNeeded();
    const section = image.locator('..').locator('..');
    const metrics = await section.evaluate((element) => {
      const image = element.querySelector('figure img').getBoundingClientRect();
      const section = element.getBoundingClientRect();
      const copy = [...element.querySelectorAll('header > p, header h2, header > div > p')].map((item) => {
        const box = item.getBoundingClientRect();
        const styles = getComputedStyle(item);
        return { left: box.left, right: box.right, bottom: box.bottom, top: box.top, clipped: item.scrollWidth > item.clientWidth + 1 || (styles.overflowY !== 'visible' && item.scrollHeight > item.clientHeight + 1) };
      });
      return { image: { left: image.left, right: image.right, top: image.top, bottom: image.bottom }, sectionBottom: section.bottom, copy, viewport: document.documentElement.clientWidth };
    });
    expect(metrics.image.right).toBeLessThanOrEqual(metrics.viewport + 1);
    for (const copy of metrics.copy) {
      expect(copy.left).toBeGreaterThanOrEqual(0);
      expect(copy.right).toBeLessThanOrEqual(metrics.viewport + 1);
      expect(copy.bottom).toBeLessThanOrEqual(metrics.sectionBottom + 1);
      expect(copy.clipped).toBe(false);
      expect(copy.right <= metrics.image.left + 1 || copy.bottom <= metrics.image.top + 1 || copy.top >= metrics.image.bottom - 1).toBe(true);
    }
  });
}
