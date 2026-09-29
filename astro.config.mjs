// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://example.com', // TODO: real domain at deploy phase
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
    // GSAP is imported lazily; pre-bundle it so the dev server never serves a stale copy.
    optimizeDeps: { include: ['gsap', 'gsap/ScrollTrigger'] },
  },
});
