/*
 * "How it works" road in a pinned screen frame (Services page). No dependencies.
 *
 * Structure: [data-road-pin] (tall wrapper) > [data-road-stage] (sticky, centred:
 * heading + frame) > [data-road-frame] ("screen") > [data-road-viewport] (clips)
 * > [data-road] (the road content: SVG + cards).
 *
 *  1. Arrival: while the wrapper scrolls up towards its sticky position, the
 *     frame grows from 90% to full size.
 *  2. Pinned: the frame (and the FAQ beside it) stays put. Scroll progress
 *     through the tall wrapper drives the accent line along the road from the
 *     first milestone to the last; the road content slides up inside the frame
 *     so the pen tip stays around the middle of the screen.
 *  3. Release: at the last milestone the wrapper ends and the page scrolls on.
 *
 * Each milestone's size and opacity follow its distance from the pen tip: small
 * and faint as it arrives, full size when the line reaches it, small and faint
 * again as the line moves on. The one nearest the tip is "current" (accent ring); the
 * counter in the frame's title bar follows it.
 *
 * Reduced motion: the wrapper isn't pinned (pin styles need html.motion) and the
 * whole road is drawn.
 */
export function initRoad(pin) {
  const stage = pin.querySelector('[data-road-stage]');
  const frame = pin.querySelector('[data-road-frame]');
  const viewport = pin.querySelector('[data-road-viewport]');
  const road = pin.querySelector('[data-road]');
  const svg = road.querySelector('.road-svg');
  const base = svg.querySelector('.road-base');
  const line = svg.querySelector('.road-progress');
  const tip = svg.querySelector('.road-tip');
  const counter = pin.querySelector('[data-road-count]');
  const steps = [...road.querySelectorAll('[data-road-step]')];
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
    road.style.transform = ''; // measure untranslated
    const box = road.getBoundingClientRect();
    svg.setAttribute('width', box.width);
    svg.setAttribute('height', box.height);
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    const pts = nodes.map((n) => {
      const r = n.getBoundingClientRect();
      return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 };
    });
    // Soft S-curves from one card's centre to the next (the cards hide the road beneath them).
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
    const pinBox = pin.getBoundingClientRect();
    const stickyTop = parseFloat(getComputedStyle(stage).top) || 0;
    const travel = pin.offsetHeight - stage.offsetHeight;

    // 1. Arrival: grow the frame into place as it approaches its pinned position.
    const enter = Math.min(1, Math.max(0, 1 - (pinBox.top - stickyTop) / (innerHeight * 0.75)));
    const eased = 1 - (1 - enter) ** 3;
    frame.style.transform = enter < 1 ? `scale(${0.9 + 0.1 * eased})` : '';

    // 2. Pinned progress (0 → 1) drives the line from the first milestone to the last.
    const progress = travel > 0 ? Math.min(1, Math.max(0, (stickyTop - pinBox.top) / travel)) : 0;
    const first = stops[0];
    const last = stops[stops.length - 1];
    const drawn = first + (last - first) * progress;
    line.style.strokeDashoffset = `${length - drawn}`;
    const p = line.getPointAtLength(drawn);
    tip.setAttribute('cx', p.x);
    tip.setAttribute('cy', p.y);
    tip.style.opacity = progress > 0 && progress < 1 ? '1' : '0';

    // Slide the road up inside the frame so the pen tip stays near the middle.
    const view = viewport.clientHeight;
    const maxShift = Math.max(0, road.offsetHeight - view + 72); // room for the bottom fade
    const shift = Math.min(maxShift, Math.max(0, p.y - view * 0.5));
    road.style.transform = `translateY(${-shift}px)`;

    // "Current" = the milestone nearest the pen tip (matches the card in focus).
    let current = 0;
    stops.forEach((s, i) => {
      if (Math.abs(s - drawn) < Math.abs(stops[current] - drawn)) current = i;
    });
    // Size and opacity by distance from the pen tip (0 = the line is in this card,
    // 1 = far away), so whichever card the road is drawing into is the one in focus,
    // all the way to the last milestone.
    const vr = viewport.getBoundingClientRect();
    const middle = road.getBoundingClientRect().top + p.y;
    steps.forEach((step, i) => {
      step.classList.toggle('is-reached', i <= current);
      step.classList.toggle('is-current', i === current);
      step.classList.toggle('is-passed', i < current);
      const r = nodes[i].getBoundingClientRect();
      const t = Math.min(1, Math.abs(r.top + r.height / 2 - middle) / (vr.height * 0.55));
      const ease = t * t * (3 - 2 * t); // smoothstep: gentle near the middle, quicker at the edges
      nodes[i].style.setProperty('--s', (1.04 - 0.22 * ease).toFixed(3));
      nodes[i].style.setProperty('--o', (1 - 0.82 * ease).toFixed(3));
    });
    if (counter) counter.textContent = String(current + 1);
  }

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
