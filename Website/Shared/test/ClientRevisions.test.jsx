import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import App from '../../src/App';

it('uses the client-approved showroom address for the visit and directions', () => {
  render(<MemoryRouter initialEntries={['/experience']}><App /></MemoryRouter>);
  const main = within(screen.getByRole('main'));
  expect(main.getByRole('heading', { name: '574–578 Canterbury Road, Vermont 3133 VIC' })).toBeInTheDocument();
  expect(new URL(main.getByRole('link', { name: /Get directions/i }).href).searchParams.get('q')).toBe('574–578 Canterbury Road, Vermont 3133 VIC');
  expect(screen.getByRole('main').textContent).not.toMatch(/Church Street|Richmond/);
});

it('removes the standalone showroom map from News', () => {
  render(<MemoryRouter initialEntries={['/news']}><App /></MemoryRouter>);
  expect(screen.queryByRole('img', { name: /Map/i })).not.toBeInTheDocument();
  expect(document.querySelector('img[src="/assets/578-map.png"]')).not.toBeInTheDocument();
});

it('shows the corrected showroom address in Contact', () => {
  render(<MemoryRouter initialEntries={['/contact']}><App /></MemoryRouter>);
  const showroom = screen.getByRole('heading', { name: '578 Interiors', level: 2 }).closest('article');
  expect(showroom.querySelector('address')).toHaveTextContent(/574[–-]578 Canterbury Road,?\s*Vermont 3133 VIC/);
  expect(screen.getByRole('main').textContent).not.toMatch(/Church Street|Richmond/);
});
