import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from '../src/App';

describe('578 Experience route', () => {
  it('renders the showroom journey and location', () => {
    render(<MemoryRouter initialEntries={['/experience']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { level: 1, name: '578 Experience' })).toBeInTheDocument();
    expect(screen.getAllByText('A destination where every detail comes together.')).toHaveLength(2);
    expect(screen.getByRole('heading', { name: /INTERICH.*Cabinetry Zone/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /FLUX.*Tapware Zone/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /IOAK.*Flooring Zone/i })).toBeInTheDocument();
    expect(screen.queryByText('Curated materials. Endless inspiration.')).not.toBeInTheDocument();
    expect(screen.getByText('578 Church Street,')).toBeInTheDocument();
    expect(screen.getAllByText('Richmond VIC 3121')).toHaveLength(2);
    expect(screen.getByRole('link', { name: /Visit 578 website/i })).toHaveAttribute(
      'href',
      'https://578experience.com.au/',
    );
  });
});

