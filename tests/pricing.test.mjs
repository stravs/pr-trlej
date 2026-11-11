import test from 'node:test';
import assert from 'node:assert/strict';
import { parseQuote, loadQuote } from '../src/lib/pricing.ts';
const search = { arrival: '2027-06-01', departure: '2027-06-04', adults: 2, children: 0 };
const response = { items: '<li><strong><span>300.00 EUR</span>Room</strong></li>', calc: { total: '317.00 EUR' } };
test('keeps accommodation nightly rate separate from total including mandatory charges', () => {
  assert.deepEqual(parseQuote(response, search), { nightly: 100, total: 317, accommodation: 300, nights: 3 });
});
test('uses average nightly rate for a stay with varying rates', () => {
  const quote = parseQuote({ ...response, items: '<li><strong><span>301.00 EUR</span>Room</strong></li>' }, search);
  assert.equal(quote.nightly, 301 / 3);
  assert.equal(quote.total, 317);
});
test('rejects errors, missing rates, invalid dates, and unexpected currencies', () => {
  for (const data of [{ ...response, error: ['Minimum stay'] }, { calc: { total: '317.00 EUR' } }, { ...response, calc: { total: '0.00 EUR' } }, { ...response, calc: { total: '317.00 USD' } }]) assert.throws(() => parseQuote(data, search));
  assert.throws(() => parseQuote(response, { ...search, departure: search.arrival }));
});
test('does not request quotes for children with unknown ages or invalid selections', async () => {
  assert.equal(await loadQuote({}, '', { ...search, children: 1 }), null);
  assert.equal(await loadQuote({}, '', { ...search, adults: 0 }), null);
});
test('quote requests preserve dates, guests and selected unit; failures never become prices', async (t) => {
  const property = { id: 'property', key: 'public-key', source: 'web' };
  const fetchMock = t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(new URL(url).searchParams.get('action'), 'calculation');
    assert.equal(options.body.get('arrival'), search.arrival);
    assert.equal(options.body.get('departure'), search.departure);
    assert.equal(options.body.get('unit[]'), 'unit');
    assert.equal(options.body.get('unit_p[unit][adults][0]'), '2');
    assert.equal(options.cache, 'no-store');
    return { ok: true, json: async () => response };
  });
  assert.equal((await loadQuote(property, 'unit', search)).total, 317);
  fetchMock.mock.mockImplementation(async () => ({ ok: false }));
  assert.equal(await loadQuote(property, 'unit', search), null);
  fetchMock.mock.mockImplementation(async () => { throw new Error('Timeout'); });
  assert.equal(await loadQuote(property, 'unit', search), null);
  fetchMock.mock.mockImplementation(async () => ({ ok: true, json: async () => ({ error: ['No rate'] }) }));
  assert.equal(await loadQuote(property, 'unit', search), null);
});
