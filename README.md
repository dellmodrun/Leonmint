# Leonmint frontend

Leonmint is a Florida business map and coin launch concept. This repository publishes a rebranded, read-only capture of the public frontend to GitHub Pages.

## Current brand

- Project: Leonmint
- Token ticker: `$LEOMINT`
- Official contract address: TBA
- Logo: `mirror/logo.png`, copied from the supplied Leonmint artwork

## Preview and deployment

`npm start` serves the Leonmint preview at <http://127.0.0.1:4176/Leonmint/>. `npm run build:pages` generates `_site/` with the Leonmint name, logo, prelaunch token state, and GitHub Pages paths. `npm run check:pages` verifies the output. Pushing `main` deploys it to <https://dellmodrun.github.io/Leonmint/>.

The captured pages are `/`, `/map/`, `/coins/`, `/create/`, and `/claim/`. The repository retains the original public mirror as input; `scripts/rebrand.mjs` applies the Leonmint presentation during each Pages build. The listed coins and map data are inherited from that mirror and are not new Leonmint launches.

This frontend does not include the original site's unpublished backend, database, wallet permissions, or live write operations. `npm run start:mirror` runs the raw captured mirror for reference; its write guard returns HTTP 403.
