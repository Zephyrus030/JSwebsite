import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { MediaGrid } from '../components/MediaGrid';

const items = [
  {
    src: '/one.webp',
    alt: 'First project',
    title: 'First',
    ratio: 'portrait',
  },
  {
    src: '/two.webp',
    alt: 'Second project',
    title: 'Second',
    ratio: 'wide',
  },
  {
    src: '/three.webp',
    alt: 'Third project',
    ratio: 'square',
  },
];

it('renders every supplied item with its declared ratio class', () => {
  render(<MediaGrid items={items} />);

  for (const item of items) {
    const image = screen.getByRole('img', { name: item.alt });
    expect(image.closest('[data-ratio]')).toHaveAttribute('data-ratio', item.ratio);
    expect(image.closest('[data-ratio]')).toHaveClass(new RegExp(item.ratio));
  }
});

it('uses the supplied minimum card width as a grid custom property', () => {
  const { container } = render(<MediaGrid items={items} minCardWidth="22rem" />);

  expect(container.firstChild).toHaveStyle({ '--card-min': '22rem' });
});

it('uses explicit reference columns and spans only at the reference count', () => {
  const { container, rerender } = render(
    <MediaGrid
      items={items.map((item, index) => ({ ...item, referenceSpan: index === 0 ? 2 : 1 }))}
      referenceColumns={4}
      referenceCount={3}
    />,
  );

  expect(container.firstChild).toHaveAttribute('data-layout', 'reference');
  expect(container.firstChild).toHaveAttribute('data-reference-columns', '4');
  expect(container.firstChild).toHaveStyle({ '--reference-columns': '4' });
  expect(screen.getByRole('img', { name: 'First project' }).closest('article'))
    .toHaveStyle({ '--reference-span': '2' });

  rerender(
    <MediaGrid
      items={items.slice(0, 2)}
      referenceColumns={4}
      referenceCount={3}
    />,
  );

  expect(container.firstChild).toHaveAttribute('data-layout', 'fallback');
  expect(container.firstChild).not.toHaveAttribute('data-reference-columns');
});

for (const count of [2, 5, 8]) {
  it(`renders ${count} items with item-driven ratio structures`, () => {
    const variableItems = Array.from({ length: count }, (_, index) => ({
      src: `/project-${index}.webp`,
      alt: `Project ${index + 1}`,
      ratio: ['portrait', 'square', 'landscape', 'wide'][index % 4],
    }));

    render(<MediaGrid items={variableItems} />);

    expect(screen.getAllByRole('article')).toHaveLength(count);
    for (const item of variableItems) {
      expect(screen.getByRole('img', { name: item.alt }).parentElement).toHaveAttribute(
        'data-ratio',
        item.ratio,
      );
    }
  });
}
