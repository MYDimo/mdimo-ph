/*
 * "How it works" road (Services page). No dependencies.
 *
 * Layout: the milestone cards are scattered across the width; a smooth S-curve
 * runs from card to card like a winding road. It's drawn twice: a faint dotted
 * base, and an accent line that is revealed as you scroll.
 *
 * Scroll: the "pen tip" sits at 55% of the viewport height. As the page moves,
 * the accent line is drawn down to the tip (plus a dot marking it). The latest
 * milestone the line has reached is "current" (it grows and lights up); earlier
 * ones are "passed" and later ones wait, both smaller and quieter. Cards also
 * drift slightly against the scroll for a soft parallax.
 *
 * With reduced motion the whole road is simply drawn and every card is shown.
 */
export function initRoad(root) {
  const svg = root.querySelector('.road-svg');
  const base = svg.querySelector('.road-base');
  const line = svg.querySelector('.road-progress');
  const tip = svg.querySelector('.road-tip');
  const steps = [...root.querySelectorAll('[data-road-step]')];
  const nodes = steps.map((s) => s.querySelector('[data-road-node]'));
  const live = document.documentElement.classList.contains('motion');
  let length = 0;
  let stops = [];

  // Path length at which the curve reaches height y (y grows monotonically along the road).
  const lengthAtY = (y) => {
    let lo = 0;
    let hi = length;
    for (let k = 0; k < 18; k++) {
      const mid = (lo + hi) / 2;
      if (line.getPointAtLength(mid).y < y) lo = mid;
      else hi = mid;
    }
    return lo;
  };

  function layout() {
    const box = root.getBoundingClientRect();
    svg.setAttribute('width', box.width);
    svg.setAttribute('height', box.height);
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    const pts = nodes.map((n) => {
      const r = n.getBoundingClientRect();
      return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 };
    });
    // The cards are scattered, so the road simply flows from one card's centre to
    // the next with soft S-curves (it passes under the cards, which hide it there).
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      const dy = b.y - a.y;
      d += ` C ${a.x} ${a.y + dy * 0.55}, ${b.x} ${b.y - dy * 0.55}, ${b.x} ${b.y}`;
    }
    base.setAttribute('d', d);
    line.setAttribute('d', d);
    length = line.getTotalLength();
    line.style.strokeDasharray = `${length}`;
    stops = pts.map((p) => lengthAtY(p.y));
    update();
  }

  function update() {
    if (!live) {
      line.style.strokeDashoffset = '0';
      tip.style.display = 'none';
      return;
    }
    const box = root.getBoundingClientRect();
    const tipY = Math.max(0, Math.min(box.height, innerHeight * 0.55 - box.top));
    const drawn = tipY <= 0 ? 0 : lengthAtY(tipY);
    line.style.strokeDashoffset = `${length - drawn}`;
    const p = line.getPointAtLength(drawn);
    tip.setAttribute('cx', p.x);
    tip.setAttribute('cy', p.y);
    tip.style.opacity = drawn > 0 && drawn < length - 1 ? '1' : '0';

    let current = -1;
    stops.forEach((s, i) => {
      if (drawn >= s - 2) current = i;
    });
    steps.forEach((step, i) => {
      step.classList.toggle('is-reached', i <= current);
      step.classList.toggle('is-current', i === current);
      step.classList.toggle('is-passed', i < current);
      // Parallax: cards drift a little against the scroll, more the further from centre.
      const r = step.getBoundingClientRect();
      const offset = r.top + r.height / 2 - innerHeight / 2;
      step.style.setProperty('--py', `${(-offset * 0.05).toFixed(1)}px`);
    });
  }

  if (live) root.classList.add('is-live');
  let queued = false;
  addEventListener('scroll', () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        update();
      });
    }
  }, { passive: true });
  addEventListener('resize', layout);
  layout();
}
