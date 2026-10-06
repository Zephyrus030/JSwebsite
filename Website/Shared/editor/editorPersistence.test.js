import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearPageEdits,
  getEditorId,
  getPageEdits,
  setPageEdit,
} from './editorPersistence';

describe('editor persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('creates a stable id from an element path', () => {
    const root = document.createElement('main');
    root.innerHTML = '<section><h1>Title</h1></section>';

    expect(getEditorId(root.querySelector('h1'), root)).toBe('section:nth-child(1)>h1:nth-child(1)');
  });

  it('stores edits per page and merges later changes', () => {
    setPageEdit('/about', 'hero-title', { text: 'New title' });
    setPageEdit('/about', 'hero-image', { src: '/assets/new.webp', scale: 1.1 });

    expect(getPageEdits('/about')).toEqual({
      'hero-title': { text: 'New title' },
      'hero-image': { src: '/assets/new.webp', scale: 1.1 },
    });
    expect(getPageEdits('/news')).toEqual({});
  });

  it('clears only the requested page', () => {
    setPageEdit('/about', 'title', { text: 'Changed' });
    setPageEdit('/news', 'title', { text: 'News changed' });

    clearPageEdits('/about');

    expect(getPageEdits('/about')).toEqual({});
    expect(getPageEdits('/news')).toEqual({ title: { text: 'News changed' } });
  });
});
