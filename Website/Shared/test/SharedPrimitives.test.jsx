import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import SiteFooter from '../components/SiteFooter';
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
  expect(screen.getByRole('link', { name: /instagram/i })).toBeInTheDocument();
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
