# Accommodation restructure — 10 November 2026

Local customised reference site. No deployment; preview noindex retained.

## Structure

- `/`: hero → three accommodation choices → family/farm → food and motorcycle links → activities → location and three stay actions. Removed the generic date form and featured unit grid.
- `/accommodation/`: compare all three stays.
- `/traditional-house/`: eight existing units with private bathrooms, plus a date form tied to the guesthouse booking destination.
- `/tourist-farm/`: four existing rooms with shared bathrooms, plus a date form tied to the farm booking destination.
- `/camping/`: Camp Starshine introduction, saved camping photograph, tent/campervan options, practical information and external camping booking links.
- `/rooms/` and all individual unit URLs remain available. The listing now groups by accommodation; detail pages link back to their accommodation page. Existing unit galleries, occupancy and child distinctions retained.
- `/farm/` remains Farm & food. Navigation, footer and contact distinguish it from tourist farm accommodation.
- `/book/` without an accommodation selection offers all three choices. Explicit house/farm selections retain their Bentral forms. Farm Booking.com fallback now goes to the farm listing.
- Policies and guest guide explicitly distinguish room information from camping arrangements.

## Evidence and limits

House/farm inventory uses the existing `src/data/site.ts` and saved `data/pr-trlej/bentral/` evidence. No live inventory capture or availability calculation added.

Camping connection: `data/pr-trlej/pages/en__camping-2.txt` and `sl__camping.txt`. Camping image: existing `camp-bled.jpg`, visually reviewed for this change. Shared farm imagery is used as setting, not as evidence of an individual room.

Official camping pages checked:

- https://www.campstarshine.si/
- https://www.campstarshine.si/prostor-za-sotor.html
- https://www.campstarshine.si/prostor-za-avtodom-ali-sotor.html

These establish the pitch types and tent listing's shared bathroom. Breakfast is listed as an option. Electricity, drinking water, vehicle services, season and arrival rules remain questions for the hosts. No invented facilities or camping rates. Only one locally evidenced camping photograph is used; additional gallery images need verified source associations and rights.

## Current checks

- Site `npm run build`: passed.
- Root `npm test`: 39 passed.
- Updated `tests/check-preview.py`: passed, 57 page/viewport inspections across 26 distinct paths. Browser regression against the built Node server, with external requests blocked. Checks mobile/desktop pages, decoded images, overflow, keyboard navigation, correct accommodation inventory, house/farm booking IDs and fallbacks, and booking forms with/without JavaScript.
- Live booking provider rendering, availability and transactions are not verified.
- Existing dev preview reused at http://172.17.0.2:4323; `/_astro/status` returned `{"ok":true}`.

This supersedes the homepage/booking structure described in `REVIEW.md`. Other limitations there still apply. The root repository ignores this local reference site; these are local files, not a production renderer change or a commit.
