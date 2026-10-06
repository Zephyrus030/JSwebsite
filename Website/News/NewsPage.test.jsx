import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { existsSync } from 'node:fs';
import path from 'node:path';
import NewsPage from './NewsPage';

it('presents all five news stories together without filters or story links', () => {
  render(<MemoryRouter><NewsPage /></MemoryRouter>);

  const main = screen.getByRole('main');
  expect(within(main).getByRole('heading', { level: 1 })).toHaveTextContent('Latest from JS Building Group.');
  expect(within(main).getByText('05 stories')).toBeInTheDocument();
  expect(within(main).getAllByRole('article')).toHaveLength(5);
  expect(within(main).queryByRole('group', { name: 'Project category' })).not.toBeInTheDocument();
  expect(within(main).queryByRole('link')).not.toBeInTheDocument();
  expect(within(main).queryByText(/read story/i)).not.toBeInTheDocument();
  expect(within(main).queryByRole('button', { name: /load more/i })).not.toBeInTheDocument();
});

it('gives every story its own heading, copy and three existing photographs', () => {
  render(<MemoryRouter><NewsPage /></MemoryRouter>);

  for (const story of screen.getAllByRole('article')) {
    expect(story).toHaveAccessibleName(within(story).getByRole('heading', { level: 2 }).textContent);
    if (story.querySelector('time')) {
      expect(story.querySelector('time')).toHaveAttribute('datetime', expect.stringMatching(/^2026-\d{2}-\d{2}$/));
    }
    expect(story.querySelector('[data-story-copy]')).toHaveTextContent(/\w/);
    const images = within(story).getAllByRole('img');
    expect(images).toHaveLength(3);
    expect(new Set(images.map((image) => image.getAttribute('src'))).size).toBe(3);
    for (const image of images) {
      expect(existsSync(path.join(process.cwd(), 'public', image.getAttribute('src')))).toBe(true);
    }
  }
});

it('uses the October S Project photographs in the supplied reference layout', () => {
  render(<MemoryRouter><NewsPage /></MemoryRouter>);

  const story = screen.getByRole('heading', { name: 'The Project in Glen Waverley' }).closest('article');
  expect(story.querySelector('time')).toHaveTextContent('28 Sep 2026');
  expect(story.querySelector('time')).toHaveAttribute('datetime', '2026-09-28');
  expect(story.querySelector('[data-story-copy]')).toHaveTextContent('under Construction of two double storey at 3 edinburgh avenue glen waverley 3150');
  expect([...story.querySelectorAll('img')].map((image) => image.getAttribute('src'))).toEqual([
    '/assets/update1001/s-project-news-2.webp',
    '/assets/update1001/s-project-news-3.webp',
    '/assets/update1001/s-project-news-1.webp',
  ]);
});
