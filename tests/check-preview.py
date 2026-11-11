"""Local-only browser regression checks. Run with the root .venv Python.
Usage: .venv/bin/python references/sites/pr-trlej/tests/check-preview.py
External requests are blocked: this does not verify Bentral or Booking.com.
"""
import json
import os
from pathlib import Path
from datetime import date, timedelta
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[4]
OUT = ROOT / 'data/pr-trlej/qa'
BASE = os.environ.get('PREVIEW_URL', 'http://172.17.0.2:4323').rstrip('/')
OUT.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    options = {'headless': True}
    if os.environ.get('CHROMIUM_PATH'):
        options['executable_path'] = os.environ['CHROMIUM_PATH']
    browser = p.chromium.launch(**options)
    context = browser.new_context()
    context.route('**/*', lambda route: route.continue_() if route.request.url.startswith(BASE + '/') else route.abort())
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    checked = []

    def inspect(path, width):
        page.set_viewport_size({'width': width, 'height': 900})
        response = page.goto(BASE + path, wait_until='networkidle')
        assert response.status == 200, (path, response.status)
        assert page.locator('main h1').count() == 1, path
        assert page.locator('main').count() == 1, path
        assert 'noindex' in page.locator('meta[name="robots"]').get_attribute('content'), path
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (path, width, 'overflow')
        page.locator('img').evaluate_all("imgs => imgs.forEach(img => img.loading = 'eager')")
        page.wait_for_function('Array.from(document.images).every(img => img.complete && img.naturalWidth > 0)')
        page.locator('img').evaluate_all('imgs => Promise.all(imgs.map(img => img.decode()))')
        page.evaluate('() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))')
        checked.append({'path': path, 'width': width, 'images': page.locator('img').count()})

    for width in [390, 768, 1024, 1440]:
        inspect('/', width)
        page.screenshot(path=str(OUT / f'after-home-{width}.png'), full_page=True)
    # Discover every local page from the home and accommodation listing.
    paths = set(page.locator('a[href^="/"]').evaluate_all('links => links.map(a => new URL(a.href).pathname)'))
    inspect('/rooms/', 390)
    paths.update(page.locator('a[href^="/rooms/"]').evaluate_all('links => links.map(a => new URL(a.href).pathname)'))
    for path in sorted(paths - {'/'}):
        inspect(path, 390)
        inspect(path, 1440)
    inspect('/', 390)
    button = page.locator('[data-mobile-menu] > summary')
    button.click()
    assert page.locator('[data-mobile-menu]').get_attribute('open') is not None
    assert page.get_by_role('navigation', name='Mobile').is_visible()
    mobile_stays = page.get_by_role('navigation', name='Mobile').locator('[data-dropdown]').first
    mobile_stays.locator('summary').click()
    assert mobile_stays.get_attribute('open') is not None
    assert mobile_stays.get_by_role('link', name='Traditional house').is_visible()
    page.keyboard.press('Escape')
    assert page.locator('[data-mobile-menu]').get_attribute('open') is None
    button.click()
    page.keyboard.press('Escape')
    assert button.evaluate('el => el === document.activeElement')
    page.set_viewport_size({'width': 1440, 'height': 900})
    desktop_menus = page.get_by_role('navigation', name='Main').locator('[data-dropdown]')
    desktop_menus.nth(0).locator('summary').click()
    assert desktop_menus.nth(0).get_attribute('open') is not None
    desktop_menus.nth(1).locator('summary').click()
    expect(desktop_menus.nth(0)).not_to_have_attribute('open', '')
    assert desktop_menus.nth(1).get_attribute('open') is not None
    page.locator('main h1').click()
    expect(desktop_menus.nth(1)).not_to_have_attribute('open', '')
    page.set_viewport_size({'width': 390, 'height': 900})
    page.keyboard.press('Control+Home')
    page.reload(wait_until='networkidle')
    page.keyboard.press('Tab')
    assert page.get_by_role('link', name='Skip to content').evaluate('el => el === document.activeElement')
    assert page.locator('#stays h3').all_text_contents() == ['Traditional house', 'Tourist farm', 'Camp Starshine']
    assert page.locator('#booking-form').count() == 0
    inspect('/accommodation/', 390)
    assert page.locator('iframe').count() == 0
    assert page.get_by_label('Property', exact=True).input_value() == ''
    assert page.get_by_label('Property', exact=True).locator('option').count() == 4
    arrival = (date.today() + timedelta(days=30)).isoformat()
    departure = (date.today() + timedelta(days=33)).isoformat()
    page.get_by_label('Property', exact=True).select_option('camping')
    page.locator('#arrival').fill(arrival)
    page.locator('#arrival').dispatch_event('change')
    page.locator('#departure').fill(departure)
    page.locator('[name="adults"]').select_option('3')
    page.locator('[name="children"]').select_option('1')
    page.get_by_role('button', name='Check dates →').click()
    page.wait_for_url('**/accommodation/?**')
    assert '5f7a45784e515f4e' in page.locator('iframe').get_attribute('src')
    assert page.get_by_label('Property', exact=True).input_value() == 'camping'
    assert page.locator('#arrival').input_value() == arrival
    assert page.locator('#departure').input_value() == departure
    assert page.locator('[name="adults"]').input_value() == '3'
    assert page.locator('[name="children"]').input_value() == '1'
    page.get_by_label('Property', exact=True).select_option('guesthouse')
    page.get_by_role('button', name='Check dates →').click()
    page.wait_for_url('**/accommodation/?building=guesthouse*')
    assert '5f7a55304e775f4d' in page.locator('iframe').get_attribute('src')
    assert page.locator('#arrival').input_value() == arrival
    assert page.locator('[name="children"]').input_value() == '1'
    legacy_query = 'building=camping&pitch=tent&arrival=2026-12-11&departure=2026-12-14&adults=3&children=1'
    legacy = context.request.get(BASE + '/book/?' + legacy_query, max_redirects=0)
    assert legacy.status == 301
    assert legacy.headers['location'] == '/accommodation/?' + legacy_query + '#booking'
    for path, building, count in [('/traditional-house/', 'guesthouse', 8), ('/tourist-farm/', 'farm', 4)]:
        inspect(path, 390)
        assert page.locator('[data-unit-slug]').count() == count
        assert page.locator('[name="building"]').input_value() == building
    inspect('/camping/', 390)
    assert page.get_by_label('Pitch type', exact=True).input_value() == ''
    assert page.locator('[data-pitch-slug]').count() == 2
    assert 'pitch=tent' in page.get_by_role('link', name='Book a tent pitch').get_attribute('href')
    for path in ['/traditional-house/', '/tourist-farm/', '/camping/']:
        page.goto(BASE + path)
        assert page.locator('main > section').first.locator('img').count() == 0
        assert page.evaluate("Boolean(document.querySelector('#booking-bar').compareDocumentPosition(document.querySelector('#units')) & Node.DOCUMENT_POSITION_FOLLOWING)")

    inspect('/traditional-house/', 390)
    assert page.locator('[name="adults"]').input_value() == '2'
    arrival = (date.today() + timedelta(days=30)).isoformat()
    departure = (date.today() + timedelta(days=33)).isoformat()
    page.locator('#arrival').fill(arrival)
    page.locator('#arrival').dispatch_event('change')
    assert page.locator('#departure').input_value() > arrival
    page.locator('#departure').fill(departure)
    page.locator('[name="children"]').select_option('1')
    page.get_by_role('button', name='Check dates →').click()
    page.wait_for_url('**/accommodation/?**')
    assert f'arrival={arrival}' in page.url and 'children=1' in page.url and 'building=guesthouse' in page.url
    assert 'Please enter children and their ages again' in page.locator('main').inner_text()
    assert page.get_by_role('link', name='Open booking system in a new tab').is_visible()
    for building, provider in [('guesthouse', '5f7a55304e775f4d'), ('farm', '5f7a55334d415f4d')]:
        page.goto(BASE + f'/accommodation/?building={building}')
        assert provider in page.locator('iframe').get_attribute('src')
        expected = 'farm-stay-trlej.html' if building == 'farm' else 'pr-trlej.html'
        assert expected in page.get_by_role('link', name='Booking.com').get_attribute('href')
    # Camping uses a distinct provider and preserves the normal date/guest handoff.
    inspect('/camping/', 390)
    assert page.locator('[name="building"]').input_value() == 'camping'
    page.get_by_label('Pitch type', exact=True).select_option('tent')
    page.locator('#arrival').fill(arrival)
    page.locator('#arrival').dispatch_event('change')
    page.locator('#departure').fill(departure)
    page.locator('[name="adults"]').select_option('3')
    page.locator('[name="children"]').select_option('1')
    page.get_by_role('button', name='Check dates →').click()
    page.wait_for_url('**/accommodation/?**')
    assert 'building=camping' in page.url and 'children=1' in page.url
    frame_src = page.locator('iframe').get_attribute('src')
    assert 'id=5f7a45784e515f4e' in frame_src and 'source=web' in frame_src
    assert 'unit=5f5459334d44634d' in frame_src
    assert f'#arrival={arrival}&departure={departure}&persons=3' in frame_src
    assert page.get_by_role('link', name='Booking.com').count() == 0
    assert 'Please enter children and their ages again' in page.locator('main').inner_text()
    for pitch, unit in [('tent', '5f5459334d44634d'), ('campervan', '5f5459334d44594d')]:
        page.goto(BASE + f'/accommodation/?building=camping&pitch={pitch}')
        frame_src = page.locator('iframe').get_attribute('src')
        assert f'unit={unit}' in frame_src
        assert page.get_by_role('link', name='Open booking system in a new tab').get_attribute('href') == frame_src
    page.goto(BASE + '/accommodation/?building=camping&pitch=unknown')
    assert '&unit=' not in page.locator('iframe').get_attribute('src')
    assert errors == [], errors
    context.close()
    nojs = browser.new_context(java_script_enabled=False)
    nojs.route('**/*', lambda route: route.continue_() if route.request.url.startswith(BASE + '/') else route.abort())
    fallback = nojs.new_page()
    fallback.goto(BASE + '/tourist-farm/')
    assert fallback.locator('#booking-form').get_attribute('action') == '/accommodation/#booking'
    fallback.locator('#arrival').fill(arrival)
    fallback.locator('#departure').fill(departure)
    fallback.get_by_role('button', name='Check dates →').press('Enter')
    fallback.wait_for_url('**/accommodation/?**')
    assert 'building=farm' in fallback.url
    assert '5f7a55334d415f4d' in fallback.locator('iframe').get_attribute('src')
    fallback.goto(BASE + '/camping/')
    fallback.locator('#arrival').fill(arrival)
    fallback.locator('#departure').fill(departure)
    fallback.get_by_role('button', name='Check dates →').press('Enter')
    fallback.wait_for_url('**/accommodation/?**')
    assert 'building=camping' in fallback.url
    assert '5f7a45784e515f4e' in fallback.locator('iframe').get_attribute('src')
    fallback.goto(BASE + '/accommodation/')
    fallback.get_by_label('Property', exact=True).select_option('farm')
    fallback.locator('#arrival').fill(arrival)
    fallback.locator('#departure').fill(departure)
    fallback.locator('[name="adults"]').select_option('3')
    fallback.get_by_role('button', name='Check dates →').press('Enter')
    fallback.wait_for_url('**/accommodation/?**')
    assert 'building=farm' in fallback.url and 'adults=3' in fallback.url
    assert fallback.get_by_label('Property', exact=True).input_value() == 'farm'
    assert '5f7a55334d415f4d' in fallback.locator('iframe').get_attribute('src')
    browser.close()
    report = {'pages': checked, 'keyboard_menu': 'passed', 'booking_handoff': 'passed', 'no_js_booking': 'passed', 'browser_errors': errors, 'external_services': 'blocked, not verified'}
    (OUT / 'report.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report, indent=2))
