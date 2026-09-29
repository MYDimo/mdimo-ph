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
  lightbox.init();
}
