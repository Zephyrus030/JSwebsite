import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import App from '../../src/App';

function renderRoute(route) {
  return render(<MemoryRouter initialEntries={[route]}><App /></MemoryRouter>);
}

it('uses the approved homepage story and 1000 square metre experience copy', () => {
  renderRoute('/');

  expect(screen.queryByRole('heading', { name: 'Design. Make. Live.' })).not.toBeInTheDocument();
  expect(screen.getByText(
    'Our story began in Australia in 2017 as a building materials supplier. Today, JS Building Group brings construction, materials, showrooms and local manufacturing together as one integrated group.',
  )).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Experience more possibilities.' })).toBeInTheDocument();
  expect(screen.getByText(/^A 1000 m² experience centre where our clients can see, touch and compare real products/))
    .toBeInTheDocument();
  expect(screen.getByRole('main')).not.toHaveTextContent('700 m²');
});

it('uses the approved About framing for the integrated group', () => {
  renderRoute('/about');

  const main = screen.getByRole('main');
  expect(within(main).getByRole('heading', { level: 1, name: 'Where Building Becomes Living.' }))
    .toBeInTheDocument();
  expect(within(main).getByText(/^JS Building Group began in Australia in 2017/)).toBeInTheDocument();
  expect(within(main).getByText(/^Our background in materials gives us a deeper understanding/)).toBeInTheDocument();
  expect(within(main).getByRole('heading', { name: 'One group. One connected way to build.' }))
    .toBeInTheDocument();
  expect(within(main).getByText(/^From construction and materials to cabinetry and finishes/))
    .toBeInTheDocument();
});

it('uses 1000 square metres throughout the 578 Interiors journey', () => {
  renderRoute('/experience');

  const main = screen.getByRole('main');
  expect(within(main).getByText(/^Set within a 1000m² experience centre, 578 Interiors/))
    .toBeInTheDocument();
  expect(within(main).getByText(/^With our designers based in the showroom/)).toBeInTheDocument();
  expect(main).not.toHaveTextContent('700 m²');
});

it('uses the supplied INTERICH hero and IOAK introduction copy', () => {
  renderRoute('/brands/interich');
  expect(screen.getByRole('heading', { level: 1, name: 'INTERICH' }).closest('section').querySelector('figure img'))
    .toHaveAttribute('src', '/assets/update922/interich-hero.webp');

  renderRoute('/brands/ioak');
  const statement = screen.getByLabelText('IOAK introduction');
  expect(statement).toHaveTextContent('IOAK specialises in premium multi-layer engineered timber flooring');
  expect(statement).toHaveTextContent('Each collection is developed to preserve the warmth, grain and individuality of real timber');
});

it('uses the western factory address, construction statuses and supplied contact imagery', () => {
  renderRoute('/contact');

  const factory = screen.getByRole('heading', { name: 'INTERICH Factory' }).closest('article');
  expect(factory).toHaveTextContent('29-31 Horne St, Hoppers Crossing 3029 VIC');
  expect(factory).toHaveTextContent('Under construction.');
  expect([...factory.querySelectorAll('img')].map((image) => image.getAttribute('src'))).toEqual([
    '/assets/update922/contact-interich-1.webp',
    '/assets/update922/contact-interich-2.webp',
  ]);

  const office = screen.getByRole('heading', { name: 'Head Office' }).closest('article');
  expect(office).toHaveTextContent('Under construction.');
  expect([...office.querySelectorAll('img')].map((image) => image.getAttribute('src'))).toEqual([
    '/assets/update922/contact-group-1.webp',
    '/assets/update1001/head-office-contact-2.webp',
  ]);
});

it('publishes the approved four news updates with the supplied FLUX and IOAK image sets', () => {
  renderRoute('/news');

  expect(screen.getByRole('heading', { name: '578 Interiors is taking shape.' }).closest('article'))
    .toHaveTextContent('Our 1000 m² experience centre is currently under construction');
  expect(screen.getByRole('heading', { name: 'Factory tours coming soon.' }).closest('article'))
    .toHaveTextContent('clients will be able to book a guided tour of the production line');
  const flux = screen.getByRole('heading', { name: 'Two collections are taking shape.' }).closest('article');
  expect(flux).toHaveTextContent('FLUX / Product development');
  expect([...flux.querySelectorAll('img')].map((image) => image.getAttribute('src'))).toEqual([
    '/assets/update922/flux-news-1.webp',
    '/assets/update922/flux-news-2.webp',
    '/assets/update922/flux-news-3.webp',
  ]);
  const ioak = screen.getByRole('heading', { name: 'A new chapter in timber flooring.' }).closest('article');
  expect(ioak).toHaveTextContent('IOAK / Collection update');
  expect([...ioak.querySelectorAll('img')].map((image) => image.getAttribute('src'))).toEqual([
    '/assets/update922/ioak-news-2.webp',
    '/assets/update922/ioak-news-1.webp',
    '/assets/update922/ioak-news-3.webp',
  ]);
});
