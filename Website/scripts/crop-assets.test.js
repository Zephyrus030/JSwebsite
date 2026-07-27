import {
  mkdtemp,
  readFile,
  rm,
  symlink,
  unlink,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { runCrops } from './crop-assets.mjs';
import { cropManifest } from './crop-manifest.js';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const designDrawingDir = path.resolve(scriptsDir, '../../DesignDrawing');

async function countBrightPixels(input, region) {
  const { data } = await sharp(input)
    .extract(region)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return [...data].filter((value) => value >= 225).length;
}

async function longestDarkHorizontalRun(input, region, threshold = 65) {
  const { data, info } = await sharp(input)
    .extract(region)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let longest = 0;

  for (let y = 0; y < info.height; y += 1) {
    let current = 0;
    for (let x = 0; x < info.width; x += 1) {
      if (data[(y * info.width) + x] <= threshold) {
        current += 1;
        longest = Math.max(longest, current);
      } else {
        current = 0;
      }
    }
  }
  return longest;
}

async function countHorizontalContrastEdges(input, region, threshold = 35) {
  const { data, info } = await sharp(input)
    .extract(region)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let edges = 0;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 1; x < info.width; x += 1) {
      const index = (y * info.width) + x;
      if (Math.abs(data[index] - data[index - 1]) > threshold) edges += 1;
    }
  }
  return edges;
}

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
  'home-brand-s-project.webp',
  'home-brand-interich.webp',
  'home-brand-ioak.webp',
  'home-brand-flux.webp',
  'home-experience.webp',
  'home-news-578.webp',
  'home-news-interich.webp',
  'home-news-ioak.webp',
  'home-news-flux.webp',
  'experience-hero.webp',
  'experience-introduction.webp',
  'experience-interich-zone.webp',
  'experience-flux-zone.webp',
  'experience-ioak-zone.webp',
  'experience-materials.webp',
  'experience-map.webp',
  'experience-visit.webp',
  'contact-showroom.webp',
  's-project-hero.webp',
  's-project-custom-homes.webp',
  's-project-design-build.webp',
  's-project-melbourne-projects.webp',
  's-project-residential-work.webp',
  'interich-hero.webp',
  'interich-hero-wide.webp',
  'interich-kitchens.webp',
  'interich-wardrobes.webp',
  'interich-whole-home.webp',
  'interich-manufacturing.webp',
  'ioak-hero.webp',
  'ioak-natural-oak.webp',
  'ioak-engineered-timber.webp',
  'ioak-signature-finishes.webp',
  'ioak-material-samples.webp',
  'ioak-material-detail.webp',
  'ioak-factory.webp',
  'flux-hero.webp',
  'flux-basin.webp',
  'flux-bath-shower.webp',
  'flux-kitchen.webp',
  'flux-ritual.webp',
  'flux-ritual-detail.webp',
  'flux-ritual-room.webp',
  'news-brighton.webp',
  'news-kew-kitchen.webp',
  'news-toorak-herringbone.webp',
  'news-arc-collection.webp',
  'news-hawthorn-house.webp',
  'news-canterbury-dressing-room.webp',
  'news-natural-oak-residence.webp',
  'news-vermont-ensuite.webp',
  'contact-showroom-lounge.webp',
  'contact-factory-exterior.webp',
  'contact-factory-floor.webp',
  'contact-map.webp',
];

const taskFiveCropBounds = {
  's-project-custom-homes.webp': [92, 820, 180, 240, 'portrait'],
  's-project-design-build.webp': [345, 820, 180, 240, 'portrait'],
  's-project-melbourne-projects.webp': [592, 820, 180, 240, 'portrait'],
  's-project-residential-work.webp': [70, 1275, 720, 260, 'panorama'],
  'interich-hero-wide.webp': [0, 65, 864, 445, 'hero-wide'],
  'interich-kitchens.webp': [58, 1058, 214, 214, 'square'],
  'interich-wardrobes.webp': [323, 1058, 214, 214, 'square'],
  'interich-whole-home.webp': [578, 1058, 214, 214, 'square'],
  'interich-manufacturing.webp': [350, 1350, 480, 270, 'wide'],
  'ioak-natural-oak.webp': [72, 700, 212, 212, 'square'],
  'ioak-engineered-timber.webp': [326, 700, 212, 212, 'square'],
  'ioak-signature-finishes.webp': [581, 700, 212, 212, 'square'],
  'ioak-material-samples.webp': [320, 1080, 200, 200, 'square'],
  'ioak-material-detail.webp': [535, 1080, 244, 183, 'landscape'],
  'ioak-factory.webp': [320, 1340, 454, 216, 'banner'],
  'flux-basin.webp': [62, 690, 186, 248, 'portrait'],
  'flux-bath-shower.webp': [320, 690, 186, 248, 'portrait'],
  'flux-kitchen.webp': [575, 690, 186, 248, 'portrait'],
  'flux-ritual.webp': [250, 1320, 290, 290, 'square'],
  'flux-ritual-detail.webp': [565, 1320, 208, 117, 'wide'],
  'flux-ritual-room.webp': [565, 1470, 224, 126, 'wide'],
};

const ratios = {
  portrait: 3 / 4,
  square: 1,
  landscape: 4 / 3,
  wide: 16 / 9,
  panorama: 36 / 13,
  banner: 21 / 10,
  'hero-wide': 864 / 445,
};

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
      expect(crop.ratio).toMatch(/^(portrait|square|landscape|wide|panorama|banner|hero-wide)$/);
    }
  });

  it('keeps reviewed Task 5 crops inside pure media bounds', () => {
    for (const [output, bounds] of Object.entries(taskFiveCropBounds)) {
      const crop = cropManifest.find((item) => item.output === output);

      expect(
        [crop.left, crop.top, crop.width, crop.height, crop.ratio],
        `${output} must use the reviewed media-only rectangle`,
      ).toEqual(bounds);
    }
  });

  it('matches every Task 5 crop dimensions to its declared ratio', () => {
    for (const output of Object.keys(taskFiveCropBounds)) {
      const crop = cropManifest.find((item) => item.output === output);

      expect(crop.width / crop.height, output).toBeCloseTo(ratios[crop.ratio], 2);
    }
  });

  it('defines a full INTERICH hero with repeatable text-band retouch patches', () => {
    const hero = cropManifest.find(({ output }) => output === 'interich-hero-wide.webp');

    expect(hero).toMatchObject({
      source: 'INTERICH.png',
      left: 0,
      top: 65,
      width: 864,
      height: 445,
      ratio: 'hero-wide',
    });
    expect(hero.retouch).toHaveLength(10);
    expect(hero.retouch[0].target).toEqual({ left: 244, top: 156, width: 10, height: 39 });
    expect(hero.retouch[8].target).toEqual({ left: 405, top: 216, width: 40, height: 9 });
    expect(hero.retouch.at(-1).target).toEqual({ left: 360, top: 241, width: 130, height: 18 });
    for (const patch of hero.retouch) {
      expect(patch.mode).toBe('horizontal-fill');
      expect(patch.source).toBeUndefined();
      expect(patch.sampleGap).toBe(2);
    }
    for (const patch of hero.retouch.slice(0, 9)) {
      expect(patch.target.width).toBeLessThanOrEqual(41);
      expect(patch.feather).toBe(2);
    }
    expect(hero.retouch.at(-1).feather).toBe(3);
    expect(hero.width).toBeGreaterThanOrEqual(800);
    expect(hero.height).toBeGreaterThanOrEqual(400);
  });

  it('crops homepage news thumbnails to the measured photography bounds', () => {
    const expectedBounds = {
      'home-news-578.webp': [45, 1315, 86, 68],
      'home-news-interich.webp': [295, 1315, 86, 68],
      'home-news-ioak.webp': [545, 1315, 86, 68],
      'home-news-flux.webp': [795, 1315, 86, 68],
    };

    for (const [output, bounds] of Object.entries(expectedBounds)) {
      const crop = cropManifest.find((item) => item.output === output);
      expect(
        [crop.left, crop.top, crop.width, crop.height],
        `${output} must contain photography only`,
      ).toEqual(bounds);
      expect(crop.ratio).toBe('landscape');
    }
  });

  it('defines independent media-only crops for every News card and Contact location', () => {
    const expectedBounds = {
      'news-brighton.webp': ['News.png', 8, 398, 210, 350, 'portrait'],
      'news-kew-kitchen.webp': ['News.png', 224, 398, 210, 350, 'portrait'],
      'news-toorak-herringbone.webp': ['News.png', 440, 398, 210, 350, 'portrait'],
      'news-arc-collection.webp': ['News.png', 656, 398, 208, 350, 'portrait'],
      'news-hawthorn-house.webp': ['News.png', 8, 808, 210, 350, 'portrait'],
      'news-canterbury-dressing-room.webp': ['News.png', 224, 808, 210, 350, 'portrait'],
      'news-natural-oak-residence.webp': ['News.png', 440, 808, 210, 350, 'portrait'],
      'news-vermont-ensuite.webp': ['News.png', 656, 808, 208, 350, 'portrait'],
      'contact-showroom.webp': ['Contact.png', 40, 306, 314, 244, 'landscape'],
      'contact-showroom-lounge.webp': ['Contact.png', 40, 565, 314, 244, 'landscape'],
      'contact-factory-exterior.webp': ['Contact.png', 404, 306, 315, 244, 'landscape'],
      'contact-factory-floor.webp': ['Contact.png', 404, 565, 315, 244, 'landscape'],
      'contact-map.webp': ['Contact.png', 0, 1700, 759, 265, 'wide'],
    };

    for (const [output, bounds] of Object.entries(expectedBounds)) {
      const crop = cropManifest.find((item) => item.output === output);
      expect(
        [crop?.source, crop?.left, crop?.top, crop?.width, crop?.height, crop?.ratio],
        `${output} must be an image-only crop`,
      ).toEqual(bounds);
    }
  });

  it('defines media-only crops for the complete 578 Experience page', () => {
    const expectedBounds = {
      'experience-hero.webp': [0, 58, 864, 350, 'hero-wide'],
      'experience-introduction.webp': [384, 448, 416, 265, 'landscape'],
      'experience-interich-zone.webp': [36, 765, 247, 279, 'portrait'],
      'experience-flux-zone.webp': [289, 765, 254, 279, 'portrait'],
      'experience-ioak-zone.webp': [550, 765, 267, 279, 'portrait'],
      'experience-materials.webp': [36, 1177, 397, 145, 'wide'],
      'experience-map.webp': [328, 1348, 489, 193, 'wide'],
      'experience-visit.webp': [390, 1576, 427, 145, 'wide'],
    };

    for (const [output, bounds] of Object.entries(expectedBounds)) {
      const crop = cropManifest.find((item) => item.output === output);
      expect(
        [crop?.left, crop?.top, crop?.width, crop?.height, crop?.ratio],
        `${output} must be an independently-rendered media crop`,
      ).toEqual(bounds);
    }
  });

  it('uses glyph-scoped vertical fills instead of full-width horizontal bands', () => {
    const hero = cropManifest.find(({ output }) => output === 'experience-hero.webp');

    expect(hero.retouch.length).toBeGreaterThan(30);
    for (const patch of hero.retouch) {
      expect(patch.mode).toBe('vertical-fill');
      expect(patch.source).toBeUndefined();
      expect(patch.target.width).toBeLessThanOrEqual(32);
      expect(patch.target.height).toBeLessThanOrEqual(58);
      expect(patch.sampleGap).toBe(2);
    }
    for (const point of [{ x: 511, y: 205 }, { x: 476, y: 260 }]) {
      expect(
        hero.retouch.some(({ target }) => (
          point.x >= target.left
          && point.x < target.left + target.width
          && point.y >= target.top
          && point.y < target.top + target.height
        )),
        `residual text point ${point.x},${point.y} must be covered`,
      ).toBe(true);
    }
  });
});

describe('runCrops', () => {
  it('removes Experience overlay copy while preserving glass structure continuity', async () => {
    const hero = cropManifest.find(({ output }) => output === 'experience-hero.webp');
    const outputDir = await mkdtemp(path.join(scriptsDir, '.experience-retouch-test-'));

    try {
      const [output] = await runCrops([hero], { outputDir });
      const source = await readFile(path.join(designDrawingDir, hero.source));
      const outputBuffer = await readFile(output);
      const sourceRegion = { left: 200, top: hero.top + 115, width: 500, height: 160 };
      const outputRegion = { left: 200, top: 115, width: 500, height: 160 };
      const sourceEdges = await countHorizontalContrastEdges(source, sourceRegion);
      const outputEdges = await countHorizontalContrastEdges(outputBuffer, outputRegion);
      const sourceBright = await countBrightPixels(source, sourceRegion);
      const outputBright = await countBrightPixels(outputBuffer, outputRegion);

      expect(outputBright).toBeLessThan(sourceBright * 0.55);
      expect(outputEdges).toBeGreaterThan(sourceEdges * 0.32);
    } finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  });

  it('removes the high-contrast INTERICH text bands from the full hero', async () => {
    const hero = cropManifest.find(({ output }) => output === 'interich-hero-wide.webp');
    expect(hero.width).toBeGreaterThanOrEqual(800);
    expect(hero.retouch).toHaveLength(10);

    const outputDir = await mkdtemp(path.join(scriptsDir, '.retouch-test-'));
    try {
      const [output] = await runCrops([hero], { outputDir });
      const source = path.join(designDrawingDir, hero.source);
      const outputBuffer = await readFile(output);
      const sourceBuffer = await readFile(source);
      const bands = [
        { left: 245, top: 145, width: 375, height: 42 },
        { left: 355, top: 235, width: 155, height: 25 },
      ];
      let originalBright = 0;
      let retouchedBright = 0;

      for (const band of bands) {
        originalBright += await countBrightPixels(sourceBuffer, {
          ...band,
          left: band.left + hero.left,
          top: band.top + hero.top,
        });
        retouchedBright += await countBrightPixels(outputBuffer, band);
      }

      expect(retouchedBright).toBeLessThan(originalBright * 0.15);
      expect(await longestDarkHorizontalRun(outputBuffer, {
        left: 200,
        top: 125,
        width: 500,
        height: 95,
      })).toBeLessThan(90);
    } finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  });

  it('creates every manifest crop as a WebP with the requested dimensions', async () => {
    const outputDir = await mkdtemp(path.join(scriptsDir, '.crop-test-'));

    try {
      const outputs = await runCrops(cropManifest, { outputDir });

      expect(outputs).toEqual(
        cropManifest.map(({ output }) => path.join(outputDir, output)),
      );
      for (const [index, output] of outputs.entries()) {
        const metadata = await sharp(await readFile(output)).metadata();
        const crop = cropManifest[index];

        expect(metadata.format, crop.output).toBe('webp');
        expect([metadata.width, metadata.height], crop.output).toEqual([
          crop.width,
          crop.height,
        ]);
      }
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

  it('rejects output directories outside Website', async () => {
    const outsideWebsite = path.resolve(scriptsDir, '../..', 'outside-assets');

    await expect(
      runCrops([cropManifest[0]], { outputDir: outsideWebsite }),
    ).rejects.toThrow(/output directory/i);
  });

  it('rejects an in-Website output symlink that resolves outside Website', async ({ skip }) => {
    const sandbox = await mkdtemp(path.join(scriptsDir, '.crop-link-test-'));
    const linkedOutputDir = path.join(sandbox, 'escaped-assets');
    let linkCreated = false;

    try {
      try {
        await symlink(
          designDrawingDir,
          linkedOutputDir,
          process.platform === 'win32' ? 'junction' : 'dir',
        );
        linkCreated = true;
      } catch (error) {
        if (['EACCES', 'EPERM', 'ENOSYS', 'ENOTSUP'].includes(error.code)) {
          skip(`symbolic links unavailable: ${error.code}`);
          return;
        }
        throw error;
      }

      await expect(
        runCrops([], { outputDir: linkedOutputDir }),
      ).rejects.toThrow(/physical output directory/i);
    } finally {
      if (linkCreated) await unlink(linkedOutputDir);
      await rm(sandbox, { recursive: true, force: true });
    }
  });

  it('rejects a pre-existing output file link before Sharp can follow it', async ({ skip }) => {
    const outputDir = await mkdtemp(path.join(scriptsDir, '.crop-file-link-test-'));
    const linkedOutput = path.join(outputDir, cropManifest[0].output);
    const outsideTarget = path.join(designDrawingDir, cropManifest[0].source);
    let linkCreated = false;

    try {
      try {
        await symlink(outsideTarget, linkedOutput, 'file');
        linkCreated = true;
      } catch (error) {
        if (['EACCES', 'EPERM', 'ENOSYS', 'ENOTSUP'].includes(error.code)) {
          if (process.platform === 'win32') {
            try {
              await symlink(designDrawingDir, linkedOutput, 'junction');
              linkCreated = true;
            } catch (junctionError) {
              if (['EACCES', 'EPERM', 'ENOSYS', 'ENOTSUP'].includes(junctionError.code)) {
                skip(`file links and junctions unavailable: ${error.code}/${junctionError.code}`);
                return;
              }
              throw junctionError;
            }
          } else {
            skip(`file symbolic links unavailable: ${error.code}`);
            return;
          }
        } else {
          throw error;
        }
      }

      const invalidCrop = { ...cropManifest[0], width: 0 };
      await expect(
        runCrops([invalidCrop], { outputDir }),
      ).rejects.toThrow(/output target.*symbolic link/i);
    } finally {
      if (linkCreated) await unlink(linkedOutput);
      await rm(outputDir, { recursive: true, force: true });
    }
  });

  it('safely overwrites a pre-existing ordinary output file', async () => {
    const outputDir = await mkdtemp(path.join(scriptsDir, '.crop-file-test-'));
    const target = path.join(outputDir, cropManifest[0].output);

    try {
      await writeFile(target, 'replace me');
      const [output] = await runCrops([cropManifest[0]], { outputDir });
      const metadata = await sharp(await readFile(output)).metadata();

      expect(metadata.format).toBe('webp');
      expect([metadata.width, metadata.height]).toEqual([
        cropManifest[0].width,
        cropManifest[0].height,
      ]);
    } finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  });
});
