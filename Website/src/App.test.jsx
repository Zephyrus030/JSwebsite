import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import App from './App';

afterEach(() => {
  vi.unstubAllGlobals();
});

const enlargedRoutes = [
  ['/', /building better living/i],
  ['/brands/s-project', 'S Project'],
  ['/brands/interich', 'INTERICH'],
  ['/brands/ioak', 'IOAK'],
  ['/brands/flux', 'FLUX'],
  ['/experience', '578 Interiors'],
];

it.each(enlargedRoutes)('renders %s at the 110%% visual scale', (path, heading) => {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );

  expect(screen.getByRole('heading', { level: 1, name: heading })
    .closest('[data-page-scale="1.1"]')).toBeInTheDocument();
});

it.each(['/about', '/news', '/contact'])(
  'does not enlarge the %s route',
  (path) => {
    const { container } = render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>,
    );

    expect(container.querySelector('[data-page-scale]')).not.toBeInTheDocument();
  },
);

it('renders the homepage at the root route', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  );

  expect(
    screen.getByRole('heading', { name: /building better living/i }),
  ).toBeInTheDocument();
});

it('moves focus to the destination page heading after pathname navigation', async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  );

  await user.click(
    within(screen.getByRole('navigation', { name: 'Primary navigation' }))
      .getByRole('link', { name: 'Contact' }),
  );

  expect(screen.getByRole('heading', { level: 1, name: 'Plan your visit.' }))
    .toHaveFocus();
});

it('uses the clear image treatment on the Interich page', () => {
  render(
    <MemoryRouter initialEntries={['/brands/interich']}>
      <App />
    </MemoryRouter>,
  );

  const hero = screen.getByRole('heading', { name: 'INTERICH' }).closest('section');
  expect(hero).not.toHaveAttribute('data-hero-treatment');
  expect(hero.querySelector('figure img')).not.toHaveAttribute('data-frame-image');
});

it('reveals marked editorial image and text groups once they enter the viewport', () => {
  let observerCallback;
  const unobserve = vi.fn();
  class IntersectionObserverMock {
    constructor(callback) {
      observerCallback = callback;
    }
    observe() {}
    disconnect() {}
    unobserve = unobserve;
  }
  vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));

  render(
    <MemoryRouter initialEntries={['/about']}>
      <App />
    </MemoryRouter>,
  );

  const section = screen.getByRole('heading', {
    name: 'One group. One connected way to build.',
  }).closest('section');
  expect(section).toHaveAttribute('data-reveal-group', 'true');
  expect(section.querySelector('[data-reveal-item="text"]')).toBeInTheDocument();
  expect(section.querySelector('[data-reveal-item="image"]')).toBeInTheDocument();
  expect(section).toHaveAttribute('data-revealed', 'false');

  act(() => observerCallback([{ isIntersecting: true, target: section }]));

  expect(section).toHaveAttribute('data-revealed', 'true');
  expect(unobserve).toHaveBeenCalledWith(section);
});
