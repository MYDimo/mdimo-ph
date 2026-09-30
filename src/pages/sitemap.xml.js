// sitemap.xml: every page in both languages, each listing its other-language twin
// (xhtml:link alternates), so search engines pair EN and BG versions.
import { locales, localizedPath, routes } from '../i18n/index.js';
import { getMoments } from '../data/moments.js';

export async function GET({ site }) {
  const paths = [...Object.values(routes).map((r) => (l) => localizedPath(l, r))];
  const slugs = (await getMoments('en')).map((m) => m.slug);
  for (const slug of slugs) paths.push((l) => `${localizedPath(l, routes.moments)}${slug}/`);

  const url = (p) => new URL(p, site).href;
  const entries = paths.flatMap((pathFor) =>
    locales.map(
      (l) => `  <url>
    <loc>${url(pathFor(l))}</loc>
${locales.map((alt) => `    <xhtml:link rel="alternate" hreflang="${alt}" href="${url(pathFor(alt))}"/>`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${url(pathFor('en'))}"/>
  </url>`,
    ),
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
