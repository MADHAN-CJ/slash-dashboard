---
paths:
  - "scripts/**"
  - ".github/**"
  - "package.json"
  - "netlify.toml"
  - "astro.config.mjs"
---

# Quality gates, CI and budgets

Every rule that a machine can check is checked on every build. A rule that lives only in a document gets broken.

## How it runs

- **The build runs the gates.** `npm run build` runs `astro build`, then `node scripts/gates/run.mjs` on `dist/`. Netlify runs the same command, so a deploy fails exactly where a local build fails.
- **Real HTML parsing.** Gates parse HTML with `cheerio`, never with regular expressions.
- **Errors and warnings.** Errors fail the build. Warnings print, and their count is compared with `quality/baseline.json`.
- **Every gate has tests.** Each has a passing and a failing HTML fixture under `scripts/gates/__tests__/`, run by `npm run test`.

## Gates

| Gate | Checks | Severity |
|---|---|---|
| `urls` | Every built page is in the registry or a collection route, and vice versa. Slugs are lowercase with hyphens. Internal links have no trailing slash, no `.html` and no dead target. No link points at a redirected URL. Every URL segment has a page. Every `_redirects` target exists | error |
| `meta` | Exactly one H1. Title and description present and within limits. The built title, description and H1 match the registry or frontmatter exactly. Canonical is absolute and self-referencing, with no trailing slash. `noindex` pages have no canonical. `og:url` equals the canonical. The `og:image` file exists. `<html lang="en">` | error |
| `schema` | Exactly one `ld+json` block. It parses. Exactly one Organization, with `@id` `https://slash.markets/#organization`. A WebSite node. No `@id` reference without a matching node. The node types each page kind requires (see `seo-aeo.md`) | error |
| `sitemap` | Every indexable page is in `/sitemap.xml`. No draft or `noindex` page is. Every sitemap URL exists in `dist/` | error |
| `compliance` | The banned phrases in `compliance.md`, unless allowed in `compliance/allow.json`. A `/disclaimer` link on every page (once `/disclaimer` is live). A "coming" integration named without "coming" or "soon" in the same sentence (error on core pages, warning in articles). Placeholder text in production (`TODO`, `TBD`, `Lorem`, `[copy]`) | error |
| `compliance-words` | The single words "tips", "signals" and "recommendation(s)" | warning |
| `facts` | Numbers that must match `facts.json` (the data delay) wherever they appear. `llms.txt` uses the current description | error |
| `style` | No em dashes in `src/` (excluding vendored or licensed text) | error |
| `freshness` | A rules page whose `checkedOn` is more than 60 days old | warning |
| `budgets` | See below | error |
| `production-only` | In the production context: no `draft` registry page and no draft entry in `dist/` | error |

The sign-off and SEO-limit rules are also enforced earlier, by the schemas in `src/content.config.ts` and by the checks at the top of `src/data/pages.ts`.

## Budgets (per page, first-party code only)

- **JavaScript:**
  - content pages, hubs and core pages: 15 KB gzipped at most;
  - `/tools` pages: 60 KB at most;
  - the homepage's current legacy scripts are exempt until the new Home replaces them.
- **CSS:** 30 KB gzipped at most. HTML: 150 KB raw at most.
- **Images:** no new image in `dist/` over 200 KB.
- **Lighthouse (mobile)**, measured on `/`, `/guides`, one guide, one use case and `/faq`:
  - LCP under 2.5 s, CLS under 0.1, TBT under 200 ms;
  - Accessibility 95 or more; SEO 100.

## The brief's sign-off checklist: what checks each item

| # | Checklist item | Checked by |
|---|---|---|
| 1 | H1, SEO title and meta description match what Prefer supplied | `meta` gate |
| 2 | The opening two lines say what the page is or does | review (articles must have an `answer`) |
| 3 | "/markets" written with the slash; the one-line description used where it fits | review (the `facts` gate checks the description in llms.txt) |
| 4 | Real prompts and outputs, sample or past data, dated | schema (`prompts` need a `dataDate`) plus review |
| 5 | No banned words or claims | `compliance` and `compliance-words` gates plus review |
| 6 | Nothing claimed that is not live; "coming" items marked | `compliance` gate plus review |
| 7 | Text in the HTML the server sends | static build plus the `meta` gate (H1 in the HTML) |
| 8 | Structured data in place and valid | `schema` gate, plus the Rich Results Test on new page types |
| 9 | Canonical, social card, clean URL, in sitemap.xml | `meta`, `urls` and `sitemap` gates |
| 10 | Linked from the menu or footer, and links to /disclaimer | registry-driven nav plus the `compliance` gate |
| 11 | Works at phone width with no sideways scrolling, and loads fast | Playwright plus Lighthouse CI |
| 12 | Sahil's sign-off recorded | schema and registry checks |

## CI: `.github/workflows/ci.yml`, on every pull request and on `main`

1. `npm ci`
2. `npm run check`, then `prettier --check .` and `eslint .` (with `eslint-plugin-astro`)
3. `npm run test`: unit tests for `src/lib/` and the gate fixtures
4. `npm run build`: the production build plus every gate. Then `SHOW_DRAFTS=true npm run build` to check that drafts build too
5. `npm run test:e2e`: Playwright against `astro preview`, at 1440, 390 and 320 px. It checks:
   - no horizontal overflow and no console errors;
   - no serious or critical axe violations;
   - the waitlist form validates an empty and a malformed email without sending anything.
6. Lighthouse CI on the five pages above, using the budgets.

**Branch protection on `main`** (Madhan sets it): pull requests only, the CI checks above must pass, and one approving review.

## Netlify (`netlify.toml`)

- **Build:** command `npm run build`, publish directory `dist`. Node comes from `.nvmrc` (24).
- **Per-context environment variables:**
  - `[context.deploy-preview.environment]` sets `SHOW_DRAFTS = "true"`.
  - Only `[context.production.environment]` sets `PUBLIC_GA4_ID` and the verification IDs.
- **Headers:**
  - `/_astro/*`: `Cache-Control: public, max-age=31536000, immutable`.
  - `/assets/*`: one day (legacy files without hashes in their names).
  - `/brand/*` and `/brand-guidelines/*`: `X-Robots-Tag: noindex`.
  - Every path: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()` and `X-Frame-Options: DENY`.
  - Netlify already sends HSTS.
- **Delete `[build.processing] skip_processing`** when moving to Astro.
- **Deploy previews** must send `X-Robots-Tag: noindex` (Netlify's default). Check it on the first preview.

## Warning ratchet

- `quality/baseline.json` stores the warning count per gate.
- CI fails if any count rises.
- When you fix warnings, lower the baseline in the same pull request.
