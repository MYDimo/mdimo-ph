/*
 * Hero carousel behaviour (no dependencies).
 *
 * Timing: the active progress segment runs a CSS animation lasting one interval;
 * its `animationend` advances to the next slide. Pausing simply sets
 * animation-play-state: paused, so a resumed slide continues where it stopped.
 *
 * Looping: the track holds the slides twice. Moving forward past the last real
 * slide lands on its identical clone; once the scroll settles we jump back by one
 * set width with no animation, which is invisible because the frames look the same.
 */

const HOLD_AFTER_INTERACTION = 8000; // ms autoplay stays paused after a manual action

export function initHeroCarousel(root) {
  const track = root.querySelector('[data-hero-track]');
  const slides = [...track.children];
  const count = slides.length / 2; // real slides; the rest are clones
  const segments = [...root.querySelectorAll('.hero-seg')];
  const toggle = root.querySelector('[data-hero-toggle]');
  const status = root.querySelector('[data-hero-status]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let index = 0; // position in the full (doubled) list
  const state = { userPaused: reduceMotion.matches, hover: false, focus: false, hidden: document.hidden, held: false };
  let holdTimer;

  // Autoplay (and thus the progress animation) only when motion is allowed.
  if (!reduceMotion.matches) root.setAttribute('data-autoplay', '');

  const slideLeft = (i) => slides[i].offsetLeft - slides[0].offsetLeft;
  const behavior = () => (reduceMotion.matches ? 'instant' : 'smooth');

  function setActive(i) {
    index = i;
    const real = i % count;
    segments.forEach((seg, n) => {
      seg.classList.remove('is-active');
      if (n === real) {
        void seg.offsetWidth; // restart the fill animation
        seg.classList.add('is-active');
      }
    });
    status.textContent = root.dataset.labelSlide.replace('{n}', real + 1).replace('{total}', count);
  }

  // Slide we are scrolling to programmatically; scroll settles elsewhere are ignored until it's reached.
  let target = null;

  function goTo(i) {
    // Going back from the first slide: jump to its clone first, then glide back one.
    if (i < 0) {
      track.scrollTo({ left: slideLeft(count), behavior: 'instant' });
      i = count - 1;
    }
    target = i;
    setActive(i);
    track.scrollTo({ left: slideLeft(i), behavior: behavior() });
  }

  // After any scroll settles (autoplay, buttons, or a swipe): sync the index and
  // silently rewind from the clone set into the real set.
  function onSettled() {
    let i = Math.round(track.scrollLeft / slideLeft(1));
    if (target !== null && i !== target) return; // still on the way (or an intermediate jump)
    target = null;
    if (i >= count) {
      i -= count;
      track.scrollTo({ left: slideLeft(i), behavior: 'instant' });
      index = i; // same frame, so keep the running progress animation
      return;
    }
    if (i !== index) setActive(i); // the visitor swiped to a different slide
  }
  if ('onscrollend' in window) {
    track.addEventListener('scrollend', onSettled);
  } else {
    let t;
    track.addEventListener('scroll', () => { clearTimeout(t); t = setTimeout(onSettled, 120); }, { passive: true });
  }

  function render() {
    const playing = !(state.userPaused || state.hover || state.focus || state.hidden || state.held);
    root.dataset.playing = String(playing);
    toggle.setAttribute('aria-label', state.userPaused ? root.dataset.labelPlay : root.dataset.labelPause);
    // Announce slide changes only when the carousel is not moving by itself.
    status.setAttribute('aria-live', playing ? 'off' : 'polite');
  }

  // A manual action pauses autoplay for a while, then it resumes on its own.
  function hold() {
    state.held = true;
    render();
    clearTimeout(holdTimer);
    holdTimer = setTimeout(() => { state.held = false; render(); }, HOLD_AFTER_INTERACTION);
  }

  segments.forEach((seg) =>
    seg.addEventListener('animationend', () => {
      if (seg.classList.contains('is-active')) goTo(index + 1);
    }),
  );

  root.querySelector('[data-hero-next]').addEventListener('click', () => { hold(); goTo(index + 1); });
  root.querySelector('[data-hero-prev]').addEventListener('click', () => { hold(); goTo((index % count) - 1); });
  toggle.addEventListener('click', () => {
    state.userPaused = !state.userPaused;
    if (!state.userPaused && reduceMotion.matches) state.userPaused = true; // never autoplay under reduced motion
    render();
  });

  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); hold(); goTo(index + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); hold(); goTo((index % count) - 1); }
  });
  track.addEventListener('pointerdown', () => { target = null; hold(); }, { passive: true });
  track.addEventListener('wheel', (e) => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { target = null; hold(); } }, { passive: true });

  root.addEventListener('mouseenter', () => { state.hover = true; render(); });
  root.addEventListener('mouseleave', () => { state.hover = false; render(); });
  root.addEventListener('focusin', (e) => { state.focus = e.target.matches(':focus-visible'); render(); });
  root.addEventListener('focusout', (e) => { if (!root.contains(e.relatedTarget)) { state.focus = false; render(); } });
  document.addEventListener('visibilitychange', () => { state.hidden = document.hidden; render(); });

  setActive(0);
  render();
}
