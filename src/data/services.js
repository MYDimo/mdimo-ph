// Prices and durations shared by both locales. All text lives in src/i18n/*.json.
// Amounts are in EUR.

export const weddingPackages = [
  { id: 'essential', price: 850, upToHours: 6, overtimePerHour: 100 },
  { id: 'signature', price: 1450, upToHours: 10, overtimePerHour: 120, recommended: true },
];

// `moment` is a Moments slug whose cover illustrates the service.
export const moreServices = [
  { id: 'christening', price: 180, hours: [1.5, 2], moment: 'viki-christening' },
  { id: 'couple', price: 160, hours: [1, 1.5], moment: 'radina-and-martin' },
  { id: 'events', pricePerHour: 100, minHours: 2, moment: 'mtb-european-dh' },
];

/** Values of the inquiry form's service <select>; keys into inquiry.serviceOptions. */
export const inquiryServices = ['wedding', 'christening', 'couple', 'events', 'other'];

export const travelRatePerKm = 0.25;
