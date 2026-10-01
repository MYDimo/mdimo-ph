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
    // scrub: 1 lets the effect trail the scroll by ~1s instead of tracking it rigidly.
    const out = { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 };
    gsap.to('[data-hero-heading]', { opacity: 0, y: -48, ease: 'none', scrollTrigger: out });
    gsap.to('[data-hero-frames]', { scale: 0.94, opacity: 0.6, ease: 'none', scrollTrigger: out });
  }

  //    Statement: "from / through / to …" plays each time it comes into view.
  //    Every word rises out of its own mask in reading order with a slight tilt
  //    settling flat; the grey serif lead words also slide in from the left, so
  //    each line visibly starts with its from / through / to. It resets once the
  //    statement has left the screen (either direction) so the next pass replays it.
  const statement = document.querySelector('[data-statement]');
  if (statement) {
    const words = statement.querySelectorAll('[data-word]');
    const leads = statement.querySelectorAll('[data-lead]');
    // Colour is handled in CSS (accent → text colour, keyed off .is-lit) so it
    // always follows the current theme; GSAP only moves the words.
    words.forEach((w, i) => w.style.setProperty('--i', String(i)));
    gsap.set(words, { yPercent: 115, rotate: 4, opacity: 0, transformOrigin: '0% 100%' });
    gsap.set(leads, { x: -24 });
    const tl = gsap.timeline({ paused: true }).to(words, {
      yPercent: 0,
      rotate: 0,
      x: 0,
      opacity: 1,
      duration: 1.6,
      ease: 'power3.out',
      stagger: 0.09,
    });
    // Play when it is well inside the viewport…
    ScrollTrigger.create({
      trigger: statement,
      start: 'top 82%',
      end: 'bottom 18%',
      onEnter: () => { tl.restart(); statement.classList.add('is-lit'); },
      onEnterBack: () => { tl.restart(); statement.classList.add('is-lit'); },
    });
    // …and rewind only once it is completely off screen, so it never resets in view.
    ScrollTrigger.create({
      trigger: statement,
      start: 'top bottom',
      end: 'bottom top',
      onLeave: () => { tl.pause(0); statement.classList.remove('is-lit'); },
      onLeaveBack: () => { tl.pause(0); statement.classList.remove('is-lit'); },
    });
  }

  // 2. Story cards: the photo drifts gently against the card as it passes
  //    (the image is pre-scaled in CSS so the drift never reveals an edge).
  gsap.utils.toArray('[data-parallax]').forEach((img) => {
    gsap.fromTo(
      img,
      { yPercent: -5 },
      { yPercent: 5, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1.2 } },
    );
  });
  // 3. Bento tiles, cards and headings use the site-wide reveals in src/scripts/motion.js.
}
