// Clicks a Moments filter and samples the visible cards every frame: reports the last clip-path
// changes after the glide (should be none) and the card positions' jitter.
const which = process.argv[2] || 'chrome';
const c = which === 'firefox' ? await (await import('./fx.mjs')).launchFx({ width: 1280, height: 900 }) : await (await import('./cdp.mjs')).launch({ width: 1280, height: 900 });
await c.goto('http://localhost:4400/en/moments/', 2500);
for (const f of ['weddings', 'all', 'sports', 'all']) {
  await c.eval(`(() => { window.__log = []; window.__t0 = performance.now();
    const sample = () => { const cards = [...document.querySelectorAll('[data-moments] > article:not([hidden])')].slice(0, 4);
      window.__log.push({ t: Math.round(performance.now() - window.__t0), clip: cards.map(a => getComputedStyle(a.querySelector('[data-reveal]')).clipPath.slice(0, 22)), x: cards.map(a => Math.round(a.getBoundingClientRect().top)) });
      if (performance.now() - window.__t0 < 2600) requestAnimationFrame(sample); };
    document.querySelector('[data-filter="${f}"]').click(); requestAnimationFrame(sample); return 1; })()`);
  await c.sleep(2900);
  const log = await c.eval('window.__log');
  const clips = log.map((l) => l.clip.join('|'));
  let last = 0; clips.forEach((v, i) => { if (v !== clips[i - 1]) last = log[i].t; });
  const ch=[]; log.forEach((l,i)=>{ if(i&&l.clip.join('|')!==log[i-1].clip.join('|')) ch.push(l.t+'ms:'+l.clip.map((v,k)=>v===log[i-1].clip[k]?'.':'~').join('')); });
  console.log(ch.slice(-4).join(' '));
  console.log(`${f}: frames=${log.length} last clip-path change at ${last}ms; final clip=${clips.at(-1)}`);
}
await c.close();
