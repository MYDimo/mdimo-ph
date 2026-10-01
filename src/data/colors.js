// Average colour of each photo (from src/data/image-colors.json), as a background
// for its frame while it loads. Look-up is by the image's built src.
import colors from './image-colors.json';

const modules = import.meta.glob('../assets/**/*.{jpg,jpeg,JPG}', { eager: true, import: 'default' });
const bySrc = new Map(Object.entries(modules).map(([p, img]) => [img.src, colors[p.replace('../assets/', '')]]));

/** `background-color: …` for an image, plus any extra inline style. */
export function bg(image, extra = '') {
  const c = image && bySrc.get(image.src);
  return [c && `background-color: ${c}`, extra].filter(Boolean).join('; ') || undefined;
}
