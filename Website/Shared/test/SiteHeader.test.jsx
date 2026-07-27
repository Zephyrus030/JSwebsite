import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it } from 'vitest';
import SiteHeader from '../components/SiteHeader';

function renderHeader() {
  return render(
    <MemoryRouter>
      <SiteHeader />
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
  document.body.style.overflow = '';
});

it('opens the brands menu on click and exposes every brand link', async () => {
  const user = userEvent.setup();
  renderHeader();

  const trigger = screen.getByRole('button', { name: /our brands/i });
  await user.click(trigger);

  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('link', { name: 'S Project' })).toHaveAttribute(
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
  const brandLink = screen.getByRole('link', { name: 'S Project' });
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

it.each(['About', 'Experience', 'News', 'Contact'])(
  'closes the brands menu when the %s route is selected',
  async (routeLabel) => {
    const user = userEvent.setup();
    renderHeader();

    const trigger = screen.getByRole('button', { name: /our brands/i });
    await user.click(trigger);
    await user.click(screen.getByRole('link', { name: routeLabel }));

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: 'S Project' })).not.toBeInTheDocument();
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
