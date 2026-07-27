import { expect, test } from '@playwright/test';

const routes = [
  ['/', 'Building Better Living.'],
  ['/about', 'About'],
  ['/brands/s-project', 'S Project'],
  ['/brands/interich', 'INTERICH'],
  ['/brands/ioak', 'IOAK'],
  ['/brands/flux', 'FLUX'],
  ['/experience', '578 Experience'],
  ['/news', 'Latest projects from across the Group.'],
  ['/contact', 'Plan your visit.'],
  ['/not-a-route', 'Page not found'],
];

for (const width of [375, 768, 1024, 1440]) {
  test(`all routes render without horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });

    for (const [path, heading] of routes) {
      await page.goto(path);
      const pageHeading = page.locator('[data-page-heading]');
      await expect(pageHeading).toHaveAccessibleName(heading);
      await expect(pageHeading).toBeVisible();
      expect(await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      )).toBe(true);
    }
  });
}

test('desktop OUR BRANDS menu is keyboard accessible and restores focus on Escape', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  const trigger = page.getByRole('button', { name: 'OUR BRANDS' });
  await trigger.focus();
  await trigger.press('Enter');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');

  await trigger.press('Tab');
  await expect(page.locator('#brands-menu').getByRole('link', { name: 'S Project' }))
    .toBeFocused();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('mobile menu moves focus inside and restores it on Escape', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto('/');

  const trigger = page.getByRole('button', { name: 'Menu' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Site navigation' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'OUR BRANDS' })).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('News filters retain the complete eight-item reference layout', async ({ page }) => {
  await page.goto('/news');

  await expect(page.getByTestId('news-card')).toHaveCount(8);
  await page.getByRole('button', { name: 'FLUX' }).click();
  await expect(page.getByTestId('news-card')).toHaveCount(2);
  await expect(page.getByText('Arc Collection')).toBeVisible();
  await page.getByRole('button', { name: 'ALL' }).click();
  await expect(page.getByTestId('news-card')).toHaveCount(8);
  await expect(page.getByRole('button', { name: /Load more projects/i })).toHaveCount(0);
});

test('Contact displays validation errors and submits a valid request', async ({ page }) => {
  await page.goto('/contact');

  await page.getByRole('button', { name: /Request appointment/i }).click();
  await expect(page.getByText('Enter your full name.')).toBeVisible();
  await expect(page.getByText('Enter a valid email address.')).toBeVisible();
  await expect(page.getByText('Choose a visit location.')).toBeVisible();
  await expect(page.getByText('Choose a preferred date.')).toBeVisible();
  await expect(page.getByText('Choose a preferred time.')).toBeVisible();

  await page.getByLabel('578 Experience').check();
  await page.getByLabel('Full name').fill('Jane Smith');
  await page.getByLabel('Email').fill('jane@example.com');
  await page.getByLabel('Preferred date').fill('2026-08-01');
  await page.getByLabel('Preferred time').selectOption('10:00');
  await page.getByRole('button', { name: /Request appointment/i }).click();
  await expect(page.getByRole('status')).toHaveText(/Thank you/i);
});

test('reduced motion reveals content without animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const reveal = page.locator('[data-revealed]').first();
  await expect(reveal).toHaveAttribute('data-revealed', 'true');
  expect(Number.parseFloat(
    await reveal.evaluate((element) => getComputedStyle(element).transitionDuration),
  )).toBeLessThanOrEqual(0.01);
});

test('focused controls have a visible focus indicator and contact controls are labelled', async ({ page }) => {
  await page.goto('/contact');

  await page.evaluate(() => document.activeElement?.blur());
  await page.keyboard.press('Tab');
  const brandsTrigger = page.getByRole('button', { name: 'OUR BRANDS' });
  await brandsTrigger.focus();
  await expect(brandsTrigger).toBeFocused();
  expect(await brandsTrigger.evaluate((element) => getComputedStyle(element).outlineStyle))
    .toBe('solid');

  for (const control of await page.locator('input, select, textarea').all()) {
    expect(await control.evaluate((element) => (
      Boolean(element.getAttribute('aria-label'))
      || Boolean(element.getAttribute('aria-labelledby'))
      || element.labels.length > 0
    ))).toBe(true);
  }
});
