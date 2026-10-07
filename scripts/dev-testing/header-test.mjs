import { launch } from './cdp.mjs';
import { mkdirSync } from 'node:fs';
const OUT = new URL('./shots/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const tag = process.argv[2] || 'before';

const c = await launch({ width: 1280, height: 800 });
await c.goto('http://localhost:4400/en/moments/silvana-and-ivan/', 2500);
await c.eval(`document.documentElement.style.scrollBehavior='auto'; document.documentElement.dataset.theme='light'; window.scrollTo(0, 1400); 1`);
await c.sleep(1200);
const strip = { x: 0, y: 0, width: 1280, height: 120 };
await c.shot(`${OUT}${tag}-0-before.jpg`);
console.log('header scrolled flag', await c.eval(`document.querySelector('[data-site-header]').hasAttribute('data-scrolled')`));

// Slow everything 20x, then flip the theme with the real toggle button.
await c.send('Animation.enable');
await c.send('Animation.setPlaybackRate', { playbackRate: 0.05 });
const btn = await c.eval(`(() => { const r = document.querySelector('[data-theme-toggle]').getBoundingClientRect(); return { x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2) }; })()`);
await c.click(btn.x, btn.y);
const t0 = Date.now();
for (const [i, at] of [300, 1500, 3500, 6500, 10000, 15000, 22000].entries()) {
  await c.sleep(Math.max(0, at - (Date.now() - t0)));
  await c.shot(`${OUT}${tag}-${i + 1}-t${at}.jpg`);
  console.log(`t=${at}ms header bg:`, await c.eval(`getComputedStyle(document.querySelector('[data-site-header]')).backgroundColor`), '| html theme:', await c.eval(`document.documentElement.dataset.theme + ' vt=' + document.documentElement.classList.contains('vt-theme')`));
}
console.log('theme now', await c.eval(`document.documentElement.dataset.theme`), 'vt class', await c.eval(`document.documentElement.className`));
await c.close();
