// Copies the curated Moments photos from /images (read-only originals) into
// src/assets/moments/<slug>/, resized to 2048px on the long edge (JPEG q82).
// The list of events and photos lives in scripts/moments.manifest.json.
//
//   node scripts/import-moments.mjs            # import everything missing
//   node scripts/import-moments.mjs --force    # re-import all
import { readFile, mkdir, access, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const manifest = JSON.parse(await readFile(path.join(root, 'scripts/moments.manifest.json'), 'utf8'));
const force = process.argv.includes('--force');
const exists = (p) => access(p).then(() => true, () => false);

for (const moment of manifest) {
  const dir = path.join(root, 'src/assets/moments', moment.slug);
  if (force) await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  // Remove files that are no longer in the manifest (e.g. after swapping a photo).
  const keep = new Set(moment.photos.map((_, i) => `${String(i + 1).padStart(2, '0')}.jpg`));
  for (const f of await readdir(dir)) if (!keep.has(f)) await rm(path.join(dir, f));

  let written = 0;
  for (const [i, file] of moment.photos.entries()) {
    const out = path.join(dir, `${String(i + 1).padStart(2, '0')}.jpg`);
    if (!force && (await exists(out))) continue;
    await sharp(path.join(root, 'images/categories', moment.source, file))
      .rotate() // respect EXIF orientation
      .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(out);
    written++;
  }
  console.log(`${moment.slug}: ${moment.photos.length} photos (${written} written)`);
}
