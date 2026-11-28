# slash.markets site build plan

**Goal.** By Friday 18 December 2026, slash.markets runs on Astro with all 19 pages live, compliance sign-off recorded on each. Articles flow in as Markdown pull requests from week 2. Every rule in `CLAUDE.md` is checked by the build.

Last updated 28 Nov 2026. Update the page tracker and the open items as work lands.

**Status (28 Nov 2026):**
- **Phase 0 and Phase 1:** merged on 25 Nov in PR #1 (`569ec76`). `npm run check`, `npm run test` and `npm run build` pass locally.
- **Production:** still serves the old static site. Checked 28 Nov: `/README.md` and `/BRAND_GUIDELINES.md` return 200, while `/sitemap.xml`, `/llms.txt` and `/og/default.jpg` return 404. Madhan to check the Netlify production deploy of `main`.
- **Phase 2:** built on 28 Nov on branch `article-system`, in one pull request that depends on PR #2. It holds all eight collections (routes for the four article collections; `useCases`, `worksWith` and `faqs` get theirs in Phase 3), the Article and Hub templates, RSS, `<Fact>`, the commands and the second set of gates. The four hubs and Prefer's temporary `/disclaimer` are `draft`, with their SEO fields and intros from Prefer (28 Nov). Sahil's sign-off on `/guides` and `/disclaimer` was relayed by Prefer on 28 Nov; both go live with the rename PR. Before articles #1 and #2 can go live: the rename PR merges with Sahil's sign-off on the renamed copy, and production deploys `main`.

## Decided (25 Nov 2026)

| Topic | Decision |
|---|---|
| Framework | Astro 7.4.13, static output, Node 24, no UI framework. Versions pinned exactly (`docs/starter-code.md`) |
| Content editing | Markdown or MDX files in this repo, added by pull request. No CMS |
| URLs | Clean URLs with no trailing slash. 301s from the old `.html` URLs |
| Pages | 19: the 16 in the site pages brief, plus the `/compare` hub and the `/use-cases` and `/works-with` index pages |
| Homepage | Ported unchanged first (Phase 1). The new Home from Sunny's design replaces it later (Phase 3) |
| `/brand/`, `/brand-guidelines/` | Stay live, hidden from search, out of the sitemap |
| Analytics | Google Analytics 4 from day 1, production only |
| Governance | `CLAUDE.md` governs; `AGENTS.md` is a symlink to it |
| Merging | Prefer or Madhan merge pull requests after review and sign-off. Netlify deploys `main` |

## Decided (28 Nov 2026)

| Topic | Decision |
|---|---|
| Phase 2 | Prefer builds all of Phase 2 on a branch and opens one pull request |
| Byline | Raunaq Vaisoha (Co-founder and CEO) is the named author, starting with articles #1 and #2. His `authors.json` entry carries his LinkedIn profile in `sameAs` |
| Disclaimer | Prefer drafts a temporary `/disclaimer` from what slash.markets does today: the homepage's "Important information" block and `.claude/rules/compliance.md`. Sahil edits it and signs off before it goes live. His final text replaces it |
| Competitors in articles | Kite MCP and Dhan MCP may be named. Sahil's sign-off on each page records it. Other competitors still need approval |

## Timeline

| Week | Dates | By the end of the week |
|---|---|---|
| 1 | Mon 23 Nov to Sun 29 Nov | Prefer sends SEO titles, descriptions, H1s and FAQ questions for every page. One-line description locked. Phase 1 pull request open (target Fri 27 Nov) |
| 2 | Mon 30 Nov to Sun 6 Dec | Phase 2 merged by Wed 2 Dec, so month-one articles can go live. Template and designs signed off. Home, How it works and the 5 use cases drafted |
| 3 | Mon 7 Dec to Sun 13 Dec | Remaining core pages and the hubs drafted, reviewed as each is ready |
| 4 | Mon 14 Dec to Sun 20 Dec | All 19 pages live by Fri 18 Dec, submitted to Search Console and Bing |

**If a page slips,** these go first: Home, How it works, the 5 use cases, Security. Articles link to them most.

## Phase 0: governing files (done 25 Nov)

**Files**
- `CLAUDE.md`
- `AGENTS.md` (a symlink to `CLAUDE.md`)
- `.claude/rules/*.md`
- this plan
- `docs/starter-code.md`

**Merge these with Phase 1, not before.** Until Phase 1 switches Netlify to publish `dist/`, every file in the repo root is public. Today `slash.markets/AGENTS.md`, `/README.md`, `/BRAND_GUIDELINES.md` and `/waitlist-apps-script.gs` all return 200.

## Phase 1: Astro foundation, homepage unchanged (week 1)

Branch: `astro-foundation`. One pull request.

1. **Setup.**
   - Add `.nvmrc` (`24`) and `package.json` with the exact versions in `docs/starter-code.md`.
   - Run `npm install` and commit `package-lock.json`.
   - Add `dist/`, `.astro/`, `.env*` and `.claude/settings.local.json` to `.gitignore`.
2. **Move files** (use `git mv` so history follows):
   - Homepage files to `public/`, keeping their paths: `assets/`, `tool-studio.css`, `tool-studio.js`, `waitlist.js`.
   - `brand/` and `brand-guidelines/` to `public/`, unchanged.
   - The previous homepage's files to `design/legacy-v1/` (they are not deployed). That covers 18 root files: `styles.css`, `experience.js`, `dither-background.js`, `market-checks.js`, `scroll-motion.js`, `clarity-lens.js`, `lens-dither.js`, `text-reveal.js`, `details-popup.*`, `faq-footer.css`, `floating-nav.*`, `get-connected.*`, `legal.css`, `watch-alerts.*`. Also the assets no live page loads: videos, the watch, CTA and footer images, and five icons. The full list is in `docs/starter-code.md`.
   - `waitlist-apps-script.gs` to `ops/`.
   - Copy the three `.woff2` fonts to `src/assets/fonts/`; the homepage keeps its own copies.
3. **Foundation files** from `docs/starter-code.md`:
   - `astro.config.mjs`, `tsconfig.json`
   - `src/config/site.ts`, `src/data/facts.json`, `src/lib/facts.ts`
   - `src/data/pages.ts`, listing all 19 pages; only `/`, `/privacy`, `/terms` and `/404` are live
   - `src/lib/graph.ts`, `src/lib/content.ts`
   - `src/components/seo/Seo.astro`, `src/layouts/Base.astro`
4. **Port the homepage** to `src/pages/index.astro` with the port script.
   - Only the head metadata changes, plus the two legal links (to `/privacy` and `/terms`).
   - Legacy CSS and JS stay `is:inline`.
5. **Legal pages.**
   - Move the privacy and terms text to `src/content/legal/*.md`, served at `/privacy` and `/terms`.
   - In a separate commit, add to the privacy text: Google Analytics, and the page, referrer and browser details the waitlist stores. Flag that commit for Sahil.
6. **Machine files.** Add the endpoints `robots.txt`, `sitemap.xml` and `llms.txt`.
7. **Social card.** Save today's card (`https://here.now/og/lucid-marvel-pyk4.jpg`) as `public/og/default.jpg`. Never link the preview host.
8. **Netlify.**
   - Write `public/_redirects` and `netlify.toml` (`docs/starter-code.md`).
   - Netlify environment variables (Madhan): `PUBLIC_GA4_ID` for production only, and `SHOW_DRAFTS=true` for deploy previews.
9. **Analytics.** Add a `sign_up` event in `waitlist.js` on success; GA4 itself loads via `Seo.astro`.
10. **Gates, first version** (`scripts/gates/`): `urls`, `meta`, `schema`, `sitemap`, `style` and `compliance` (banned phrases). Use cheerio, each gate with a test.
11. **CI, first version:** `.github/workflows/ci.yml` running check, test and build.
12. **README.md.** Rewrite it for the Astro setup (run, build, where things live, pointer to `CLAUDE.md`).

**Done when** (show the evidence in the pull request):
- `npm run build` and `npm run check` finish with 0 errors.
- The homepage comparison script reports:
  - identical visible text;
  - identical element counts;
  - identical `id`, `class`, `data-*`, `aria-*` and `style` attributes.
- Screenshots at 1440, 390 and 320 px match the live site, at the top, middle and footer of the page.
- On the deploy preview:
  - every built URL returns 200;
  - `/privacy.html` and `/terms.html` end on the clean URLs;
  - `/AGENTS.md`, `/README.md` and `/waitlist-apps-script.gs` return 404;
  - `/brand/` and `/brand-guidelines/` send `X-Robots-Tag: noindex`;
  - the preview itself sends `noindex`.
- What `/how-it-works/` and `/privacy.html` returned is written into `.claude/rules/site-architecture.md`.
- The waitlist form submits from the preview. Use a test address, then delete that row from the sheet.

**Stop.** Open the pull request with the preview link and the evidence. Wait for review.

## Phase 2: article system (weeks 1 to 2, merged by Wed 2 Dec)

1. **Collections.** Add `guides`, `best`, `rules`, `compare`, `useCases`, `worksWith`, `faqs` and `authors`, with the schemas in `docs/starter-code.md`.
2. **Article template** (`src/layouts/Article.astro`), containing:
   - H1, then the `answer` lead;
   - a meta row: updated date, author, "Checked on" for rules, "Reviewed on" for best lists and comparisons;
   - a table of contents from the `##` headings;
   - the body, with prompt and output styling;
   - FAQ, sources (rules), related links (same group or use case), a disclaimer note, and breadcrumbs.
3. **Hub template** (`src/layouts/Hub.astro`) for `/guides` (grouped), `/best` (with the method note), `/rules` (with dates) and `/compare`.
   - The intro comes from the registry.
   - An empty hub still shows its intro.
4. **Drafts.**
   - `getPublished()` everywhere.
   - On previews, drafts render with a visible "Draft" banner and `noindex`.
5. **More endpoints and components.**
   - `rss.xml`.
   - llms.txt now includes articles.
   - A `<Fact>` component for `.mdx`.
6. **Commands** in `.claude/commands/`: `new-guide`, `new-best`, `new-rules`, `new-compare` and `seo-check`, each written from the final schemas.
7. **Gates, second version:** `compliance-words`, `facts`, `freshness`, `production-only` and placeholder text.

**Done when:**
- One draft per collection renders correctly on the preview, with valid structured data, and is absent from production.
- An entry with `draft: false` and no `signoff` fails the build.
- Hubs group and order their entries.
- A Prefer article can go live by adding one Markdown file.

**Stop.** Pull request, review, merge.

## Phase 3: core pages from Sunny's template (weeks 2 to 4)

**Build order** (the brief's fallback order):
1. Shared header and footer, driven by the registry, with the /disclaimer link.
2. `/how-it-works`.
3. The 5 use cases and `/use-cases`.
4. `/security`.
5. `/markets-covered`, built from `facts.json`.
6. `/works-with/claude` and `/works-with`.
7. `/faq`.
8. `/about`.
9. `/disclaimer`.
10. The hubs' final design.
11. The new Home, which replaces the port at the same URL.

**For each page**
1. Prefer's SEO fields go into the registry or frontmatter.
2. Build it from Sunny's design, with copy and facts from Anil and Raunaq.
3. Put it on a branch as `draft`.
4. Prefer reviews against the sign-off checklist within 2 working days.
5. Sahil signs off. Set `signoff` and `status: "live"`.
6. Merge. Prefer submits it to Search Console and Bing.

**Done when:**
- All 19 pages are live, each with a sign-off.
- All gates pass.
- The Lighthouse budgets are met on the five sample pages.

**Stop** after each page's pull request.

## Phase 4: hardening (week 4 onward)

- **CI.** Playwright, axe and Lighthouse CI, if not already in. Add the warning baseline ratchet.
- **Images and icons.**
  - Per-page social images generated at build time with satori and @resvg/resvg-js. This needs TTF or WOFF copies of Libre Baskerville and Onest (OFL; keep the licences).
  - PNG favicons, an apple-touch icon, and a 512 px PNG logo for the Organization schema.
- **Content Security Policy.** Start in report-only mode and allow Google Analytics.
- **Legacy files.**
  - When the new Home lands, move the homepage onto the shared tokens and components, and remove unused `public/assets` files.
  - Delete `design/legacy-v1/` once Sunny confirms.
  - Sunny updates `BRAND_GUIDELINES.md` (its "Where to edit" table) for the Astro layout.
- **Later.** Calculators under `/tools`, if the slash.markets team builds them.

## Page tracker

| URL | SEO fields (Prefer) | Design (Sunny) | Copy and facts | Built | Sign-off (Sahil) | Live |
|---|---|---|---|---|---|---|
| `/` (new Home) | | | | | | |
| `/how-it-works` | | | | | | |
| `/use-cases/option-chain` | | | | | | |
| `/use-cases/alerts` | | | | | | |
| `/use-cases/pre-market-brief` | | | | | | |
| `/use-cases/python` | | | | | | |
| `/use-cases/check-my-study` | | | | | | |
| `/markets-covered` | | | | | | |
| `/works-with/claude` | | | | | | |
| `/security` | | | | | | |
| `/about` | | | | | | |
| `/faq` | | | | | | |
| `/disclaimer` | 28 Nov | | Prefer's text (28 Nov) | Phase 2 | 28 Nov (relayed by Prefer) | with the rename PR |
| `/guides` | 28 Nov | | intro 28 Nov | Phase 2 | 28 Nov (relayed by Prefer) | with the rename PR |
| `/best` | 28 Nov | | intro and method note 28 Nov | draft (Phase 2) | | |
| `/rules` | 28 Nov | | intro 28 Nov | draft (Phase 2) | | |
| `/compare` | 28 Nov | | intro 28 Nov | draft (Phase 2) | | |
| `/use-cases` | | | | | | |
| `/works-with` | | | | | | |
| `/privacy`, `/terms` | carried over | carried over | renamed to slash.markets (rename PR) | | waits for the rename PR | |

## Open items

| Item | Owner | Needed by |
|---|---|---|
| One-line description locked | Sahil with Prefer | Week 1 |
| SEO titles, descriptions, H1s and FAQ questions for every page | Prefer | Week 1 |
| Google Analytics 4 property and measurement ID; Search Console and Bing verification | Madhan with Prefer | Week 1 |
| Netlify build settings, per-context variables and deploy previews | Madhan | Week 1 |
| Branch protection on `main` | Madhan | Week 1 |
| Privacy page: analytics and waitlist details | Sahil | Week 1 (analytics is live from day 1) |
| Company entity for the schema and About page: Certus Innovations Pvt Ltd or Boundless91 Inc | Anil, Raunaq | Week 2 |
| Shared template design and content width (1280 or 1360 px) | Sunny | Week 2 |
| Default social image, 1200 by 630 (the current card is used until then) | Sunny | Week 2 |
| Claude setup steps for `/works-with/claude` | Anil | Week 2 |
| Rename the name in live copy to slash.markets (homepage, `site.ts`, `facts.json`, `pages.ts` titles, legal pages, `llms.txt`, `og:site_name`) and drop the inline word-mark badge (CLAUDE.md, hard rule 1). Built in the rename PR, stacked on Phase 2 | Sahil signs off the rename PR; Sunny updates `BRAND_GUIDELINES.md` | Before the first new page goes live |
| Founders' photos, bios, LinkedIn and X links (Raunaq's LinkedIn received 28 Nov) | Anil, Raunaq | Week 3 |
| Disclaimer: Sahil signed off Prefer's text as it stands (relayed by Prefer, 28 Nov). It goes live with the rename PR. Any later change needs his sign-off again | Sahil | Done |
| The words "recommendation(s)" in the live homepage and terms copy: rephrased in the rename PR, for Sahil to approve with it | Sahil | With the rename PR |
| Approval to name competitors other than Kite MCP and Dhan MCP on /compare and /best | Anil, Raunaq, Sahil | Before the first comparison |

## Starting a session

Open Claude Code in this folder and paste:

```
Read CLAUDE.md, then docs/site-build-plan.md and docs/starter-code.md.
Do Phase 1 from docs/site-build-plan.md on a new branch named astro-foundation.
Work through the tasks in order. Check every "Done when" item yourself and show the command output as evidence.
Stay inside Phase 1. Never push, merge or deploy unless I say so. If the plan is wrong or unclear, stop and ask instead of guessing.
When Phase 1 is done, stop and give me: what changed, the checks you ran and their results,
what still needs the Netlify deploy preview to verify, and the pull request description.
```

For later phases: "Read CLAUDE.md and docs/site-build-plan.md, then do Phase N. Same rules."
