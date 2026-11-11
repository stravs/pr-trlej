// Public Bentral widget data. Parse JSON only; never execute provider scripts.
export interface Search { arrival: string; departure: string; adults: number; children: number }
interface ProviderUnit { title: string; capacity: number; adults: number; children: number; childrenMinAge?: number | null }
export interface Calendar {
  units: Record<string, ProviderUnit>;
  unavailable: Record<string, Record<string, string>>;
  closed: Record<string, Record<string, string[]>>;
}
export function validSearch(search: Search) {
  const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  return validDate(search.arrival) && validDate(search.departure) && search.departure > search.arrival
    && Number.isInteger(search.adults) && search.adults >= 1 && search.adults <= 7
    && Number.isInteger(search.children) && search.children >= 0 && search.children <= 6;
}
export function parseCalendar(html: string): Calendar {
  function read(name: string) {
    const value = html.match(new RegExp(`var\\s+${name}\\s*=\\s*([^;]+);`))?.[1];
    if (!value) throw new Error(`Missing ${name}`);
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object') throw new Error(`Invalid ${name}`);
    return parsed;
  }
  const units = read('unit_data');
  if (!Object.keys(units).length || Object.values(units).some((unit: any) => typeof unit.title !== 'string' || !Number.isFinite(Number(unit.capacity)) || !Number.isFinite(Number(unit.adults)) || !Number.isFinite(Number(unit.children)))) throw new Error('Invalid unit data');
  return { units, unavailable: read('unavailDates'), closed: read('closedDates') };
}
export function matchingUnits(calendar: Calendar, search: Search) {
  if (!validSearch(search)) return [];
  return Object.entries(calendar.units).filter(([id, unit]) => {
    if (search.adults + search.children > Number(unit.capacity) || search.adults > Number(unit.adults) || search.children > Number(unit.children)) return false;
    const restrictions = calendar.closed[id] ?? {};
    if (restrictions[search.arrival]?.includes('coa') || restrictions[search.departure]?.includes('cod')) return false;
    const dates = calendar.unavailable[id] ?? {};
    // Provider marks occupied nights with unavail/unavail_start. unavail_end permits arrival.
    return !Object.entries(dates).some(([date, status]) =>
      (status === 'unavail' && date >= search.arrival && date <= search.departure)
      || (status === 'unavail_start' && date >= search.arrival && date < search.departure));
  }).map(([id, unit]) => ({ id, ...unit }));
}
export async function loadCalendar(url: string): Promise<Calendar> {
  const response = await fetch(url, { signal: AbortSignal.timeout(8000), cache: 'no-store' });
  if (!response.ok) throw new Error(`Calendar HTTP ${response.status}`);
  return parseCalendar(await response.text());
}
