import { expect, test } from '@playwright/test';
import sharp from 'sharp';

const routes = [
  ['/', 'Building Better Living.'],
  ['/about', 'Where Building Becomes Living.'],
  ['/brands/s-project', 'S Project'],
  ['/brands/interich', 'INTERICH'],
  ['/brands/ioak', 'IOAK'],
  ['/brands/flux', 'FLUX'],
  ['/experience', '578 Interiors'],
  ['/news', 'Latest from JS Building Group.'],
  ['/contact', 'Plan your visit.'],
  ['/not-a-route', 'Page not found'],
];

test('homepage loads without requesting internet resources', async ({ page }) => {
  const externalRequests = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (!['127.0.0.1', 'localhost'].includes(url.hostname)) {
      externalRequests.push(request.url());
    }
  });

  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);

  expect(externalRequests).toEqual([]);
});

test('homepage 578 feature uses the requested desktop heading scale', async ({ page }) => {
  await page.setViewportSize({ width: 1526, height: 752 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);

  const heading = page.getByRole('heading', { level: 2, name: 'Experience more possibilities.' });
  await expect(heading).toBeVisible();
  await expect(heading).toHaveCSS('font-size', '34px');
});

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

  const trigger = page.getByRole('button', { name: 'Our Brands' });
  await trigger.focus();
  await trigger.press('Enter');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');

  await trigger.press('Tab');
  await expect(page.locator('#brands-menu').getByRole('link', { name: 'IOAK' }))
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

test('News presents five complete stories on one page without filters or links', async ({ page }) => {
  await page.goto('/news');

  await expect(page.getByTestId('news-card')).toHaveCount(5);
  await expect(page.locator('main article img')).toHaveCount(15);
  await expect(page.locator('main a, main button')).toHaveCount(0);
  await expect(page.getByRole('img', { name: /Map showing 578/ })).toHaveCount(0);
  for (const [index, story] of (await page.getByTestId('news-card').all()).entries()) {
    await story.scrollIntoViewIfNeeded();
    await expect(story.getByRole('heading', { level: 2 })).toBeVisible();
    if (index === 1) {
      await expect(story.locator('time')).toHaveCount(0);
    } else {
      await expect(story.locator('time')).toBeVisible();
    }
  }
});

test('Contact displays visit information without unfinished booking controls', async ({ page }) => {
  await page.goto('/contact');

  await expect(page.getByRole('heading', { level: 2, name: '578 Interiors' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'INTERICH Factory' })).toBeVisible();
  await expect(page.locator('form, input, select, textarea, a[href="#appointment"]')).toHaveCount(0);
  await expect(page.getByRole('link', { name: /book/i })).toHaveCount(0);
  await expect(page.locator('main article img')).toHaveCount(6);
  await expect(page.locator('main a[href="mailto:info@jsbuildinggroup.com.au"]')).toHaveCount(3);
  await expect(page.locator('main a[href="tel:+61380862666"]')).toHaveCount(3);
  await expect(page.locator('main article').last().getByRole('heading', { name: 'Head Office' })).toBeVisible();
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

test('hero image and copy use a restrained staged entrance', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  const hero = page.locator('[data-motion-sequence="hero"]');
  const imageStep = hero.locator('[data-motion-step="image"]');
  const wordmarkStep = hero.locator('[data-motion-step="wordmark"]');

  expect(await imageStep.evaluate((element) => getComputedStyle(element).animationName))
    .toContain('hero-frame-in');
  const wordmarkMotion = await wordmarkStep.evaluate((element) => {
    const styles = getComputedStyle(element);
    return { delay: Number.parseFloat(styles.animationDelay), name: styles.animationName };
  });
  expect(wordmarkMotion.name).toContain('hero-copy-in');
  expect(wordmarkMotion.delay).toBeGreaterThan(0);
});

test('IOAK reveals its complete logo as one faded unit without clipping the lower mark', async ({ page }) => {
  await page.setViewportSize({ width: 1221, height: 602 });
  await page.goto('/brands/ioak');

  const wordmark = page.locator('h1[data-wordmark="ioak"]');
  const entranceState = await wordmark.evaluate((element) => {
    const animation = element.getAnimations().find(({ animationName }) => (
      animationName.includes('ioak-wordmark-in')
    ));
    animation.pause();
    animation.currentTime = 330;

    const styles = getComputedStyle(element);
    return {
      clipPath: styles.clipPath,
      opacity: Number.parseFloat(styles.opacity),
    };
  });

  expect(entranceState.clipPath).toBe('none');
  expect(entranceState.opacity).toBeGreaterThan(0);
  expect(entranceState.opacity).toBeLessThan(1);
});

test('IOAK hero tracks the dynamic viewport height when mobile browser chrome changes', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/brands/ioak');

  const hero = page.locator('[data-hero-layout="full-bleed"]');
  const heroHeight = await hero.evaluate((element) => (
    getComputedStyle(element).getPropertyValue('--hero-height')
  ));

  expect(heroHeight).toContain('100dvh');
  expect((await hero.boundingBox()).y + (await hero.boundingBox()).height).toBeCloseTo(812, 1);
});

test('scrolled navigation settles the logo and draws its divider', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  await page.evaluate(() => window.scrollTo(0, 180));
  const header = page.getByRole('banner');
  await expect(header).toHaveAttribute('data-scrolled', 'true');
  await page.waitForTimeout(350);

  expect(await header.locator('a[aria-label="JS Building Group home"]').evaluate(
    (element) => getComputedStyle(element).transform,
  )).not.toBe('none');
  expect(await header.evaluate(
    (element) => getComputedStyle(element, '::after').transform,
  )).not.toBe('none');
});

test('image presentation remains unchanged when the pointer moves over it', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/news');

  const image = page.getByTestId('news-card').first().locator('img').first();
  const readMotion = () => image.evaluate((element) => {
    const styles = getComputedStyle(element);
    return { scale: styles.scale, transform: styles.transform, translate: styles.translate };
  });
  const before = await readMotion();
  await image.hover();
  await page.waitForTimeout(550);

  expect(await readMotion()).toEqual(before);
  await expect(image).not.toHaveAttribute('data-pointer-depth');
});

test('every hero Scroll cue has a slow breathing layer', async ({ page }) => {
  await page.goto('/');

  const breath = page.locator('[data-scroll-breathe="true"]');
  await expect(breath).toHaveCount(1);
  const motion = await breath.evaluate((element) => {
    const styles = getComputedStyle(element);
    return { duration: Number.parseFloat(styles.animationDuration), name: styles.animationName };
  });

  expect(motion.name).toContain('scroll-breathe');
  expect(motion.duration).toBeGreaterThanOrEqual(2);
});

test('wheel snapping aligns every full-screen hero bottom with the navigation bottom', async ({ page }) => {
  await page.setViewportSize({ width: 1221, height: 700 });

  for (const path of [
    '/',
    '/brands/s-project',
    '/brands/interich',
    '/brands/ioak',
    '/brands/flux',
    '/experience',
  ]) {
    await page.goto(path);
    const hero = page.locator('[data-scroll-target="next-section"]');
    const header = page.getByRole('banner');
    await expect(hero).toBeVisible();

    await page.mouse.wheel(0, 120);

    await expect.poll(async () => page.evaluate(() => {
      const heroElement = document.querySelector('[data-scroll-target="next-section"]');
      const headerElement = document.querySelector('[role="banner"]');
      return Math.abs(
        heroElement.getBoundingClientRect().bottom
        - headerElement.getBoundingClientRect().bottom,
      );
    })).toBeLessThanOrEqual(1);
  }
});

for (const [path, heading] of [
  ['/about', 'Where Building Becomes Living.'],
  ['/experience', '578 Interiors'],
  ['/news', 'Latest from JS Building Group.'],
  ['/contact', 'Plan your visit.'],
]) {
  test(`${path} uses the shared page-intro motion language`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(path);

    const intro = page.locator('[data-motion-sequence="page-intro"]');
    const title = intro.locator('[data-motion-step="title"]');
    await expect(title).toHaveAccessibleName(heading);
    expect(await title.evaluate((element) => getComputedStyle(element).animationName))
      .toContain('page-copy-in');
  });
}

test('editorial image and text reveal together when their section enters view', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 700 });
  await page.goto('/about');

  const section = page.getByRole('heading', {
    name: 'One group. One connected way to build.',
  }).locator('..').locator('..');
  const image = section.locator('[data-reveal-item="image"]');
  const copy = section.locator('[data-reveal-item="text"]');

  await expect(section).toHaveAttribute('data-revealed', 'false');
  await section.scrollIntoViewIfNeeded();
  await expect(section).toHaveAttribute('data-revealed', 'true');
  await expect(image).toHaveCSS('opacity', '1');
  await expect(copy).toHaveCSS('opacity', '1');
});

test('About applies the requested desktop type scale and copy offsets', async ({ page }) => {
  await page.setViewportSize({ width: 1526, height: 752 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/about');
  await page.evaluate(() => document.fonts.ready);

  const introduction = page.getByRole('heading', { level: 1, name: 'Where Building Becomes Living.' });
  const ambition = page.getByRole('heading', { level: 2, name: 'One group. One connected way to build.' });
  const choice = page.getByRole('heading', { level: 2, name: 'Why choose JS Building Group?' });

  await expect(introduction).toHaveCSS('font-size', '40.2px');
  await expect(introduction.locator('..')).toHaveCSS('padding-top', '42.31px');
  await expect(ambition).toHaveCSS('font-size', '37.6px');
  await expect(ambition.locator('..')).toHaveCSS('margin-top', '-30px');
  await expect(choice).toHaveCSS('font-size', '39.6px');
});

test('About ambition heading keeps one complete sentence on each line', async ({ page }) => {
  await page.setViewportSize({ width: 1526, height: 752 });
  await page.goto('/about');
  await page.evaluate(() => document.fonts.ready);

  const heading = page.getByRole('heading', { level: 2, name: 'One group. One connected way to build.' });
  const sentences = heading.locator(':scope > span');
  await expect(sentences).toHaveCount(2);

  const lines = await sentences.evaluateAll((elements) => elements.map((element) => ({
    lineCount: element.getClientRects().length,
    top: element.getBoundingClientRect().top,
  })));
  expect(lines[0].lineCount).toBe(1);
  expect(lines[1].lineCount).toBe(1);
  expect(lines[1].top).toBeGreaterThan(lines[0].top);
});

test('homepage hero uses the annotated desktop composition', async ({ page }) => {
  await page.setViewportSize({ width: 1221, height: 602 });
  await page.goto('/');

  const hero = page.locator('[data-hero-layout="full-bleed"]');
  const content = hero.locator(':scope > div');
  const scrollCue = hero.getByRole('button', { name: /scroll/i });
  const figure = hero.locator('figure');
  const image = figure.locator('img');

  const contentMetrics = await content.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      height: element.getBoundingClientRect().height,
      marginTop: styles.marginTop,
      marginRight: styles.marginRight,
      marginBottom: styles.marginBottom,
      marginLeft: styles.marginLeft,
    };
  });
  expect(contentMetrics).toMatchObject({
    marginTop: '55px',
    marginRight: '0px',
    marginBottom: '-97px',
    marginLeft: '138.31px',
  });
  expect(contentMetrics.height).toBeCloseTo(498.56, 1);

  expect(await scrollCue.evaluate((element) => {
    const styles = getComputedStyle(element);
    return { marginTop: styles.marginTop, marginBottom: styles.marginBottom };
  })).toEqual({ marginTop: '172px', marginBottom: '50px' });

  const [figureBox, imageBox] = await Promise.all([figure.boundingBox(), image.boundingBox()]);
  const centerX = (box) => box.x + (box.width / 2);
  expect(centerX(imageBox) - centerX(figureBox)).toBeCloseTo(11, 1);
  expect(imageBox.x).toBeLessThanOrEqual(figureBox.x);
  expect(imageBox.x + imageBox.width).toBeGreaterThanOrEqual(figureBox.x + figureBox.width);
  expect(imageBox.y).toBeLessThanOrEqual(figureBox.y);
  expect(imageBox.y + imageBox.height).toBeGreaterThanOrEqual(figureBox.y + figureBox.height);
});

test('homepage hero applies the annotated copy colors, offsets, and scroll emphasis', async ({ page }) => {
  await page.setViewportSize({ width: 1221, height: 602 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);

  const hero = page.locator('[data-hero-layout="full-bleed"]');
  const titleLines = hero.locator('#page-title > span');
  const body = hero.getByText(/^A Melbourne-based group/);
  const scrollCue = hero.getByRole('button', { name: /scroll/i });

  expect(await titleLines.nth(0).evaluate((element) => {
    const styles = getComputedStyle(element);
    return { marginBottom: styles.marginBottom, marginLeft: styles.marginLeft };
  })).toEqual({ marginBottom: '1px', marginLeft: '-4px' });
  expect(await titleLines.nth(1).evaluate((element) => {
    const styles = getComputedStyle(element);
    return { color: styles.color, marginLeft: styles.marginLeft, opacity: styles.opacity };
  })).toEqual({ color: 'rgb(255, 251, 245)', marginLeft: '-5px', opacity: '0.98' });
  const titleClipBottomExpansion = await hero.locator('#page-title').evaluate(async (element) => {
    await Promise.all(element.getAnimations().map((animation) => animation.finished));
    const match = getComputedStyle(element).clipPath.match(/-\s*([0-9.]+)px/);
    return Number.parseFloat(match?.[1] ?? '0');
  });
  expect(titleClipBottomExpansion).toBeGreaterThan(0);
  expect(await body.evaluate((element) => {
    const styles = getComputedStyle(element);
    return { color: styles.color, opacity: styles.opacity };
  })).toEqual({ color: 'rgb(255, 241, 224)', opacity: '0.96' });
  expect(await scrollCue.evaluate((element) => {
    const styles = getComputedStyle(element);
    return { marginTop: styles.marginTop, opacity: styles.opacity };
  })).toEqual({ marginTop: '172px', opacity: '0.63' });
  const [heroBox, scrollBox] = await Promise.all([hero.boundingBox(), scrollCue.boundingBox()]);
  expect(scrollBox.y + scrollBox.height).toBeLessThanOrEqual(heroBox.y + heroBox.height);
});

test('homepage About feature applies the annotated editorial treatment', async ({ page }) => {
  await page.setViewportSize({ width: 1221, height: 602 });
  await page.goto('/');

  const eyebrow = page.getByText('About JS Building Group', { exact: true });
  const feature = eyebrow.locator('xpath=ancestor::section[1]');
  const content = feature.locator(':scope > div');
  const body = feature.getByText(/^Our story began in Australia in 2017/);
  const action = feature.getByRole('link', { name: /Learn more/i });

  expect(await content.evaluate((element) => getComputedStyle(element).paddingTop)).toBe('10.05px');
  await expect(feature.getByRole('heading', { name: 'Design. Make. Live.' })).toHaveCount(0);
  expect(await eyebrow.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      color: styles.color,
      fontSize: styles.fontSize,
      marginLeft: styles.marginLeft,
      opacity: styles.opacity,
    };
  })).toEqual({
    color: 'rgb(134, 88, 45)',
    fontSize: '12px',
    marginLeft: '-5px',
    opacity: '1',
  });
  const bodyStyles = await body.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      color: styles.color,
      fontWeight: styles.fontWeight,
      marginLeft: styles.marginLeft,
      opacity: styles.opacity,
      width: styles.width,
    };
  });
  expect(bodyStyles).toMatchObject({
    color: 'rgb(122, 80, 41)',
    fontWeight: '500',
    marginLeft: '-7px',
    opacity: '1',
  });
  expect(Number.parseFloat(bodyStyles.width)).toBeCloseTo(445.89, 1);
  await expect(action).toHaveCSS('color', 'rgb(134, 88, 45)');
});

test('homepage brand columns share the annotated S Project typography treatment', async ({ page }) => {
  await page.setViewportSize({ width: 1221, height: 602 });
  await page.goto('/');

  const section = page.getByRole('heading', { name: 'S Project' }).locator('xpath=ancestor::section[1]');
  const cards = section.locator('article');

  await section.scrollIntoViewIfNeeded();
  await expect(section).toHaveAttribute('data-revealed', 'true');
  const sectionEyebrow = section.locator(':scope > p').first();
  await expect(sectionEyebrow).toHaveCSS('color', 'rgb(134, 88, 45)');
  await expect(sectionEyebrow).toHaveCSS('opacity', '1');
  expect(await cards.locator('h3').evaluateAll((elements) => elements.map((element) => {
    const styles = getComputedStyle(element);
    return { color: styles.color, fontWeight: styles.fontWeight };
  }))).toEqual(Array(4).fill({ color: 'rgb(111, 73, 37)', fontWeight: '700' }));
  expect(await cards.locator('p').evaluateAll((elements) => elements.map(
    (element) => getComputedStyle(element).color,
  ))).toEqual(Array(8).fill('rgb(122, 80, 41)'));
  expect(await cards.locator('a > span').evaluateAll((elements) => elements.map(
    (element) => getComputedStyle(element).color,
  ))).toEqual(Array(4).fill('rgb(134, 88, 45)'));
});

test('homepage 578 feature applies the annotated warm editorial treatment', async ({ page }) => {
  await page.setViewportSize({ width: 1221, height: 602 });
  await page.goto('/');

  const heading = page.getByRole('heading', { name: 'Experience more possibilities.' });
  const feature = heading.locator('xpath=ancestor::section[1]');
  const eyebrow = feature.getByText('578 INTERIORS', { exact: true });
  const body = feature.getByText(/^A 1000 m² experience centre/);
  const opening = feature.getByText('Opening late 2026', { exact: true });
  const action = feature.getByRole('link', { name: 'DISCOVER 578 INTERIORS' });

  expect(await heading.evaluate((element) => {
    const styles = getComputedStyle(element);
    return { color: styles.color, marginLeft: styles.marginLeft };
  })).toEqual({ color: 'rgb(111, 73, 37)', marginLeft: '-4px' });
  expect(await eyebrow.evaluate((element) => {
    const styles = getComputedStyle(element);
    return { color: styles.color, opacity: styles.opacity };
  })).toEqual({ color: 'rgb(134, 88, 45)', opacity: '1' });
  expect(await body.evaluate((element) => {
    const styles = getComputedStyle(element);
    return { color: styles.color, marginLeft: styles.marginLeft, opacity: styles.opacity };
  })).toEqual({ color: 'rgb(122, 80, 41)', marginLeft: '-3px', opacity: '1' });
  expect(await opening.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      color: styles.color,
      marginTop: styles.marginTop,
      marginBottom: styles.marginBottom,
    };
  })).toEqual({ color: 'rgb(134, 88, 45)', marginTop: '5px', marginBottom: '-10px' });
  expect(await action.evaluate((element) => {
    const styles = getComputedStyle(element);
    return { color: styles.color, marginRight: styles.marginRight, marginLeft: styles.marginLeft };
  })).toEqual({ color: 'rgb(134, 88, 45)', marginRight: '3px', marginLeft: '1px' });
});

test('homepage 578 long copy stays clear of its image across viewport sizes', async ({ page }) => {
  for (const width of [1086, 1221, 768, 390]) {
    await page.setViewportSize({ width, height: 752 });
    await page.goto('/');
    const feature = page.getByRole('region', { name: '578 INTERIORS', exact: true });
    const body = feature.getByText(/^A 1000 m² experience centre/);
    const image = feature.locator('figure');
    const bodyBox = await body.boundingBox();
    const imageBox = await image.boundingBox();
    expect(bodyBox.x + bodyBox.width).toBeLessThanOrEqual(width);
    const separated = bodyBox.x + bodyBox.width <= imageBox.x
      || bodyBox.y + bodyBox.height <= imageBox.y;
    expect(separated).toBe(true);
    await expect(feature.getByRole('link', { name: 'DISCOVER 578 INTERIORS' })).toHaveAttribute('href', '/experience');
  }
});

test('homepage news columns share the left-card treatment and keep every action visible', async ({ page }) => {
  await page.setViewportSize({ width: 1221, height: 602 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);

  const section = page.getByRole('heading', {
    name: '578 Interiors is taking shape.',
  }).locator('xpath=ancestor::section[1]');
  const cards = section.locator('article');

  await expect(section.locator(':scope > p').first()).toHaveCSS('color', 'rgb(134, 88, 45)');
  expect(await cards.locator('h3').evaluateAll((elements) => elements.map(
    (element) => getComputedStyle(element).color,
  ))).toEqual(Array(4).fill('rgb(111, 73, 37)'));
  expect(await cards.locator('span').evaluateAll((elements) => elements.map(
    (element) => getComputedStyle(element).color,
  ))).toEqual(Array(4).fill('rgb(134, 88, 45)'));
  await expect(cards.first().locator('a')).toHaveCSS('margin-right', '-15px');

  const actionBounds = await cards.evaluateAll((elements) => elements.map((card) => {
    const link = card.querySelector('a');
    const action = card.querySelector('span');
    const range = document.createRange();
    range.selectNodeContents(action);
    return {
      actionRight: action.getBoundingClientRect().right,
      linkRight: link.getBoundingClientRect().right,
      lineCount: range.getClientRects().length,
    };
  }));
  for (const bounds of actionBounds) {
    expect(bounds.lineCount).toBe(1);
    expect(bounds.actionRight).toBeLessThanOrEqual(bounds.linkRight + 0.5);
  }
});

test('S Project displays the supplied logo proportionally on desktop and mobile', async ({ page }) => {
  for (const width of [390, 1526]) {
    await page.setViewportSize({ width, height: 752 });
    await page.goto('/brands/s-project');
    const heading = page.getByRole('heading', { level: 1, name: 'S Project' });
    const logo = heading.locator('img');
    await expect(logo).toHaveAttribute('src', '/assets/s-project-logo-914.png');
    await expect(logo).toBeVisible();
    await expect.poll(() => logo.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
    const bounds = await logo.boundingBox();
    expect(bounds.width / bounds.height).toBeCloseTo(1659 / 298, 2);
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
    const eyebrow = heading.locator('..').getByText('Residential building', { exact: true });
    expect(bounds.y + bounds.height).toBeLessThanOrEqual((await eyebrow.boundingBox()).y + 1);
  }
});

test('S Project uses the annotated desktop hero and editorial composition', async ({ page }) => {
  await page.setViewportSize({ width: 1221, height: 602 });
  await page.goto('/brands/s-project');

  const hero = page.locator('[data-hero-layout="full-bleed"]');
  const content = hero.locator(':scope > div');
  const heroImage = hero.locator('figure img');
  const heroTitle = hero.getByRole('heading', { level: 1, name: 'S Project' });
  const logo = heroTitle.locator('img');
  const headline = hero.getByText('Homes designed for the way life is lived.', { exact: true });
  const eyebrow = hero.getByText('Residential building', { exact: true });
  const scrollCue = hero.getByRole('button', { name: /scroll/i });

  await expect.soft(heroImage).toHaveAttribute('src', '/assets/s-project-hero-warm-v2.jpg');
  expect.soft(await heroImage.evaluate((image) => ({
    naturalHeight: image.naturalHeight,
    naturalWidth: image.naturalWidth,
  }))).toEqual({ naturalHeight: 1497, naturalWidth: 3840 });
  expect.soft((await hero.boundingBox()).height).toBeCloseTo(531.59, 1);
  expect.soft(await content.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      marginTop: styles.marginTop,
      marginRight: styles.marginRight,
      paddingBottom: styles.paddingBottom,
      paddingTop: styles.paddingTop,
    };
  })).toEqual({
    marginTop: '191px',
    marginRight: '442px',
    paddingBottom: '28px',
    paddingTop: '73px',
  });
  await expect.soft(heroTitle).toHaveCSS('padding-bottom', '4px');
  const headlineMetrics = await headline.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      color: styles.color,
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      height: Number.parseFloat(styles.height),
      marginTop: styles.marginTop,
      width: Number.parseFloat(styles.width),
    };
  });
  expect.soft(headlineMetrics).toMatchObject({
    color: 'rgb(255, 252, 245)',
    fontSize: '17.73px',
    fontWeight: '300',
    marginTop: '27.52px',
  });
  expect.soft(headlineMetrics.height).toBeCloseTo(44.62, 1);
  expect.soft(headlineMetrics.width).toBeCloseTo(287, 1);
  await expect.soft(heroTitle).toHaveCSS('color', 'rgb(255, 252, 245)');
  await expect(logo).toHaveAttribute('src', '/assets/s-project-logo-914.png');
  await expect(logo).toBeVisible();
  expect(await logo.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
  expect.soft(await eyebrow.evaluate((element) => {
    const styles = getComputedStyle(element);
    return { color: styles.color, fontWeight: styles.fontWeight, marginTop: styles.marginTop };
  })).toEqual({ color: 'rgb(255, 253, 245)', fontWeight: '500', marginTop: '-6px' });
  expect.soft(await scrollCue.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      color: styles.color,
      fontSize: styles.fontSize,
      marginBottom: styles.marginBottom,
      marginTop: styles.marginTop,
      opacity: styles.opacity,
      transform: styles.transform,
    };
  })).toEqual({
    color: 'rgb(243, 243, 231)',
    fontSize: '10px',
    marginBottom: '40px',
    marginTop: '174px',
    opacity: '0.81',
    transform: 'matrix(1, 0, 0, 1, 0, -30)',
  });
  const [heroBounds, scrollBounds] = await Promise.all([hero.boundingBox(), scrollCue.boundingBox()]);
  expect.soft(scrollBounds.y + scrollBounds.height)
    .toBeLessThanOrEqual(heroBounds.y + heroBounds.height);
  expect.soft(await heroImage.evaluate((element) => getComputedStyle(element).filter))
    .toBe('brightness(0.98) contrast(1.08) sepia(0) saturate(1) hue-rotate(0deg)');

  const heroGlow = await hero.locator('figure').evaluate((element) => {
    const styles = getComputedStyle(element, '::before');
    return {
      backgroundImage: styles.backgroundImage,
      filter: styles.filter,
      mixBlendMode: styles.mixBlendMode,
      opacity: styles.opacity,
    };
  });
  expect.soft(heroGlow).toMatchObject({
    filter: 'blur(8px) brightness(1.08)',
    mixBlendMode: 'screen',
    opacity: '0.035',
  });
  expect.soft(heroGlow.backgroundImage).toContain('s-project-hero-warm-v2.jpg');

  const heroOverlay = await hero.locator('figure').evaluate((element) => (
    getComputedStyle(element, '::after').backgroundImage
  ));
  expect.soft(heroOverlay).toContain('rgba(0, 0, 0, 0.34)');
  expect.soft(heroOverlay).toContain('rgba(0, 0, 0, 0.2)');
  expect.soft(heroOverlay).toContain('rgba(0, 0, 0, 0.04)');
  expect.soft(heroOverlay).toContain('78%');

  const statementParagraphs = page.getByLabel('S Project introduction').locator('p');
  expect.soft(await statementParagraphs.first().evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      color: styles.color,
      fontWeight: styles.fontWeight,
      letterSpacing: styles.letterSpacing,
      marginTop: styles.marginTop,
      opacity: styles.opacity,
    };
  })).toEqual({
    color: 'rgb(122, 80, 41)',
    fontWeight: '200',
    letterSpacing: '0.2px',
    marginTop: '-2px',
    opacity: '1',
  });
  expect.soft(await statementParagraphs.nth(1).evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      color: styles.color,
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      marginTop: styles.marginTop,
    };
  })).toEqual({
    color: 'rgb(122, 80, 41)',
    fontSize: '15.4px',
    fontWeight: '500',
    marginTop: '-2px',
  });

  const collections = page.locator('[data-section-id="s-project-collections"]');
  const collectionsTitle = collections.getByRole('heading', {
    name: 'A considered way to build.',
  });
  const collectionsEyebrow = collections.getByText('Residential work', { exact: true });
  expect.soft(await collections.evaluate((element) => {
    const styles = getComputedStyle(element);
    return { marginBottom: styles.marginBottom, marginTop: styles.marginTop };
  })).toEqual({ marginBottom: '-34px', marginTop: '-34px' });
  expect.soft(await collectionsEyebrow.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      color: styles.color,
      fontSize: styles.fontSize,
      margin: `${styles.marginTop} ${styles.marginRight} ${styles.marginBottom} ${styles.marginLeft}`,
      opacity: styles.opacity,
    };
  })).toEqual({
    color: 'rgb(134, 88, 45)',
    fontSize: '13.4px',
    margin: '-14px 3px 21px 2px',
    opacity: '1',
  });
  expect.soft(await collectionsTitle.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      color: styles.color,
      fontSize: styles.fontSize,
      marginTop: styles.marginTop,
      marginBottom: styles.marginBottom,
    };
  })).toEqual({
    color: 'rgb(111, 73, 37)',
    fontSize: '20.86px',
    marginTop: '9px',
    marginBottom: '-22px',
  });

  const grid = collections.locator('[data-layout="reference"]');
  const [gridBox, cardBoxes] = await Promise.all([
    grid.boundingBox(),
    grid.locator('article').evaluateAll((articles) => articles.map((article) => {
      const box = article.getBoundingClientRect();
      return { x: box.x, width: box.width };
    })),
  ]);
  expect.soft(cardBoxes[0].x).toBeCloseTo(gridBox.x, 1);
  expect.soft(cardBoxes[2].x + cardBoxes[2].width).toBeCloseTo(gridBox.x + gridBox.width, 1);

  const cardImageMetrics = await grid.locator('[data-ratio="portrait"]').evaluateAll((images) => (
    images.map((image) => {
      const box = image.getBoundingClientRect();
      return { height: box.height, width: box.width };
    })
  ));
  cardImageMetrics.forEach(({ height, width }) => {
    expect.soft(width).toBeCloseTo(338.92, 1);
    expect.soft(height).toBeCloseTo(401.88, 1);
  });
  await expect.soft(grid.locator('article').nth(1).locator('img'))
    .toHaveCSS('object-position', '50% 50%');

  const cardTitleStyles = await grid.locator('article h3').evaluateAll((elements) => elements.map((element) => {
    const styles = getComputedStyle(element);
    return { color: styles.color, fontWeight: styles.fontWeight, marginTop: styles.marginTop };
  }));
  expect.soft(cardTitleStyles).toEqual(Array(3).fill({
    color: 'rgb(111, 73, 37)',
    fontWeight: '700',
    marginTop: '18px',
  }));
  const cardBodyStyles = await grid.locator('article > p').evaluateAll((elements) => elements.map((element) => {
    const box = element.getBoundingClientRect();
    const parent = element.parentElement.getBoundingClientRect();
    const styles = getComputedStyle(element);
    return {
      centerOffset: (box.left + (box.width / 2)) - (parent.left + (parent.width / 2)),
      color: styles.color,
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      opacity: styles.opacity,
      paddingLeft: styles.paddingLeft,
      width: box.width,
    };
  }));
  cardBodyStyles.forEach((styles) => {
    expect.soft(styles).toMatchObject({
      color: 'rgb(122, 80, 41)',
      fontSize: '13.96px',
      fontWeight: '500',
      opacity: '1',
      paddingLeft: '6px',
    });
    expect.soft(styles.centerOffset).toBeCloseTo(0, 1);
    expect.soft(styles.width).toBeCloseTo(358.25, 1);
  });

  const visitLink = collections.getByRole('link', { name: /Visit S Project website/i });
  await expect.soft(visitLink).toHaveCSS('margin-top', '4px');

  const feature = page.locator('[data-section-id="s-project-feature"]');
  const featureFigure = feature.locator(':scope > figure');
  const featureImage = featureFigure.locator('img');
  const featureCopy = feature.locator('[data-section-copy]');
  expect.soft(await featureCopy.evaluate((element) => {
    const styles = getComputedStyle(element);
    return { marginRight: styles.marginRight, marginLeft: styles.marginLeft };
  })).toEqual({ marginRight: '68px', marginLeft: '-62px' });
  expect.soft((await featureFigure.boundingBox()).height).toBeCloseTo(539.3, 1);
  await expect.soft(featureImage).toHaveCSS('filter', 'contrast(1.03)');
  await expect.soft(featureImage).toHaveCSS('object-position', '50% 50%');
  await expect.soft(feature.getByRole('heading', { name: 'Homes shaped around the way life is lived.' }))
    .toHaveCSS('color', 'rgb(111, 73, 37)');
  await expect.soft(feature.getByText('Selected residential work', { exact: true }))
    .toHaveCSS('color', 'rgb(134, 88, 45)');
  expect.soft(await feature.getByText(/^Our residential work brings together architecture,/).evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      color: styles.color,
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      opacity: styles.opacity,
    };
  })).toEqual({
    color: 'rgb(122, 80, 41)',
    fontSize: '15.4px',
    fontWeight: '500',
    opacity: '1',
  });
  expect.soft(await page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  )).toBe(true);
});

test('IOAK hero uses the supplied artwork and annotated desktop composition', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1221, height: 602 });
  await page.goto('/brands/ioak');

  const hero = page.locator('[data-hero-layout="full-bleed"]');
  const heroImage = hero.locator('figure img');
  const logo = hero.locator('[data-wordmark="ioak"] img');
  const eyebrow = hero.getByText('Timber flooring', { exact: true });
  const headline = hero.getByText('Natural foundations for modern living.', { exact: true });
  const scrollCue = hero.getByRole('button', { name: /scroll/i });

  await expect(heroImage).toHaveAttribute('src', '/assets/ioak-hero-main.png');
  await expect(heroImage).toHaveAccessibleName(
    'Bright minimalist living room with oak flooring and floor-to-ceiling windows',
  );
  await expect(logo).toHaveAttribute('src', '/assets/ioak-logo-white-tight.png');
  await expect(logo).toHaveJSProperty('naturalWidth', 839);
  await expect(logo).toHaveJSProperty('naturalHeight', 331);

  const [logoBox, eyebrowBox, headlineBox, scrollBox] = await Promise.all([
    logo.boundingBox(),
    eyebrow.boundingBox(),
    headline.boundingBox(),
    scrollCue.boundingBox(),
  ]);
  const centerX = (box) => box.x + (box.width / 2);
  await expect.soft(logo).toHaveCSS('transform', 'matrix(1.08, 0, 0, 1.08, 0, 0)');
  expect.soft(Math.abs(centerX(logoBox) - centerX(eyebrowBox))).toBeLessThanOrEqual(1);
  expect.soft(Math.abs(centerX(logoBox) - centerX(headlineBox))).toBeLessThanOrEqual(1);
  expect.soft(Math.abs(centerX(logoBox) - centerX(scrollBox))).toBeLessThanOrEqual(1);
  expect(logoBox.y).toBeLessThan(eyebrowBox.y);
  await expect(hero).toHaveAttribute('data-image-brightness-gradient', 'right-to-left');
  const heroBox = await hero.boundingBox();
  expect.soft(heroBox.y + heroBox.height).toBeCloseTo(602, 1);
  expect.soft(await heroImage.evaluate((element) => {
    const styles = getComputedStyle(element);
    return { filter: styles.filter, objectFit: styles.objectFit };
  })).toEqual({
    filter: 'brightness(1) contrast(0.95) sepia(0.06) saturate(1.05) hue-rotate(0deg)',
    objectFit: 'cover',
  });
  expect.soft(await hero.locator('figure').evaluate((element) => (
    getComputedStyle(element, '::after').backgroundImage
  ))).toContain('rgba(0, 0, 0, 0.3)');

  const content = hero.locator(':scope > div');
  const contentBox = await content.boundingBox();
  const contentMargins = await content.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      marginBottom: styles.marginBottom,
      marginLeft: styles.marginLeft,
      marginTop: styles.marginTop,
    };
  });
  expect.soft(contentBox.x).toBeCloseTo(718.49, 1);
  expect.soft(headlineBox.x + headlineBox.width).toBeLessThanOrEqual(1221);
  expect.soft(contentMargins.marginTop).toBe('100px');
  expect.soft(contentMargins.marginBottom).toBe('49px');
  expect.soft(await logo.evaluate((element) => getComputedStyle(element).marginBottom)).toBe('35px');
  expect.soft(await eyebrow.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      color: styles.color,
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      marginBottom: styles.marginBottom,
      marginTop: styles.marginTop,
    };
  })).toEqual({
    color: 'rgb(234, 226, 220)',
    fontSize: '12px',
    fontWeight: '500',
    marginBottom: '4px',
    marginTop: '38px',
  });
  expect.soft(await headline.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      color: styles.color,
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      marginBottom: styles.marginBottom,
      marginTop: styles.marginTop,
      opacity: styles.opacity,
    };
  })).toEqual({
    color: 'rgb(243, 234, 221)',
    fontSize: '16.72px',
    fontWeight: '200',
    marginBottom: '4px',
    marginTop: '10.52px',
    opacity: '0.82',
  });
  expect(await scrollCue.evaluate((element) => getComputedStyle(element).fontSize)).toBe('9px');
  expect.soft(await scrollCue.evaluate((element) => {
    const styles = getComputedStyle(element);
    return { marginTop: styles.marginTop, opacity: styles.opacity };
  })).toEqual({ marginTop: '146px', opacity: '0.81' });
  expect((await scrollCue.boundingBox()).height).toBeGreaterThanOrEqual(44);
});

test('IOAK wordmark remains fully visible after its entrance animation', async ({ page }) => {
  await page.setViewportSize({ width: 1221, height: 602 });
  await page.goto('/brands/ioak');

  const logo = page.locator('[data-wordmark="ioak"] img');
  await expect(logo).toBeVisible();
  await page.waitForTimeout(1600);

  const screenshot = await logo.screenshot();
  const { data: pixels, info } = await sharp(screenshot)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let brightPixelsInBottomRows = 0;
  for (let y = info.height - 4; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const pixel = ((y * info.width) + x) * 3;
      if (pixels[pixel] > 220 && pixels[pixel + 1] > 220 && pixels[pixel + 2] > 220) {
        brightPixelsInBottomRows += 1;
      }
    }
  }

  expect(brightPixelsInBottomRows).toBeGreaterThan(0);
});

test('INTERICH designed-for-living copy uses the requested desktop horizontal offset', async ({ page }) => {
  await page.setViewportSize({ width: 1526, height: 752 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/brands/interich');

  const copy = page.locator('[data-section-id="interich-feature"] > [data-section-copy]');
  await expect(copy).toHaveCSS('margin-right', '17px');
  await expect(copy).toHaveCSS('margin-left', '-24px');
  expect(await page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  )).toBe(true);
});

test('IOAK introduction aligns both paragraphs to the requested desktop treatment', async ({ page }) => {
  await page.setViewportSize({ width: 1526, height: 752 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/brands/ioak');
  await page.evaluate(() => document.fonts.ready);

  const statement = page.locator('[data-statement-variant="split"]');
  const lead = statement.locator(':scope > p:first-of-type');
  const detail = statement.locator(':scope > p:last-child');

  const leadStyles = await lead.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      color: styles.color,
      fontSize: styles.fontSize,
      marginTop: styles.marginTop,
      marginRight: styles.marginRight,
      marginLeft: styles.marginLeft,
    };
  });
  const detailStyles = await detail.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      color: styles.color,
      fontSize: styles.fontSize,
      marginRight: styles.marginRight,
      marginLeft: styles.marginLeft,
    };
  });

  expect(leadStyles).toEqual({
    color: 'rgb(111, 73, 37)',
    fontSize: '19.2px',
    marginTop: '-109px',
    marginRight: '-45px',
    marginLeft: '35px',
  });
  expect(detailStyles).toEqual({
    color: leadStyles.color,
    fontSize: leadStyles.fontSize,
    marginRight: leadStyles.marginRight,
    marginLeft: leadStyles.marginLeft,
  });

  const [leadBox, detailBox] = await Promise.all([lead.boundingBox(), detail.boundingBox()]);
  expect(detailBox.x).toBeCloseTo(leadBox.x, 1);
  expect(detailBox.width).toBeCloseTo(leadBox.width, 1);
});

test('IOAK introduction and factory retain the revised desktop spacing', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1221, height: 602 });
  await page.goto('/brands/ioak');

  const statement = page.locator('[data-statement-variant="split"]');
  const lead = statement.locator(':scope > p:first-of-type');
  const detail = statement.locator(':scope > p:last-child');
  const statementImage = statement.locator(':scope > figure');
  const factoryCopy = page.locator('[data-section-id="ioak-factory"] [data-section-copy]');

  expect.soft(await statement.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      marginBottom: styles.marginBottom,
      marginTop: styles.marginTop,
      paddingBottom: styles.paddingBottom,
      paddingTop: styles.paddingTop,
    };
  })).toEqual({
    marginBottom: '-18px',
    marginTop: '-18px',
    paddingBottom: '50.57px',
    paddingTop: '142.57px',
  });
  expect.soft(await statementImage.evaluate((element) => getComputedStyle(element).marginBottom))
    .toBe('35px');
  const [leadBox, detailBox] = await Promise.all([lead.boundingBox(), detail.boundingBox()]);
  expect.soft(leadBox.y + leadBox.height).toBeLessThanOrEqual(detailBox.y);
  const detailStyles = await detail.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      color: styles.color,
      fontSize: styles.fontSize,
      lineHeight: styles.lineHeight,
      marginTop: styles.marginTop,
      opacity: styles.opacity,
      width: Number.parseFloat(styles.width),
    };
  });
  expect.soft({ ...detailStyles, width: undefined }).toEqual({
    color: 'rgb(111, 73, 37)',
    fontSize: '16.8px',
    lineHeight: '27.72px',
    marginTop: '0px',
    opacity: '1',
    width: undefined,
  });
  expect.soft(detailBox.x + detailBox.width).toBeLessThanOrEqual(1221);
  expect.soft(await factoryCopy.evaluate((element) => {
    const styles = getComputedStyle(element);
    return { marginRight: styles.marginRight, marginLeft: styles.marginLeft };
  })).toEqual({ marginRight: '-16px', marginLeft: '25px' });
  expect.soft(await page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  )).toBe(true);
});

test('IOAK applies the annotated collection and feature typography without shifting image centers', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1221, height: 602 });
  await page.goto('/brands/ioak');

  const collections = page.locator('[data-section-id="ioak-collections"]');
  const collectionsEyebrow = collections.getByText('Discover the range', { exact: true });
  const collectionsTitle = collections.getByRole('heading', { name: 'Timber with character.' });
  expect.soft(await collectionsEyebrow.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      borderColor: styles.borderColor,
      color: styles.color,
      fontWeight: styles.fontWeight,
      marginBottom: styles.marginBottom,
      opacity: styles.opacity,
    };
  })).toEqual({
    borderColor: 'rgb(136, 128, 114)',
    color: 'rgb(134, 88, 45)',
    fontWeight: '700',
    marginBottom: '-21.2px',
    opacity: '1',
  });
  expect.soft(await collectionsTitle.evaluate((element) => {
    const styles = getComputedStyle(element);
    return { color: styles.color, fontWeight: styles.fontWeight, opacity: styles.opacity };
  })).toEqual({ color: 'rgb(111, 73, 37)', fontWeight: '500', opacity: '1' });

  const cards = collections.locator('article');
  const cardMetrics = await cards.evaluateAll((articles) => articles.map((article) => {
    const card = article.getBoundingClientRect();
    const image = article.querySelector('[data-ratio="square"]').getBoundingClientRect();
    return {
      cardCenter: card.left + (card.width / 2),
      imageCenter: image.left + (image.width / 2),
      imageWidth: image.width,
      transform: getComputedStyle(article.querySelector('[data-ratio="square"]')).transform,
    };
  }));
  cardMetrics.forEach(({ cardCenter, imageCenter, transform }, index) => {
    expect.soft(imageCenter).toBeCloseTo(cardCenter, 1);
    expect.soft(transform).toBe('matrix(0.98, 0, 0, 0.98, 0, 0)');
    if (index > 0) expect.soft(cardMetrics[index].imageWidth).toBeCloseTo(cardMetrics[0].imageWidth, 1);
  });
  expect.soft(await cards.locator('h3').evaluateAll((elements) => elements.map((element) => {
    const styles = getComputedStyle(element);
    return {
      borderColor: styles.borderColor,
      color: styles.color,
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      marginBottom: styles.marginBottom,
      marginTop: styles.marginTop,
    };
  }))).toEqual(Array(3).fill({
    borderColor: 'rgb(146, 100, 47)',
    color: 'rgb(111, 73, 37)',
    fontSize: '13px',
    fontWeight: '700',
    marginBottom: '1px',
    marginTop: '17px',
  }));
  const cardBodyStyles = await cards.locator(':scope > p').evaluateAll((elements) => elements.map((element) => {
    const styles = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    const parent = element.parentElement.getBoundingClientRect();
    return {
      centerOffset: (box.left + (box.width / 2)) - (parent.left + (parent.width / 2)),
      color: styles.color,
      fontSize: styles.fontSize,
      marginLeft: styles.marginLeft,
      width: Number.parseFloat(styles.width),
    };
  }));
  expect.soft(cardBodyStyles.map(({ centerOffset, width, ...styles }) => styles)).toEqual(Array(3).fill({
    color: 'rgb(122, 80, 41)',
    fontSize: '14px',
    marginLeft: '14px',
  }));
  cardBodyStyles.forEach(({ centerOffset, width }) => {
    expect.soft(Math.abs(centerOffset)).toBeLessThanOrEqual(3);
    expect.soft(width).toBeLessThanOrEqual(310.88);
  });

  const materials = page.locator('[data-section-id="ioak-materials"]');
  const materialsCopy = materials.locator('[data-section-copy]');
  const materialsEyebrow = materials.getByText('Material, grain, character', { exact: true });
  const materialsTitle = materials.getByRole('heading', { name: 'The beauty is in the detail.' });
  const materialsBody = materialsCopy.locator(':scope > p:nth-of-type(2)');
  const materialsMargins = await materials.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      marginLeft: Number.parseFloat(styles.marginLeft),
      marginRight: Number.parseFloat(styles.marginRight),
    };
  });
  expect.soft(materialsMargins.marginLeft).toBeCloseTo(61.05, 1);
  expect.soft(materialsMargins.marginRight).toBeCloseTo(61.05, 1);
  expect.soft(await materialsEyebrow.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      color: styles.color,
      fontSize: styles.fontSize,
      marginBottom: styles.marginBottom,
      marginLeft: styles.marginLeft,
      opacity: styles.opacity,
    };
  })).toEqual({
    color: 'rgb(134, 88, 45)',
    fontSize: '12.12px',
    marginBottom: '9px',
    marginLeft: '-3px',
    opacity: '1',
  });
  await expect.soft(materialsTitle).toHaveCSS('color', 'rgb(111, 73, 37)');
  await expect.soft(materialsTitle).toHaveCSS('margin-left', '-3px');
  const materialsBodyStyles = await materialsBody.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      color: styles.color,
      fontSize: styles.fontSize,
      marginLeft: styles.marginLeft,
      opacity: styles.opacity,
      width: Number.parseFloat(styles.width),
    };
  });
  expect.soft({ ...materialsBodyStyles, width: undefined }).toEqual({
    color: 'rgb(122, 80, 41)',
    fontSize: '15.12px',
    marginLeft: '-4px',
    opacity: '1',
    width: undefined,
  });
  expect.soft(materialsBodyStyles.width).toBeCloseTo(356.09, 1);

  const factory = page.locator('[data-section-id="ioak-factory"]');
  const factoryCopy = factory.locator('[data-section-copy]');
  const factoryMargins = await factory.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      marginLeft: Number.parseFloat(styles.marginLeft),
      marginRight: Number.parseFloat(styles.marginRight),
      marginTop: styles.marginTop,
    };
  });
  expect.soft(factoryMargins.marginLeft).toBeCloseTo(58.05, 1);
  expect.soft(factoryMargins.marginRight).toBeCloseTo(58.05, 1);
  expect.soft(factoryMargins.marginTop).toBe('-7px');
  await expect.soft(factory.getByText('Made in Melbourne', { exact: true }))
    .toHaveCSS('color', 'rgb(134, 88, 45)');
  await expect.soft(factory.getByRole('heading', { name: 'Local capability. Lasting performance.' }))
    .toHaveCSS('color', 'rgb(111, 73, 37)');
  expect.soft(await factoryCopy.locator(':scope > p:nth-of-type(2)').evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      color: styles.color,
      fontSize: styles.fontSize,
      opacity: styles.opacity,
    };
  })).toEqual({ color: 'rgb(122, 80, 41)', fontSize: '15.12px', opacity: '1' });
  expect.soft(await page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  )).toBe(true);
});

test('IOAK keeps the revised hero typography on the annotated narrow viewport', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 570, height: 478 });
  await page.goto('/brands/ioak');

  const hero = page.locator('[data-hero-layout="full-bleed"]');
  const eyebrow = hero.getByText('Timber flooring', { exact: true });
  const headline = hero.getByText('Natural foundations for modern living.', { exact: true });
  const scrollCue = hero.getByRole('button', { name: /scroll/i });

  const [heroBox, heroImageBox, headlineBox, scrollBox] = await Promise.all([
    hero.boundingBox(),
    hero.locator('figure img').boundingBox(),
    headline.boundingBox(),
    scrollCue.boundingBox(),
  ]);
  expect.soft(heroBox.y + heroBox.height).toBeCloseTo(478, 1);
  expect.soft(heroImageBox.height).toBeCloseTo(heroBox.height, 1);
  expect.soft(scrollBox.y).toBeGreaterThanOrEqual(headlineBox.y + headlineBox.height);
  expect.soft(scrollBox.y + scrollBox.height).toBeLessThanOrEqual(heroBox.y + heroBox.height);

  expect.soft(await eyebrow.evaluate((element) => getComputedStyle(element).fontSize)).toBe('12px');
  expect.soft(await headline.evaluate((element) => {
    const styles = getComputedStyle(element);
    return { fontSize: styles.fontSize, fontWeight: styles.fontWeight };
  })).toEqual({ fontSize: '16.72px', fontWeight: '200' });
  expect.soft(await scrollCue.evaluate((element) => {
    const styles = getComputedStyle(element);
    return { marginTop: styles.marginTop, opacity: styles.opacity };
  })).toEqual({ marginTop: '146px', opacity: '0.81' });
  expect.soft(scrollBox.height).toBeGreaterThanOrEqual(44);
  expect.soft(await page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  )).toBe(true);
});

test('IOAK keeps the scroll control inside the hero at the intermediate breakpoint', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 868, height: 602 });
  await page.goto('/brands/ioak');

  const hero = page.locator('[data-hero-layout="full-bleed"]');
  const scrollCue = hero.getByRole('button', { name: /scroll/i });
  const [heroBox, scrollBox] = await Promise.all([hero.boundingBox(), scrollCue.boundingBox()]);

  expect(scrollBox.y + scrollBox.height).toBeLessThanOrEqual(heroBox.y + heroBox.height);
});

test('IOAK keeps the enlarged collection copy clear of the mobile CTA', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/brands/ioak');

  const collections = page.locator('[data-section-id="ioak-collections"]');
  const lastDescription = collections.locator('article > p').last();
  const cta = collections.locator('[data-cta-placement="feature"]');
  const [descriptionBox, ctaBox] = await Promise.all([
    lastDescription.boundingBox(),
    cta.boundingBox(),
  ]);

  expect.soft(ctaBox.y).toBeGreaterThanOrEqual(descriptionBox.y + descriptionBox.height + 16);
  expect.soft(await page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  )).toBe(true);
});

test('FLUX uses the supplied image set and annotated desktop feature composition', async ({ page }) => {
  await page.setViewportSize({ width: 868, height: 602 });
  await page.goto('/brands/flux');

  const hero = page.locator('[data-hero-layout="full-bleed"]');
  await expect(hero.locator('figure img')).toHaveAttribute('src', '/assets/flux-hero-main.png');
  await expect(hero.locator('figure img')).toHaveAccessibleName(
    'Brushed metal FLUX wall tapware above a sculptural stone basin',
  );

  const logo = hero.locator('[data-wordmark="flux"] img');
  const headline = hero.getByText('Flow Within Minimal Forms.', { exact: true });
  const scrollCue = hero.getByRole('button', { name: /scroll/i });

  await expect(logo).toHaveAttribute('src', '/assets/flux-logo-white-tight.png');
  await expect(logo).toHaveJSProperty('naturalWidth', 778);
  await expect(logo).toHaveJSProperty('naturalHeight', 480);

  const [logoBox, headlineBox, scrollBox] = await Promise.all([
    logo.boundingBox(),
    headline.boundingBox(),
    scrollCue.boundingBox(),
  ]);
  const centerX = (box) => box.x + (box.width / 2);
  expect(Math.abs(centerX(logoBox) - centerX(headlineBox))).toBeLessThanOrEqual(1);
  expect(Math.abs(centerX(logoBox) - centerX(scrollBox))).toBeLessThanOrEqual(1);

  const headlineStyles = await headline.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      color: styles.color,
      fontSize: styles.fontSize,
      letterSpacing: styles.letterSpacing,
      marginTop: styles.marginTop,
      opacity: styles.opacity,
      paddingLeft: styles.paddingLeft,
      paddingRight: styles.paddingRight,
    };
  });
  expect(headlineStyles).toEqual({
    color: 'rgb(255, 249, 245)',
    fontSize: '17.73px',
    letterSpacing: '0.7092px',
    marginTop: '27.52px',
    opacity: '0.87',
    paddingLeft: '27px',
    paddingRight: '27px',
  });
  expect(await scrollCue.evaluate((element) => {
    const styles = getComputedStyle(element);
    return { marginTop: styles.marginTop, marginBottom: styles.marginBottom };
  })).toEqual({ marginTop: '145px', marginBottom: '-106px' });
  expect(await page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  )).toBe(true);

  const statement = page.getByLabel('FLUX introduction');
  await expect(statement.locator('img')).toHaveAttribute('src', '/assets/flux-statement-main.png');
  await expect(statement.locator('img')).toHaveAccessibleName(
    'FLUX wall-mounted tapware in a green tiled bathroom',
  );

  const collections = page.locator('[data-section-id="flux-collections"]');
  expect(await collections.locator('article img').evaluateAll(
    (images) => images.map((image) => image.getAttribute('src')),
  )).toEqual([
    '/assets/flux-bath-shower-main.png',
    '/assets/flux-kitchen-update821.png',
  ]);

  const collectionsTitle = collections.getByRole('heading', {
    name: 'Designed for everyday rituals.',
  });
  const bathShowerCard = collections.locator('article').nth(0);
  const bathShowerImage = bathShowerCard.locator('img');
  await bathShowerCard.scrollIntoViewIfNeeded();
  await expect(bathShowerCard).toHaveCSS('opacity', '1');
  const bathShowerScreenshot = await bathShowerImage.screenshot();
  const { data: bathShowerPixels, info: bathShowerInfo } = await sharp(bathShowerScreenshot)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const darkPixels = [];
  for (let y = Math.floor(bathShowerInfo.height * 0.45); y < bathShowerInfo.height; y += 1) {
    for (let x = Math.floor(bathShowerInfo.width * 0.5); x < bathShowerInfo.width; x += 1) {
      const pixel = ((y * bathShowerInfo.width) + x) * 3;
      const luminance = (
        (bathShowerPixels[pixel] * 0.2126)
        + (bathShowerPixels[pixel + 1] * 0.7152)
        + (bathShowerPixels[pixel + 2] * 0.0722)
      );
      if (luminance < 95) darkPixels.push(x);
    }
  }
  const faucetCenterRatio = (
    darkPixels.reduce((sum, x) => sum + x, 0) / darkPixels.length
  ) / bathShowerInfo.width;
  expect(faucetCenterRatio).toBeGreaterThan(0.78);
  expect(faucetCenterRatio).toBeLessThan(0.88);
  expect(Math.max(...darkPixels) / bathShowerInfo.width).toBeLessThan(0.93);
  expect(await collectionsTitle.evaluate((element) => getComputedStyle(element).fontSize))
    .toBe('20.4px');

  const feature = page.locator('[data-section-id="flux-feature"]');
  const copy = feature.locator('[class*="copy"]').first();
  const mosaic = feature.locator('[data-media-layout="flux-triptych"]');
  const copyMetrics = await copy.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      marginTop: styles.marginTop,
      marginRight: styles.marginRight,
      marginLeft: styles.marginLeft,
      width: element.getBoundingClientRect().width,
    };
  });
  expect(copyMetrics).toMatchObject({
    marginTop: '87.74px',
    marginRight: '-12px',
    marginLeft: '8px',
  });
  expect(copyMetrics.width).toBeCloseTo(336.59, 1);
  expect(await mosaic.evaluate((element) => getComputedStyle(element).transform))
    .toBe('matrix(1, 0, 0, 1, -10, 0)');
  await expect(mosaic.locator('img')).toHaveCount(3);
});

test('FLUX applies the requested desktop editorial spacing and color treatment', async ({ page }) => {
  await page.setViewportSize({ width: 1221, height: 800 });
  await page.goto('/brands/flux');

  const hero = page.locator('[data-hero-layout="full-bleed"]');
  const heroContent = hero.locator(':scope > div');
  const headline = hero.getByText('Flow Within Minimal Forms.', { exact: true });
  const scrollCue = hero.getByRole('button', { name: /scroll/i });

  expect(await heroContent.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      marginTop: styles.marginTop,
      marginLeft: Number.parseFloat(styles.marginLeft),
    };
  })).toEqual({ marginTop: '6px', marginLeft: -30.8 });
  expect(await headline.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      color: styles.color,
      letterSpacing: styles.letterSpacing,
      marginTop: styles.marginTop,
      opacity: styles.opacity,
    };
  })).toEqual({
    color: 'rgb(255, 249, 245)',
      letterSpacing: '0.7092px',
    marginTop: '27.52px',
    opacity: '0.87',
  });
  expect(await scrollCue.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      color: styles.color,
      marginBottom: styles.marginBottom,
      marginTop: styles.marginTop,
      opacity: styles.opacity,
    };
  })).toEqual({
    color: 'rgb(233, 223, 211)',
    marginBottom: '-106px',
    marginTop: '145px',
    opacity: '0.71',
  });
  await expect(scrollCue.locator('[data-scroll-breathe="true"]')).toHaveCSS('margin-top', '20px');

  const statement = page.getByLabel('FLUX introduction');
  const statementCopy = statement.locator(':scope > p');
  expect(await statement.evaluate((element) => {
    const styles = getComputedStyle(element);
    return { marginRight: styles.marginRight, marginLeft: styles.marginLeft };
  })).toEqual({ marginRight: '129.29px', marginLeft: '116.29px' });
  const statementCopyStyles = await statementCopy.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      color: styles.color,
      fontSize: styles.fontSize,
      height: Number.parseFloat(styles.height),
      lineHeight: styles.lineHeight,
      marginTop: styles.marginTop,
      marginRight: styles.marginRight,
      marginLeft: styles.marginLeft,
      opacity: styles.opacity,
      width: Number.parseFloat(styles.width),
    };
  });
  expect(statementCopyStyles).toMatchObject({
    color: 'rgb(122, 80, 41)',
    fontSize: '20.64px',
    lineHeight: '27.6576px',
    marginTop: '9px',
    marginRight: '4px',
    marginLeft: '34px',
    opacity: '1',
  });
  expect(statementCopyStyles.height).toBeGreaterThan(300);
  expect(statementCopyStyles.width).toBeCloseTo(428.6, 1);

  const collections = page.locator('[data-section-id="flux-collections"]');
  await expect(collections).toHaveCSS('margin-top', '10px');
  await expect(collections).toHaveCSS('margin-bottom', '10px');
  await expect(collections.locator('[data-layout="reference"]'))
    .toHaveCSS('column-gap', '46.746px');
  const collectionTitles = collections.locator('article h3');
  const collectionDescriptions = collections.locator('article > p').filter({ hasNotText: 'Collections' });
  await expect(collections.getByRole('heading', { name: 'Designed for everyday rituals.' }))
    .toHaveCSS('color', 'rgb(111, 73, 37)');
  await expect(collections.getByText('Collections', { exact: true }))
    .toHaveCSS('color', 'rgb(134, 88, 45)');
  expect(await collectionTitles.evaluateAll((elements) => elements.map((element) => {
    const styles = getComputedStyle(element);
    return {
      color: styles.color,
      fontWeight: styles.fontWeight,
      marginTop: styles.marginTop,
    };
  }))).toEqual(Array(2).fill({
    color: 'rgb(111, 73, 37)',
    fontWeight: '700',
    marginTop: '13px',
  }));
  const collectionDescriptionStyles = await collectionDescriptions.evaluateAll((elements) => elements.map((element) => {
    const styles = getComputedStyle(element);
    return {
      color: styles.color,
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      marginTop: styles.marginTop,
      opacity: styles.opacity,
      width: Number.parseFloat(styles.width),
    };
  }));
  expect(collectionDescriptionStyles.map(({ width, ...styles }) => styles)).toEqual(Array(2).fill({
    color: 'rgb(122, 80, 41)',
    fontSize: '14px',
    fontWeight: '500',
    marginTop: '6.6px',
    opacity: '1',
  }));
  collectionDescriptionStyles.forEach(({ width }) => expect(width).toBeCloseTo(342.88, 1));

  const feature = page.locator('[data-section-id="flux-feature"]');
  const featureCopy = feature.locator('[data-section-copy]');
  const featureEyebrow = feature.getByText('Sculptural restraint', { exact: true });
  const featureHeading = feature.getByRole('heading', { name: 'Made for the rituals of everyday life.' });
  const featureBody = feature.getByText(/From the first touch of the handle/);
  const featureCopyMetrics = await featureCopy.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      marginTop: styles.marginTop,
      marginRight: styles.marginRight,
      marginLeft: styles.marginLeft,
      width: styles.width,
    };
  });
  expect(featureCopyMetrics).toMatchObject({ marginTop: '87.74px', marginRight: '-12px', marginLeft: '8px' });
  expect(Number.parseFloat(featureCopyMetrics.width)).toBeCloseTo(306, 1);
  await expect(featureEyebrow).toHaveCSS('color', 'rgb(134, 88, 45)');
  await expect(featureEyebrow).toHaveCSS('margin-bottom', '15px');
  await expect(featureEyebrow).toHaveCSS('opacity', '1');
  await expect(featureHeading).toHaveCSS('color', 'rgb(111, 73, 37)');
  await expect(featureBody).toHaveCSS('color', 'rgb(122, 80, 41)');
  await expect(featureBody).toHaveCSS('font-size', '16.12px');
  await expect(featureBody).toHaveCSS('opacity', '1');

  const visitLink = collections.getByRole('link', { name: /Visit FLUX website/i });
  const visitLinkStyles = await visitLink.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      borderColor: styles.borderColor,
      borderWidth: styles.borderWidth,
      color: styles.color,
      opacity: styles.opacity,
    };
  });
  expect(visitLinkStyles).toMatchObject({
    borderColor: 'rgb(69, 30, 12)',
    color: 'rgb(134, 88, 45)',
    opacity: '1',
  });
  expect(Number.parseFloat(visitLinkStyles.borderWidth)).toBeCloseTo(1 / 1.1, 5);

  expect(await page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  )).toBe(true);
});

test('578 Experience uses the annotated desktop location and visit composition', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 631 });
  await page.goto('/experience');

  const main = page.getByRole('main');
  const directions = page.getByRole('link', { name: /Get directions/i });
  const location = page.locator('main > section').filter({ has: directions });
  const address = location.locator(':scope > div');
  const map = location.getByRole('img', { name: /Map of the 578 showroom area/i });
  const visitLink = page.getByRole('link', { name: 'Visit 578 website' });
  const visit = page.locator('main > section').filter({ has: visitLink });
  const visitCopy = visit.locator(':scope > div');

  expect(await main.evaluate((element) => {
    const styles = getComputedStyle(element);
    return { marginTop: styles.marginTop, marginBottom: styles.marginBottom };
  })).toEqual({ marginTop: '0px', marginBottom: '-23px' });

  expect(await address.evaluate((element) => {
    const styles = getComputedStyle(element);
    return { marginRight: styles.marginRight, marginLeft: styles.marginLeft };
  })).toEqual({ marginRight: '-5px', marginLeft: '84px' });
  expect(await directions.evaluate((element) => getComputedStyle(element).marginTop)).toBe('14px');

  expect(await map.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      paddingRight: styles.paddingRight,
      paddingLeft: styles.paddingLeft,
      marginLeft: styles.marginLeft,
    };
  })).toEqual({ paddingRight: '21px', paddingLeft: '23px', marginLeft: '-24px' });

  expect(await visitCopy.evaluate((element) => getComputedStyle(element).marginLeft)).toBe('-4px');
  expect(await visitLink.evaluate((element) => {
    const styles = getComputedStyle(element);
    return { marginTop: styles.marginTop, marginBottom: styles.marginBottom };
  })).toEqual({ marginTop: '-63px', marginBottom: '-63px' });

  const [visitBox, linkBox] = await Promise.all([visit.boundingBox(), visitLink.boundingBox()]);
  expect(linkBox.y).toBeCloseTo(visitBox.y - 69.3, 1);
  expect(linkBox.y + linkBox.height).toBeCloseTo(visitBox.y + visitBox.height + 69.3, 1);
});

test('578 Experience keeps the restored header scale and single-line hero title', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 631 });
  await page.goto('/experience');
  await page.evaluate(() => document.fonts.ready);

  const header = page.getByRole('banner');
  const logo = header.getByRole('img', { name: 'JS Building Group' });
  const title = page.getByRole('heading', { level: 1, name: '578 Interiors' });
  const [headerBox, logoBox] = await Promise.all([header.boundingBox(), logo.boundingBox()]);

  expect(headerBox.height).toBeCloseTo(70.4, 1);
  expect(logoBox.width).toBeLessThanOrEqual(211.2);
  expect(await title.evaluate((element) => {
    const styles = getComputedStyle(element);
    return element.getBoundingClientRect().height / Number.parseFloat(styles.lineHeight);
  })).toBeLessThan(1.1);
});

test('578 Experience keeps the full navigation bar clear of the hero', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/experience');

  const header = page.getByRole('banner');
  const hero = page.getByRole('region', { name: '578 Interiors' });
  const [headerBox, heroBox] = await Promise.all([header.boundingBox(), hero.boundingBox()]);

  expect(heroBox.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height);
});

test('578 Experience P2 title and body use the shared close brown tones', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/experience');

  const introduction = page.locator('main > section').nth(1);
  const titleColor = await introduction.getByRole('heading', { level: 2 }).evaluate(
    (element) => getComputedStyle(element).color,
  );
  const bodyColors = await introduction.locator('header > div > p').evaluateAll(
    (paragraphs) => paragraphs.map((paragraph) => getComputedStyle(paragraph).color),
  );

  expect(titleColor).toBe('rgb(111, 73, 37)');
  expect(bodyColors).toEqual(['rgb(122, 80, 41)', 'rgb(122, 80, 41)']);
});

test('578 Experience applies the requested hero and editorial color treatment', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/experience');
  await page.evaluate(() => document.fonts.ready);

  const hero = page.getByRole('region', { name: '578 Interiors' });
  const heroImage = hero.getByRole('img');
  const heroTitle = hero.getByRole('heading', { level: 1, name: '578 Interiors' });

  expect(await heroTitle.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      color: styles.color,
      width: Number.parseFloat(styles.width),
    };
  })).toMatchObject({ color: 'rgb(255, 247, 240)' });
  expect(Number.parseFloat(await heroTitle.evaluate((element) => getComputedStyle(element).width)))
    .toBeCloseTo(580, 1);
  expect(await heroTitle.evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return range.getClientRects().length;
  })).toBe(1);
  expect(await heroImage.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      objectPosition: styles.objectPosition,
      transform: styles.transform,
      transformOrigin: styles.transformOrigin,
    };
  })).toMatchObject({
    objectPosition: '50% 50%',
    transform: 'matrix(1.05, 0, 0, 1.05, 0, 0)',
  });

  const heroOverlay = await hero.evaluate((element) => (
    getComputedStyle(element, '::after').backgroundImage
  ));
  expect(heroOverlay).toContain('rgba(0, 0, 0, 0.03)');
  expect(heroOverlay).toContain('rgba(0, 0, 0, 0.2)');
  expect(heroOverlay).toContain('66.667%');

  const zoneGrid = page.getByTestId('experience-zone-grid');
  expect(await zoneGrid.locator('article h3').evaluateAll((elements) => elements.map((element) => {
    const styles = getComputedStyle(element);
    return { color: styles.color, fontWeight: styles.fontWeight };
  }))).toEqual(Array(3).fill({ color: 'rgb(111, 73, 37)', fontWeight: '600' }));
  expect(await zoneGrid.locator('article > p').evaluateAll((elements) => elements.map((element) => (
    getComputedStyle(element).color
  )))).toEqual(Array(3).fill('rgb(122, 80, 41)'));

  const introduction = page.locator('main > section').nth(1);
  const introductionHeading = introduction.getByRole('heading', {
    name: 'A destination where every detail comes together.',
  });
  const eyebrow = introduction.getByText('About the 578 Experience', { exact: true });
  const firstParagraph = introduction.getByText(/^Set within a 1000m² experience centre/);
  const secondParagraph = introduction.getByText(/^With our designers based in the showroom/);

  await expect(introductionHeading).toHaveCSS('color', 'rgb(111, 73, 37)');
  expect(await eyebrow.evaluate((element) => {
    const styles = getComputedStyle(element);
    return { color: styles.color, opacity: styles.opacity };
  })).toEqual({ color: 'rgb(134, 88, 45)', opacity: '1' });
  await expect(firstParagraph).toHaveCSS('opacity', '1');
  await expect(secondParagraph).toHaveCSS('opacity', '1');

  await page.setViewportSize({ width: 375, height: 812 });
  const mobileTitleBounds = await heroTitle.evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    const box = range.getBoundingClientRect();
    return {
      left: box.left,
      right: box.right,
      viewportWidth: document.documentElement.clientWidth,
    };
  });
  const mobileSubtitleBounds = await hero.getByText(
    'A destination where every detail comes together.',
    { exact: true },
  ).evaluate((element) => {
    const box = element.getBoundingClientRect();
    return {
      left: box.left,
      right: box.right,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
    };
  });
  expect(mobileTitleBounds.left).toBeGreaterThanOrEqual(0);
  expect(mobileTitleBounds.right).toBeLessThanOrEqual(mobileTitleBounds.viewportWidth);
  expect(mobileSubtitleBounds.left).toBeGreaterThanOrEqual(0);
  expect(mobileSubtitleBounds.right).toBeLessThanOrEqual(mobileSubtitleBounds.viewportWidth);
  expect(mobileSubtitleBounds.documentWidth).toBe(mobileSubtitleBounds.viewportWidth);
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
