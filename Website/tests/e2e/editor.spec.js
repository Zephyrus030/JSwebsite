import { expect, test } from '@playwright/test';

test('edit mode persists text changes and exposes image controls', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?edit=1');

  await expect(page.getByRole('toolbar', { name: 'Page editor' })).toBeVisible();
  const heading = page.getByRole('heading', { name: 'Building Better Living.' });
  await heading.dblclick();
  await page.keyboard.press('Control+A');
  await page.keyboard.type('Edited headline');
  await page.getByRole('button', { name: 'Export' }).click();

  await expect.poll(async () => page.evaluate(() => {
    const store = JSON.parse(localStorage.getItem('js-building-editor-v1') || '{}');
    return Object.values(store['/'] || {}).some((edit) => edit.text === 'Edited headline');
  })).toBe(true);

  await page.locator('main img').first().click();
  await expect(page.getByRole('button', { name: 'Replace image' })).toBeEnabled();
});

test('selected images can be moved and resized', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?edit=1');
  await page.locator('main img').first().click();

  const moveSurface = page.getByRole('button', { name: 'Move selected image' });
  const moveBox = await moveSurface.boundingBox();
  await page.mouse.move(moveBox.x + 100, moveBox.y + 100);
  await page.mouse.down();
  await page.mouse.move(moveBox.x + 130, moveBox.y + 120);
  await page.mouse.up();

  await expect.poll(async () => page.evaluate(() => {
    const store = JSON.parse(localStorage.getItem('js-building-editor-v1') || '{}');
    return Object.values(store['/'] || {}).find((edit) => Number.isFinite(edit.x))?.x || 0;
  })).toBe(30);

  const resizeHandle = page.getByRole('button', { name: 'Resize selected image' });
  const resizeBox = await resizeHandle.boundingBox();
  await page.mouse.move(resizeBox.x + 2, resizeBox.y + 2);
  await page.mouse.down();
  await page.mouse.move(resizeBox.x + 42, resizeBox.y + 42);
  await page.mouse.up();

  await expect.poll(async () => page.evaluate(() => {
    const store = JSON.parse(localStorage.getItem('js-building-editor-v1') || '{}');
    return Object.values(store['/'] || {}).find((edit) => Number.isFinite(edit.scale))?.scale || 1;
  })).toBeGreaterThan(1);
});
