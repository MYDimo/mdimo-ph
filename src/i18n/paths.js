import { locales } from './index.js';

/** getStaticPaths for pages that exist once per locale under src/pages/[locale]/. */
export const localeStaticPaths = () => locales.map((locale) => ({ params: { locale } }));
