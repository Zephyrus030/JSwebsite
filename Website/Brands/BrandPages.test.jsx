import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, it } from 'vitest';
import App from '../src/App';

function renderRoute(route) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  );
}

it.each([
  ['/brands/s-project', 'S Project', ['Custom Homes', 'Design & Build', 'Melbourne Projects']],
  ['/brands/interich', 'INTERICH', ['Kitchens', 'Wardrobes', 'Whole-home Cabinetry']],
  ['/brands/ioak', 'IOAK', ['Natural Oak', 'Engineered Timber', 'Signature Finishes']],
  ['/brands/flux', 'FLUX', ['Bath & Shower', 'Kitchen']],
])('renders %s as a complete, distinct brand page', (route, name, collections) => {
  renderRoute(route);

  expect(screen.getByRole('heading', { level: 1, name })).toBeInTheDocument();
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  collections.forEach((collection) => {
    expect(screen.getByRole('heading', { name: collection })).toBeInTheDocument();
  });
  expect(screen.getByRole('link', { name: new RegExp(`Visit ${name} website`, 'i') }))
    .toHaveAttribute('target', '_blank');
  expect(screen.getByRole('contentinfo')).toBeInTheDocument();
});

it('renders INTERICH manufacturing and IOAK materials as brand-specific features', () => {
  const { unmount } = renderRoute('/brands/interich');
  expect(screen.getByText('Made locally. Built to last.')).toBeInTheDocument();
  unmount();

  renderRoute('/brands/ioak');
  expect(screen.getByText('The beauty is in the detail.')).toBeInTheDocument();
  expect(screen.getByText('Local capability. Lasting performance.')).toBeInTheDocument();
});

it('removes the FLUX finish swatches section', () => {
  renderRoute('/brands/flux');

  expect(screen.queryByRole('list', { name: 'Available finishes' })).not.toBeInTheDocument();
});

it.each([
  ['/brands/interich', 'Crafted for modern life.', 'text-left-media-right'],
  ['/brands/ioak', 'The beauty is in the detail.', 'text-left-media-right'],
  ['/brands/flux', 'Made for the rituals of everyday life.', 'text-left-media-right'],
  ['/brands/s-project', 'Homes shaped around the way life is lived.', 'media-left-text-right'],
])('uses the declared composition variant on %s', (route, headingName, variant) => {
  renderRoute(route);

  const heading = screen.getByRole('heading', { name: headingName });
  const section = heading.closest('section');
  const copy = heading.closest('[data-section-copy]');
  const media = section.querySelector('figure');

  expect(section).toHaveAttribute('data-variant', variant);
  const copyBeforeMedia = copy.compareDocumentPosition(media) & Node.DOCUMENT_POSITION_FOLLOWING;
  expect(Boolean(copyBeforeMedia)).toBe(variant !== 'media-left-text-right');
});

it('matches the INTERICH manufacturing reference with text-first DOM order', () => {
  renderRoute('/brands/interich');

  const heading = screen.getByRole('heading', {
    name: 'Made locally. Built to last.',
  });
  const section = heading.closest('section');
  const copy = heading.closest('[data-section-copy]');
  const media = section.querySelector('figure');

  expect(section).toHaveAttribute('data-variant', 'text-left-media-right');
  expect(copy.compareDocumentPosition(media) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

it.each([
  '/brands/s-project',
  '/brands/interich',
  '/brands/ioak',
  '/brands/flux',
])('gives every labelled section an existing heading on %s', (route) => {
  const { container } = renderRoute(route);

  for (const section of container.querySelectorAll('section[aria-labelledby]')) {
    const labelledBy = section.getAttribute('aria-labelledby');
    const label = container.querySelector(`#${labelledBy}`);

    expect(label, `${labelledBy} must reference an existing element`).not.toBeNull();
    expect(label.tagName).toMatch(/^H[1-6]$/);
  }
});

it.each([
  ['/brands/s-project', 'Custom Homes', 'portrait'],
  ['/brands/ioak', 'Natural Oak', 'square'],
  ['/brands/interich', 'Kitchens', 'square'],
  ['/brands/flux', 'Bath & Shower', 'portrait'],
])('renders the declared media ratio for %s collection items', (route, title, ratio) => {
  renderRoute(route);

  const card = screen.getByRole('heading', { name: title }).closest('article');
  expect(card.querySelector('[data-ratio]')).toHaveAttribute('data-ratio', ratio);
});

it.each([
  ['/brands/s-project', 'S Project', 's-project'],
  ['/brands/interich', 'INTERICH', 'interich'],
  ['/brands/ioak', 'IOAK', 'ioak'],
  ['/brands/flux', 'FLUX', 'flux'],
])('renders a distinct accessible wordmark on %s', (route, name, wordmark) => {
  renderRoute(route);

  const heading = screen.getByRole('heading', { level: 1, name });
  expect(heading).toHaveAttribute('data-wordmark', wordmark);
  expect(heading).toHaveClass(new RegExp(wordmark));
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
});

it.each([
  ['/brands/s-project', 'S Project', 'full-bleed'],
  ['/brands/interich', 'INTERICH', 'full-bleed'],
  ['/brands/ioak', 'IOAK', 'full-bleed'],
  ['/brands/flux', 'FLUX', 'full-bleed'],
])('applies the reference hero and compact brand footer on %s', (route, name, layout) => {
  const { container } = renderRoute(route);

  expect(screen.getByRole('heading', { level: 1, name }).closest('section'))
    .toHaveAttribute('data-hero-layout', layout);
  expect(container.querySelector('main')).toHaveAttribute('data-brand');
  expect(screen.getByRole('contentinfo')).toHaveAttribute('data-variant', 'brand');
});

it.each([
  ['/brands/s-project', 'A considered way to build.', 3],
  ['/brands/interich', 'All under one roof.', 3],
  ['/brands/ioak', 'Timber with character.', 3],
  ['/brands/flux', 'Designed for everyday rituals.', 2],
])('uses the exact reference grid at the current item count on %s', (route, heading, columns) => {
  renderRoute(route);

  const section = screen.getByRole('heading', { name: heading }).closest('section');
  const grid = section.querySelector('[data-layout]');
  expect(grid).toHaveAttribute('data-layout', 'reference');
  expect(grid).toHaveAttribute('data-reference-columns', String(columns));
});

it.each([
  '/brands/s-project',
  '/brands/interich',
  '/brands/ioak',
  '/brands/flux',
])('enables hero snapping on %s', (route) => {
  renderRoute(route);

  expect(screen.getByRole('heading', { level: 1 }).closest('section'))
    .toHaveAttribute('data-scroll-target', 'next-section');
});

it('uses the requested FLUX statement image and omits the replaced detail copy', () => {
  renderRoute('/brands/flux');

  const statement = screen.getByLabelText('FLUX introduction');
  expect(statement.querySelector('img')).toHaveAccessibleName('FLUX wall-mounted tapware in a green tiled bathroom');
  expect(statement).toHaveTextContent('Born in Melbourne, FLUX creates refined architectural tapware');
  expect(statement).not.toHaveTextContent('Sculptural yet understated');
});

it('uses the supplied S Project image set across the page', () => {
  renderRoute('/brands/s-project');

  const hero = screen.getByRole('heading', { level: 1, name: 'S Project' })
    .closest('section')
    .querySelector('img');
  expect(hero).toHaveAttribute('src', '/assets/s-project-hero-warm-v2.jpg');
  expect(hero).toHaveAccessibleName('S Project contemporary residence concept with architectural linework');

  const collectionImages = [...screen.getByRole('heading', { name: 'A considered way to build.' })
    .closest('section')
    .querySelectorAll('article img')];
  expect(collectionImages.map((image) => image.src)).toEqual([
    expect.stringContaining('update914/s-project-custom-homes.webp'),
    expect.stringContaining('update914/s-project-design-build.webp'),
    expect.stringContaining('update914/s-project-melbourne-projects.webp'),
  ]);

  const feature = screen.getByRole('heading', { name: 'Homes shaped around the way life is lived.' })
    .closest('section')
    .querySelector('img');
  expect(feature.src).toContain('s-project-residential-work.jpg');
});

it('uses the supplied S Project logo while keeping an accessible page heading', () => {
  renderRoute('/brands/s-project');

  const heading = screen.getByRole('heading', { level: 1, name: 'S Project' });
  expect(heading.querySelector('img')).toHaveAttribute('src', '/assets/s-project-logo-914.png');
  expect(heading.querySelector('img')).toHaveAttribute('aria-hidden', 'true');
  expect(heading.querySelector('span')).toBeNull();
});

it('centers the S Project hero copy in the open sky above the facade', () => {
  renderRoute('/brands/s-project');

  const hero = screen.getByRole('heading', { level: 1, name: 'S Project' }).closest('section');
  expect(hero).toHaveStyle('--hero-content-translate-y: -10%');

  const heroCss = readFileSync(
    path.resolve(__dirname, 'S_Project', 'SProjectPage.module.css'),
    'utf8',
  );
  expect(heroCss).toContain('margin-right: auto;');
  expect(heroCss).not.toContain('margin-right: 442px;');
  expect(heroCss).toContain('width: min(100%, clamp(28rem, 52vw, 62rem));');
  expect(heroCss).toContain('font-size: 26.63px;');
});

it('places the S Project residential CTA inside the collections module', () => {
  renderRoute('/brands/s-project');

  const collections = screen.getByRole('heading', { name: 'A considered way to build.' })
    .closest('section');
  const feature = screen.getByRole('heading', { name: 'Homes shaped around the way life is lived.' })
    .closest('section');
  const cta = screen.getByRole('link', { name: /Visit S Project website/i });

  expect(collections).toContainElement(cta);
  expect(feature).not.toContainElement(cta);
  expect(cta.parentElement).toHaveAttribute('data-cta-placement', 'feature');
  expect(screen.getByText('Independent website — launching 2026')).toBeInTheDocument();
});

it('uses two equal reference columns after removing the FLUX Basin collection', () => {
  renderRoute('/brands/flux');

  const collections = screen.getByRole('heading', { name: 'Designed for everyday rituals.' })
    .closest('section')
    .querySelector('[data-layout="reference"]');
  expect(collections).toHaveAttribute('data-reference-columns', '2');
  expect(collections.querySelectorAll('article')).toHaveLength(2);
  expect(screen.queryByRole('heading', { name: 'Basin' })).not.toBeInTheDocument();
  expect(screen.queryByRole('list', { name: 'Available finishes' })).not.toBeInTheDocument();
});

it.each([
  ['/brands/s-project', 'S Project'],
  ['/brands/interich', 'INTERICH'],
  ['/brands/ioak', 'IOAK'],
  ['/brands/flux', 'FLUX'],
])('keeps the Visit CTA external without an internal target page on %s', (route, name) => {
  renderRoute(route);

  const link = screen.getByRole('link', { name: new RegExp(`Visit ${name} website`, 'i') });
  expect(link.href).toMatch(/^https:\/\//);
  expect(link).toHaveAttribute('target', '_blank');
  expect(link).toHaveAttribute('rel', expect.stringMatching(/noreferrer/));
});

it.each([
  ['/brands/s-project', ['deep', 'paper', 'deep']],
  ['/brands/interich', ['paper', 'deep', 'paper']],
  ['/brands/ioak', ['deep', 'paper', 'deep', 'paper']],
  ['/brands/flux', ['deep', 'paper', 'deep']],
])('alternates the editorial surfaces on %s', (route, expectedSurfaces) => {
  const { container } = renderRoute(route);

  expect([...container.querySelectorAll('main[data-brand] [data-surface]')]
    .map((section) => section.dataset.surface))
    .toEqual(expectedSurfaces);
});

it.each([
  ['/brands/s-project', 'Homes designed for the way life is lived.', 's-project'],
  ['/brands/ioak', 'Natural foundations for modern living.', 'ioak'],
  ['/brands/flux', 'Flow Within Minimal Forms.', 'flux'],
])('renders the reference hero headline hierarchy on %s', (route, headline, variant) => {
  renderRoute(route);

  const title = screen.getByText(headline);
  expect(title).toHaveAttribute('data-headline-variant', variant);
  expect(title).toHaveClass(new RegExp('headline'));
});

it('keeps the S Project hero bright, neutral, and softly highlighted', () => {
  const { container } = renderRoute('/brands/s-project');
  const hero = container.querySelector('[data-hero-layout="full-bleed"]');

  expect(hero).toHaveAttribute('data-image-brightness-gradient', 'vertical');
  expect(hero).toHaveAttribute('data-hero-treatment', 'soft-highlight');
  expect(hero).toHaveStyle('--hero-image-brightness: 0.98');
  expect(hero).toHaveStyle('--hero-image-brightness-top: 0.72');
  expect(hero).toHaveStyle('--hero-image-contrast: 1.08');
  expect(hero).toHaveStyle('--hero-image-warmth: 0');
  expect(hero).toHaveStyle('--hero-image-hue: 0deg');
  expect(hero).toHaveStyle('--hero-image-saturation: 1.04');
  expect(hero).toHaveStyle('--hero-content-translate-y: -10%');
  expect(hero).toHaveStyle('--hero-image-brightness-bottom: 0.91');
});

it('applies the annotated S Project hero gradient, headline scale, and scroll placement', () => {
  renderRoute('/brands/s-project');

  const heroCss = readFileSync(
    path.resolve(__dirname, 'S_Project', 'SProjectPage.module.css'),
    'utf8',
  );

  expect(heroCss).toContain('to bottom,');
  expect(heroCss).toContain('font-size: 26.63px;');
  expect(heroCss).toContain('margin-top: clamp(8rem, 25vh, 188px);');
});

it('applies the latest S Project hero spacing and type annotations', () => {
  renderRoute('/brands/s-project');

  const heroCss = readFileSync(
    path.resolve(__dirname, 'S_Project', 'SProjectPage.module.css'),
    'utf8',
  );

  expect(heroCss).toContain('margin-top: 215px;');
  expect(heroCss).toContain('color: #ffffff;');
  expect(heroCss).toContain('font-size: 26.63px;');
  expect(heroCss).toContain('margin: 29px 119.2px -16px 152.19px;');
  expect(heroCss).toContain('letter-spacing: 0.025em;');
  expect(heroCss).toContain('font-size: clamp(4rem, 8vw, 97px);');
  expect(heroCss).toContain('margin-bottom: 4px;');
  expect(heroCss).toContain('color: #fffbf5;');
  expect(heroCss).toContain('font-size: 11px;');
  expect(heroCss).toContain('margin-top: clamp(8rem, 25vh, 188px);');
  expect(heroCss).toContain('opacity: 0.91;');
  expect(heroCss).toContain('row-gap: 4px;');
});

it('places the IOAK CTA inside the Discover the range collections module', () => {
  renderRoute('/brands/ioak');

  const collections = screen.getByRole('heading', { name: 'Timber with character.' })
    .closest('section');
  const factory = screen.getByRole('heading', { name: 'Local capability. Lasting performance.' })
    .closest('section');
  const cta = screen.getByRole('link', { name: /Visit IOAK website/i });

  expect(collections).toContainElement(cta);
  expect(factory).not.toContainElement(cta);
  expect(cta.parentElement).toHaveAttribute('data-cta-placement', 'feature');
});

it('applies the revised IOAK hero treatment and annotated editorial composition', () => {
  renderRoute('/brands/ioak');

  const hero = screen.getByRole('heading', { level: 1, name: 'IOAK' }).closest('section');
  expect(hero).toHaveAttribute('data-image-brightness-gradient', 'right-to-left');
  expect(hero).toHaveStyle('--hero-height: calc(100svh - 4rem)');
  expect(hero).toHaveStyle('--hero-image-brightness: 1');

});

it('removes the INTERICH intro section below its hero', () => {
  renderRoute('/brands/interich');

  expect(screen.queryByRole('heading', {
    level: 2,
    name: 'Designed. Manufactured. Installed.',
  })).not.toBeInTheDocument();
  expect(screen.queryByLabelText('INTERICH introduction')).not.toBeInTheDocument();
});

it('uses the INTERICH logo image in the hero wordmark', () => {
  renderRoute('/brands/interich');

  const heroHeading = screen.getByRole('heading', { level: 1, name: 'INTERICH' });
  expect(heroHeading.querySelector('img')).toHaveAttribute('src', '/assets/interich-logo-white.png');
  expect(heroHeading.querySelector('img')).toHaveAttribute('alt', '');
});

it('removes the INTERICH glass treatment and embeds its CTA in collections', () => {
  renderRoute('/brands/interich');

  const hero = screen.getByRole('heading', { level: 1, name: 'INTERICH' }).closest('section');
  const collections = screen.getByRole('heading', { name: 'All under one roof.' })
    .closest('section');
  const cta = screen.getByRole('link', { name: /Visit INTERICH website/i });

  expect(hero).not.toHaveAttribute('data-hero-treatment');
  expect(hero.querySelector('[data-frame-image]')).not.toBeInTheDocument();
  expect(collections).toContainElement(cta);
  expect(cta.parentElement).toHaveAttribute('data-cta-placement', 'feature');
});

it('raises the INTERICH hero eyebrow into the wordmark stack', () => {
  const css = readFileSync(
    path.resolve(__dirname, 'Interich', 'InterichPage.module.css'),
    'utf8',
  );
  const data = readFileSync(
    path.resolve(__dirname, 'INTERICH', 'brandData.js'),
    'utf8',
  );

  expect(css).toContain('margin: -51px 0 13px;');
  expect(data).toContain("height: 'calc(100svh - 4rem)'");
});

it('applies the annotated INTERICH collections and feature composition', () => {
  renderRoute('/brands/interich');

  const collections = screen.getByRole('heading', { name: 'All under one roof.' })
    .closest('section');
  const crafted = screen.getByRole('heading', { name: 'Crafted for modern life.' })
    .closest('section');
  const manufacturing = screen.getByRole('heading', {
    name: 'Made locally. Built to last.',
  }).closest('section');
  const cta = screen.getByRole('link', { name: /Visit INTERICH website/i }).parentElement;

  expect(collections).toHaveAttribute('data-section-id', 'interich-collections');
  expect(crafted).toHaveAttribute('data-section-id', 'interich-feature');
  expect(manufacturing).toHaveAttribute('data-section-id', 'interich-manufacturing');
  expect(collections).toContainElement(cta);

  const css = readFileSync(
    path.resolve(__dirname, 'INTERICH', 'InterichPage.module.css'),
    'utf8',
  );
  expect(css).toContain('main[data-brand="interich"] > [data-section-id="interich-collections"]');
  expect(css).toContain('main[data-brand="interich"] > [data-section-id="interich-manufacturing"]');
  expect(css).toContain('padding: 31.47px 0 127.47px;');
  expect(css).toContain('font-size: 13.48px;');
  expect(css).toContain('font-size: 12.48px;');
  expect(css).toContain('font-size: 20.63px;');
  expect(css).toContain('font-size: 30.63px;');
  expect(css).toContain('font-size: 32.63px;');
  expect(css).toContain('margin: 10px 0 3px;');
  expect(css).toContain('margin: 6px -3px -28px 0;');
  expect(css).toContain('padding: 19px 7px 0;');
  expect(css).toContain('margin: 10px 0 -67px;');
  expect(css).toContain('padding: 29px 0 0;');
  expect(css).not.toContain('padding-bottom: -9px;');
  expect(css).toContain('justify-items: center;');
  expect(css).toContain('padding: 62.47px 0;');
  expect(css).toContain('margin: -19px auto 0;');
  expect(css).toContain('margin-top: -26px;');
  expect(css).toContain('margin-right: -13px;');
  expect(css).toContain('margin-left: 19px;');
  expect(css).toContain('margin-bottom: -40px;');
  expect(css).toContain('margin-top: -57px;');
  expect(css).toContain('margin-top: -14px;');
  expect(css).toContain('gap: calc(var(--grid-gap) * 0.5);');
});

it('gives the INTERICH hero logo a larger responsive width', () => {
  const heroCss = readFileSync(
    path.resolve(process.cwd(), 'Shared/components/Hero.module.css'),
    'utf8',
  );

  expect(heroCss).toContain('width: clamp(30rem, 75vw, 60rem);');
  expect(heroCss).toContain('.content h1.interich.wordmark');
});

it('shrinks INTERICH collection images and expands their spacing', () => {
  renderRoute('/brands/interich');

  const grid = screen.getByRole('heading', { name: 'All under one roof.' })
    .closest('section')
    .querySelector('[data-layout="reference"]');
  expect(grid).toHaveStyle({ '--media-scale': '90%', '--media-gap': 'clamp(1.25rem, 2.5vw, 2.5rem)' });
});

it('uses a darker alternating surface for each INTERICH section', () => {
  const { container } = renderRoute('/brands/interich');

  const surfaces = [...container.querySelectorAll('main[data-brand="interich"] [data-section-id]')]
    .map((section) => section.dataset.surface);
  expect(surfaces).toEqual(['paper', 'deep', 'paper']);
});

it('brightens and warms the INTERICH hero image without changing its layout', () => {
  renderRoute('/brands/interich');

  const hero = screen.getByRole('heading', { level: 1, name: 'INTERICH' }).closest('section');
  expect(hero).toHaveStyle({
    '--hero-image-brightness': '0.6',
    '--hero-image-warmth': '0.08',
    '--hero-image-hue': '-6deg',
  });
});

it('reverses the INTERICH hero gradient toward the right side', () => {
  const heroCss = readFileSync(
    path.resolve(process.cwd(), 'Shared/components/Hero.module.css'),
    'utf8',
  );

  expect(heroCss).toContain('linear-gradient(270deg');
});

it('adds a vertical brightness fade and extended spacing to the INTERICH hero cue', () => {
  const { container } = renderRoute('/brands/interich');
  const hero = screen.getByRole('heading', { level: 1, name: 'INTERICH' }).closest('section');
  const heroCss = readFileSync(
    path.resolve(process.cwd(), 'Shared/components/Hero.module.css'),
    'utf8',
  );

  expect(hero).toHaveAttribute('data-image-brightness-gradient', 'vertical');
  expect(screen.getByRole('button', { name: /scroll/i })).toBeInTheDocument();
  expect(heroCss).toContain('linear-gradient(to bottom');
});

it('removes the unpainted gaps between INTERICH modules', () => {
  const brandCss = readFileSync(
    path.resolve(process.cwd(), 'Shared/components/BrandPage.module.css'),
    'utf8',
  );

  expect(brandCss).toContain('.page[data-brand="interich"] > .section');
  expect(brandCss).toContain('margin-top: 0;');
});

it('gives INTERICH copy a more generous reading scale', () => {
  const { container } = renderRoute('/brands/interich');

  expect(container.querySelector('main[data-brand="interich"]')).toHaveStyle({
    '--brand-copy-size': 'clamp(1rem, 1.35vw, 1.2rem)',
    '--brand-copy-max': '40rem',
  });
});

it('applies the latest INTERICH hero and collection composition', () => {
  renderRoute('/brands/interich');

  const hero = screen.getByRole('heading', { level: 1, name: 'INTERICH' }).closest('section');
  expect(hero).toHaveStyle('--hero-height: calc(100svh - 4rem)');
  expect(hero).toHaveStyle({
    '--hero-image-contrast': '0.98',
    '--hero-image-saturation': '1.13',
  });

  const css = readFileSync(
    path.resolve(__dirname, 'INTERICH', 'InterichPage.module.css'),
    'utf8',
  );
  expect(css).toContain('margin: -51px 0 13px;');
  expect(css).toContain('gap: calc(var(--grid-gap) * 0.5);');
  expect(css).toContain('text-align: center;');
  expect(css).toContain('rgb(0 0 0 / 20%) 0%,');
  expect(css).toContain('rgb(0 0 0 / 10%) 66.67%');
});

it.each([
  ['/brands/interich', 'interich-type'],
  ['/brands/ioak', 'ioak-geometric'],
  ['/brands/flux', 'flux-constructed'],
])('uses a distinct wordmark construction on %s', (route, construction) => {
  renderRoute(route);

  expect(screen.getByRole('heading', { level: 1 }))
    .toHaveAttribute('data-wordmark-construction', construction);
});

it.each([
  ['/brands/ioak', 'The beauty is in the detail.', 'ioak-pair', ['sample', 'floor']],
  ['/brands/flux', 'Made for the rituals of everyday life.', 'flux-triptych', ['bath', 'kitchen', 'detail']],
])('renders a declarative media mosaic on %s', (route, heading, layout, areas) => {
  renderRoute(route);

  const section = screen.getByRole('heading', { name: heading }).closest('section');
  const mosaic = section.querySelector('[data-media-layout]');
  expect(mosaic).toHaveAttribute('data-media-layout', layout);
  expect([...mosaic.querySelectorAll('figure')].map((figure) => figure.dataset.area))
    .toEqual(areas);
});

it('uses a distinct clean INTERICH hero asset from the Crafted feature', () => {
  renderRoute('/brands/interich');

  const pageHeading = screen.getByRole('heading', { level: 1, name: 'INTERICH' });
  const heroImage = pageHeading.closest('section').querySelector('img');
  const craftedImage = screen.getByRole('heading', { name: 'Crafted for modern life.' })
    .closest('section')
    .querySelector('img');
  expect(heroImage.src).not.toBe(craftedImage.src);
  expect(heroImage.src).toContain('update922/interich-hero.webp');
});

it('uses the JSON-selected INTERICH image replacements across the page', () => {
  renderRoute('/brands/interich');

  const collectionImages = [...screen.getByRole('heading', { name: 'All under one roof.' })
    .closest('section')
    .querySelectorAll('article img')];
  expect(collectionImages.map((image) => image.src)).toEqual([
    expect.stringContaining('interich-kitchens-edited.png'),
    expect.stringContaining('interich-wardrobes-edited.png'),
    expect.stringContaining('interich-whole-home-edited.png'),
  ]);

  expect(screen.getByRole('heading', { name: 'Crafted for modern life.' })
    .closest('section')
    .querySelector('figure img').src).toContain('update914/interich-feature.webp');
  expect(screen.getByRole('heading', { name: 'Made locally. Built to last.' })
    .closest('section')
    .querySelector('figure img').src).toContain('update914/interich-manufacturing.webp');
});

it('uses the FLUX full-bleed hero and IOAK factory banner', () => {
  const { unmount } = renderRoute('/brands/flux');
  expect(screen.getByRole('heading', { level: 1, name: 'FLUX' }).closest('section'))
    .toHaveAttribute('data-hero-layout', 'full-bleed');

  unmount();
  renderRoute('/brands/ioak');
  const factory = screen.getByRole('heading', {
    name: 'Local capability. Lasting performance.',
  }).closest('section');
  expect(factory.querySelector('figure')).toHaveAttribute('data-ratio', 'banner');
});

it('uses the supplied FLUX logo and replacement image set', () => {
  renderRoute('/brands/flux');

  const hero = screen.getByRole('heading', { level: 1, name: 'FLUX' });
  expect(hero.querySelector('img')).toHaveAttribute('src', '/assets/flux-logo-white-tight.png');

  const collectionImages = [...screen.getByRole('heading', { name: 'Designed for everyday rituals.' })
    .closest('section')
    .querySelectorAll('article img')];
  expect(collectionImages.map((image) => image.src)).toEqual([
    expect.stringContaining('flux-bath-shower-main.png'),
    expect.stringContaining('flux-kitchen-update821.png'),
  ]);

  expect(screen.getByLabelText('FLUX introduction').querySelector('img').src)
    .toContain('flux-statement-main.png');
  expect(screen.getByRole('heading', { name: 'Made for the rituals of everyday life.' })
    .closest('section')
    .querySelectorAll('figure img').length).toBe(3);
  const featureImages = [...screen.getByRole('heading', { name: 'Made for the rituals of everyday life.' })
    .closest('section')
    .querySelectorAll('figure img')];
  expect(featureImages.map((image) => image.src)).toEqual([
    expect.stringContaining('flux3-1.png'),
    expect.stringContaining('flux3-2.png'),
    expect.stringContaining('flux3-3.png'),
  ]);
});

it('fills the FLUX first viewport and centers its hero treatment in the marked composition', () => {
  renderRoute('/brands/flux');

  const hero = screen.getByRole('heading', { level: 1, name: 'FLUX' }).closest('section');
  expect(hero).toHaveStyle('--hero-height: calc(100svh - 4rem)');
  expect(hero.querySelector('h1 img')).toHaveAttribute('src', '/assets/flux-logo-white-tight.png');

  const heroCss = readFileSync(
    path.resolve(__dirname, 'FLUX', 'FluxPage.module.css'),
    'utf8',
  );
  expect(heroCss).toContain('--hero-content-offset: calc(clamp(6rem, 10.5vw, 18rem) + 20px);');
  expect(heroCss).toContain('--hero-content-max: min(34vw, 56rem);');
});

it('uses the supplied IOAK hero image, logo, and introduction image', () => {
  renderRoute('/brands/ioak');

  const hero = screen.getByRole('heading', { level: 1, name: 'IOAK' });
  expect(hero.querySelector('img')).toHaveAttribute('src', '/assets/ioak-logo-white-tight.png');
  expect(hero.closest('section').querySelector('figure img')).toHaveAttribute(
    'src',
    '/assets/ioak-hero-main.png',
  );

  const statement = screen.getByLabelText('IOAK introduction');
  expect(statement.querySelector('img')).toHaveAttribute('src', '/assets/ioak-introduction.png');
  expect(statement).not.toHaveTextContent('IOAK brings together considered timber species');
});

it('uses the annotated IOAK statement copy and desktop reading measure', () => {
  renderRoute('/brands/ioak');

  const statement = screen.getByLabelText('IOAK introduction');
  expect(statement).toHaveTextContent(
    'IOAK specialises in premium multi-layer engineered timber flooring, created for interiors where natural material, refined design and lasting performance matter.',
  );
  expect(statement).toHaveTextContent(
    'Each collection is developed to preserve the warmth, grain and individuality of real timber, while offering the stability required for modern homes. Thoughtful tones, refined finishes and enduring quality define the IOAK approach to flooring.',
  );

  const css = readFileSync(
    path.resolve(__dirname, 'IOAK', 'IoakPage.module.css'),
    'utf8',
  );
  expect(css).toContain('width: 388.8px;');
  expect(css).toContain('margin: -51px -40px 0 50px;');
  expect(css).toContain('line-height: 1.62;');
});

it('adjusts the IOAK hero copy spacing', () => {
  const css = readFileSync(
    path.resolve(__dirname, 'IOAK', 'IoakPage.module.css'),
    'utf8',
  );

  expect(css).toContain('margin: 20.52px auto 4px;');
  expect(css).toContain('margin: 28px auto 4px;');
});

it('expands the IOAK statement column gap on desktop', () => {
  const css = readFileSync(
    path.resolve(__dirname, 'IOAK', 'IoakPage.module.css'),
    'utf8',
  );

  expect(css).toContain('column-gap: 2.6rem;');
});

it('renders the supplied IOAK detail images in their numbered order', () => {
  renderRoute('/brands/ioak');
  const images = [...screen.getByRole('heading', { name: 'The beauty is in the detail.' })
    .closest('section').querySelectorAll('figure img')];
  expect(images.map((image) => image.getAttribute('src'))).toEqual([
    '/assets/update914/ioak-detail-1.webp',
    '/assets/update914/ioak-detail-2.webp',
  ]);
});

it('uses the supplied IOAK collection and factory image set', () => {
  renderRoute('/brands/ioak');

  const collectionImages = [...screen.getByRole('heading', { name: 'Timber with character.' })
    .closest('section')
    .querySelectorAll('article img')];
  expect(collectionImages.map((image) => image.src)).toEqual([
    expect.stringContaining('update914/ioak-natural-oak.webp'),
    expect.stringContaining('update914/ioak-engineered-timber.webp'),
    expect.stringContaining('update914/ioak-signature-finishes.webp'),
  ]);

  expect(screen.getByRole('heading', { name: 'Local capability. Lasting performance.' })
    .closest('section')
    .querySelector('figure img').src).toContain('ioak-factory-edited.png');
});

it('places the FLUX CTA inside the collections section', () => {
  renderRoute('/brands/flux');

  const collections = screen.getByRole('heading', { name: 'Designed for everyday rituals.' })
    .closest('section');
  expect(collections).toContainElement(screen.getByRole('link', { name: /Visit FLUX website/i }));
  expect(screen.getByRole('link', { name: /Visit FLUX website/i }).parentElement)
    .toHaveAttribute('data-cta-placement', 'feature');
});

it('keeps the IOAK CTA external and enables the hero scroll transition', () => {
  renderRoute('/brands/ioak');

  const hero = screen.getByRole('heading', { level: 1, name: 'IOAK' }).closest('section');
  const cta = screen.getByRole('link', { name: /Visit IOAK website/i }).parentElement;

  expect(hero).toHaveAttribute('data-scroll-target', 'next-section');
  expect(screen.getByRole('button', { name: /scroll/i })).toBeInTheDocument();
  expect(cta).toHaveAttribute('data-cta-placement', 'feature');
  expect(screen.getByRole('heading', { name: 'Timber with character.' })
    .closest('section')).toContainElement(cta);
});

it('renders supplied artwork for IOAK and FLUX wordmarks', () => {
  const { unmount } = renderRoute('/brands/ioak');
  const ioakHeading = screen.getByRole('heading', { level: 1, name: 'IOAK' });
  expect(ioakHeading.querySelector('img')).toHaveAttribute('src', '/assets/ioak-logo-white-tight.png');
  expect(ioakHeading.querySelector('img')).toHaveAttribute('alt', '');
  unmount();

  renderRoute('/brands/flux');
  const fluxHeading = screen.getByRole('heading', { level: 1, name: 'FLUX' });
  expect(fluxHeading.querySelector('img')).toHaveAttribute('src', '/assets/flux-logo-white-tight.png');

  const heroCss = readFileSync(
    path.resolve(process.cwd(), 'Shared/components/Hero.module.css'),
    'utf8',
  );
  expect(heroCss).not.toContain('scaleX');
});

it('applies the annotated FLUX hero, statement, and collections composition', () => {
  renderRoute('/brands/flux');

  const hero = screen.getByRole('heading', { level: 1, name: 'FLUX' }).closest('section');
  expect(hero).not.toHaveTextContent('Tapware');

  const fluxCss = readFileSync(
    path.resolve(__dirname, 'FLUX', 'FluxPage.module.css'),
    'utf8',
  );
  expect(fluxCss).toContain('--flux-hero-axis: 375.29px;');
  expect(fluxCss).toContain('--hero-content-offset: calc(clamp(6rem, 10.5vw, 18rem) + 20px);');
  expect(fluxCss).toContain('margin-top: 6px;');
  expect(fluxCss).toContain('margin-left: -30.8px;');
  expect(fluxCss).toContain('font-size: 17.73px;');
  expect(fluxCss).toContain('width: 331.05px;');
  expect(fluxCss).toContain('padding-right: 27px;');
  expect(fluxCss).toContain('padding-left: 27px;');
  expect(fluxCss).toContain('color: #e9dfd3;');
  expect(fluxCss).toContain('opacity: 0.87;');
  expect(fluxCss).toContain('letter-spacing: 0.04em;');
  expect(fluxCss).toContain('opacity: 0.71;');
  expect(fluxCss).toContain('transform: translateX(-50%);');
  expect(fluxCss).toContain('width: 254px;');
  expect(fluxCss).toContain('height: auto;');
  expect(fluxCss).toContain('font-weight: 100;');
  expect(fluxCss).toContain('width: 428.6px;');
  expect(fluxCss).toContain('line-height: 1.34;');
  expect(fluxCss).toContain('padding: 42.47px 83px 42.47px 85px;');
  expect(fluxCss).toContain('margin: 0 129.29px 0 116.29px;');
  expect(fluxCss).toContain('padding-top: 35.47px;');
  expect(fluxCss).toContain('padding-bottom: 35.47px;');
  expect(fluxCss).toContain('height: 428.17px;');
  expect(fluxCss).toContain('margin: -1px 0 15px;');
  expect(fluxCss).toContain('margin-bottom: -22px;');
  expect(fluxCss).toContain('justify-items: center;');
  expect(fluxCss).toContain('aspect-ratio: 3 / 4;');
  expect(fluxCss).toContain('transform: translateX(-20px);');
  expect(fluxCss).toContain('font-weight: 100;');
  expect(fluxCss).toContain('letter-spacing: 0.012em;');
  expect(fluxCss).toContain('margin-left: -15px;');
  expect(fluxCss).toContain('margin-right: -15px;');
  expect(fluxCss).toContain('transform: scale(0.98);');
  expect(fluxCss).toContain('margin-top: 31px;');
  expect(fluxCss).toContain('grid-template-areas:');
  expect(fluxCss).toContain('"bath kitchen"');
  expect(fluxCss).toContain('"detail detail"');
  expect(fluxCss).toContain('width: 85.714%;');
  expect(fluxCss).toContain('aspect-ratio: 4 / 3;');
  expect(fluxCss).toContain('width: 306px;');
  expect(fluxCss).toContain('margin: 87.74px -12px 0 8px;');
  expect(fluxCss).toContain('gap: calc(var(--grid-gap) * 1.3 + 15px);');
  expect(fluxCss).toContain('margin-top: 10px;');
  expect(fluxCss).toContain('margin-bottom: 10px;');
  expect(fluxCss).toContain('margin-top: 20px;');
  expect(fluxCss).toContain('color: var(--ink);');
  expect(fluxCss).toContain('font-weight: 700;');
  expect(fluxCss).toContain('color: var(--body);');
  expect(fluxCss).toContain('font-weight: 500;');
  expect(fluxCss).toContain('color: var(--muted);');
  expect(fluxCss).toContain('border: 1.3px solid #451e0c;');
  expect(fluxCss).toContain('transform: translateX(-10px);');
  expect(fluxCss).toContain('margin-left: var(--flux-hero-axis);');
});

it('marks the IOAK reference mosaic as equal-height with count fallback metadata', () => {
  renderRoute('/brands/ioak');

  const mosaic = screen.getByRole('heading', { name: 'The beauty is in the detail.' })
    .closest('section')
    .querySelector('[data-media-layout]');
  expect(mosaic).toHaveAttribute('data-layout', 'reference');
  expect(mosaic).toHaveAttribute('data-equal-height', 'true');
  expect(mosaic).toHaveAttribute('data-mobile-layout', 'stack');
  for (const figure of mosaic.querySelectorAll('figure')) {
    expect(figure).toHaveClass(new RegExp('mosaicCell'));
  }
});
