/*
 * Home page scroll narrative (GSAP + ScrollTrigger). Loaded lazily after first
 * paint and never under prefers-reduced-motion. Only transform/opacity animate.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initHomeScroll() {
  gsap.registerPlugin(ScrollTrigger);

  // 1. Hero → statement. While the hero scrolls away, the headline lifts and
  //    fades and the frames settle back slightly, handing focus to the next section.
  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const out = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
    gsap.to('[data-hero-heading]', { opacity: 0, y: -48, ease: 'none', scrollTrigger: out });
    gsap.to('[data-hero-frames]', { scale: 0.94, opacity: 0.6, ease: 'none', scrollTrigger: out });
  }

  //    The "from / through / to" lines appear one after another, tied to
  //    scroll position, so the sentence is read at the pace of the scroll.
  //    (They start fully transparent rather than dimmed, so a half-revealed line
  //    is never read as low-contrast text.)
  const lines = gsap.utils.toArray('[data-statement-line]');
  if (lines.length) {
    gsap.from(lines, {
      opacity: 0,
      y: 24,
      stagger: 0.35,
      ease: 'power1.out',
      scrollTrigger: { trigger: lines[0].parentElement, start: 'top 85%', end: 'bottom 55%', scrub: 0.6 },
    });
  }

  // 2. Story cards: the photo drifts gently against the card as it passes
  //    (the image is pre-scaled in CSS so the drift never reveals an edge).
  gsap.utils.toArray('[data-parallax]').forEach((img) => {
    gsap.fromTo(
      img,
      { yPercent: -5 },
      { yPercent: 5, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } },
    );
  });

  // 3. Bento: tiles rise and fade in with a soft stagger the first time they appear.
  const tiles = gsap.utils.toArray('[data-bento-tile]');
  if (tiles.length) {
    gsap.set(tiles, { opacity: 0, y: 40 });
    ScrollTrigger.batch(tiles, {
      start: 'top 92%',
      once: true,
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out' }),
    });
  }
}
