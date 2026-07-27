import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import Homepage from './Homepage';

it('renders the complete editorial homepage with one page heading', () => {
  render(
    <MemoryRouter>
      <Homepage />
    </MemoryRouter>,
  );

  expect(
    screen.getByRole('heading', { level: 1, name: 'Building Better Living.' }),
  ).toBeInTheDocument();
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  expect(screen.getByRole('heading', { name: 'S Project' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'INTERICH' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'IOAK' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'FLUX' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: '578 Experience' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'News' })).toBeInTheDocument();
  expect(screen.getByRole('contentinfo')).toBeInTheDocument();
});

it('places each brand description and action before its image', () => {
  render(
    <MemoryRouter>
      <Homepage />
    </MemoryRouter>,
  );

  for (const brandName of ['S Project', 'INTERICH', 'IOAK', 'FLUX']) {
    const heading = screen.getByRole('heading', { level: 3, name: brandName });
    const card = heading.closest('article');
    const action = card.querySelector('span');
    const figure = card.querySelector('figure');

    expect(heading.compareDocumentPosition(figure) & Node.DOCUMENT_POSITION_FOLLOWING)
      .toBeTruthy();
    expect(action.compareDocumentPosition(figure) & Node.DOCUMENT_POSITION_FOLLOWING)
      .toBeTruthy();
  }
});

it('reserves the measured landscape ratio for homepage news photography', () => {
  render(
    <MemoryRouter>
      <Homepage />
    </MemoryRouter>,
  );

  for (const image of screen.getAllByRole('img').filter(
    ({ src }) => src.includes('/assets/home-news-'),
  )) {
    expect(image).toHaveAttribute('width', '86');
    expect(image).toHaveAttribute('height', '68');
  }
});
