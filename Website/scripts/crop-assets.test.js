import { mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { runCrops } from './crop-assets.mjs';
import { cropManifest } from './crop-manifest.js';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));

const sourceDimensions = {
  'Homepage.png': [1024, 1536],
  '578Experience.png': [864, 1821],
  'Contact.png': [759, 2071],
  'FLUX.png': [864, 1821],
  'INTERICH.png': [864, 1821],
  'IOAK.png': [864, 1821],
  'News.png': [864, 1821],
  'S_Project.png': [864, 1821],
};

const plannedOutputs = [
  'home-hero.webp',
  'home-about.webp',
  'experience-hero.webp',
  'contact-showroom.webp',
  's-project-hero.webp',
  'interich-hero.webp',
  'ioak-hero.webp',
  'flux-hero.webp',
  'news-brighton.webp',
];

describe('crop manifest', () => {
  it('defines every planned semantic WebP output exactly once', () => {
    const outputs = cropManifest.map(({ output }) => output);

    expect(outputs).toEqual(plannedOutputs);
    expect(new Set(outputs).size).toBe(outputs.length);
  });

  it('keeps every positive integer crop inside its source image', () => {
    for (const crop of cropManifest) {
      const dimensions = sourceDimensions[crop.source];

      expect(dimensions, `${crop.source} must be an approved screenshot`).toBeDefined();
      for (const field of ['left', 'top', 'width', 'height']) {
        expect(Number.isInteger(crop[field]), `${crop.output} ${field}`).toBe(true);
      }
      expect(crop.left).toBeGreaterThanOrEqual(0);
      expect(crop.top).toBeGreaterThanOrEqual(0);
      expect(crop.width).toBeGreaterThan(0);
      expect(crop.height).toBeGreaterThan(0);
      expect(crop.left + crop.width).toBeLessThanOrEqual(dimensions[0]);
      expect(crop.top + crop.height).toBeLessThanOrEqual(dimensions[1]);
    }
  });

  it('records the intended ratio of every crop', () => {
    for (const crop of cropManifest) {
      expect(crop.ratio).toMatch(/^(portrait|square|landscape|wide)$/);
    }
  });
});

describe('runCrops', () => {
  it('creates a WebP with the requested crop dimensions', async () => {
    const outputDir = await mkdtemp(path.join(scriptsDir, '.crop-test-'));

    try {
      const outputs = await runCrops([cropManifest[0]], { outputDir });
      const metadata = await sharp(outputs[0]).metadata();

      expect(outputs).toEqual([path.join(outputDir, 'home-hero.webp')]);
      expect(metadata.format).toBe('webp');
      expect([metadata.width, metadata.height]).toEqual([
        cropManifest[0].width,
        cropManifest[0].height,
      ]);
    } finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  });

  it('rejects source paths outside the configured source directory', async () => {
    const unsafeCrop = { ...cropManifest[0], source: '../Homepage.png' };

    await expect(runCrops([unsafeCrop])).rejects.toThrow(/source filename/i);
  });

  it('rejects output paths outside the configured output directory', async () => {
    const unsafeCrop = { ...cropManifest[0], output: '../home-hero.webp' };

    await expect(runCrops([unsafeCrop])).rejects.toThrow(/output filename/i);
  });
});
