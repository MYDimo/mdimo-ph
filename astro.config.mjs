// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.mdimophotography.bg',
  output: 'static',
  trailingSlash: 'always',
  // CSS is ~6.5 KB gzipped: inlining it removes a render-blocking request (faster LCP).
  build: { inlineStylesheets: 'always' },
  i18n: {
    locales: ['en', 'bg'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: true },
  },
  integrations: [mdx()],
  vite: {
    plugins: [tailwindcss()],
    // These are only imported by some pages (and partly lazily). Pre-bundling them up front
    // stops the dev server from re-optimizing mid-session and serving stale copies (504s).
    optimizeDeps: { include: ['gsap', 'gsap/ScrollTrigger', 'photoswipe', 'photoswipe/lightbox'] },
  },
});
