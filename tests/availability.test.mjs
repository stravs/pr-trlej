import test from 'node:test';
import assert from 'node:assert/strict';
import { matchingUnits, parseCalendar, validSearch } from '../src/lib/availability.ts';
const search = { arrival: '2027-05-10', departure: '2027-05-12', adults: 2, children: 1 };
const unit = { title: 'Family room', capacity: 4, adults: 3, children: 2 };
const calendar = (dates = {}, closed = {}) => ({ units: { a: unit, b: unit }, unavailable: { a: dates }, closed: { a: closed } });
test('returns every matching unit and keeps adult/child limits separate', () => {
  assert.equal(matchingUnits(calendar(), search).length, 2);
  assert.equal(matchingUnits(calendar(), { ...search, adults: 4, children: 0 }).length, 0);
  assert.equal(matchingUnits(calendar(), { ...search, adults: 1, children: 3 }).length, 0);
  assert.equal(matchingUnits(calendar(), { ...search, adults: 3, children: 2 }).length, 0);
});
test('excludes occupied stays, allows checkout at next booking and arrival at previous checkout', () => {
  for (const dates of [{ '2027-05-11': 'unavail' }, { '2027-05-10': 'unavail_start' }, { '2027-05-12': 'unavail' }]) {
    assert.deepEqual(matchingUnits(calendar(dates), search).map(unit => unit.id), ['b']);
  }
  for (const dates of [{ '2027-05-12': 'unavail_start' }, { '2027-05-10': 'unavail_end' }]) {
    assert.equal(matchingUnits(calendar(dates), search).length, 2);
  }
});
test('honours closed arrival and departure restrictions', () => {
  for (const closed of [{ '2027-05-10': ['coa'] }, { '2027-05-12': ['cod'] }]) {
    assert.equal(matchingUnits(calendar({}, closed), search).length, 1);
  }
});
test('rejects invalid dates and guest counts', () => {
  for (const override of [{ arrival: '2027-02-30' }, { departure: search.arrival }, { adults: 0 }, { children: -1 }, { adults: 2.5 }]) {
    assert.equal(validSearch({ ...search, ...override }), false);
    assert.deepEqual(matchingUnits(calendar(), { ...search, ...override }), []);
  }
});
test('parses provider JSON and fails closed on missing or malformed data', () => {
  const html = `var unit_data = ${JSON.stringify({ a: unit })};var unavailDates = {};var closedDates = [];`;
  assert.equal(parseCalendar(html).units.a.title, 'Family room');
  assert.throws(() => parseCalendar('blocked'));
  assert.throws(() => parseCalendar(html.replace('var unavailDates = {};', '')));
  assert.throws(() => parseCalendar(html.replace(JSON.stringify({ a: unit }), 'runScript()')));
});
