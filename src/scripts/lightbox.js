/*
 * PhotoSwipe lightbox for Moment galleries. The small lightbox core loads with
 * the page; the viewer itself (and its gestures/zoom) is fetched on first open.
 */
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';

export function initLightbox(root) {
  const d = root.dataset;
  const lightbox = new PhotoSwipeLightbox({
    gallery: root,
    children: 'a[data-pswp]',
    pswpModule: () => import('photoswipe'),
    bgOpacity: 1,
    padding: { top: 24, bottom: 24, left: 16, right: 16 },
    closeTitle: d.lbClose,
    zoomTitle: d.lbZoom,
    arrowPrevTitle: d.lbPrev,
    arrowNextTitle: d.lbNext,
    errorMsg: d.lbError,
    showHideAnimationType: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'none' : 'zoom',
  });
  keepCornersConstant(lightbox);
  lightbox.init();
}

/*
 * Rounded corners that stay the same size through the open/close zoom.
 *
 * PhotoSwipe scales the photo with CSS transforms (the whole slide container, plus
 * the stand-in thumbnail's own scale), and a border-radius is scaled by those
 * transforms too, so a fixed radius shrinks and grows mid-zoom. Instead, for each
 * photo layer we measure how much it is really scaled on screen
 * (bounding box ÷ layout size) and set its radius to RADIUS ÷ scale, so the visible
 * corner is always exactly RADIUS: the thumbnail's own radius, read from the
 * link that was clicked. This runs every frame during the zoom animations, and
 * whenever a photo loads, the slide changes or the visitor zooms.
 *
 * (Don't clip the zoom container with overflow:hidden instead: it has no size of
 * its own, so that hides the photo completely.)
 */
const FALLBACK_RADIUS = 20; // px; the gallery tiles' radius

function keepCornersConstant(lightbox) {
  let raf = 0;

  const radiusFor = (slide) => {
    const thumb = slide?.data?.element;
    const r = thumb ? parseFloat(getComputedStyle(thumb).borderTopLeftRadius) : NaN;
    return Number.isFinite(r) && r > 0 ? r : FALLBACK_RADIUS;
  };

  const apply = () => {
    const slide = lightbox.pswp?.currSlide;
    const layers = slide?.holderElement?.querySelectorAll('.pswp__img');
    if (!layers) return;
    const radius = radiusFor(slide);
    for (const img of layers) {
      const layout = img.offsetWidth;
      if (!layout) continue;
      const scale = img.getBoundingClientRect().width / layout;
      img.style.borderRadius = `${(radius / (scale || 1)).toFixed(2)}px`;
    }
  };

  const loop = () => {
    apply();
    raf = requestAnimationFrame(loop);
  };
  const stop = () => {
    cancelAnimationFrame(raf);
    apply();
  };

  lightbox.on('openingAnimationStart', () => {
    cancelAnimationFrame(raf);
    loop();
  });
  lightbox.on('openingAnimationEnd', stop);
  lightbox.on('closingAnimationStart', () => {
    cancelAnimationFrame(raf);
    loop();
  });
  lightbox.on('close', () => setTimeout(() => cancelAnimationFrame(raf), 1000));
  for (const name of ['afterInit', 'change', 'loadComplete', 'zoomPanUpdate', 'resize']) lightbox.on(name, apply);
}
