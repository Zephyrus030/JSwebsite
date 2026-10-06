import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import Homepage from './Homepage';
import styles from './Homepage.module.css';

it('renders the complete editorial homepage with one page heading', () => {
  render(
    <MemoryRouter>
      <Homepage />
    </MemoryRouter>,
  );

  expect(
    screen.getByRole('heading', { level: 1, name: 'Building Better Living.' }),
  ).toBeInTheDocument();
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  expect(screen.getByRole('heading', { name: 'S Project' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'INTERICH' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'IOAK' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'FLUX' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: '578 INTERIORS' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'News' })).toBeInTheDocument();
  expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  expect(screen.getByAltText('Coastal living and kitchen interior with floor-to-ceiling windows'))
    .toHaveAttribute('src', '/assets/update914/home-about.webp');
});

it('offers Discover more links to each internal brand page', () => {
  render(<MemoryRouter><Homepage /></MemoryRouter>);

  for (const [name, href] of [
    ['S Project', '/brands/s-project'],
    ['INTERICH', '/brands/interich'],
    ['IOAK', '/brands/ioak'],
    ['FLUX', '/brands/flux'],
  ]) {
    const card = screen.getByRole('heading', { level: 3, name }).closest('article');
    expect(card.querySelector('a')).toHaveAttribute('href', href);
    expect(card.querySelector('a')).not.toHaveAttribute('target');
    expect(card.querySelector('span')).toHaveTextContent('DISCOVER MORE');
  }
});

it('uses a full viewport hero that snaps to the following section', () => {
  render(
    <MemoryRouter>
      <Homepage />
    </MemoryRouter>,
  );

  const hero = screen.getByRole('heading', { level: 1 }).closest('section');
  expect(hero).toHaveAttribute('data-scroll-target', 'next-section');
  expect(hero).toHaveStyle('--hero-height: calc(100svh - 4rem)');
});

it('applies the requested cooler, dimmed vertical treatment to the homepage hero', () => {
  render(
    <MemoryRouter>
      <Homepage />
    </MemoryRouter>,
  );

  const hero = screen.getByRole('heading', { level: 1 }).closest('section');
  expect(hero).toHaveAttribute('data-image-brightness-gradient', 'vertical');
  expect(hero).toHaveStyle({
    '--hero-image-brightness': '0.7',
    '--hero-image-warmth': '0.08',
    '--hero-image-saturation': '1.1',
  });
});

it('applies the annotated homepage section heights and spacing at desktop size', () => {
  const homepageCss = readFileSync(
    path.resolve(process.cwd(), 'Homepage/Homepage.module.css'),
    'utf8',
  );

  expect(homepageCss).toContain('height: 432.4px;');
  expect(homepageCss).toContain('padding-left: 9px;');
  expect(homepageCss).toContain('padding: 41.26px max(var(--page-gutter), calc((100% - 128rem) / 2)) 66.78px;');
  expect(homepageCss).toContain('margin-bottom: 38.84px;');
  expect(homepageCss).toContain('width: min(470.82px, 100%);');
  expect(homepageCss).toContain('padding: 51.26px max(var(--page-gutter), calc((100% - 128rem) / 2)) 36.05px;');
});

it('applies the refined About and 578 Experience desktop composition', () => {
  const homepageCss = readFileSync(
    path.resolve(process.cwd(), 'Homepage/Homepage.module.css'),
    'utf8',
  );

  expect(homepageCss).toContain('padding: 99.78px 50.05px;');
  expect(homepageCss).toContain('margin: 22px auto 42px;');
  expect(homepageCss).toContain('transform: scale(1.08);');
  expect(homepageCss).toContain('transform-origin: right center;');
  expect(homepageCss).toContain('.aboutFeature :global([class*="splitFigure"]) > img {\n    transform: scale(1.04);');
  expect(homepageCss).toContain('margin-bottom: 10px;');
});

it('dims the homepage image from a 30 percent top fade to zero at the bottom', () => {
  render(
    <MemoryRouter>
      <Homepage />
    </MemoryRouter>,
  );

  const homepageCss = readFileSync(
    path.resolve(process.cwd(), 'Homepage/Homepage.module.css'),
    'utf8',
  );
  expect(screen.getByRole('heading', { level: 1 }).closest('section')).toHaveStyle({
    '--hero-image-brightness': '0.7',
  });
  expect(homepageCss).toContain('rgb(0 0 0 / 40%) 0%');
  expect(homepageCss).toContain('rgb(0 0 0 / 0%) 100%');
});

it('applies the homepage visual review offsets and full-height image fade', () => {
  const homepageCss = readFileSync(
    path.resolve(process.cwd(), 'Homepage/Homepage.module.css'),
    'utf8',
  );

  expect(homepageCss).toContain('rgb(0 0 0 / 0%) 100%');
  expect(homepageCss).toContain(
    '.aboutFeature :global([class*="splitFigure"]) {\n  transform: translateX(-20px);',
  );
});

it('uses the supplied coastal corridor photograph for the homepage hero', () => {
  render(
    <MemoryRouter>
      <Homepage />
    </MemoryRouter>,
  );

  expect(screen.getByAltText('A minimalist interior corridor opening onto a coastal view'))
    .toHaveAttribute('src', '/assets/home-hero-main.png');
});

it('aligns the hero image bottom with the sticky navigation bottom', () => {
  render(
    <MemoryRouter>
      <Homepage />
    </MemoryRouter>,
  );

  const hero = screen.getByRole('heading', { level: 1 }).closest('section');
  const header = document.querySelector('header[role="banner"]');
  hero.getBoundingClientRect = vi.fn(() => ({ bottom: 700 }));
  header.getBoundingClientRect = vi.fn(() => ({ bottom: 70 }));
  Object.defineProperty(hero, 'offsetHeight', { configurable: true, value: 500 });
  Object.defineProperty(header, 'offsetHeight', { configurable: true, value: 64 });
  window.matchMedia = vi.fn(() => ({ matches: false }));
  window.scrollTo = vi.fn();

  fireEvent.wheel(window, { deltaY: 120 });

  expect(window.scrollTo).toHaveBeenCalledWith({ top: 630, behavior: 'smooth' });
});

it('places each brand description and action before its image', () => {
  render(
    <MemoryRouter>
      <Homepage />
    </MemoryRouter>,
  );

  for (const brandName of ['S Project', 'INTERICH', 'IOAK', 'FLUX']) {
    const heading = screen.getByRole('heading', { level: 3, name: brandName });
    const card = heading.closest('article');
    const action = card.querySelector('span');
    const figure = card.querySelector('figure');

    expect(heading.compareDocumentPosition(figure) & Node.DOCUMENT_POSITION_FOLLOWING)
      .toBeTruthy();
    expect(action.compareDocumentPosition(figure) & Node.DOCUMENT_POSITION_FOLLOWING)
      .toBeTruthy();
  }
});

it('uses a shared aligned media row for every brand image', () => {
  render(
    <MemoryRouter>
      <Homepage />
    </MemoryRouter>,
  );

  const brandImages = within(screen.getByRole('main')).getAllByRole('img').filter(
    ({ src }) => src.includes('/assets/home-brand-'),
  );

  expect(brandImages).toHaveLength(4);
  for (const image of brandImages) {
    expect(image.closest('figure')).toHaveClass(styles.brandImage);
  }
});

it('reserves the measured landscape ratio for homepage news photography', () => {
  render(
    <MemoryRouter>
      <Homepage />
    </MemoryRouter>,
  );

  for (const image of within(screen.getByRole('main')).getAllByRole('img').filter(
    ({ src }) => src.includes('/assets/home-news-'),
  )) {
    expect(image).toHaveAttribute('width', '86');
    expect(image).toHaveAttribute('height', '68');
  }
});

it('alternates homepage editorial surfaces and keeps split copy aligned to the reference', () => {
  render(
    <MemoryRouter>
      <Homepage />
    </MemoryRouter>,
  );

  expect([...document.querySelectorAll('main [data-surface]')].map((section) => section.dataset.surface))
    .toEqual(['paper', 'tint', 'paper', 'tint']);

  const homepageCss = readFileSync(
    path.resolve(process.cwd(), 'Homepage/Homepage.module.css'),
    'utf8',
  );
  expect(homepageCss).toContain('grid-template-columns: repeat(2, minmax(0, 1fr));');
  expect(homepageCss).toContain('padding: 0;');
});

it('keeps homepage editorial media and section headings at the reference scale', () => {
  const homepageCss = readFileSync(
    path.resolve(process.cwd(), 'Homepage/Homepage.module.css'),
    'utf8',
  );

  expect(homepageCss).toContain('.homeFeature :global([class*="splitFigure"]) {\n  aspect-ratio: 16 / 9;');
  expect(homepageCss).toContain('max-width: 128rem;');
  expect(homepageCss).toContain('.brands > .eyebrow {\n  margin-bottom: clamp(2.5rem, 4vw, 4rem);');
  expect(homepageCss).toContain('.newsGrid {\n  display: grid;');
  expect(homepageCss).toContain('margin-top: -1rem;');
});

it('gives each homepage split a widened, top-aligned text region', () => {
  render(
    <MemoryRouter>
      <Homepage />
    </MemoryRouter>,
  );

  const splits = document.querySelectorAll(`.${styles.homeFeature}`);
  expect(splits).toHaveLength(2);
  expect(splits[0]).toHaveClass(styles.aboutFeature);
  expect(splits[1]).toHaveClass(styles.experienceFeature);

  const homepageCss = readFileSync(
    path.resolve(process.cwd(), 'Homepage/Homepage.module.css'),
    'utf8',
  );
  expect(homepageCss).toContain('.aboutFeature :global([class*="splitContent"]),\n.experienceFeature :global([class*="splitContent"]) {');
  expect(homepageCss).toContain('max-width: 36rem;');
  expect(homepageCss).toContain('.aboutFeature :global([class*="splitContent"]) {\n  align-self: start;');
  expect(homepageCss).toContain('padding-top: clamp(3rem, 5vw, 5rem);');
  expect(homepageCss).toContain('.experienceFeature :global([class*="splitContent"]) {\n  align-self: center;');
  expect(homepageCss).toContain('justify-self: end;');
  expect(homepageCss).toContain('align-self: center;');
  expect(homepageCss).toContain('.aboutFeature :global([class*="splitContent"]) {\n    padding-top: 0;');
  expect(homepageCss).toContain('gap: clamp(2rem, 4vw, 4rem);');
});

it('moves About and 578 Experience copy 20px to the right', () => {
  const homepageCss = readFileSync(
    path.resolve(process.cwd(), 'Homepage/Homepage.module.css'),
    'utf8',
  );

  expect(homepageCss).toContain(
    '.aboutFeature :global([class*="splitContent"]),\n.experienceFeature :global([class*="splitContent"]) {\n  transform: translateX(20px);',
  );
});
