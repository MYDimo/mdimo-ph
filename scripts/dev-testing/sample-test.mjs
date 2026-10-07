import { readFileSync } from 'node:fs';
const which = process.argv[2];             // 'firefox' | 'chrome'
const url = process.argv[3] || 'http://localhost:4400/en/';
const sampler = readFileSync(new URL('./sampler.js', import.meta.url), 'utf8');
let c;
if (which === 'firefox') { const { launchFx } = await import('./fx.mjs'); c = await launchFx({ width: 1440, height: 800 }); }
else { const { launch } = await import('./cdp.mjs'); c = await launch({ width: 1440, height: 800 }); }
await c.goto(url, 3500);
await c.eval(`(async () => { document.documentElement.style.scrollBehavior='auto'; document.documentElement.dataset.theme='night'; const st = document.querySelector('[data-statement]'); window.scrollTo(0, st.getBoundingClientRect().top + scrollY - 20); await new Promise(r => setTimeout(r, 2500)); return 1; })()`);
await c.eval(sampler);
await c.sleep(300);
const btn = await c.eval(`(() => { const r = document.querySelector('[data-theme-toggle]').getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; })()`);
await c.click(btn.x, btn.y);
await c.sleep(2600);
const log = await c.eval(`(clearInterval(window.__iv), window.__log)`);
let prev = '';
console.log(`--- ${which} (${url})`);
for (const e of log) {
  const key = `${e.blur}|${e.alpha}|vt=${e.vt}|settle=${e.settle}|${e.theme}`;
  if (key !== prev) console.log(`${String(e.t).padStart(5)}ms  blur=${e.blur.padEnd(5)} bg-alpha=${e.alpha}  vt-theme=${e.vt}  vt-settle=${e.settle}  theme=${e.theme}`);
  prev = key;
}
await c.close();
