import test from 'node:test';
import assert from 'node:assert/strict';

const base = process.env.PREVIEW_URL;

test('Cloudflare routing, cache policy and preview indexing', { skip: !base }, async () => {
  const request = (path, init) => fetch(new URL(path, base), init);
  for (const path of ['/', '/contact/', '/accommodation/', '/rooms/double-room-terrace/', '/camping/tent/']) {
    const response = await request(path);
    assert.equal(response.status, 200, path);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff', path);
    assert.match(response.headers.get('x-robots-tag'), /noindex/, path);
    assert.match(await response.text(), /noindex/, path);
    if (path.includes('accommodation') || path.includes('/rooms/') || path.includes('/camping/')) {
      assert.equal(response.headers.get('cache-control'), 'no-store', path);
    }
  }
  const home = await request('/');
  const html = await home.text();
  const image = html.match(/src="(\/_astro\/[^" ]+\.webp)"/)[1];
  const asset = await request(image);
  assert.equal(asset.status, 200);
  assert.match(asset.headers.get('cache-control'), /immutable/);
  assert.match(asset.headers.get('content-type'), /image\/webp/);

  for (const path of ['/contact', '/rooms/double-room-terrace']) {
    const slash = await request(`${path}?adults=3`, { redirect: 'manual' });
    assert.ok([301, 307, 308].includes(slash.status), `${path}: ${slash.status}`);
    const location = new URL(slash.headers.get('location'), base);
    assert.equal(location.pathname, `${path}/`);
    assert.equal(location.search, '?adults=3');
  }
  const head = await request('/rooms/double-room-terrace/', { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(head.headers.get('cache-control'), 'no-store');
  assert.equal(await head.text(), '');
  const redirect = await request('/book/?building=camping&adults=3', { redirect: 'manual' });
  assert.equal(redirect.status, 301);
  assert.equal(redirect.headers.get('location'), '/accommodation/?building=camping&adults=3#booking');
  const invalid = await request('/api/availability/');
  assert.equal(invalid.status, 400);
  assert.equal(invalid.headers.get('cache-control'), 'no-store');
  const missing = await request('/rooms/not-a-real-room/');
  assert.equal(missing.status, 404);
});
