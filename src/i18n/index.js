import en from './en.json';
import bg from './bg.json';

export const locales = ['en', 'bg'];
export const defaultLocale = 'en';
const dictionaries = { en, bg };

// Intl locale per site locale (dates, numbers, prices).
const intlLocale = { en: 'en-GB', bg: 'bg-BG' };

/** Every page route, shared by both locales. '' is home. */
export const routes = { home: '', moments: 'moments', services: 'services', about: 'about', contact: 'contact' };

/**
 * Look up a string (or object/array) by dotted key, e.g. t('bg', 'nav.home').
 * `{name}` placeholders are filled from `vars`. A missing key fails the build.
 */
export function t(locale, key, vars) {
  const value = key.split('.').reduce((node, part) => node?.[part], dictionaries[locale]);
  if (value === undefined) throw new Error(`[i18n] Missing "${key}" for locale "${locale}"`);
  if (typeof value !== 'string' || !vars) return value;
  return value.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? `{${name}}`));
}

/** Curried helper for components: const tr = useT(locale); tr('nav.home'). */
export const useT = (locale) => (key, vars) => t(locale, key, vars);

/** '/bg/services/' from ('bg', 'services'). */
export function localizedPath(locale, route = '') {
  return route ? `/${locale}/${route}/` : `/${locale}/`;
}

/** Same page in another locale: swaps the leading locale segment. */
export function switchLocalePath(pathname, target) {
  const rest = pathname.replace(/^\/(en|bg)(?=\/|$)/, '');
  return `/${target}${rest || '/'}`;
}

/** Prices in EUR without decimals: en '€1,450', bg '1450 €'. */
export function formatPrice(locale, amount, { decimals = 0 } = {}) {
  return new Intl.NumberFormat(intlLocale[locale], {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/** '1.5–2' / '1,5–2' style number ranges. */
export function formatRange(locale, from, to) {
  const nf = new Intl.NumberFormat(intlLocale[locale], { maximumFractionDigits: 1 });
  return to ? `${nf.format(from)}–${nf.format(to)}` : nf.format(from);
}

export function formatDate(locale, date, options = { day: 'numeric', month: 'long', year: 'numeric' }) {
  return new Intl.DateTimeFormat(intlLocale[locale], options).format(date);
}

// Build-time guard (we use plain JS, so this replaces type checking):
// both dictionaries must have exactly the same keys.
function keyPaths(node, prefix = '') {
  if (node === null || typeof node !== 'object') return [prefix];
  return Object.entries(node).flatMap(([k, v]) => keyPaths(v, prefix ? `${prefix}.${k}` : k));
}
const enKeys = new Set(keyPaths(en));
const bgKeys = new Set(keyPaths(bg));
const missing = [
  ...[...enKeys].filter((k) => !bgKeys.has(k)).map((k) => `bg is missing ${k}`),
  ...[...bgKeys].filter((k) => !enKeys.has(k)).map((k) => `en is missing ${k}`),
];
if (missing.length) throw new Error(`[i18n] Dictionaries out of sync:\n  ${missing.join('\n  ')}`);
