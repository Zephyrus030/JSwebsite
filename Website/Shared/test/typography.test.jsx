import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import '../../Shared/styles/global.css';

it('uses Libre Baskerville for ordinary page text', () => {
  render(<p>Building better living.</p>);

  expect(getComputedStyle(document.documentElement).getPropertyValue('--font-sans'))
    .toContain('Libre Baskerville');
});
