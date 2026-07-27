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
  ['/brands/flux', 'FLUX', ['Basin', 'Bath & Shower', 'Kitchen']],
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
  expect(screen.getByText('Local manufacturing. Lasting precision.')).toBeInTheDocument();
  unmount();

  renderRoute('/brands/ioak');
  expect(screen.getByText('The beauty is in the detail.')).toBeInTheDocument();
  expect(screen.getByText('Local capability. Lasting performance.')).toBeInTheDocument();
});

it('renders FLUX finish swatches from data', () => {
  renderRoute('/brands/flux');

  expect(screen.getByRole('list', { name: 'Available finishes' })).toBeInTheDocument();
  ['Brushed Nickel', 'Brushed Brass', 'Gunmetal', 'Matte Black'].forEach((finish) => {
    expect(screen.getByRole('listitem', { name: finish })).toBeInTheDocument();
  });
});

it.each([
  ['/brands/interich', 'Crafted for modern living.', 'text-left-media-right'],
  ['/brands/ioak', 'The beauty is in the detail.', 'text-left-media-right'],
  ['/brands/flux', 'Made for living beautifully.', 'text-left-media-right'],
  ['/brands/s-project', 'Spaces for a life well lived.', 'full-width-media'],
])('uses the declared composition variant on %s', (route, headingName, variant) => {
  renderRoute(route);

  const heading = screen.getByRole('heading', { name: headingName });
  const section = heading.closest('section');
  const copy = heading.closest('[data-section-copy]');
  const media = section.querySelector('figure');

  expect(section).toHaveAttribute('data-variant', variant);
  expect(copy.compareDocumentPosition(media) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

it('matches the INTERICH manufacturing reference with text-first DOM order', () => {
  renderRoute('/brands/interich');

  const heading = screen.getByRole('heading', {
    name: 'Local manufacturing. Lasting precision.',
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
  ['/brands/flux', 'Basin', 'portrait'],
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
  ['/brands/s-project', 'S Project', 'split'],
  ['/brands/interich', 'INTERICH', 'full-bleed'],
  ['/brands/ioak', 'IOAK', 'full-bleed'],
  ['/brands/flux', 'FLUX', 'product-split'],
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

it('uses the requested FLUX statement image and omits the replaced detail copy', () => {
  renderRoute('/brands/flux');

  const statement = screen.getByLabelText('FLUX introduction');
  expect(statement.querySelector('img')).toHaveAccessibleName('FLUX tapware beside a sculptural stone basin');
  expect(statement).toHaveTextContent('FLUX creates refined tapware');
  expect(statement).not.toHaveTextContent('Sculptural yet understated');
});

it('uses four equal reference columns for FLUX finishes', () => {
  renderRoute('/brands/flux');

  const swatches = screen.getByRole('list', { name: 'Available finishes' });
  expect(swatches).toHaveAttribute('data-layout', 'reference');
  expect(swatches).toHaveStyle({ '--reference-columns': '4' });
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
  ['/brands/s-project', 'Homes designed for the way life is lived.', 's-project'],
  ['/brands/ioak', 'Natural foundations for modern living.', 'ioak'],
  ['/brands/flux', 'Form in motion.', 'flux'],
])('renders the reference hero headline hierarchy on %s', (route, headline, variant) => {
  renderRoute(route);

  const title = screen.getByText(headline);
  expect(title).toHaveAttribute('data-headline-variant', variant);
  expect(title).toHaveClass(new RegExp('headline'));
});

it('renders the centred INTERICH intro below its hero', () => {
  renderRoute('/brands/interich');

  const intro = screen.getByRole('heading', {
    level: 2,
    name: 'Designed. Manufactured. Installed.',
  });
  expect(intro.closest('section')).toHaveAttribute('data-statement-variant', 'centered');
  expect(intro.closest('section')).toHaveTextContent(/considered cabinetry/i);
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
  ['/brands/flux', 'Made for living beautifully.', 'flux-triptych', ['primary', 'detail', 'room']],
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
  const craftedImage = screen.getByRole('heading', { name: 'Crafted for modern living.' })
    .closest('section')
    .querySelector('img');
  expect(heroImage.src).not.toBe(craftedImage.src);
  expect(heroImage.src).toContain('interich-hero-wide.webp');
});

it('uses the FLUX split-product hero and IOAK factory banner', () => {
  const { unmount } = renderRoute('/brands/flux');
  expect(screen.getByRole('heading', { level: 1, name: 'FLUX' }).closest('section'))
    .toHaveAttribute('data-hero-layout', 'product-split');

  unmount();
  renderRoute('/brands/ioak');
  const factory = screen.getByRole('heading', {
    name: 'Local capability. Lasting performance.',
  }).closest('section');
  expect(factory.querySelector('figure')).toHaveAttribute('data-ratio', 'banner');
});

it('places the IOAK CTA beside its factory media and enables the hero scroll transition', () => {
  renderRoute('/brands/ioak');

  const hero = screen.getByRole('heading', { level: 1, name: 'IOAK' }).closest('section');
  const factory = screen.getByRole('heading', {
    name: 'Local capability. Lasting performance.',
  }).closest('section');
  const cta = screen.getByRole('link', { name: /Visit IOAK website/i }).parentElement;

  expect(hero).toHaveAttribute('data-scroll-target', 'next-section');
  expect(screen.getByRole('button', { name: /scroll/i })).toBeInTheDocument();
  expect(cta).toHaveAttribute('data-cta-placement', 'feature');
  expect(factory).toContainElement(cta);
});

it('renders IOAK and FLUX as distinct inline SVG path wordmarks', () => {
  const { unmount } = renderRoute('/brands/ioak');
  const ioakHeading = screen.getByRole('heading', { level: 1, name: 'IOAK' });
  const ioakSvg = ioakHeading.querySelector('svg');
  const ioakPaths = [...ioakSvg.querySelectorAll('path')].map((path) => path.getAttribute('d'));
  expect(ioakSvg).toHaveAttribute('aria-hidden', 'true');
  expect(ioakHeading.querySelector('[data-wordmark-name]')).toHaveTextContent('IOAK');
  unmount();

  renderRoute('/brands/flux');
  const fluxHeading = screen.getByRole('heading', { level: 1, name: 'FLUX' });
  const fluxSvg = fluxHeading.querySelector('svg');
  const fluxPaths = [...fluxSvg.querySelectorAll('path')].map((path) => path.getAttribute('d'));
  expect(fluxSvg).toHaveAttribute('aria-hidden', 'true');
  expect(fluxHeading.querySelector('[data-wordmark-name]')).toHaveTextContent('FLUX');
  expect(fluxPaths).not.toEqual(ioakPaths);

  const heroCss = readFileSync(
    path.resolve(process.cwd(), 'Shared/components/Hero.module.css'),
    'utf8',
  );
  expect(heroCss).not.toContain('scaleX');
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

