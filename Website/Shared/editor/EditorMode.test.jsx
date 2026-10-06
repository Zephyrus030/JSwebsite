import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import EditorMode from './EditorMode';
import { getPageEdits } from './editorPersistence';

function renderEditor(children) {
  return render(
    <MemoryRouter initialEntries={['/about']}>
      <EditorMode enabled>{children}</EditorMode>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

it('keeps the editor controls out of normal browsing mode', () => {
  render(
    <MemoryRouter initialEntries={['/about']}>
      <EditorMode enabled={false}><p>Normal page</p></EditorMode>
    </MemoryRouter>,
  );

  expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
});

it('saves text after a double-click edit is finished', () => {
  renderEditor(<p>Original copy</p>);
  const copy = screen.getByText('Original copy');

  fireEvent.doubleClick(copy);
  copy.textContent = 'Updated copy';
  fireEvent.blur(copy);

  expect(Object.values(getPageEdits('/about'))).toContainEqual({ text: 'Updated copy' });
});

it('shows image controls after selecting an image', () => {
  renderEditor(<img alt="Editable room" src="/assets/home-hero.webp" />);

  fireEvent.click(screen.getByRole('img', { name: 'Editable room' }));

  expect(screen.getByRole('toolbar')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /replace image/i })).toBeInTheDocument();
});
