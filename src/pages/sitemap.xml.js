// sitemap.xml: every page in both languages, each listing its other-language twin
// (xhtml:link alternates), so search engines pair EN and BG versions.
import { execFileSync } from 'node:child_process';
import { locales, localizedPath, routes } from '../i18n/index.js';
import { getMoments } from '../data/moments.js';

// <lastmod> = date of the last git commit touching the page's files (undefined if git history isn't available).
function lastCommit(...files) {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...files], { encoding: 'utf8' }).trim();
    return out || undefined;
  } catch {
    return undefined;
  }
}
const copy = ['src/i18n/en.json', 'src/i18n/bg.json'];
const pageFile = { '': 'index', moments: 'moments/index' };

export async function GET({ site }) {
  const paths = Object.values(routes).map((r) => ({
    path: (l) => localizedPath(l, r),
    lastmod: lastCommit(`src/pages/[locale]/${pageFile[r] ?? r}.astro`, ...copy),
  }));
  const slugs = (await getMoments('en')).map((m) => m.slug);
  for (const slug of slugs) {
    paths.push({
      path: (l) => `${localizedPath(l, routes.moments)}${slug}/`,
      lastmod: lastCommit(`src/content/moments/en/${slug}.mdx`, `src/content/moments/bg/${slug}.mdx`, `src/assets/moments/${slug}`),
    });
  }

  const url = (p) => new URL(p, site).href;
  const entries = paths.flatMap(({ path: pathFor, lastmod }) =>
    locales.map(
      (l) => `  <url>
    <loc>${url(pathFor(l))}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}
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
