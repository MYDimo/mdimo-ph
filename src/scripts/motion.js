/*
 * Site-wide motion (no dependencies, loaded on every page). Styles: src/styles/motion.css.
 *
 *  - Reveals: headings (word by word), photos (mask opening) and blocks (rise)
 *    animate each time they scroll into view and reset once fully out of view,
 *    so they replay on every pass, not just the first.
 *  - Photos fade in over their average colour once loaded.
 *  - Header: frosted after scrolling; on mobile it hides while scrolling down.
 *  - "View" pill follows the cursor over photo links (mouse/trackpad only).
 */

const root = document.documentElement;
const motion = root.classList.contains('motion');

/* Split a heading's text into masked words (keeps nested elements like <em>). */
function splitWords(el) {
  let i = 0;
  const walk = (node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === Node.TEXT_NODE) {
        const parts = child.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        for (const part of parts) {
          if (!part) continue;
          if (/^\s+$/.test(part)) {
            frag.append(document.createTextNode(part));
            continue;
          }
          const outer = document.createElement('span');
          outer.className = 'rw';
          const inner = document.createElement('span');
          inner.textContent = part;
          inner.style.setProperty('--i', String(i++));
          outer.append(inner);
          frag.append(outer);
        }
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
      }
    }
  };
  walk(el);
  el.classList.add('is-split');
}

// Big headings reveal word by word. Skip ones that morph between pages
// (they carry a view-transition-name) and the home statement (GSAP-driven).
const headings = document.querySelectorAll(
  'main :is(h1, .text-headline, [data-split]):not([data-statement]):not([style*="view-transition-name"])',
);
headings.forEach((h) => {
  h.setAttribute('data-reveal-words', '');
  if (motion) splitWords(h);
});

// Stagger index for groups of rising blocks (cards, steps).
document.querySelectorAll('[data-reveal-group]').forEach((group) => {
  group.querySelectorAll('[data-reveal="rise"]').forEach((el, i) => el.style.setProperty('--i', String(i % 6)));
});

if (motion && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting && e.intersectionRatio >= 0.12) e.target.classList.add('is-in');
        else if (!e.isIntersecting) e.target.classList.remove('is-in'); // fully out: reset to replay next time
      }
    },
    { threshold: [0, 0.12] },
  );
  const targets = document.querySelectorAll('[data-reveal-words], [data-reveal]');
  targets.forEach((el) => io.observe(el));
  // Whatever is already on screen animates straight away rather than waiting for
  // the observer's first callback (a short timeout lets the hidden state paint first).
  setTimeout(() => {
    targets.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in');
    });
  }, 30);
} else {
  document.querySelectorAll('[data-reveal-words], [data-reveal]').forEach((el) => el.classList.add('is-in'));
}

/* Photos: fade in once decoded (the container already shows their average colour). */
document.querySelectorAll('img.fade-img').forEach((img) => {
  const done = () => img.classList.add('is-loaded');
  if (img.complete && img.naturalWidth) done();
  else img.addEventListener('load', done, { once: true });
  img.addEventListener('error', done, { once: true });
});

/* Header: frosted once the page is scrolled; hides on mobile while scrolling down. */
const header = document.querySelector('[data-site-header]');
if (header) {
  let last = window.scrollY;
  let ticking = false;
  const update = () => {
    const y = window.scrollY;
    header.toggleAttribute('data-scrolled', y > 8);
    const menuOpen = document.getElementById('mobile-menu')?.open;
    if (y > 160 && y > last + 4 && !menuOpen) header.setAttribute('data-hidden', '');
    else if (y < last - 4 || y <= 160) header.removeAttribute('data-hidden');
    last = y;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  // Keyboard users tabbing into a hidden header should see it.
  header.addEventListener('focusin', () => header.removeAttribute('data-hidden'));
  update();
}

/* "View" pill following the cursor over photo links ([data-view]). */
if (motion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const targets = document.querySelectorAll('[data-view]');
  if (targets.length) {
    const pill = document.createElement('div');
    pill.className = 'view-cursor';
    pill.setAttribute('aria-hidden', 'true');
    pill.textContent = root.dataset.viewLabel || 'View';
    document.body.append(pill);
    let x = 0, y = 0, raf = 0;
    const place = () => {
      pill.style.transform = `translate(${x + 14}px, ${y + 14}px)`;
      raf = 0;
    };
    document.addEventListener('pointermove', (e) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(place);
    }, { passive: true });
    targets.forEach((t) => {
      t.addEventListener('pointerenter', () => pill.classList.add('is-on'));
      t.addEventListener('pointerleave', () => pill.classList.remove('is-on'));
    });
  }
}
