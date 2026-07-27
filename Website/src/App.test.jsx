import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import App from './App';

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
