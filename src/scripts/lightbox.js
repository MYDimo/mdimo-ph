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
  keepCornersDuringZoom(lightbox);
  lightbox.init();
}

/*
 * Rounded corners that stay constant through the open/close zoom.
 *
 * During the zoom PhotoSwipe shows two layers inside one container (the zoom
 * wrap): a low-res placeholder on a grey box and, once loaded, the full photo.
 * Rounding only the images left the grey box square and the late-arriving photo
 * un-compensated. So the container itself is rounded and clips both layers.
 *
 * The container is scaled during the zoom (thumbnail size → full size), and a
 * scaled radius shrinks with it. To keep the corners visually equal to the
 * thumbnail's, the radius starts at RADIUS ÷ scale and eases back to RADIUS in
 * step with the zoom (reverse on close). When the visitor zooms in, the radius
 * is divided by the zoom factor so corners don't balloon.
 */
const RADIUS = 20; // px; matches the gallery tiles (rounded-lg)
const DURATION = 333; // PhotoSwipe's default show/hide animation
const EASING = 'cubic-bezier(0.4, 0, 0.22, 1)'; // PhotoSwipe's default easing

function keepCornersDuringZoom(lightbox) {
  let animating = false;
  // Thumbnail width ÷ the photo's on-screen width. When opening, the current zoom
  // isn't applied yet, so use the level the photo will settle at (`initial`).
  const thumbScale = (slide, opening = false) => {
    const thumb = slide?.data?.element;
    const zoom = opening ? slide?.zoomLevels?.initial : slide?.currZoomLevel;
    const shown = slide && zoom ? slide.width * zoom : 0;
    return thumb && shown ? Math.min(1, thumb.getBoundingClientRect().width / shown) : 1;
  };
  const setRadius = (slide, px, animate) => {
    const wrap = slide?.container;
    if (!wrap) return;
    wrap.style.transition = animate ? `border-radius ${DURATION}ms ${EASING}` : 'none';
    wrap.style.borderRadius = `${px}px`;
  };

  lightbox.on('openingAnimationStart', () => {
    animating = true;
    const slide = lightbox.pswp.currSlide;
    setRadius(slide, RADIUS / thumbScale(slide, true), false);
    requestAnimationFrame(() => requestAnimationFrame(() => setRadius(slide, RADIUS, true)));
  });
  lightbox.on('openingAnimationEnd', () => (animating = false));
  lightbox.on('closingAnimationStart', () => {
    animating = true;
    const slide = lightbox.pswp.currSlide;
    setRadius(slide, RADIUS / thumbScale(slide), true);
  });
  // Keep corners the same size while zooming/panning and on other slides.
  lightbox.on('zoomPanUpdate', ({ slide }) => {
    if (animating || !slide?.container) return;
    const scale = slide.currZoomLevel / (slide.currentResolution || slide.zoomLevels.initial || 1);
    setRadius(slide, RADIUS / (scale || 1), false);
  });
}
