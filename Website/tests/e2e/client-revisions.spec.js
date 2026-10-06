import { expect, test } from '@playwright/test';

for (const width of [375, 759, 1440]) {
  test('client revisions preserve navigation and footer layout at ' + width + 'px', async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const route of ['/', '/about', '/brands/ioak', '/brands/flux', '/brands/interich', '/brands/s-project', '/experience', '/news', '/contact']) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      const header = page.getByRole('banner');
      const menu = header.getByRole('button', { name: 'Menu', exact: true });
      if (await menu.isVisible()) await menu.click();
      await expect(header.getByRole('link', { name: '578 Interiors', exact: true }).filter({ visible: true })).toHaveAttribute('href', '/experience');
      if (await menu.isVisible()) await page.keyboard.press('Escape');
      if (route === '/news') {
        await expect(page.locator('img[src="/assets/578-map.png"]')).toHaveCount(0);
        await expect(page.getByRole('img', { name: /Map/i })).toHaveCount(0);
      }
      if (route === '/contact') {
        const showroom = page.locator('main article').filter({ has: page.getByRole('heading', { name: '578 Interiors', level: 2 }) });
        await expect(showroom.locator('address')).toHaveText(/574[–-]578 Canterbury Road,?\s*Vermont 3133 VIC/);
      }
      if (route === '/experience') {
        const directions = page.getByRole('link', { name: /Get directions/i });
        expect(new URL(await directions.getAttribute('href')).searchParams.get('q')).toBe('574–578 Canterbury Road, Vermont 3133 VIC');
      }
      const footer = page.getByRole('contentinfo');
      await footer.scrollIntoViewIfNeeded();
      const spacing = await footer.evaluate((element) => {
        const main = element.firstElementChild;
        const copyright = element.lastElementChild;
        const style = getComputedStyle(element);
        const mainStyle = getComputedStyle(main);
        const copyrightStyle = getComputedStyle(copyright);
        return {
          topBorder: style.borderTopWidth,
          topColor: style.borderTopColor,
          bottomBorder: copyrightStyle.borderTopWidth,
          bottomColor: copyrightStyle.borderTopColor,
          topGap: mainStyle.paddingTop,
          bottomGap: mainStyle.paddingBottom,
        };
      });
      if (route === '/') {
        expect(spacing.topBorder).toBe('0px');
      } else {
        expect(parseFloat(spacing.topBorder)).toBeGreaterThan(0);
        expect(parseFloat(spacing.topBorder)).toBeLessThanOrEqual(1);
        expect(spacing.topBorder).toBe(spacing.bottomBorder);
        expect(spacing.topColor).toBe(spacing.bottomColor);
        expect(spacing.topGap).toBe(spacing.bottomGap);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      if (route === '/experience') {
        await page.getByRole('region', { name: '574–578 Canterbury Road, Vermont 3133 VIC' }).screenshot({ path: '.visual-review/client-revisions/experience-address-' + width + '.png' });
      }
      if (['/', '/news', '/contact', '/experience'].includes(route)) {
        await footer.screenshot({ path: '.visual-review/client-revisions/' + (route.slice(1) || 'home') + '-footer-' + width + '.png' });
      }
    }
  });
}
