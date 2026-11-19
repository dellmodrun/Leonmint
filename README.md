# Leonmint frontend

Leonmint is a Florida business map and coin launch concept. This repository publishes a rebranded, read-only capture of the public frontend to GitHub Pages.

## Current brand

- Project: Leonmint
- Token ticker: `$LEOMINT`
- Official contract address: TBA, read from the live CA table
- Logo: `mirror/logo.png`, copied from the supplied Leonmint artwork

## Preview and deployment

`npm start` serves the Leonmint preview at <http://127.0.0.1:4176/Leonmint/>. `npm run build:pages` generates `_site/` with the Leonmint name, logo, prelaunch token state, and GitHub Pages paths. `npm run check:pages` verifies the output. Pushing `main` deploys it to <https://dellmodrun.github.io/Leonmint/>.

The captured pages are `/`, `/map/`, `/coins/`, `/create/`, and `/claim/`. The repository retains the original public mirror as input; `scripts/rebrand.mjs` applies the Leonmint presentation during each Pages build. The listed coins and map data are inherited from that mirror and are not new Leonmint launches.

This frontend does not include the original site's unpublished backend, database, wallet permissions, or live write operations. `npm run start:mirror` runs the raw captured mirror for reference; its write guard returns HTTP 403.

## Official CA updates

The official `$LEOMINT` CA is stored in `public.leonmint_ca` in Supabase, with read-only public access. The published site polls it every second and updates the CA and pump.fun link without a GitHub Pages deployment. From an authenticated Supabase CLI session, run `npm run update:ca -- <Solana mint>` or `npm run update:ca -- tba`. The script verifies the public read after writing. `supabase/leonmint_ca.sql` defines the table and access policy. The 17 inherited example coin records in the source mirror are static placeholders, not Leonmint launches or live CA records.
