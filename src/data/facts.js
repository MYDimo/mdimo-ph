// Live numbers for copy that quotes prices (FAQ answers, llms.txt, meta descriptions).
import { formatPrice } from '../i18n/index.js';
import { weddingPackages, moreServices, travelRatePerKm } from './services.js';

const [essential, signature] = weddingPackages;
const more = Object.fromEntries(moreServices.map((s) => [s.id, s]));

/** Placeholder values for `{name}` tokens in i18n strings. */
export function factVars(locale) {
  const price = (n, o) => formatPrice(locale, n, o);
  return {
    rate: price(travelRatePerKm, { decimals: 2 }),
    overtime: price(essential.overtimePerHour),
    essential: price(essential.price),
    essentialHours: essential.upToHours,
    signature: price(signature.price),
    signatureHours: signature.upToHours,
    christening: price(more.christening.price),
    couple: price(more.couple.price),
    events: price(more.events.pricePerHour),
  };
}

/** Fill `{name}` tokens from factVars; unknown tokens stay visible. */
export function fillFacts(locale, text) {
  const vars = factVars(locale);
  return text.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}
