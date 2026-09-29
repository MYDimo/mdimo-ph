// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://example.com', // TODO: real domain at deploy phase
  output: 'static',
  trailingSlash: 'always',
  i18n: {
    locales: ['en', 'bg'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: true },
  },
  integrations: [mdx()],
  vite: { plugins: [tailwindcss()] },
});
