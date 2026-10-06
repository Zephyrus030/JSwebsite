import { expect, test } from '@playwright/test';

test('October 6 image replacements load with the supplied source dimensions', async ({ page }) => {
  const cases = [
    { path: '/experience', alt: 'Map of the 578 showroom area', width: 1581, height: 995 },
    { path: '/about', alt: 'Melbourne locations map', width: 1774, height: 887 },
    { path: '/brands/s-project', alt: 'S Project contemporary residence concept with architectural linework', width: 3840, height: 1497 },
  ];

  for (const imageCase of cases) {
    await page.goto(imageCase.path);
    const image = page.getByRole('img', { name: imageCase.alt });
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element) => element.complete && element.naturalWidth > 0)).toBe(true);
    await expect(image).toHaveJSProperty('naturalWidth', imageCase.width);
    await expect(image).toHaveJSProperty('naturalHeight', imageCase.height);
  }
});

test('578 location map stays complete and visit image clears the left copy', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/experience');

  const map = page.getByRole('img', { name: 'Map of the 578 showroom area' });
  const mapMetrics = await map.evaluate((element) => {
    const styles = getComputedStyle(element);
    const bounds = element.getBoundingClientRect();
    return {
      naturalRatio: element.naturalWidth / element.naturalHeight,
      renderedRatio: bounds.width / bounds.height,
      objectFit: styles.objectFit,
      marginLeft: styles.marginLeft,
      paddingLeft: styles.paddingLeft,
      paddingRight: styles.paddingRight,
    };
  });
  expect(mapMetrics.renderedRatio).toBeCloseTo(mapMetrics.naturalRatio, 2);
  expect(mapMetrics.objectFit).toBe('contain');
  expect(mapMetrics.marginLeft).toBe('0px');
  expect(mapMetrics.paddingLeft).toBe('0px');
  expect(mapMetrics.paddingRight).toBe('0px');

  const visit = page.getByRole('link', { name: 'Visit 578 website' }).locator('..');
  const copy = visit.locator(':scope > div');
  const visitImage = visit.getByRole('img');
  const [copyBounds, imageBounds, headingFontSize] = await Promise.all([
    copy.boundingBox(),
    visitImage.boundingBox(),
    copy.locator('h2').evaluate((element) => getComputedStyle(element).fontSize),
  ]);
  expect(imageBounds.x).toBeGreaterThan(copyBounds.x + copyBounds.width + 16);
  expect(Number.parseFloat(headingFontSize)).toBeLessThan(19);
});

test('578 location section keeps the annotated vertical spacing', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/experience');

  const location = page.getByRole('img', { name: 'Map of the 578 showroom area' }).locator('xpath=ancestor::section[1]');
  const spacing = await location.evaluate((element) => {
    const styles = getComputedStyle(element);
    return { paddingTop: Number.parseFloat(styles.paddingTop), paddingBottom: Number.parseFloat(styles.paddingBottom) };
  });
  expect(spacing.paddingTop).toBeLessThanOrEqual(80);
  expect(spacing.paddingBottom).toBeLessThanOrEqual(80);
});
