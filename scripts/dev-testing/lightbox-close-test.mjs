import { launch } from './cdp.mjs';
const c = await launch({ width: 1280, height: 860 });
await c.goto('http://localhost:4400/en/moments/maria-and-kian/', 2500);
await c.eval(`document.documentElement.style.scrollBehavior='auto'; 1`);
const measure = `(() => [...document.querySelectorAll('.pswp__img')].map(img => { const s = img.getBoundingClientRect().width / (img.offsetWidth||1); const br = parseFloat(getComputedStyle(img).borderTopLeftRadius)||0; return (img.classList.contains('pswp__img--placeholder')?'placeholder':'photo') + ' visibleRadius=' + (br*s).toFixed(1) + ' width=' + Math.round(img.getBoundingClientRect().width); }))()`;
for (const [name, sel] of [['masonry tile', '.columns-2 a[data-pswp]']]) {
  const pt = await c.eval(`(async () => { const a = document.querySelector(${JSON.stringify(sel)}) || document.querySelectorAll('a[data-pswp]')[3]; a.scrollIntoView({block:'center'}); await new Promise(r=>setTimeout(r,1200)); const r=a.getBoundingClientRect(); return {x:Math.round(r.left+r.width/2), y:Math.round(r.top+r.height/2), radius:getComputedStyle(a).borderTopLeftRadius}; })()`);
  console.log(`\n== ${name}: thumbnail radius ${pt.radius}`);
  await c.click(pt.x, pt.y); await c.sleep(1500);
  console.log('open  ', JSON.stringify(await c.eval(measure)));
    await c.click(1249, 30);                       // the close (X) button
  for (const ms of [60, 80, 80, 100]) { await c.sleep(ms); console.log(`close +${ms}ms`, JSON.stringify(await c.eval(measure))); }
  await c.shot(new URL(`./shots/close-${name.replace(' ','-')}.jpg`, import.meta.url).pathname);
  await c.send('Animation.setPlaybackRate', { playbackRate: 1 }); await c.sleep(1500);
  console.log('closed', await c.eval(`!document.querySelector('.pswp--open')`));
  await c.eval(`window.scrollTo(0,0)`); await c.sleep(300);
}
await c.close();
