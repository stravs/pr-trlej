# Astro Starter Kit: Minimal

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Camping booking

`/camping/` submits dates and guests to `/accommodation/?building=camping`.
Camp Starshine uses its own Bentral property (`5f7a45784e515f4e`, `source=web`), separate from house/farm rooms.
Public widget configuration was verified on 2026-11-11 against:

- https://www.campstarshine.si/en/tent-pitch.html — unit `5f5459334d44634d`
- https://www.campstarshine.si/en/campervan-tent-pitches.html — unit `5f5459334d44594d`

Pitch links pass a reviewed unit ID to the embedded form. Dates and adults use Bentral's existing hash handoff; children and ages must be entered again. Availability, totals and confirmation stay with Bentral; no reservation is created locally.

Accommodation search lives at `/accommodation/` and returns photo unit cards, with no embedded booking form. Cards open `/rooms/<slug>/` or `/camping/<slug>/` with the search selection preserved. Each unit page rechecks availability and only embeds its unit-specific Bentral form after valid dates and guest counts match. Missing dates, invalid searches, unavailable units and provider errors never show the form. The legacy `/book/` route redirects to accommodation with query parameters preserved.

The accommodation page searches all properties by default, with an optional property filter. It reads each property’s public Bentral unit limits and availability calendar on each search and lists every matching unit. Adult and child limits are checked separately. Failed calendar requests show an explicit fallback instead of claiming there are no units. Final rates, stay restrictions and children’s ages are confirmed by Bentral. Search values and unit booking links preserve dates and guest selection; children must be re-entered in Bentral.

Availability and pricing checks: `node --test tests/*.test.mjs` (Node 24).

For selected dates and guests, accommodation cards and individual unit pages request Bentral’s read-only calculation endpoint. They display the accommodation subtotal divided by nights (average nightly rate) and the provider’s stay total including quoted mandatory charges. Optional services and payment fees are excluded unless selected in Bentral. A failed or invalid quote shows “Live price unavailable”, never a saved sample rate. Children with unknown ages cannot be quoted locally. Quotes are requested fresh, without creating reservations.

Property-type pages use a compact heading and booking bar followed directly by rooms or pitches. Camping’s pitch selector maps to the reviewed Bentral pitch IDs. Entered dates/guests are carried into room and pitch booking links; the provider confirms availability and final prices.
