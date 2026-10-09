// llms.txt: a plain-text summary of the site for AI assistants (llmstxt.org format).
// Everything is built from the i18n files and src/data, so it never drifts from the site.
import { locales, useT, localizedPath, routes } from '../i18n/index.js';
import { getMoments } from '../data/moments.js';
import { fillFacts } from '../data/facts.js';
import { contact } from '../data/contact.js';

export async function GET({ site }) {
  const url = (p) => new URL(p, site).href;
  const en = useT('en');
  const faq = (l) => useT(l)('services.faq.items');
  const lines = [`# ${en('site.name')}`, '', `> ${en('seo.home', { price: fillFacts('en', '{essential}') })}`, ''];

  lines.push('Mihaylo Dimo (Михайло Димо) is a photographer based in Sofia, Bulgaria. The site is in English and Bulgarian; prices are public and in EUR.', '');

  lines.push('## Facts', '');
  for (const l of locales) {
    const item = faq(l)[0];
    lines.push(`- (${l}) ${item.q} ${fillFacts(l, item.a)}`);
  }
  lines.push(`- Contact: ${contact.email}, ${contact.phoneDisplay}, Instagram ${contact.instagramUrl}`, '');

  for (const l of locales) {
    const tr = useT(l);
    lines.push(`## Pages (${l})`, '');
    for (const [name, route] of Object.entries(routes)) {
      const label = name === 'home' ? tr('nav.home') : tr(`nav.${name}`);
      const desc = { home: tr('site.description'), moments: tr('seo.moments'), services: tr('seo.services'), about: tr('seo.about'), contact: tr('seo.contact') }[name];
      lines.push(`- [${label}](${url(localizedPath(l, route))}): ${desc}`);
    }
    lines.push('');
  }

  lines.push('## Moments (recent work)', '');
  for (const m of await getMoments('en')) {
    const { title, location, date } = m.entry.data;
    lines.push(`- [${title}](${url(`${localizedPath('en', routes.moments)}${m.slug}/`)}): ${date.getFullYear()}${location ? `, ${location}` : ''}`);
  }
  lines.push('');

  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
