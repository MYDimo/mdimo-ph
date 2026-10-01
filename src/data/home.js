// Home page images. Alt text lives in src/i18n/*.json under home.alt.<key>.
// To swap a photo: copy it from /images into src/assets/home/… and change the import.
import hero1 from '../assets/home/hero/01-autumn-stairs.jpg';
import hero2 from '../assets/home/hero/02-rings.jpg';
import hero3 from '../assets/home/hero/03-sunset.jpg';
import hero4 from '../assets/home/hero/04-sunlit-dance.jpg';
import hero5 from '../assets/home/hero/05-autumn-forest.jpg';
import hero6 from '../assets/home/hero/06-golden-hour.jpg';
import story from '../assets/home/story/every-frame.jpg';
import meet from '../assets/about/self-portrait.jpg';
import bento1 from '../assets/home/bento/1-seaside-bride.jpg';
import bento2 from '../assets/home/bento/2-night-dance.jpg';
import bento3 from '../assets/home/bento/3-table.jpg';
import bento4 from '../assets/home/bento/4-glass.jpg';
import bento5 from '../assets/home/bento/5-dance-bw.jpg';
import bento6 from '../assets/home/bento/6-moonlight.jpg';

/** Hero carousel, in order. The first one is the LCP image (eager + preloaded). */
export const heroSlides = [
  { src: hero1, alt: 'hero1' },
  { src: hero2, alt: 'hero2' },
  { src: hero3, alt: 'hero3' },
  { src: hero4, alt: 'hero4' },
  { src: hero5, alt: 'hero5' },
  { src: hero6, alt: 'hero6' },
];

export const storyImages = {
  story: { src: story, alt: 'story' },
  meet: { src: meet, alt: 'meet' }, // Mihaylo's self-portrait (also on About)
};

/** Bento tiles, in grid order: big, tall, small, small, wide, wide. */
export const bentoTiles = [
  { src: bento1, alt: 'bento1' },
  { src: bento2, alt: 'bento2' },
  { src: bento3, alt: 'bento3' },
  { src: bento4, alt: 'bento4' },
  { src: bento5, alt: 'bento5' },
  { src: bento6, alt: 'bento6' },
];
