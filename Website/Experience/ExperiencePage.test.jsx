import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import App from '../src/App';
import styles from './ExperiencePage.module.css';

describe('578 Experience route', () => {
  it('renders the showroom journey and location', () => {
    render(<MemoryRouter initialEntries={['/experience']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { level: 1, name: '578 Interiors' })).toBeInTheDocument();
    expect(screen.getAllByText('A destination where every detail comes together.')).toHaveLength(2);
    expect(screen.getByRole('heading', { name: /INTERICH.*Cabinetry Zone/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /FLUX\s+—\s+Tapware Zone/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /IOAK.*Flooring Zone/i })).toBeInTheDocument();
    expect(screen.queryByText('Curated materials. Endless inspiration.')).not.toBeInTheDocument();
    expect(screen.getByText('574–578 Canterbury Road,')).toBeInTheDocument();
    expect(within(screen.getByRole('main')).getByText('Vermont 3133 VIC')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Visit 578 website/i })).toHaveAttribute(
      'href',
      'https://578experience.com.au/',
    );
  });

  it('uses the 578 source imagery and expanded visual treatments', () => {
    render(<MemoryRouter initialEntries={['/experience']}><App /></MemoryRouter>);

    expect(screen.getByRole('img', { name: /Facade of the 578 Experience/i })).toHaveAttribute(
      'src',
      '/assets/578-hero.png',
    );
    expect(screen.getByRole('img', { name: /Meeting space within the 578 Experience/i })).toHaveAttribute(
      'src',
      '/assets/578-visit.jpg',
    );
    expect(screen.getByRole('img', { name: /Entrance to the 578 Experience/i })).toHaveAttribute(
      'src',
      '/assets/update1001/578-interiors-1.webp',
    );
    expect(screen.getByRole('img', { name: /Map of the 578 showroom area/i })).toHaveAttribute(
      'src',
      '/assets/578-map.png',
    );
    expect(screen.getByRole('img', { name: /INTERICH cabinetry showroom kitchen/i })).toHaveAttribute(
      'src',
      '/assets/578-zone-01.jpg',
    );
    expect(screen.getByRole('img', { name: /FLUX tapware showroom bathroom/i })).toHaveAttribute(
      'src',
      '/assets/578-zone-02.jpg',
    );
    expect(screen.getByRole('img', { name: /IOAK flooring showroom display/i })).toHaveAttribute(
      'src',
      '/assets/578-zone-03.jpg',
    );
    expect(screen.getByRole('region', { name: '578 Interiors' })).toHaveAttribute('data-overlay', 'dimmed-gradient');
    expect(screen.getByRole('region', { name: '578 Interiors' })).toHaveAttribute('data-scroll-target', 'next-section');
    expect(screen.getByRole('region', { name: '578 Interiors' })).toHaveAttribute('data-copy-spacing', 'relaxed');
    expect(screen.getByRole('img', { name: /Map of the 578 showroom area/i })).toHaveAttribute('data-fit', 'contain');
    expect(screen.getByTestId('experience-zone-grid')).toHaveClass(styles.expandedSpacing);
  });

  it('uses an expanded editorial type scale for the page copy', () => {
    render(<MemoryRouter initialEntries={['/experience']}><App /></MemoryRouter>);

    expect(screen.getByRole('main')).toHaveClass(styles.editorialType);
    expect(screen.getByRole('region', { name: '578 Interiors' })).toHaveClass(styles.fullViewportHero);
    expect(screen.getByRole('main')).toHaveClass(styles.aboutPalette);
  });

  it('aligns the hero image bottom with the sticky navigation bottom', () => {
    render(<MemoryRouter initialEntries={['/experience']}><App /></MemoryRouter>);

    const hero = screen.getByRole('region', { name: '578 Interiors' });
    const header = document.querySelector('header[role="banner"]');
    hero.getBoundingClientRect = vi.fn(() => ({ bottom: 700 }));
    header.getBoundingClientRect = vi.fn(() => ({ bottom: 70 }));
    Object.defineProperty(hero, 'offsetHeight', { configurable: true, value: 500 });
    Object.defineProperty(header, 'offsetHeight', { configurable: true, value: 64 });
    window.matchMedia = vi.fn(() => ({ matches: false }));
    window.scrollTo = vi.fn();

    fireEvent.wheel(window, { deltaY: 120 });

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 630, behavior: 'smooth' });
  });

  it('alternates the Experience modules after the image hero', () => {
    render(<MemoryRouter initialEntries={['/experience']}><App /></MemoryRouter>);

    expect([...screen.getByRole('main').querySelectorAll('[data-surface]')]
      .map((section) => section.dataset.surface))
      .toEqual(['hero', 'tint', 'paper', 'tint', 'paper']);
  });

  it('applies the annotated Experience typography and showroom image sizing', () => {
    render(<MemoryRouter initialEntries={['/experience']}><App /></MemoryRouter>);

    const css = readFileSync(path.resolve(__dirname, 'ExperiencePage.module.css'), 'utf8');
    const tapware = screen.getByRole('heading', { name: /FLUX\s+—\s+Tapware Zone/i });

    expect(css).toContain('font-size: 28.74px;');
    expect(css).toContain('margin-right: -38px;');
    expect(css).toContain('width: 297.28px;');
    expect(css).toContain('width: 302.28px;');
    expect(css).toContain('margin-bottom: 37px;');
    expect(css).toContain('margin-top: -4px;');
    expect(css).toContain('height: 410.17px;');
    expect(css).toContain('margin-top: -32px;');
    expect(css).toContain('object-fit: contain !important;');
    expect(css).toContain('font-size: 19.6px;');
    expect(css).toContain('margin-top: 2px;');
    expect(css).toContain('margin-top: 25px;');
    expect(tapware.textContent).toBe('FLUX —\nTapware Zone');
  });

  it('keeps the Experience map and visit imagery cropped without mobile overflow', () => {
    render(<MemoryRouter initialEntries={['/experience']}><App /></MemoryRouter>);

    const map = screen.getByRole('img', { name: /Map of the 578 showroom area/i });
    const visitImage = screen.getByRole('img', { name: /Meeting space within the 578 Experience/i });

    expect(map).toHaveAttribute('data-fit', 'contain');
    expect(visitImage).toBeInTheDocument();
  });

});
