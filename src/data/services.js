// Prices and durations shared by both locales. All text lives in src/i18n/*.json.
// Amounts are in EUR.

export const weddingPackages = [
  { id: 'essential', price: 850, upToHours: 6, overtimePerHour: 100 },
  { id: 'signature', price: 1450, upToHours: 10, overtimePerHour: 120, recommended: true },
];

export const moreServices = [
  { id: 'christening', price: 180, hours: [1.5, 2] },
  { id: 'couple', price: 160, hours: [1, 1.5] },
  { id: 'events', pricePerHour: 100, minHours: 2 },
];

export const travelRatePerKm = 0.25;
