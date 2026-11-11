"""Image regression checks against a running production build (no external traffic).
Usage: PREVIEW_URL=http://127.0.0.1:4334 /workspace/izba/.venv/bin/python tests/check-images.py
"""
import os
from playwright.sync_api import sync_playwright

base = os.environ.get('PREVIEW_URL', 'http://127.0.0.1:4334').rstrip('/')
with sync_playwright() as p:
    options = {'headless': True}
    if os.environ.get('CHROMIUM_PATH'):
        options['executable_path'] = os.environ['CHROMIUM_PATH']
    browser = p.chromium.launch(**options)
    context = browser.new_context(device_scale_factor=1)
    context.route('**/*', lambda route: route.continue_() if route.request.url.startswith(base + '/') else route.abort())
    page = context.new_page()
    for width in (390, 768, 1440):
        page.set_viewport_size({'width': width, 'height': 900})
        for path in ('/', '/rooms/double-room-terrace/', '/camping/tent/'):
            response = page.goto(base + path, wait_until='networkidle')
            assert response.status == 200, path
            assert page.locator('img[fetchpriority="high"]').count() == 1, path
            page.locator('img').evaluate_all("imgs => imgs.forEach(img => img.loading = 'eager')")
            page.wait_for_function('Array.from(document.images).every(img => img.complete && img.naturalWidth > 0)')
            images = page.locator('img').evaluate_all('''imgs => imgs.map(img => ({
                src: img.currentSrc, srcset: img.srcset, sizes: img.sizes,
                width: img.width, height: img.height,
                intrinsicWidth: img.getAttribute('width'), intrinsicHeight: img.getAttribute('height'),
                renderedWidth: img.getBoundingClientRect().width
            }))''')
            for image in images:
                assert image['srcset'] and image['sizes'], (path, image)
                assert int(image['intrinsicWidth']) > 0 and int(image['intrinsicHeight']) > 0
                assert '/images/' not in image['src'], (path, image)
                selected_width = next(
                    int(candidate.strip().rsplit(' ', 1)[1][:-1])
                    for candidate in image['srcset'].split(',')
                    if candidate.strip().rsplit(' ', 1)[0] == image['src'].removeprefix(base)
                )
                assert selected_width <= image['renderedWidth'] * 2 + 1, (path, image)
                asset = context.request.get(image['src'])
                assert asset.status == 200, (path, image['src'], asset.status)
                assert 'image/webp' in asset.headers.get('content-type', ''), image
            hero = images[0]
            print(f"{width}px {path}: {len(images)} images OK; hero rendered {hero['renderedWidth']:.0f}px; {hero['src'].split('/')[-1]}")
    browser.close()
