(() => {
  window.__log = [];
  const t0 = performance.now();
  const h = document.querySelector('[data-site-header]');
  const alpha = (c) => { const m = /\/\s*([\d.]+)\)/.exec(c); return m ? +m[1] : 1; };
  window.__iv = setInterval(() => {
    const cs = getComputedStyle(h);
    const bf = cs.backdropFilter || cs.webkitBackdropFilter || 'none';
    window.__log.push({ t: Math.round(performance.now() - t0), blur: bf.startsWith('blur') ? 'blur' : bf, alpha: alpha(cs.backgroundColor), vt: document.documentElement.classList.contains('vt-theme'), settle: document.documentElement.classList.contains('vt-settle'), theme: document.documentElement.dataset.theme });
  }, 40);
  return 1;
})()
