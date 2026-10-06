import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it } from 'vitest';
import SiteHeader from '../components/SiteHeader';
import styles from '../components/SiteHeader.module.css';
import headerCss from '../components/SiteHeader.module.css?raw';

function renderHeader(initialEntry = '/') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <SiteHeader />
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
  document.body.style.overflow = '';
});

it('renders the supplied JS Building Group logo asset in the home link', () => {
  renderHeader();

  expect(screen.getByRole('img', { name: 'JS Building Group' })).toHaveAttribute(
    'src',
    '/assets/js-building-group-logo.png',
  );
});

it('uses one typography class for every desktop navigation item', () => {
  renderHeader();

  const desktopNav = screen.getByRole('navigation', { name: 'Primary navigation' });
  const items = desktopNav.querySelectorAll('a, button');

  expect(items).toHaveLength(5);
  items.forEach((item) => expect(item).toHaveClass(styles.navItem));
  expect(screen.getByRole('button', { name: 'Our Brands' })).toBeInTheDocument();
});

it('keeps desktop navigation items in one horizontal row at the requested size', () => {
  expect(headerCss).toContain('.desktopNav {');
  expect(headerCss).toContain('display: flex;');
  expect(headerCss).toContain('flex-direction: row;');
  expect(headerCss).toContain('.navItem');
  expect(headerCss).toContain('font-size: 0.8125rem;');
});

it('uses title case for the mobile brands label', async () => {
  const user = userEvent.setup();
  renderHeader();

  await user.click(document.querySelector('[aria-label="Menu"]'));

  expect(within(document.getElementById('mobile-menu')).getByText('Our Brands')).toBeInTheDocument();
});

it.each(['desktop', 'mobile'])('orders uppercase brand links consistently in the %s menu', async (mode) => {
  const user = userEvent.setup();
  renderHeader();

  if (mode === 'mobile') {
    await user.click(document.querySelector('[aria-label="Menu"]'));
  }
  const navigation = mode === 'mobile'
    ? document.querySelector('#mobile-menu nav')
    : screen.getByRole('navigation', { name: 'Primary navigation' });
  await user.click(within(navigation).getByText('Our Brands'));
  const links = [...navigation.querySelectorAll('a[href^="/brands/"]')];
  expect(links.map((link) => [link.textContent, link.getAttribute('href')])).toEqual([
    ['IOAK', '/brands/ioak'],
    ['FLUX', '/brands/flux'],
    ['INTERICH', '/brands/interich'],
    ['S PROJECT', '/brands/s-project'],
  ]);
});

it('opens the brands menu on click and exposes every brand link', async () => {
  const user = userEvent.setup();
  renderHeader();

  const trigger = screen.getByRole('button', { name: /our brands/i });
  await user.click(trigger);

  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('link', { name: 'S PROJECT' })).toHaveAttribute(
    'href',
    '/brands/s-project',
  );
  expect(screen.getByRole('link', { name: 'INTERICH' })).toHaveAttribute(
    'href',
    '/brands/interich',
  );
  expect(screen.getByRole('link', { name: 'IOAK' })).toHaveAttribute(
    'href',
    '/brands/ioak',
  );
  expect(screen.getByRole('link', { name: 'FLUX' })).toHaveAttribute(
    'href',
    '/brands/flux',
  );
});

it('closes the brands menu on Escape and restores trigger focus', async () => {
  const user = userEvent.setup();
  renderHeader();

  const trigger = screen.getByRole('button', { name: /our brands/i });
  await user.click(trigger);
  await user.keyboard('{Escape}');

  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(trigger).toHaveFocus();
});

it('closes the brands menu when Escape is pressed from a brand link', async () => {
  const user = userEvent.setup();
  renderHeader();

  const trigger = screen.getByRole('button', { name: /our brands/i });
  await user.click(trigger);
  const brandLink = screen.getByRole('link', { name: 'S PROJECT' });
  brandLink.focus();
  await user.keyboard('{Escape}');

  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(trigger).toHaveFocus();
});

it('closes the brands menu when clicking outside its navigation', async () => {
  const user = userEvent.setup();
  renderHeader();

  const trigger = screen.getByRole('button', { name: /our brands/i });
  await user.click(trigger);
  await user.click(document.body);

  expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

it.each(['About', '578 Interiors', 'News', 'Contact'])(
  'closes the brands menu when the %s route is selected',
  async (routeLabel) => {
    const user = userEvent.setup();
    renderHeader();

    const trigger = screen.getByRole('button', { name: /our brands/i });
    await user.click(trigger);
    await user.click(screen.getByRole('link', { name: routeLabel }));

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: 'S PROJECT' })).not.toBeInTheDocument();
  },
);

it('opens the mobile menu from a labeled control and locks page scrolling', async () => {
  const user = userEvent.setup();
  renderHeader();

  const menuButton = document.querySelector('[aria-label="Menu"]');
  expect(menuButton).toBeInstanceOf(HTMLButtonElement);
  await user.click(menuButton);

  expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  expect(document.getElementById('mobile-menu')).toHaveAttribute('role', 'dialog');
  expect(document.getElementById('mobile-menu')).toHaveAttribute('aria-label', 'Site navigation');
  expect(document.body.style.overflow).toBe('hidden');

  await user.click(menuButton);
  expect(document.body.style.overflow).toBe('');
});

it('moves focus into the mobile dialog and restores it after Escape', async () => {
  const user = userEvent.setup();
  renderHeader();

  const menuButton = document.querySelector('[aria-label="Menu"]');
  await user.click(menuButton);
  const dialog = document.getElementById('mobile-menu');
  const firstControl = dialog.querySelector('button');

  expect(firstControl).toHaveFocus();
  await user.keyboard('{Escape}');

  expect(dialog).not.toBeInTheDocument();
  expect(menuButton).toHaveFocus();
});

it('traps Tab and Shift+Tab within the mobile dialog', async () => {
  const user = userEvent.setup();
  renderHeader();

  const menuButton = document.querySelector('[aria-label="Menu"]');
  await user.click(menuButton);
  const dialog = document.getElementById('mobile-menu');
  const firstControl = dialog.querySelector('button');
  const controls = dialog.querySelectorAll('button, a[href]');
  const lastControl = controls[controls.length - 1];

  lastControl.focus();
  fireEvent.keyDown(dialog, { key: 'Tab' });
  expect(firstControl).toHaveFocus();

  firstControl.focus();
  fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
  expect(lastControl).toHaveFocus();
});

it('adds the scrolled state after passing the header threshold', () => {
  renderHeader();

  fireEvent.scroll(window, { target: { scrollY: 20 } });

  expect(screen.getByRole('banner')).toHaveAttribute('data-scrolled', 'true');
});

it('exposes the current route for the restrained navigation indicator', () => {
  renderHeader('/news');

  const desktopNav = screen.getByRole('navigation', { name: 'Primary navigation' });
  expect(within(desktopNav).getByRole('link', { name: 'News' })).toHaveAttribute(
    'aria-current',
    'page',
  );
});
