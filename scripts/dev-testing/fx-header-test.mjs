import { launchFx } from './fx.mjs';
import { mkdirSync, readdirSync, rmSync } from 'node:fs';
const OUT = new URL('./shots/', import.meta.url).pathname; mkdirSync(OUT, { recursive: true });
const tag = process.argv[2] || 'fx';
const site = process.argv[3] || 'https://mdimophotography.bg/en/';
const from = process.argv[4] || 'night';
for (const f of readdirSync(OUT)) if (f.startsWith(tag + '-')) rmSync(OUT + f);

const c = await launchFx({ width: 1440, height: 800 });
await c.goto(site, 4000);
console.log('has startViewTransition:', await c.eval(`typeof document.startViewTransition`), '| UA:', await c.eval(`navigator.userAgent`));
await c.eval(`(async () => { document.documentElement.style.scrollBehavior='auto'; document.documentElement.dataset.theme='${from}'; const st = document.querySelector('[data-statement]'); window.scrollTo(0, st.getBoundingClientRect().top + scrollY - 20); await new Promise(r => setTimeout(r, 2500)); return 1; })()`);
// Slow the transition 20x once it starts, so a screenshot loop can catch each stage.
await c.eval(`(() => { const orig = document.startViewTransition.bind(document); document.startViewTransition = (cb) => { const t = orig(cb); t.ready.then(() => setTimeout(() => document.getAnimations().forEach(a => { try { a.updatePlaybackRate(0.05); } catch (e) {} }), 0)).catch(() => {}); return t; }; return 1; })()`);
const probe = `(() => { const h = document.querySelector('[data-site-header]'); const cs = getComputedStyle(h); return { backdrop: cs.backdropFilter || cs.webkitBackdropFilter, bg: cs.backgroundColor, vt: document.documentElement.classList.contains('vt-theme'), theme: document.documentElement.dataset.theme, anims: document.getAnimations().length }; })()`;
console.log('before', JSON.stringify(await c.eval(probe)));
await c.shot(`${OUT}${tag}-0.jpg`);
const btn = await c.eval(`(() => { const r = document.querySelector('[data-theme-toggle]').getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; })()`);
await c.click(btn.x, btn.y);
const t0 = Date.now();
for (const [i, at] of [600, 2500, 5000, 8000, 11000, 14500, 18000, 24000].entries()) {
  await c.sleep(Math.max(0, at - (Date.now() - t0)));
  await c.shot(`${OUT}${tag}-${i + 1}-t${at}.jpg`);
  console.log(`t=${at}`, JSON.stringify(await c.eval(probe)));
}
await c.close();
