import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import NewsPage from './NewsPage';

it('filters the eight reference projects by category and restores all projects', async () => {
  const user = userEvent.setup();
  render(<MemoryRouter><NewsPage /></MemoryRouter>);

  expect(screen.getAllByTestId('news-card')).toHaveLength(8);
  expect(screen.getByRole('img', { name: 'Location map' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'FLUX' }));

  expect(screen.getAllByTestId('news-card')).toHaveLength(2);
  expect(screen.getByText('Arc Collection')).toBeInTheDocument();
  expect(screen.queryByText('Brighton Residence')).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'ALL' }));
  expect(screen.getAllByTestId('news-card')).toHaveLength(8);
});

it('increments the visible project limit without changing the grid renderer', async () => {
  const user = userEvent.setup();
  render(<MemoryRouter><NewsPage initialLimit={4} /></MemoryRouter>);

  expect(screen.getAllByTestId('news-card')).toHaveLength(4);
  await user.click(screen.getByRole('button', { name: /Load more projects/i }));

  expect(screen.getAllByTestId('news-card')).toHaveLength(8);
  expect(screen.getByTestId('news-grid')).toHaveAttribute('data-layout', 'reference');
});
