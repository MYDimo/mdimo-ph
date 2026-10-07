import { launch } from './cdp.mjs';
const OUT = new URL('./shots/', import.meta.url).pathname;
import { mkdirSync } from 'node:fs';
mkdirSync(OUT, { recursive: true });

const c = await launch({ width: 1280, height: 860 });
const URL_ = process.argv[2] || 'http://localhost:4400/en/moments/silvana-and-ivan/';
await c.goto(URL_, 2500);
await c.eval(`document.documentElement.style.scrollBehavior='auto'; 1`);

// Bring a masonry thumbnail to the middle of the screen and find where it is.
const pt = await c.eval(`(async () => {
  const a = document.querySelectorAll('a[data-pswp]')[3];
  a.scrollIntoView({ block: 'center' });
  await new Promise(r => setTimeout(r, 1500));
  const r = a.getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), w: Math.round(r.width), radius: getComputedStyle(a).borderTopLeftRadius };
})()`);
console.log('thumbnail', pt);

// Slow every CSS transition/animation 10x so mid-zoom frames can be captured.
await c.send('Animation.enable');
await c.send('Animation.setPlaybackRate', { playbackRate: 0.1 });

const measure = `(() => {
  const layers = [...document.querySelectorAll('.pswp__img')].map(img => {
    const s = img.getBoundingClientRect().width / (img.offsetWidth || 1);
    const br = parseFloat(getComputedStyle(img).borderTopLeftRadius) || 0;
    return { kind: img.classList.contains('pswp__img--placeholder') ? 'placeholder' : 'photo', scale: +s.toFixed(2), localRadius: +br.toFixed(1), visibleRadius: +(br * s).toFixed(1), w: Math.round(img.getBoundingClientRect().width) };
  });
  return { open: !!document.querySelector('.pswp--open'), layers };
})()`;

await c.click(pt.x, pt.y);
for (const [label, ms] of [['a-start', 300], ['b-early', 1200], ['c-middle', 1500], ['d-late', 1500], ['e-settled', 2500]]) {
  await c.sleep(ms);
  await c.shot(`${OUT}${label}.jpg`);
  console.log(label, JSON.stringify(await c.eval(measure)));
}
await c.send('Animation.setPlaybackRate', { playbackRate: 1 });
await c.sleep(800);
await c.shot(`${OUT}f-open-normal.jpg`);
console.log('counter', await c.eval(`document.querySelector('.pswp__counter')?.textContent`));
await c.close();
