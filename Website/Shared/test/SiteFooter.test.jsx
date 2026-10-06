import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import App from '../../src/App';
import SiteFooter from '../components/SiteFooter';

it.each(['default', 'brand', 'compact'])('renders the complete reference footer for the %s variant', (variant) => {
  render(<MemoryRouter><SiteFooter variant={variant} /></MemoryRouter>);
  const footer = within(screen.getByRole('contentinfo'));
  const explore = within(footer.getByRole('navigation', { name: 'Explore' }));
  expect(explore.getAllByRole('link').map((link) => [link.textContent, link.getAttribute('href')])).toEqual([
    ['About', '/about'], ['578 Interiors', '/experience'], ['News', '/news'], ['Contact', '/contact'],
  ]);
  const brands = within(footer.getByRole('navigation', { name: 'Our brands' }));
  expect(brands.getAllByRole('link').map((link) => [link.textContent, link.getAttribute('href')])).toEqual([
    ['IOAK', '/brands/ioak'], ['FLUX', '/brands/flux'], ['INTERICH', '/brands/interich'], ['S PROJECT', '/brands/s-project'],
  ]);
  expect(footer.getByRole('link', { name: '(03) 8086 2666' })).toHaveAttribute('href', 'tel:+61380862666');
  expect(footer.getByRole('link', { name: 'info@jsbuildinggroup.com.au' })).toHaveAttribute('href', 'mailto:info@jsbuildinggroup.com.au');
  expect(footer.getByText('1 Aristoc Rd, Glen Waverley 3150 VIC')).toBeInTheDocument();
  expect(footer.getByText('574–578 Canterbury Road, Vermont 3133 VIC')).toBeInTheDocument();
  expect(footer.getByText('29–31 Horne St, Hoppers Crossing 3029 VIC')).toBeInTheDocument();
  expect(footer.queryByText('578 Church Street')).not.toBeInTheDocument();
  expect(footer.getByText('© JS Building Group. All rights reserved.')).toBeInTheDocument();
  for (const [name, href] of [
    ['TikTok', 'https://www.tiktok.com/'],
    ['Instagram', 'https://www.instagram.com/'],
    ['小红书', 'https://www.xiaohongshu.com/'],
  ]) {
    const link = footer.getByRole('link', { name });
    expect(link).toHaveAttribute('href', href);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  }
});

it.each(['/', '/about', '/brands/ioak', '/brands/flux', '/brands/interich', '/brands/s-project', '/experience', '/news', '/contact', '/not-a-page'])('includes the shared footer on %s', (route) => {
  render(<MemoryRouter initialEntries={[route]}><App /></MemoryRouter>);
  const footer = within(screen.getByRole('contentinfo'));
  expect(footer.getByRole('navigation', { name: 'Explore' })).toBeInTheDocument();
  expect(footer.getByRole('navigation', { name: 'Our brands' })).toBeInTheDocument();
  expect(footer.getByRole('heading', { name: 'Locations' })).toBeInTheDocument();
});

