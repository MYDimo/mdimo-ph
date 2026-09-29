import { getCollection } from 'astro:content';

// Every imported Moments photo, keyed by path: ../assets/moments/<translationKey>/NN.jpg
const photos = import.meta.glob('../assets/moments/*/*.jpg', { eager: true, import: 'default' });

/** Photos of one Moment, in order (01.jpg, 02.jpg …). */
export function getPhotos(key) {
  return Object.entries(photos)
    .filter(([path]) => path.includes(`/moments/${key}/`))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, image]) => image);
}

/** All Moments in one locale, newest first, with slug, photos and cover attached. */
export async function getMoments(locale) {
  const entries = await getCollection('moments', (e) => e.id.startsWith(`${locale}/`));
  return entries
    .map((entry) => {
      const images = getPhotos(entry.data.translationKey);
      return { entry, slug: entry.data.translationKey, images, cover: images[entry.data.cover - 1] ?? images[0] };
    })
    .sort((a, b) => b.entry.data.date - a.entry.data.date);
}
