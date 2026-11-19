// Calendar dates are plain YYYY-MM-DD strings. Format them in UTC so the day never shifts.
const dayFormat = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
const shortDayFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

function utcDate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return match ? new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))) : null;
}

export function nightsBetween(arrival: string, departure: string): number {
  const start = utcDate(arrival);
  const end = utcDate(departure);
  return start && end ? Math.round((end.getTime() - start.getTime()) / 86_400_000) : 0;
}

export function formatStay(arrival: string, departure: string, short = false): string {
  const start = utcDate(arrival);
  const end = utcDate(departure);
  if (!start || !end) return '';
  const nights = nightsBetween(arrival, departure);
  const format = short ? shortDayFormat : dayFormat;
  return `${format.format(start)} – ${format.format(end)} · ${nights} ${nights === 1 ? 'night' : 'nights'}`;
}

export function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}
