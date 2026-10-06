import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import AboutPage from './AboutPage';
import styles from './AboutPage.module.css';

it('renders the complete about story with its supplied imagery and locations', () => {
  render(
    <MemoryRouter initialEntries={['/about']}>
      <AboutPage />
    </MemoryRouter>,
  );

  expect(screen.getByRole('heading', { level: 1, name: 'Where Building Becomes Living.' }))
    .toHaveAttribute('data-page-heading');
  expect(screen.getByRole('heading', { name: 'One group. One connected way to build.' }))
    .toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Why choose JS Building Group?' }))
    .toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Our journey' })).toBeInTheDocument();

  expect(screen.getByAltText('Minimalist hallway with timber doors and soft natural light')).toHaveAttribute(
    'src',
    '/assets/update914/about-introduction.webp',
  );
  expect(screen.getByAltText('JS Building Group building entrance')).toHaveAttribute(
    'src',
    '/assets/about-building-entrance.webp',
  );
  expect(screen.getByAltText('JS Building Group western factory')).toHaveAttribute(
    'src',
    '/assets/about-western-factory.webp',
  );
  expect(screen.getByAltText('JS Building Group journey timeline')).toHaveAttribute(
    'src',
    '/assets/about-journey.webp',
  );
  expect(screen.getByAltText('Melbourne locations map')).toHaveAttribute(
    'src',
    '/assets/about-locations.webp',
  );
  expect(within(screen.getByRole('main')).getByText('1 Aristoc Rd, Glen Waverley 3150 VIC')).toBeInTheDocument();
  expect(screen.getByText('574-578 Canterbury Road, Vermont 3133 VIC')).toBeInTheDocument();
  expect(screen.getByText('29-31 Horne St, Hoppers Crossing 3029 VIC')).toBeInTheDocument();

  expect(screen.getByRole('heading', { level: 1, name: 'Where Building Becomes Living.' })
    .parentElement).toHaveClass(styles.introCopy);
  expect(screen.getByRole('heading', { level: 1, name: 'Where Building Becomes Living.' })
    .parentElement).toHaveClass(styles.spaciousCopy);
  expect(screen.getByRole('heading', { level: 1, name: 'Where Building Becomes Living.' }))
    .toHaveClass(styles.quieterHeading);
  expect(screen.getByAltText('Melbourne locations map')).toHaveClass(styles.mapImage);
  expect(screen.getByAltText('Melbourne locations map').parentElement)
    .toHaveClass(styles.mapBleed);
});

it('presents the supplied origin and materials background as separate introduction paragraphs', () => {
  render(
    <MemoryRouter initialEntries={['/about']}>
      <AboutPage />
    </MemoryRouter>,
  );

  const introduction = screen.getByRole('heading', { level: 1 }).parentElement;
  const paragraphs = introduction.querySelectorAll('p');
  expect(paragraphs).toHaveLength(2);
  expect(paragraphs[0]).toHaveTextContent(/^JS Building Group began in Australia in 2017/);
  expect(paragraphs[1]).toHaveTextContent(/^Our background in materials gives us a deeper understanding/);
});

it('keeps the About modules in the paper-tint-paper rhythm', () => {
  render(
    <MemoryRouter initialEntries={['/about']}>
      <AboutPage />
    </MemoryRouter>,
  );

  expect([...document.querySelectorAll('main [data-surface]')].map((section) => section.dataset.surface))
    .toEqual(['paper', 'tint', 'paper', 'tint', 'paper']);
});
