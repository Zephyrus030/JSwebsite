import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from '../src/App';

describe('unknown route', () => {
  it('renders a branded not-found page with a Home action', () => {
    render(<MemoryRouter initialEntries={['/not-a-route']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Home/ })).toHaveAttribute('href', '/');
  });
});

