// Generates public/apple-touch-icon.png (180×180) from the logo: ink stroke on the paper background.
// Run once after changing the logo: node scripts/make-icons.mjs
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

const svg = (await readFile(new URL('../src/assets/logo.svg', import.meta.url), 'utf8')).replace('currentColor', '#1f1d1a');
const logo = await sharp(Buffer.from(svg), { density: 600 }).resize(112, 112, { fit: 'contain', background: '#00000000' }).png().toBuffer();
await sharp({ create: { width: 180, height: 180, channels: 4, background: '#f6f5f2' } })
  .composite([{ input: logo, gravity: 'center' }])
  .png()
  .toFile(new URL('../public/apple-touch-icon.png', import.meta.url).pathname);
console.log('public/apple-touch-icon.png written');
