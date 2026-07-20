import { render, screen } from '@testing-library/react';
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
