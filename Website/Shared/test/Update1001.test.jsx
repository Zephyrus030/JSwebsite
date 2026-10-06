import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { expect, it } from 'vitest';
import App from '../../src/App';

function renderRoute(route) {
  return render(<MemoryRouter initialEntries={[route]}><App /></MemoryRouter>);
}

function imageSources(element) {
  return [...element.querySelectorAll('img')].map((image) => image.getAttribute('src'));
}

it('uses the October showroom and head office contact images', () => {
  renderRoute('/contact');

  expect(imageSources(screen.getByRole('article', { name: '578 Interiors' }))).toEqual([
    '/assets/update1001/578-contact-1.webp',
    '/assets/update1001/578-contact-2-news-1.webp',
  ]);
  expect(imageSources(screen.getByRole('article', { name: 'Head Office' }))).toEqual([
    '/assets/update922/contact-group-1.webp',
    '/assets/update1001/head-office-contact-2.webp',
  ]);
});

it('replaces the 578 news triptych and moves the factory facade to the lower right', () => {
  renderRoute('/news');

  expect(imageSources(screen.getByRole('article', { name: '578 Interiors is taking shape.' }))).toEqual([
    '/assets/update1001/578-contact-2-news-1.webp',
    '/assets/update1001/578-news-2.webp',
    '/assets/update1001/578-news-3.webp',
  ]);
  expect(imageSources(screen.getByRole('article', { name: 'Factory tours coming soon.' }))).toEqual([
    '/assets/update1001/interich-news-1.webp',
    '/assets/update922/contact-interich-2.webp',
    '/assets/update922/contact-interich-1.webp',
  ]);
});

it('keeps homepage news thumbnails consistent with the replaced lead images', () => {
  renderRoute('/');

  const sources = imageSources(screen.getByRole('main'));
  expect(sources).toContain('/assets/update1001/578-contact-2-news-1.webp');
  expect(sources).toContain('/assets/update1001/interich-news-1.webp');
});

it.each(['/experience', '/news', '/contact'])('serves existing replacement assets on %s', (route) => {
  renderRoute(route);

  const replacements = imageSources(screen.getByRole('main')).filter((source) => source.includes('/update1001/'));
  expect(replacements.length).toBeGreaterThan(0);
  for (const source of replacements) {
    expect(existsSync(path.join(process.cwd(), 'public', source))).toBe(true);
  }
});
