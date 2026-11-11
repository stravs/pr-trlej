# Pr’ Trlej — local review and improvements

Reviewed 10 November 2026. Custom reference site only; no deployment or live property capture.

## Main findings and fixes

- **Misleading photographs (high priority).** The homepage bedroom hero was labelled as a valley view; Lake Bled photos illustrated the farm and motorcycles; the motorcycle group photo was labelled as an apartment. Reviewed a contact sheet of the existing local photos. Changed the hero to the guesthouse exterior, farm imagery to the horse/meadow and breakfast, and rider imagery to the motorcycle group. Corrected secondary page heroes and image descriptions. Did not replace source-linked unit galleries with shared property photos. Reordered the twin room’s existing gallery so its bed photo leads instead of its bathroom.
- **Unreliable availability presentation (high priority).** The old page-level scraper treated an empty/unrecognised calendar as free and errors as unavailable; unit pages could show null prices and disable booking links. Removed those calls from the public page flow. Date search is now a normal GET form to `/book/`, working without JavaScript, defaulting to two adults. Bentral is the confirmation step. Children’s ages and unit selection must be entered there; the handoff explains that explicitly. Added real provider/contact fallback links and preserved selected unit/building information. This intentionally replaces in-page live card prices, not the booking provider itself.
- **Heavy unresponsive images.** Original JPEGs total 79,456,313 bytes. Added 480/960/1600px WebP derivatives (capped at original width), intrinsic dimensions, responsive `srcset`/`sizes`, lazy loading below the fold and high priority on the actual hero. All three derivative sets together total 17,323,018 bytes; a browser requests one selected variant, not the entire set. Originals are unchanged. These are file measurements, not a Lighthouse/Core Web Vitals claim.
- **Weak hierarchy and contrast.** Retained the cream/moss/serif character, but simplified the hero, distinguished its two actions, improved image overlays and added occupancy to featured cards. Added a sample-price caveat. Removed the unsupported blanket claim that all units have their own outdoor space. Darkened clay to `#995524`: white/clay contrast 5.71:1, clay/cream 5.33:1. This is not a full contrast/accessibility certification.
- **Navigation/accessibility gaps.** Added a main landmark, skip link, consistent keyboard focus, current-page states, menu control association, Escape-to-close with focus restoration and reduced-motion overrides. Desktop navigation now begins at 1024px instead of crowding tablet widths. Fixed hidden secondary hero photography with an isolated stacking context.

## Verification actually run

- Root `npm test`: **39 passed**.
- Site `npm run build`: **passed**. Node SSR retained for booking and the legacy endpoint; other pages prerender.
- Site `npm audit --omit=dev`: **0 vulnerabilities reported**.
- Root `.venv/bin/python -m pytest`: **34 passed, 1 skipped, 3 failed**. All three failures are browser startup failures: this environment lacks the exact Chromium revision expected by the installed Python Playwright. No test source or browser installation was changed to hide this limitation.
- Dedicated browser regression against the **built Node server**, `http://172.17.0.2:4330`: **passed** using the available Chromium 1254 binary. 22 distinct pages, 48 page/viewport inspections; homepage at 390/768/1024/1440px, all discovered pages at 390/1440px. Checks HTTP status, main/H1, preview noindex, overflow, decoded local images, menu/Escape/focus, skip link, date correction, query preservation and booking submission with/without JavaScript. No browser JavaScript errors.
- External requests blocked in the regression run. Bentral iframe rendering, real availability, transactions, Booking.com, map services and production caching were **not verified**.

Run the local browser checks from `/workspace/izba`:

```sh
PREVIEW_URL=http://172.17.0.2:4330 \
CHROMIUM_PATH=/ms-playwright/chromium-1254/chrome-linux64/chrome \
.venv/bin/python references/sites/pr-trlej/tests/check-preview.py
```

Regenerate image derivatives using `.venv/bin/python references/sites/pr-trlej/scripts/prepare-images.py`.

QA artifacts: `data/pr-trlej/qa/report.json`, `before-desktop.png`, `before-mobile.png`, `after-home-{390,768,1024,1440}.png`, plus build/browser/Python test logs. These are local material, not publication assets.

## Before public launch

- Owner must verify facts, prices, occupancy/child rules, unit-photo associations and photo rights. The visual review establishes what photos depict, not licensing or authoritative room identity.
- The **legacy `/api/availability` endpoint remains in source and reachable**, but these pages no longer call it. It needs a separate backend review or removal before public use: calendar coverage/failure semantics, child-age pricing, input validation, timeouts, request limits and cache bounds are not addressed here. Do not treat it as an authoritative availability API.
- Keep preview private. Existing noindex metadata and preview footer remain; neither is authentication. No production canonical, structured claims, sitemap or indexing was added without a confirmed launch origin.
- `references/sites/` is ignored by the root repository. Changes are local reference-site edits, not tracked production renderer changes. This property-specific design was not copied into the shared renderer.

Astro documentation consulted via the official docs MCP: [image components](https://docs.astro.build/en/guides/images/#astro-components-for-images), [public images and dimensions](https://docs.astro.build/en/reference/modules/astro-assets/#_top), [Tailwind responsive-image interaction](https://docs.astro.build/en/guides/images/#responsive-images-with-tailwind-4). This site uses native responsive HTML in `Photo.astro` with pre-generated local WebPs.
