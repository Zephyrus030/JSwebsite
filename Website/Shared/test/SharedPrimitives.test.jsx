import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import SiteFooter from '../components/SiteFooter';
import Hero from '../components/Hero';
import Reveal from '../components/Reveal';

afterEach(() => {
  vi.unstubAllGlobals();
});

it('renders the shared footer contact and social navigation', () => {
  render(
    <MemoryRouter>
      <SiteFooter />
    </MemoryRouter>,
  );

  expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Instagram' })).toHaveAttribute('href', 'https://www.instagram.com/');
  expect(screen.getByRole('link', { name: /contact/i })).toHaveAttribute('href', '/contact');
});

it('renders reveal content in its initial hidden state', () => {
  const observe = vi.fn();
  const disconnect = vi.fn();
  class IntersectionObserverMock {
    observe = observe;
    disconnect = disconnect;
  }
  vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

  render(
    <Reveal>
      <p>Editorial content</p>
    </Reveal>,
  );

  expect(screen.getByText('Editorial content').parentElement).toHaveAttribute(
    'data-revealed',
    'false',
  );
});

it('reveals content when IntersectionObserver is unavailable', () => {
  vi.stubGlobal('IntersectionObserver', undefined);

  render(
    <Reveal>
      <p>Fallback content</p>
    </Reveal>,
  );

  expect(screen.getByText('Fallback content').parentElement).toHaveAttribute(
    'data-revealed',
    'true',
  );
});

it('marks hero layers with a restrained entrance sequence', () => {
  render(
    <Hero
      eyebrow="Our approach"
      image="/hero.webp"
      imageAlt="Completed residence"
      scrollOnWheel
      text="Considered spaces for better living."
      title={'Building\nBetter Living.'}
    />,
  );

  const hero = screen.getByRole('region', { name: 'Building Better Living.' });
  const orderedSteps = [...hero.querySelectorAll('[data-motion-step]')]
    .map((element) => element.getAttribute('data-motion-step'));

  expect(hero).toHaveAttribute('data-motion-sequence', 'hero');
  expect(orderedSteps).toEqual(['image', 'eyebrow', 'wordmark', 'copy', 'scroll']);
  expect(screen.getByRole('button', { name: /scroll/i }).firstElementChild)
    .toHaveAttribute('data-scroll-breathe', 'true');
});

it('prepares geometric brand wordmarks for a single line-draw entrance', () => {
  render(
    <Hero
      image="/hero.webp"
      imageAlt="Material detail"
      title="IOAK"
      wordmark={{ construction: 'geometric', variant: 'ioak' }}
    />,
  );

  const paths = screen.getByRole('heading', { name: 'IOAK' }).querySelectorAll('path');

  expect(paths).toHaveLength(4);
  paths.forEach((path) => expect(path).toHaveAttribute('pathLength', '1'));
});
