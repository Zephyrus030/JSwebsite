import { render, screen } from '@testing-library/react';
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
  await user.click(screen.getByLabelText('578 Experience'));
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

it('renders the plan-your-visit content and two appointment locations', () => {
  render(<MemoryRouter><ContactPage /></MemoryRouter>);

  expect(screen.getByRole('heading', { level: 1, name: 'Plan your visit.' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: '578 Experience' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'INTERICH Factory' })).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'Location map' })).toBeInTheDocument();
  expect(screen.getByRole('contentinfo')).toBeInTheDocument();
});
