import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import AppointmentForm, { validateAppointment } from './AppointmentForm';
import ContactPage from './ContactPage';

it('shows inline errors for the required appointment fields', async () => {
  const user = userEvent.setup();
  render(<AppointmentForm />);

  await user.click(screen.getByRole('button', { name: /Request appointment/i }));

  expect(screen.getByText('Enter your full name.')).toBeInTheDocument();
  expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
  expect(screen.getByText('Choose a visit location.')).toBeInTheDocument();
  expect(screen.getByText('Choose a preferred date.')).toBeInTheDocument();
  expect(screen.getByText('Choose a preferred time.')).toBeInTheDocument();
});

it('programmatically associates the location error with every radio', async () => {
  const user = userEvent.setup();
  render(<AppointmentForm />);

  await user.click(screen.getByRole('button', { name: /Request appointment/i }));

  const error = screen.getByText('Choose a visit location.');
  expect(error).toHaveAttribute('id', 'location-error');
  for (const radio of screen.getAllByRole('radio')) {
    expect(radio).toHaveAttribute('aria-describedby', 'location-error');
    expect(radio).toHaveAttribute('aria-invalid', 'true');
  }
});

it('lets the desktop location grid use the shared content width', () => {
  const css = readFileSync(
    path.join(process.cwd(), 'Contact', 'ContactPage.module.css'),
    'utf8',
  );

  expect(css).toMatch(
    /\.locations\s*\{[^}]*width:\s*min\(100%\s*-\s*\(var\(--page-gutter\)\s*\*\s*2\),\s*var\(--content-max\)\)/s,
  );
});

it('rejects an invalid email and confirms a valid local appointment request', async () => {
  const user = userEvent.setup();
  render(<AppointmentForm />);

  await user.type(screen.getByLabelText(/Full name/i), 'Jane Smith');
  await user.type(screen.getByLabelText(/^Email$/i), 'not-an-email');
  await user.click(screen.getByLabelText('578 Interiors'));
  await user.type(screen.getByLabelText(/Preferred date/i), '2026-08-01');
  await user.selectOptions(screen.getByLabelText(/Preferred time/i), '10:00');
  await user.click(screen.getByRole('button', { name: /Request appointment/i }));
  expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();

  await user.clear(screen.getByLabelText(/^Email$/i));
  await user.type(screen.getByLabelText(/^Email$/i), 'jane@example.com');
  await user.click(screen.getByRole('button', { name: /Request appointment/i }));
  expect(await screen.findByRole('status')).toHaveTextContent(/Thank you/i);
});

it('returns keyed errors for missing appointment values', () => {
  expect(validateAppointment({
    name: '',
    email: '',
    location: '',
    date: '',
    time: '',
  })).toEqual({
    name: 'Enter your full name.',
    email: 'Enter a valid email address.',
    location: 'Choose a visit location.',
    date: 'Choose a preferred date.',
    time: 'Choose a preferred time.',
  });
});

it('renders two photographs per location without the old 578 artwork or booking controls', () => {
  render(<MemoryRouter><ContactPage /></MemoryRouter>);

  expect(screen.getByRole('heading', { level: 1, name: 'Plan your visit.' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 2, name: '578 Interiors' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'INTERICH Factory' })).toBeInTheDocument();
  const locations = screen.getAllByRole('article');
  expect(locations).toHaveLength(3);
  for (const location of locations) {
    expect(location.querySelectorAll('img')).toHaveLength(2);
    expect(new Set([...location.querySelectorAll('img')].map((image) => image.src)).size).toBe(2);
    expect(location.querySelector('address')).toBeInTheDocument();
  }
  expect(document.querySelector('main img[src="/assets/578-hero.png"], main img[src="/assets/578-entrance.png"], main img[src="/assets/578-map.png"]')).not.toBeInTheDocument();
  expect(screen.queryByRole('img', { name: /Map showing 578/ })).not.toBeInTheDocument();
  expect(document.body.textContent).not.toContain('578 Experience');
  expect(document.querySelector('form')).not.toBeInTheDocument();
  expect(document.querySelector('a[href="#appointment"]')).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /book/i })).not.toBeInTheDocument();
  expect(screen.queryByText(/03 XXXX XXXX/)).not.toBeInTheDocument();
  expect(screen.getByRole('contentinfo')).toBeInTheDocument();
});

it('ends with Head Office and includes the supplied email and phone in every location', () => {
  render(<MemoryRouter><ContactPage /></MemoryRouter>);

  const cards = screen.getAllByRole('article');
  expect(within(cards.at(-1)).getByRole('heading', { name: 'Head Office' })).toBeInTheDocument();
  expect(within(cards.at(-1)).getByText('1 Aristoc Rd, Glen Waverley VIC 3150')).toBeInTheDocument();
  expect(within(cards[0]).getByText('574–578 Canterbury Road, Vermont 3133 VIC')).toBeInTheDocument();
  expect(within(cards[1]).getByText('29-31 Horne St, Hoppers Crossing 3029 VIC')).toBeInTheDocument();
  for (const card of cards) {
    expect(within(card).getByRole('link', { name: 'info@jsbuildinggroup.com.au' }))
      .toHaveAttribute('href', 'mailto:info@jsbuildinggroup.com.au');
    expect(within(card).getByRole('link', { name: '(03) 8086 2666' }))
      .toHaveAttribute('href', 'tel:+61380862666');
  }
});

it('shows construction notices as separate small-text lines', () => {
  render(<MemoryRouter><ContactPage /></MemoryRouter>);

  const cards = screen.getAllByRole('article');
  const factoryCard = cards.find((card) => within(card).queryByRole('heading', { name: 'INTERICH Factory' }));
  const officeCard = cards.find((card) => within(card).queryByRole('heading', { name: 'Head Office' }));

  for (const card of [factoryCard, officeCard]) {
    expect(card.querySelector('[class*="locationDescription"]')).not.toHaveTextContent('Under construction.');
    expect(card.querySelector('[data-location-status]')).toHaveTextContent('Under construction.');
  }
});
