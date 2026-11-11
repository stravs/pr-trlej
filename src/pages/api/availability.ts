import { buildings, units, childrenCapacity, type Building, type Unit } from '../../data/site';

export const prerender = false;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const UA = 'IzbaPreview/1.0';
const BENTRAL_USER = '5f6a67304e415f4d';

type Cal = { booked: string[]; tentative: string[] };

const calCache = new Map<string, { at: number; cal: Cal }>();
const priceCache = new Map<string, { at: number; price: Price | null }>();
const TTL = 90_000;
const PRICE_TTL = 10 * 60_000;

type Price = { nightly: number | null; total: string | null; surcharge: string | null };

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function parseCalendar(html: string): Cal {
  const booked: string[] = [];
  const tentative: string[] = [];
  const monthRe = /<th colspan="7">([A-Za-z]+) (\d{4})/g;
  const months = [...html.matchAll(monthRe)];
  const positions = months.map((m) => m.index!);
  for (let i = 0; i < months.length; i++) {
    const m = months[i];
    const segEnd = i + 1 < months.length ? positions[i + 1] : html.length;
    const seg = html.slice(m.index!, segEnd);
    const cellRe = /<td class="([^"]*)"><span class="([^"]*)"><label><span>(\d{1,2})<\/span><\/label><\/span><\/td>/g;
    let c: RegExpExecArray | null;
    const mi = MONTHS.indexOf(m[1]);
    if (mi === -1) continue;
    while ((c = cellRe.exec(seg))) {
      const [, , spanCls, day] = c;
      const date = `${m[2]}-${pad(mi + 1)}-${pad(Number(day))}`;
      if (spanCls.includes('unavail_temp')) tentative.push(date);
      else if (spanCls.includes('unavail')) booked.push(date);
    }
  }
  return { booked, tentative };
}

async function fetchCalendar(building: Building, unitId: string): Promise<Cal> {
  const key = `${building}:${unitId}`;
  const hit = calCache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.cal;
  const b = buildings[building];
  const url = `https://www.bentral.com/service/embed/calendar.html?id=${b.id}&uid=${unitId}&unit=${unitId}&lang=en&key=${b.key}&source=kmetije&months=12&cols=1`;
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'en' } });
  if (!res.ok) throw new Error(`calendar ${res.status}`);
  const cal = parseCalendar(await res.text());
  calCache.set(key, { at: Date.now(), cal });
  return cal;
}

function toDate(ymd: string): number {
  const [y, m, d] = ymd.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

function formatDdMmYyyy(ymd: string): string {
  const [y, m, d] = ymd.split('-');
  return `${d}/${m}/${y}`;
}

function parsePrice(json: any): Price {
  const items: string = json.items ?? '';
  const nightlyMatch = items.match(/([\d.]+) EUR &times; \d+ \(nights\)/);
  const nightly = nightlyMatch ? Number(nightlyMatch[1]) : null;
  const total = (json.calc && typeof json.calc.total === 'string' ? json.calc.total : null) ?? null;
  const surchargeMatch = items.match(/<span>([\d.]+) EUR<\/span>([^<]*urcharge[^<]*)/i);
  const surcharge = surchargeMatch ? `${surchargeMatch[1]} EUR ${surchargeMatch[2].trim()}` : null;
  return { nightly, total, surcharge };
}

async function fetchPrice(building: Building, unitId: string, arrival: string, departure: string, adults: number, children: number): Promise<Price | null> {
  const key = `${building}:${unitId}:${arrival}:${departure}:${adults}:${children}`;
  const hit = priceCache.get(key);
  if (hit && Date.now() - hit.at < PRICE_TTL) return hit.price;

  const b = buildings[building];
  const bookingUrl = `https://www.bentral.com/service/embed/booking.html?id=${b.id}&lang=en&key=${b.key}&source=kmetije&width=full`;
  try {
    const sessRes = await fetch(bookingUrl, { headers: { 'User-Agent': UA, 'Accept-Language': 'en' } });
    const setCookie = sessRes.headers.get('set-cookie') ?? '';
    const sess = setCookie.match(/PHPSESSID=([^;]+)/)?.[1] ?? '';

    const params = new URLSearchParams();
    params.set('source', 'kmetije');
    params.set('building', b.id);
    params.set('key', b.key);
    params.set('lang', 'en');
    params.set('user', BENTRAL_USER);
    params.set('unit[]', unitId);
    params.set(`unit_num[${unitId}]`, '1');
    params.set(`unit_p[${unitId}][adults][0]`, String(adults));
    params.set(`unit_p[${unitId}][children][0]`, String(children));
    params.set('title_source', 'agency');
    params.set('formated_arrival', formatDdMmYyyy(arrival));
    params.set('arrival', arrival);
    params.set('departure', departure);
    params.set('formated_departure', formatDdMmYyyy(departure));
    params.set('bank_cutoff_days', '0');
    params.set('adults', String(adults));
    params.set('children', String(children));
    params.set('children_age', children > 0 ? Array(children).fill('0').join(',') : '');
    params.set('pet', '0');
    params.set('pet_desc', '');
    params.set('policy', '0');
    params.set('name', '');
    params.set('country', '');
    params.set('email', '');
    params.set('phone_number', '');
    params.set('phone_type', 'mobile');
    params.set('note', '');
    params.set('arrival_time', '-1');
    params.set('payment', 'arrival');

    const res = await fetch(`https://www.bentral.com/service/embed/ajax/order?action=calculation&currency=EUR&lang=en`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': UA,
        'Accept-Language': 'en',
        'Referer': bookingUrl,
        'Cookie': `PHPSESSID=${sess}`,
      },
      body: params.toString(),
    });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text) return null;
    const price = parsePrice(JSON.parse(text));
    priceCache.set(key, { at: Date.now(), price });
    return price;
  } catch {
    return null;
  }
}

export async function GET({ url }: { url: URL }) {
  const arrival = url.searchParams.get('arrival') ?? '';
  const departure = url.searchParams.get('departure') ?? '';
  const adultsRaw = url.searchParams.get('adults');
  const childrenRaw = url.searchParams.get('children');
  const adults = adultsRaw ? Number(adultsRaw) : 2;
  const children = childrenRaw ? Number(childrenRaw) : 0;

  const dateRe = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRe.test(arrival) || !dateRe.test(departure)) {
    return new Response(JSON.stringify({ error: 'Provide arrival and departure as YYYY-MM-DD.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
  const a = toDate(arrival);
  const d = toDate(departure);
  if (!Number.isFinite(a) || !Number.isFinite(d) || d <= a) {
    return new Response(JSON.stringify({ error: 'Departure must be after arrival.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const totalGuests = (Number.isFinite(adults) ? adults : 0) + (Number.isFinite(children) ? children : 0);
  const results: Array<{
    slug: string;
    name: string;
    building: Building;
    buildingName: string;
    bathroom: Unit['bathroom'];
    capacity: number;
    pets: boolean;
    fits: boolean;
    available: boolean;
    bookedInRange: string[];
    nightly: number | null;
    total: string | null;
    surcharge: string | null;
    bookingUrl: string;
  }> = [];

  for (const unit of units) {
    const childCap = childrenCapacity[unit.slug] ?? 0;
    const fits = unit.capacity >= totalGuests && childCap >= children;
    let available = false;
    let bookedInRange: string[] = [];
    let price: Price | null = null;

    if (fits) {
      try {
        const cal = await fetchCalendar(unit.building, unit.bentral.unit);
        bookedInRange = [...cal.booked, ...cal.tentative].filter((date) => toDate(date) >= a && toDate(date) < d).sort();
        available = bookedInRange.length === 0;
      } catch {
        available = false;
      }
      if (available) {
        price = await fetchPrice(unit.building, unit.bentral.unit, arrival, departure, adults, children);
      }
    }

    results.push({
      slug: unit.slug,
      name: unit.name,
      building: unit.building,
      buildingName: buildings[unit.building].name,
      bathroom: unit.bathroom,
      capacity: unit.capacity,
      pets: unit.pets,
      fits,
      available,
      bookedInRange,
      nightly: price?.nightly ?? null,
      total: price?.total ?? null,
      surcharge: price?.surcharge ?? null,
      bookingUrl: `https://www.bentral.com/service/embed/booking.html?id=${buildings[unit.building].id}&lang=en&key=${buildings[unit.building].key}&source=kmetije&width=full`,
    });
  }

  return new Response(
    JSON.stringify({
      arrival,
      departure,
      nights: Math.round((d - a) / 86_400_000),
      adults: Number.isFinite(adults) ? adults : 2,
      children: Number.isFinite(children) ? children : 0,
      checked: results.length,
      results,
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
}
