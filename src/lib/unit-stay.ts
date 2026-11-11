import { buildings, bentralBookingUrl, type Building } from '../data/site';
import { loadCalendar, matchingUnits, validSearch } from './availability';
import { loadQuote, type Quote } from './pricing';
export async function loadUnitStay(building: Building, unitId: string, params: URLSearchParams) {
  const arrival = params.get('arrival');
  const departure = params.get('departure');
  const adults = params.get('adults') ?? '2';
  const children = params.get('children') ?? '0';
  const search = { arrival: arrival ?? '', departure: departure ?? '', adults: Number(adults), children: Number(children) };
  const searched = arrival !== null || departure !== null;
  let available = false;
  let failed = false;
  let quote: Quote | null = null;
  if (searched && validSearch(search)) {
    try {
      available = matchingUnits(await loadCalendar(bentralBookingUrl(building)), search).some(unit => unit.id === unitId);
      if (available) quote = await loadQuote(buildings[building], unitId, search);
    } catch { failed = true; }
  }
  return { arrival, departure, adults, children, search, searched, available, failed, quote };
}
export type UnitStay = Awaited<ReturnType<typeof loadUnitStay>>;
