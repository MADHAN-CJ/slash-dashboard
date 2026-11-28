# slash.markets website: working guide

> The governing document for every person and AI agent in this repo. `AGENTS.md` is a symlink to this file, so Claude Code, Codex, Cursor and others read the same rules. Edit this file only. Detail lives in `.claude/rules/`: read the matching rule before changing anything it covers.

## What this repo is

The marketing website for slash.markets, served at https://slash.markets. It is an Astro 7 static site on Netlify. Every page is server-rendered HTML. Articles are Markdown files added by pull request; there is no CMS. The product itself runs at https://app.slash.markets and is not in this repo.

**Status (28 Nov 2026):** Phase 1 (the Astro foundation) merged on 25 Nov in PR #1, but production still serves the old static site. Phase 2 (the article system) is not built: `src/content.config.ts` has only the `legal` collection, so no article can be published yet. `docs/site-build-plan.md` has the phases, dates and what is done. Parts of this guide describe the target state.

## What slash.markets is

- **One line** (draft until locked with Sahil; the live copy is `description` in `src/data/facts.json`): "slash.markets gives your AI live Indian market data, option chain analytics, charts and a Python sandbox, so it can answer any NSE, BSE or MCX question from real data and watch the market for you."
- **Audience:** Indian retail traders in index and stock options and MCX, often part-time and on a phone. India only, English only.
- **Main action on every page:** join the waitlist (closed beta, free for now).

## Hard rules

1. **Name: always "slash.markets" in text.** We want people to search for us the way they type the website.
   - Write it exactly `slash.markets`: lowercase, with the dot, even at the start of a sentence.
   - It applies to every word we write: page copy, titles, meta descriptions, H1s, FAQs, alt text, `og:site_name`, structured data, llms.txt, articles, docs, commit messages, pull requests, client documents and the prompts we track in Prefer.
   - "/markets" is the visual word mark only. It appears in the logo and in images, never as typed text. The logo's alt text is "slash.markets".
   - Never "Slash" or "Slash Markets": those are other companies.
   - This rule overrides the inline-badge guidance in `BRAND_GUIDELINES.md`. Copy that still writes /markets (the homepage, `src/config/site.ts`, `src/data/facts.json`, the titles in `src/data/pages.ts`, the legal pages and `llms.txt`) changes in one pull request with Sahil's sign-off. Never add a new one.
2. **Compliance (SEBI).** Research and education only. Never tips, buy or sell calls, signals, recommendations, targets, return or profit claims, win rates, backtest returns, "best stocks", "guaranteed" or "never miss a move". Rank products, never securities. No forecasts. Examples use sample or past data, dated, with no real user's name, trades or P&L. Say alerts "can be delayed". Every page links to /disclaimer. Full rules: `.claude/rules/compliance.md`.
3. **Only claim what is live today.** Anything not live yet (ChatGPT, Kite, WhatsApp, more markets) is marked "coming" or left out. Status lives in `src/data/facts.json`.
4. **Sign-off.** Nothing goes live without Sahil's compliance sign-off, recorded in the entry's `signoff` field (articles) or in `src/data/pages.ts` (pages). The build fails without it.
5. **Facts.** Never type a product fact (data delay, markets, integrations, price, company details) into a page or article. Read it from `src/data/facts.json`. Facts change only when Anil or Raunaq confirm them.
6. **Server-rendered text.** Every word a reader or an AI crawler needs is in the HTML the server sends. No JavaScript by default. Never `client:only`. Add interactive code only where a page needs interaction, within the budget in `.claude/rules/quality-gates.md`.
7. **SEO fields.** The titles, meta descriptions, H1s and FAQ questions Prefer supplies go in exactly as given. One H1 per page.
8. **One home per fact.** The domain and brand strings live in `src/config/site.ts`, routes in `src/data/pages.ts`, product facts in `src/data/facts.json`, and structured data in `src/lib/graph.ts`. Never hardcode `https://slash.markets` anywhere else.
9. **Design.** Preserve the slash.markets brand (`BRAND_GUIDELINES.md` and `.claude/rules/design-system.md`). Three typefaces only. Check 1440, 390 and 320 px wide: no sideways scrolling, no clipped text.
10. **Voice.** Speak to a trader. Short, concrete, plain sentences. Show real prompts and outputs rather than describing them. No em dashes. No jargon or inflated promises.
11. **Git.** Work on a branch and open a pull request. Never push to `main`. As an AI agent, never push, merge, deploy or change repository visibility unless the person you work for says so in this session. Netlify deploys `main`.
12. **Never commit** credentials, `.env` files, private research, conversation traces, deployment state or QA screenshots. Never name a real user anywhere.
13. **Tools.** Do not use the Superdesign app, CLI or website.

## Commands (from Phase 1)

| Command | What it does |
|---|---|
| `npm install` | Install dependencies (Node 24, pinned in `.nvmrc`) |
| `npm run dev` | Local dev server at http://localhost:4321 |
| `npm run build` | Build to `dist/`, then run every gate. Fails on any error |
| `SHOW_DRAFTS=true npm run build` | Build with drafts shown, the way deploy previews do |
| `npm run check` | Type check (`astro check`) |
| `npm run test` | Unit tests, including gate tests |
| `npm run test:e2e` | Browser checks at 1440, 390 and 320 px |

## Where things live (target layout)

```
CLAUDE.md                 this file (AGENTS.md links here)
.claude/rules/            detailed rules, one per topic
docs/site-build-plan.md   phases, dates, page tracker, open items
docs/starter-code.md      verified starting code for the Astro setup
BRAND_GUIDELINES.md       visual rules (see the caveat in design-system.md)
src/config/site.ts        domain, brand strings, site-wide constants
src/data/pages.ts         route registry for every .astro page
src/data/facts.json       product facts (Anil and Raunaq confirm)
src/content/              articles, use cases, legal pages, FAQ, authors
src/content.config.ts     collection schemas (SEO limits and sign-off live here)
src/lib/                  graph.ts (JSON-LD), facts.ts, content.ts
src/components/seo/       Seo.astro: every head tag
src/layouts/              Base, Page, Article, Hub
src/pages/                routes and endpoints (sitemap, robots, llms, rss)
public/                   files served as-is (homepage assets, /brand/, /brand-guidelines/)
scripts/gates/            build gates run after every build
design/legacy-v1/         the previous homepage's files, not deployed
ops/                      the waitlist's Google Apps Script backend
```

## Who does what

| Who | Owns |
|---|---|
| Prefer | SEO titles, descriptions, H1s and FAQ questions; the articles in /guides, /best, /rules and /compare; review of every page; Search Console and Bing |
| Sunny | Page designs and the shared template; `BRAND_GUIDELINES.md` |
| Anil, Raunaq | Product facts and page copy |
| Sahil | Compliance sign-off on every page and article |
| Madhan | Build and deploy; Netlify and GitHub settings |

Prefer or Madhan merge pull requests after review and sign-off.

## Read before you work

| If you are | Read first |
|---|---|
| Adding, moving or renaming a page or URL | `.claude/rules/site-architecture.md` |
| Writing or editing an article or a use case | `.claude/rules/content-model.md` and `.claude/rules/compliance.md` |
| Changing head tags, structured data, the sitemap, robots.txt or llms.txt | `.claude/rules/seo-aeo.md` |
| Making any visual change | `.claude/rules/design-system.md` and `BRAND_GUIDELINES.md` |
| Changing the build, CI, scripts or budgets | `.claude/rules/quality-gates.md` |
| Deciding what to do next | `docs/site-build-plan.md` |

## Before you open a pull request

1. `npm run build` and `npm run check` pass, with no new warnings.
2. You checked every changed page at 1440, 390 and 320 px, plus keyboard focus and reduced motion.
3. The PR lists the pages changed and links the Netlify deploy preview. Content PRs say who signed off.
