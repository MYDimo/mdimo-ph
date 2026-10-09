// Average colour of each photo (from src/data/image-colors.json), as a background
// for its frame while it loads. Look-up is by the image's built src.
import colors from './image-colors.json';
import blurs from './image-blur.json';

const modules = import.meta.glob('../assets/**/*.{jpg,jpeg,JPG}', { eager: true, import: 'default' });
const bySrc = new Map(Object.entries(modules).map(([p, img]) => [img.src, colors[p.replace('../assets/', '')]]));
const blurBySrc = new Map(Object.entries(modules).map(([p, img]) => [img.src, blurs[p.replace('../assets/', '')]]));

/** The image's average colour as a hex string (or undefined). */
export const colorOf = (image) => (image ? bySrc.get(image.src) : undefined);

/** `background-color: …` plus a tiny preview of the photo (`--ph`, blurred in CSS), plus any extra inline style. */
export function bg(image, extra = '') {
  const c = image && bySrc.get(image.src);
  const b = image && blurBySrc.get(image.src);
  return [c && `background-color: ${c}`, b && `--ph: url(${b})`, extra].filter(Boolean).join('; ') || undefined;
}
