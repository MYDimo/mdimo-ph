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

  //    Statement: "from / through / to …" plays once as it comes into view.
  //    Every word rises out of its own mask in reading order with a slight tilt
  //    settling flat; the grey italic lead words also slide in from the left, so
  //    each line visibly starts with its from / through / to.
  const statement = document.querySelector('[data-statement]');
  if (statement) {
    const words = statement.querySelectorAll('[data-word]');
    gsap.set(words, { yPercent: 115, rotate: 4, opacity: 0, transformOrigin: '0% 100%' });
    gsap.set(statement.querySelectorAll('[data-lead]'), { x: -24 });
    gsap.to(words, {
      yPercent: 0,
      rotate: 0,
      x: 0,
      opacity: 1,
      duration: 1.1,
      ease: 'power4.out',
      stagger: 0.055,
      scrollTrigger: { trigger: statement, start: 'top 78%', once: true },
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
