"""Mobile layout and interaction checks against a running build (no external traffic).
Usage: PREVIEW_URL=http://127.0.0.1:4334 /workspace/izba/.venv/bin/python tests/check-mobile.py
Bentral calls are blocked in the browser; server-side quotes depend on the server's own network.
"""
import os
from datetime import date, timedelta
from playwright.sync_api import sync_playwright

base = os.environ.get('PREVIEW_URL', 'http://127.0.0.1:4334').rstrip('/')
pages = ['/', '/accommodation/', '/traditional-house/', '/tourist-farm/', '/camping/', '/farm/',
         '/guest-guide/', '/activities/', '/motorcycles/', '/location/', '/contact/', '/policies/',
         '/rooms/double-room-terrace/', '/rooms/apartment-liza/', '/camping/tent/']


def local_only(context):
    context.route('**/*', lambda route: route.continue_() if route.request.url.startswith(base + '/') else route.abort())


def day_label(day: date) -> str:
    return f'{day.day} {day.strftime("%B")}'


with sync_playwright() as p:
    options = {'headless': True}
    if os.environ.get('CHROMIUM_PATH'):
        options['executable_path'] = os.environ['CHROMIUM_PATH']
    browser = p.chromium.launch(**options)

    # No horizontal page scroll at the standard widths.
    for width in (390, 768, 1440):
        context = browser.new_context(viewport={'width': width, 'height': 900})
        local_only(context)
        page = context.new_page()
        for path in pages:
            assert page.goto(base + path, wait_until='networkidle').status == 200, path
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (path, width, 'overflow')
        context.close()

    context = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    local_only(context)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))

    # Sticky header and full-screen menu with scroll lock.
    page.goto(base + '/', wait_until='networkidle')
    page.mouse.wheel(0, 2000)
    page.wait_for_timeout(200)
    assert page.locator('body > header').evaluate('el => el.getBoundingClientRect().top') == 0
    page.locator('[data-mobile-menu] > summary').click()
    menu = page.get_by_role('navigation', name='Mobile')
    assert menu.get_by_role('link', name='Traditional house · Private bathrooms').is_visible()
    page.wait_for_function("document.documentElement.classList.contains('overflow-hidden')")
    page.keyboard.press('Escape')
    page.wait_for_function("!document.documentElement.classList.contains('overflow-hidden')")

    # Cally range picker fills the submitted fields.
    page.goto(base + '/accommodation/', wait_until='networkidle')
    assert page.locator('#arrival').is_hidden() and page.locator('#dates-button').is_visible()
    arrival = date.today() + timedelta(days=2)
    departure = arrival + timedelta(days=3)
    page.locator('#dates-button').click()
    dialog = page.locator('#dates-dialog')
    assert dialog.evaluate('el => el.open')
    while page.locator(f'calendar-month button[aria-label="{day_label(arrival)}"]').count() == 0:
        page.locator('calendar-range [aria-label="Next month"]').click()
    page.locator(f'calendar-month button[aria-label="{day_label(arrival)}"]').click()
    assert 'Now select check-out' in page.locator('#dates-status').inner_text()
    while page.locator(f'calendar-month button[aria-label="{day_label(departure)}"]').count() == 0:
        page.locator('calendar-range [aria-label="Next month"]').click()
    page.locator(f'calendar-month button[aria-label="{day_label(departure)}"]').click()
    assert not dialog.evaluate('el => el.open')
    assert page.locator('#arrival').input_value() == arrival.isoformat()
    assert page.locator('#departure').input_value() == departure.isoformat()
    assert '3 nights' in page.locator('#dates-text').inner_text()
    page.get_by_role('button', name='Check dates →').click()
    page.wait_for_url('**/accommodation/?**')
    assert f'arrival={arrival.isoformat()}' in page.url and f'departure={departure.isoformat()}' in page.url

    # Submitting without dates opens the picker instead of a hidden-field error.
    page.goto(base + '/traditional-house/', wait_until='networkidle')
    page.get_by_role('button', name='Check dates →').click()
    assert page.locator('#dates-dialog').evaluate('el => el.open')
    page.keyboard.press('Escape')
    assert not page.locator('#dates-dialog').evaluate('el => el.open')

    # Room page: photo first on phones, swipeable full-screen viewer.
    page.goto(base + '/rooms/double-room-terrace/', wait_until='networkidle')
    photo = page.locator('[data-photo-index="0"]').bounding_box()
    title = page.locator('main h1').bounding_box()
    assert photo['y'] < title['y']
    page.locator('[data-photo-index="0"]').click()
    viewer = page.locator('#photo-viewer')
    assert viewer.evaluate('el => el.open')
    page.keyboard.press('ArrowRight')
    page.wait_for_function("document.querySelector('[data-viewer-count]').textContent.startsWith('2 /')")
    page.keyboard.press('Escape')
    assert not viewer.evaluate('el => el.open')
    assert errors == [], errors
    context.close()

    # Without JavaScript the native date fields remain usable.
    nojs = browser.new_context(viewport={'width': 390, 'height': 844}, java_script_enabled=False)
    local_only(nojs)
    fallback = nojs.new_page()
    fallback.goto(base + '/tourist-farm/')
    assert fallback.locator('#arrival').is_visible() and fallback.locator('#dates-button').is_hidden()
    fallback.locator('#arrival').fill(arrival.isoformat())
    fallback.locator('#departure').fill(departure.isoformat())
    fallback.get_by_role('button', name='Check dates →').press('Enter')
    fallback.wait_for_url('**/accommodation/?**')
    assert 'building=farm' in fallback.url
    browser.close()

print('mobile checks passed')
