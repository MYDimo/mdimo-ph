// Computes each photo's average colour (used as the frame's background while the
// photo loads, so images fade in from their own tone instead of popping in).
// Writes src/data/image-colors.json. Run after adding/swapping photos
// (import-moments.mjs runs it automatically):  node scripts/image-colors.mjs
import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const assets = path.join(root, 'src/assets');
const out = {};
const blur = {};

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (/\.jpe?g$/i.test(entry.name)) {
      // Shrinking to a single pixel averages the whole image.
      const { data } = await sharp(full).resize(1, 1, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      const key = path.relative(assets, full).split(path.sep).join('/');
      // A ~24px JPEG, stretched and blurred by the browser, previews the photo while it loads.
      const tiny = await sharp(full).resize(24, 24, { fit: 'inside' }).jpeg({ quality: 50 }).toBuffer();
      blur[key] = `data:image/jpeg;base64,${tiny.toString('base64')}`;
      out[key] = `#${[...data].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
    }
  }
}

await walk(assets);
const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
await writeFile(path.join(root, 'src/data/image-colors.json'), JSON.stringify(sorted, null, 2) + '\n');
const sortedBlur = Object.fromEntries(Object.entries(blur).sort(([a], [b]) => a.localeCompare(b)));
await writeFile(path.join(root, 'src/data/image-blur.json'), JSON.stringify(sortedBlur) + '\n');
console.log(`src/data/image-colors.json: ${Object.keys(sorted).length} colours`);
