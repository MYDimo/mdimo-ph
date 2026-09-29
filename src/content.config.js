import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

export const categories = ['weddings', 'christenings', 'photoshoots', 'concerts', 'sports'];

// One MDX file per event per language: src/content/moments/{en,bg}/<slug>.mdx.
// The photos live in src/assets/moments/<translationKey>/ (see scripts/import-moments.mjs).
const moments = defineCollection({
  loader: glob({ base: './src/content/moments', pattern: '**/*.mdx' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    categories: z.array(z.enum(categories)).min(1),
    location: z.string().optional(),
    /** Which photo (1-based) is the cover. */
    cover: z.number().int().positive().default(1),
    /** Shared by the EN and BG versions; also the photo folder and URL slug. */
    translationKey: z.string(),
  }),
});

export const collections = { moments };
