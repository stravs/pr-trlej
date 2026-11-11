import { validSearch, type Search } from './availability.ts';
export interface Quote { nightly: number; total: number; nights: number; accommodation: number }
interface Property { id: string; key: string; source: string }
export function parseQuote(data: any, search: Search): Quote {
  if (!validSearch(search) || data.error && (!Array.isArray(data.error) || data.error.length)) throw new Error('Quote unavailable');
  const amount = (value: unknown) => {
    if (typeof value !== 'string' || !/^\d+(?:\.\d{2})? EUR$/.test(value.trim())) throw new Error('Invalid quote amount');
    return Number(value.trim().replace(' EUR', ''));
  };
  const total = amount(data.calc?.total);
  // The first line is the accommodation subtotal; subsequent lines are services/taxes.
  const subtotal = typeof data.items === 'string' ? data.items.match(/^\s*<li>\s*<strong>\s*<span>([^<]+)<\/span>/)?.[1] : undefined;
  const accommodation = amount(subtotal);
  if (total <= 0 || accommodation <= 0) throw new Error('No rate for selected stay');
  const nights = (Date.parse(search.departure) - Date.parse(search.arrival)) / 86400000;
  return { total, accommodation, nights, nightly: accommodation / nights };
}
export async function loadQuote(property: Property, unit: string, search: Search): Promise<Quote | null> {
  // Children require ages, which are collected only in the provider form.
  if (!validSearch(search) || search.children > 0) return null;
  try {
    const body = new URLSearchParams({
      building: property.id, key: property.key, source: property.source, lang: 'en',
      arrival: search.arrival, departure: search.departure, adults: String(search.adults), children: '0',
      'unit[]': unit, [`unit_num[${unit}]`]: '1',
      [`unit_p[${unit}][adults][0]`]: String(search.adults), [`unit_p[${unit}][children][0]`]: '0',
      title_source: 'agency', payment: 'arrival',
    });
    const response = await fetch('https://www.bentral.com/service/embed/ajax/order?action=calculation&currency=eur&lang=en', {
      method: 'POST', body, signal: AbortSignal.timeout(8000), cache: 'no-store',
    });
    if (!response.ok) return null;
    return parseQuote(await response.json(), search);
  } catch { return null; }
}
export function money(value: number) {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(value);
}
