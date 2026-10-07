import { launch } from './cdp.mjs';
import { mkdirSync, writeFileSync, rmSync, readdirSync } from 'node:fs';
const OUT = new URL('./shots/', import.meta.url).pathname; mkdirSync(OUT, { recursive: true });
for (const f of readdirSync(OUT)) if (f.startsWith('cast-')) rmSync(OUT + f);
const from = process.argv[2] || 'night';
const c = await launch({ width: 1440, height: 800 });
await c.goto(process.env.SITE || 'http://localhost:4400/en/', 3500);
await c.eval(`document.documentElement.style.scrollBehavior='auto'; document.documentElement.dataset.theme='${from}'; 1`);
await c.eval(`(async () => { const st = document.querySelector('[data-statement]'); window.scrollTo(0, st.getBoundingClientRect().top + scrollY - 20); await new Promise(r => setTimeout(r, 2500)); })()`);
const btn = await c.eval(`(() => { const r = document.querySelector('[data-theme-toggle]').getBoundingClientRect(); return { x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2) }; })()`);

const frames = [];
c.on(async (msg) => {
  if (msg.method === 'Page.screencastFrame') {
    frames.push({ t: msg.params.metadata.timestamp, data: msg.params.data });
    c.send('Page.screencastFrameAck', { sessionId: msg.params.sessionId }).catch(() => {});
  }
});
await c.send('Page.startScreencast', { format: 'jpeg', quality: 60, everyNthFrame: 1 });
await c.sleep(300);
const clickAt = Date.now() / 1000;
await c.click(btn.x, btn.y);
await c.sleep(2200);
await c.send('Page.stopScreencast');
frames.sort((a, b) => a.t - b.t);
const t0 = frames.find((f) => f.t >= clickAt - 0.05)?.t ?? frames[0].t;
const kept = frames.filter((f) => f.t >= t0 - 0.2);
kept.forEach((f, i) => writeFileSync(`${OUT}cast-${String(i).padStart(3, '0')}-${Math.round((f.t - clickAt) * 1000)}ms.jpg`, Buffer.from(f.data, 'base64')));
console.log('frames captured:', kept.length);
await c.close();
