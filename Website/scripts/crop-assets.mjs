import { lstat, mkdir, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { cropManifest } from './crop-manifest.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const websiteDir = path.resolve(here, '..');
const sourceDir = path.resolve(here, '../../DesignDrawing');
const defaultOutputDir = path.resolve(websiteDir, 'public/assets');

function isInside(parent, child) {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function validateFilename(filename, label) {
  if (
    typeof filename !== 'string'
    || filename.length === 0
    || path.basename(filename) !== filename
  ) {
    throw new Error(`${label} filename must not contain a directory`);
  }
}

async function findExistingAncestor(candidate) {
  let current = candidate;

  while (true) {
    try {
      await lstat(current);
      return current;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      const parent = path.dirname(current);
      if (parent === current) throw error;
      current = parent;
    }
  }
}

async function prepareOutputDir(resolvedOutputDir) {
  const physicalWebsiteDir = await realpath(websiteDir);
  const existingAncestor = await findExistingAncestor(resolvedOutputDir);
  const physicalAncestor = await realpath(existingAncestor);

  if (!isInside(physicalWebsiteDir, physicalAncestor)) {
    throw new Error('Physical output directory must remain inside Website');
  }

  await mkdir(resolvedOutputDir, { recursive: true });

  const physicalOutputDir = await realpath(resolvedOutputDir);
  if (!isInside(physicalWebsiteDir, physicalOutputDir)) {
    throw new Error('Physical output directory must remain inside Website');
  }

  return physicalOutputDir;
}

async function validateOutputTarget(target) {
  try {
    const targetStats = await lstat(target);
    if (targetStats.isSymbolicLink()) {
      throw new Error('Output target must not be a symbolic link or reparse point');
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

function validateRetouch(crop) {
  for (const patch of crop.retouch ?? []) {
    if (
      patch.mode === 'horizontal-heal'
      || patch.mode === 'horizontal-fill'
      || patch.mode === 'vertical-fill'
    ) {
      const { target } = patch;
      const values = [
        target.left,
        target.top,
        target.width,
        target.height,
        patch.feather,
      ];
      if (patch.mode === 'horizontal-heal') {
        values.push(patch.threshold, patch.contrast, patch.searchRadius);
      } else {
        values.push(patch.sampleGap);
      }
      for (const value of values) {
        if (!Number.isInteger(value)) throw new Error('Retouch coordinates must be integers');
      }
      if (
        target.left < 0
        || target.top < 0
        || target.left + target.width > crop.width
        || target.top + target.height > crop.height
        || (patch.mode === 'horizontal-heal' && (
          patch.threshold < 0
          || patch.threshold > 255
          || patch.contrast < 0
          || patch.searchRadius < 1
        ))
        || (patch.mode === 'horizontal-fill' && (
          patch.sampleGap < 1
          || target.left - patch.sampleGap - 1 < 0
          || target.left + target.width + patch.sampleGap >= crop.width
        ))
        || (patch.mode === 'vertical-fill' && (
          patch.sampleGap < 1
          || target.top - patch.sampleGap - 1 < 0
          || target.top + target.height + patch.sampleGap >= crop.height
        ))
        || patch.feather < 0
      ) {
        throw new Error(`Retouch patch must remain inside ${crop.output}`);
      }
      continue;
    }

    const { source, target } = patch;
    for (const value of [
      source.left,
      source.top,
      source.width,
      source.height,
      target.left,
      target.top,
    ]) {
      if (!Number.isInteger(value)) throw new Error('Retouch coordinates must be integers');
    }
    if (
      source.left < 0
      || source.top < 0
      || source.left + source.width > crop.width
      || source.top + source.height > crop.height
      || target.left < 0
      || target.top < 0
      || target.left + source.width > crop.width
      || target.top + source.height > crop.height
    ) {
      throw new Error(`Retouch patch must remain inside ${crop.output}`);
    }
  }
}

function applyHorizontalFill(data, info, patch) {
  const { target, feather, sampleGap } = patch;
  const original = Buffer.from(data);
  const { width: imageWidth, channels } = info;
  const pixelIndex = (x, y) => ((y * imageWidth) + x) * channels;
  const leftX = target.left - sampleGap - 1;
  const rightX = target.left + target.width + sampleGap;

  for (let y = 0; y < target.height; y += 1) {
    const imageY = target.top + y;
    const leftIndex = pixelIndex(leftX, imageY);
    const rightIndex = pixelIndex(rightX, imageY);

    for (let x = 0; x < target.width; x += 1) {
      const destinationIndex = pixelIndex(target.left + x, imageY);
      const horizontalMix = (x + sampleGap + 1) / (target.width + (sampleGap * 2) + 1);
      const edgeDistance = Math.min(x, y, target.width - x - 1, target.height - y - 1);
      const strength = feather === 0
        ? 1
        : Math.min(1, (edgeDistance + 1) / (feather + 1));

      for (let channel = 0; channel < Math.min(3, channels); channel += 1) {
        const replacement = (original[leftIndex + channel] * (1 - horizontalMix))
          + (original[rightIndex + channel] * horizontalMix);
        data[destinationIndex + channel] = Math.round(
          (original[destinationIndex + channel] * (1 - strength)) + (replacement * strength),
        );
      }
    }
  }
}

function applyVerticalFill(data, info, patch) {
  const { target, feather, sampleGap } = patch;
  const original = Buffer.from(data);
  const { width: imageWidth, channels } = info;
  const pixelIndex = (x, y) => ((y * imageWidth) + x) * channels;
  const topY = target.top - sampleGap - 1;
  const bottomY = target.top + target.height + sampleGap;

  for (let x = 0; x < target.width; x += 1) {
    const imageX = target.left + x;
    const topIndex = pixelIndex(imageX, topY);
    const bottomIndex = pixelIndex(imageX, bottomY);

    for (let y = 0; y < target.height; y += 1) {
      const destinationIndex = pixelIndex(imageX, target.top + y);
      const verticalMix = (y + sampleGap + 1) / (target.height + (sampleGap * 2) + 1);
      const edgeDistance = Math.min(x, y, target.width - x - 1, target.height - y - 1);
      const strength = feather === 0
        ? 1
        : Math.min(1, (edgeDistance + 1) / (feather + 1));

      for (let channel = 0; channel < Math.min(3, channels); channel += 1) {
        const replacement = (original[topIndex + channel] * (1 - verticalMix))
          + (original[bottomIndex + channel] * verticalMix);
        data[destinationIndex + channel] = Math.round(
          (original[destinationIndex + channel] * (1 - strength)) + (replacement * strength),
        );
      }
    }
  }
}

function luminance(data, index) {
  return (data[index] * 0.2126) + (data[index + 1] * 0.7152) + (data[index + 2] * 0.0722);
}

function applyHorizontalHeal(data, info, patch) {
  const { target, threshold, contrast, searchRadius, feather } = patch;
  const { width: imageWidth, channels } = info;
  const maskWidth = target.width;
  const maskHeight = target.height;
  const candidates = new Uint8Array(maskWidth * maskHeight);
  const alpha = new Float32Array(maskWidth * maskHeight);
  const original = Buffer.from(data);
  const sampleOffsets = [4, 8, 12, 18, 24].filter((offset) => offset <= searchRadius);

  const pixelIndex = (x, y) => ((y * imageWidth) + x) * channels;
  const maskIndex = (x, y) => (y * maskWidth) + x;

  for (let y = 0; y < maskHeight; y += 1) {
    for (let x = 0; x < maskWidth; x += 1) {
      const imageX = target.left + x;
      const imageY = target.top + y;
      const value = luminance(original, pixelIndex(imageX, imageY));
      const nearby = [];

      for (const offset of sampleOffsets) {
        if (imageX - offset >= 0) {
          nearby.push(luminance(original, pixelIndex(imageX - offset, imageY)));
        }
        if (imageX + offset < info.width) {
          nearby.push(luminance(original, pixelIndex(imageX + offset, imageY)));
        }
      }
      const background = nearby.length ? Math.min(...nearby) : value;
      if (value >= threshold && value - background >= contrast) {
        candidates[maskIndex(x, y)] = 1;
        alpha[maskIndex(x, y)] = 1;
      }
    }
  }

  for (let y = 0; y < maskHeight; y += 1) {
    for (let x = 0; x < maskWidth; x += 1) {
      if (!candidates[maskIndex(x, y)]) continue;
      for (let dy = -feather; dy <= feather; dy += 1) {
        for (let dx = -feather; dx <= feather; dx += 1) {
          const nextX = x + dx;
          const nextY = y + dy;
          if (nextX < 0 || nextX >= maskWidth || nextY < 0 || nextY >= maskHeight) continue;
          const distance = Math.max(Math.abs(dx), Math.abs(dy));
          const strength = distance === 0 ? 1 : (feather - distance + 1) / ((feather + 1) * 1.5);
          alpha[maskIndex(nextX, nextY)] = Math.max(alpha[maskIndex(nextX, nextY)], strength);
        }
      }
    }
  }

  for (let y = 0; y < maskHeight; y += 1) {
    for (let x = 0; x < maskWidth; x += 1) {
      const strength = alpha[maskIndex(x, y)];
      if (strength === 0) continue;

      let left = x - 1;
      let right = x + 1;
      while (left >= 0 && alpha[maskIndex(left, y)] > 0 && x - left <= searchRadius) left -= 1;
      while (
        right < maskWidth
        && alpha[maskIndex(right, y)] > 0
        && right - x <= searchRadius
      ) right += 1;

      const hasLeft = left >= 0 && x - left <= searchRadius;
      const hasRight = right < maskWidth && right - x <= searchRadius;
      if (!hasLeft && !hasRight) continue;

      const destinationIndex = pixelIndex(target.left + x, target.top + y);
      const leftIndex = hasLeft ? pixelIndex(target.left + left, target.top + y) : null;
      const rightIndex = hasRight ? pixelIndex(target.left + right, target.top + y) : null;
      const mix = hasLeft && hasRight ? (x - left) / (right - left) : 0;

      for (let channel = 0; channel < Math.min(3, channels); channel += 1) {
        const replacement = hasLeft && hasRight
          ? (original[leftIndex + channel] * (1 - mix)) + (original[rightIndex + channel] * mix)
          : original[(hasLeft ? leftIndex : rightIndex) + channel];
        data[destinationIndex + channel] = Math.round(
          (original[destinationIndex + channel] * (1 - strength)) + (replacement * strength),
        );
      }
    }
  }
}

export async function runCrops(
  manifest = cropManifest,
  { outputDir = defaultOutputDir, quality = 88 } = {},
) {
  const resolvedOutputDir = path.resolve(outputDir);
  if (!isInside(websiteDir, resolvedOutputDir)) {
    throw new Error('Output directory must remain inside Website');
  }

  for (const crop of manifest) {
    validateFilename(crop.source, 'Source');
    validateFilename(crop.output, 'Output');
    validateRetouch(crop);
  }

  const physicalOutputDir = await prepareOutputDir(resolvedOutputDir);

  return Promise.all(
    manifest.map(async (crop) => {
      const target = path.join(physicalOutputDir, crop.output);
      const sourcePath = path.join(sourceDir, crop.source);
      await validateOutputTarget(target);
      let image = sharp(sourcePath).extract({
          left: crop.left,
          top: crop.top,
          width: crop.width,
          height: crop.height,
        });

      const horizontalRetouches = crop.retouch?.filter(
        (patch) => (
          patch.mode === 'horizontal-heal'
          || patch.mode === 'horizontal-fill'
          || patch.mode === 'vertical-fill'
        ),
      ) ?? [];
      if (horizontalRetouches.length) {
        const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
        for (const patch of horizontalRetouches) {
          if (patch.mode === 'horizontal-fill') applyHorizontalFill(data, info, patch);
          else if (patch.mode === 'vertical-fill') applyVerticalFill(data, info, patch);
          else applyHorizontalHeal(data, info, patch);
        }
        image = sharp(data, { raw: info });
      }

      const compositePatches = crop.retouch?.filter((patch) => !patch.mode) ?? [];
      if (compositePatches.length) {
        const patches = await Promise.all(compositePatches.map(async (patch) => ({
          input: await sharp(sourcePath)
            .extract({
              left: crop.left + patch.source.left,
              top: crop.top + patch.source.top,
              width: patch.source.width,
              height: patch.source.height,
            })
            .toBuffer(),
          left: patch.target.left,
          top: patch.target.top,
        })));
        image = image.composite(patches);
      }

      await image
        .webp({ quality })
        .toFile(target);
      return target;
    }),
  );
}

if (
  process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await runCrops();
}
