import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import SProjectPage from './SProjectPage';

it('places selected projects at the end of main with matching covers and previews', () => {
  render(<MemoryRouter><SProjectPage /></MemoryRouter>);
  const section = screen.getByRole('region', { name: 'Selected Projects' });
  expect(section.parentElement).toHaveAttribute('data-brand', 's-project');
  expect(section).toBe(section.parentElement.lastElementChild);
  expect(section.querySelector('header p')).toHaveTextContent('S PROJECT / SELECTED WORK');
  const cards = section.querySelectorAll('figure');
  expect(cards).toHaveLength(2);
  ['2025', '2024'].forEach((year, index) => {
    expect(cards[index]).toHaveTextContent(`S Project | ${year} Completed`);
    const images = cards[index].querySelectorAll('img');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('src', `/assets/s-project-${year}-cover.webp`);
    expect(images[1]).toHaveAttribute('src', `/assets/s-project-${year}-hover.webp`);
    expect(within(cards[index]).getByRole('button')).toHaveAccessibleName(`Preview S Project | ${year} Completed`);
  });
});
