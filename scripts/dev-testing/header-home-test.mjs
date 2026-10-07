import { launch } from './cdp.mjs';
import { mkdirSync } from 'node:fs';
const OUT = new URL('./shots/', import.meta.url).pathname; mkdirSync(OUT, { recursive: true });
const tag = process.argv[2] || 'home';
const from = process.argv[3] || 'night';           // theme we start in
const c = await launch({ width: 1440, height: 800 });
await c.goto('http://localhost:4400/en/', 3000);
await c.eval(`document.documentElement.style.scrollBehavior='auto'; document.documentElement.dataset.theme='${from}'; 1`);
// Put the big statement text right under the header, like in the screenshot.
await c.eval(`(async () => { const st = document.querySelector('[data-statement]'); window.scrollTo(0, st.getBoundingClientRect().top + scrollY - 20); await new Promise(r => setTimeout(r, 2500)); })()`);
await c.shot(`${OUT}${tag}-0.jpg`);
await c.send('Animation.enable');
await c.send('Animation.setPlaybackRate', { playbackRate: 0.05 });
const btn = await c.eval(`(() => { const r = document.querySelector('[data-theme-toggle]').getBoundingClientRect(); return { x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2) }; })()`);
await c.click(btn.x, btn.y);
const t0 = Date.now();
for (const [i, at] of [400, 2500, 5000, 9000, 14000, 19000, 24000].entries()) {
  await c.sleep(Math.max(0, at - (Date.now() - t0)));
  await c.shot(`${OUT}${tag}-${i + 1}-t${at}.jpg`);
  console.log(`t=${at}`, await c.eval(`(() => { const h = document.querySelector('[data-site-header]'); const cs = getComputedStyle(h); return 'backdrop=' + cs.backdropFilter + ' | vt=' + document.documentElement.classList.contains('vt-theme'); })()`));
}
await c.close();
