# slash.markets website

The marketing website for /markets at https://slash.markets: an Astro static site on Netlify. Every page is server-rendered HTML. The product itself runs at https://app.slash.markets and is not in this repo.

**Read [CLAUDE.md](CLAUDE.md) before changing anything.** It holds the rules for people and AI agents (`AGENTS.md` links to it), and `.claude/rules/` has the detail for each topic. What to build next is in [docs/site-build-plan.md](docs/site-build-plan.md).

## Run it

You need Node 24 (`.nvmrc`). Then:

| Command | What it does |
|---|---|
| `npm install` | Install the pinned dependencies |
| `npm run dev` | Local dev server at http://localhost:4321 |
| `npm run build` | Build to `dist/`, then run every gate. Fails on any error |
| `SHOW_DRAFTS=true npm run build` | Build the way deploy previews do: drafts shown, every page `noindex` |
| `npm run preview` | Serve the built `dist/` |
| `npm run check` | Type check (`astro check`) |
| `npm run test` | Unit tests, including the gate tests |

Browser checks (`npm run test:e2e`) arrive in a later phase.

## Where things live

```
src/pages/            routes: the homepage, /privacy, /terms, /404, sitemap.xml, robots.txt, llms.txt
src/data/pages.ts     the route registry: every page's URL, title, description, H1, status and sign-off
src/data/facts.json   product facts (data delay, markets, integrations): never type these into a page
src/config/site.ts    the domain, brand strings and site-wide IDs
src/content/legal/    the privacy and terms text, in Markdown
src/components/seo/   Seo.astro: every head tag, structured data and analytics
src/lib/              graph.ts (JSON-LD), facts.ts, content.ts
public/               files served as-is: the homepage's assets and scripts, /brand/ and /brand-guidelines/
scripts/gates/        build gates that run after every build, with their tests
design/legacy-v1/     the previous homepage's files, kept for reference and not deployed
ops/                  the waitlist's Google Apps Script backend
docs/                 the site build plan and the starter code
```

The homepage (`src/pages/index.astro`) is the old static page ported unchanged. Its CSS and scripts stay inline until the new Home replaces it.

## Gates and CI

`npm run build` runs `scripts/gates/run.mjs` on `dist/` after `astro build`, so a rule that breaks fails the build locally, in CI and on Netlify alike. The gates check URLs and links, head tags, structured data, the sitemap, em dashes in `src/` and banned compliance phrases. See `.claude/rules/quality-gates.md`.

GitHub Actions (`.github/workflows/ci.yml`) runs the type check, the tests and both builds on every pull request.

## Deploys

Netlify builds `main` with `npm run build` and publishes `dist/`. Every pull request gets a deploy preview that shows drafts and sends `noindex`. Work on a branch and open a pull request; never push to `main`.

## Waitlist to Google Sheet

The waitlist form (`#waitform` on the homepage) posts to a Google Apps Script web app bound to a Google Sheet.

- **Front end:** `public/waitlist.js`, a framework-free ES module. It also sends the Google Analytics `sign_up` event when a sign-up succeeds.
- **Backend:** `ops/waitlist-apps-script.gs`. Paste it into the Sheet's Apps Script editor and deploy it as a web app with access for "Anyone".
- **Endpoint:** the deployed `/exec` URL is in the form's `data-endpoint` (in `src/pages/index.astro`) and in `src/config/site.ts`.
- **Storage:** a honeypot field (`company`) stops bots, and duplicates are removed on the server. Columns: timestamp, email, source, page, referrer, user_agent.

## Licences

Third-party licences are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). No open-source licence covers the /markets brand, copy or artwork.
