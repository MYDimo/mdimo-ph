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
 * The open/close "zoom" animation scales the photo from thumbnail size to full
 * size. Scaling shrinks rounded corners with it, so on their own the corners
 * would look tiny at the start and grow mid-flight. To keep them visually equal
 * to the thumbnail's radius, start with radius ÷ scale and ease back to the
 * normal radius in step with the zoom (and the reverse when closing).
 */
const RADIUS = 20; // px; matches the gallery tiles (rounded-lg) and .pswp__img
const DURATION = 333; // PhotoSwipe's default show/hide animation
const EASING = 'cubic-bezier(0.4, 0, 0.22, 1)'; // PhotoSwipe's default easing

function keepCornersDuringZoom(lightbox) {
  const images = (slide) => slide?.holderElement?.querySelectorAll('.pswp__img') ?? [];
  // Thumbnail width ÷ the photo's on-screen width. When opening, the current zoom
  // isn't applied yet, so use the level the photo will settle at (`initial`).
  const thumbScale = (slide, opening = false) => {
    const thumb = slide?.data?.element;
    const zoom = opening ? slide?.zoomLevels?.initial : slide?.currZoomLevel;
    const shown = slide && zoom ? slide.width * zoom : 0;
    return thumb && shown ? Math.min(1, thumb.getBoundingClientRect().width / shown) : 1;
  };
  const setRadius = (slide, px, animate) => {
    for (const img of images(slide)) {
      img.style.transition = animate ? `border-radius ${DURATION}ms ${EASING}` : 'none';
      img.style.borderRadius = `${px}px`;
    }
  };

  lightbox.on('openingAnimationStart', () => {
    const slide = lightbox.pswp.currSlide;
    setRadius(slide, RADIUS / thumbScale(slide, true), false);
    requestAnimationFrame(() => setRadius(slide, RADIUS, true));
  });
  lightbox.on('closingAnimationStart', () => {
    const slide = lightbox.pswp.currSlide;
    setRadius(slide, RADIUS / thumbScale(slide), true);
  });
}
