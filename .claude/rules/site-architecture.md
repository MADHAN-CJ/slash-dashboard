---
paths:
  - "src/pages/**"
  - "src/data/pages.ts"
  - "src/content/**"
  - "public/_redirects"
  - "netlify.toml"
---

# Site architecture: URLs, pages and links

The page list comes from the site pages brief in the 90-day plan (the Claude Doc's "Site pages brief" tab), plus three additions agreed on 25 Nov 2026. This file is the single list of URLs. Change a URL here first.

## URL rules

- Lowercase words joined by hyphens. No trailing slash, no `.html`, no dates, no query strings.
- **Canonical form has no trailing slash:** `https://slash.markets/how-it-works`. The config enforces it with `trailingSlash: "never"` and `build.format: "file"`.
- Article URLs are flat under their hub: `/guides/<slug>`. Never nest by group or topic, so regrouping never changes a URL.
- **Slug = file name.** `src/content/rules/nifty-expiry-day.md` becomes `/rules/nifty-expiry-day`. Keep slugs to 3 to 6 words.
- Keep the year out of slugs so the URL survives next year's update. Put the year in the title.
- A live URL never changes without a 301 (see "Renaming a page").

## The pages (19, plus legal and system pages)

| # | URL | Page | Built from | Structured data (besides Organization and WebSite) | Nav |
|---|---|---|---|---|---|
| 1 | `/` | Home | `src/pages/index.astro` | WebPage, SoftwareApplication | logo |
| 2 | `/how-it-works` | How it works | page + registry | WebPage, BreadcrumbList | header |
| 3 | `/use-cases/option-chain` | Use case | `useCases` collection | WebPage, BreadcrumbList, FAQPage | via /use-cases |
| 4 | `/use-cases/alerts` | Use case | `useCases` | same as 3 | via /use-cases |
| 5 | `/use-cases/pre-market-brief` | Use case | `useCases` | same as 3 | via /use-cases |
| 6 | `/use-cases/python` | Use case | `useCases` | same as 3 | via /use-cases |
| 7 | `/use-cases/check-my-study` | Use case | `useCases` | same as 3 | via /use-cases |
| 8 | `/markets-covered` | Markets covered | page + `facts.json` | WebPage, BreadcrumbList | footer |
| 9 | `/works-with/claude` | Works with Claude | `worksWith` collection | WebPage, BreadcrumbList (+ FAQPage if it has FAQs) | via /works-with |
| 10 | `/security` | Security and data | page | WebPage, BreadcrumbList | header and footer |
| 11 | `/about` | About | page + `facts.json` | AboutPage, BreadcrumbList, Person (founders) | footer |
| 12 | `/faq` | FAQ | `faqs` collection | FAQPage, BreadcrumbList | header and footer |
| 13 | `/disclaimer` | Disclaimer | `legal` collection | WebPage, BreadcrumbList | footer, every page |
| 14 | `/guides` | Hub | `guides` collection | CollectionPage, BreadcrumbList | header and footer |
| 15 | `/best` | Hub | `best` collection | CollectionPage, BreadcrumbList | footer |
| 16 | `/rules` | Hub | `rules` collection | CollectionPage, BreadcrumbList | footer |
| 17 | `/compare` | Hub (added 25 Nov) | `compare` collection | CollectionPage, BreadcrumbList | footer |
| 18 | `/use-cases` | Index (added 25 Nov) | `useCases` collection | CollectionPage, BreadcrumbList | header |
| 19 | `/works-with` | Index (added 25 Nov) | `facts.json` integrations | CollectionPage, BreadcrumbList | footer |

**Also built**
- `/privacy` and `/terms` (`legal` collection).
- `/404` (noindex, no canonical).
- Machine files: `/sitemap.xml`, `/robots.txt`, `/llms.txt` and `/rss.xml`.

**Article URLs**
- `/guides/<slug>`: "Connect AI guide" and "Explainer" items from the 90-article list.
- `/best/<slug>`: "Best list" items.
- `/rules/<slug>`: "Rules" items.
- `/compare/<slug>`: "Comparison" items.

**Served as-is from `public/`, not built by Astro**
- `/brand-guidelines/` and `/brand/`.
- They stay live but hidden from search (a `X-Robots-Tag: noindex` header in `netlify.toml`).
- They never appear in the sitemap or in navigation.

**Reserved for later**
- `/tools/<slug>`: calculators, if the slash.markets team builds them. Interactive code is allowed there, within budget.
- Live-data pages: these wait until the data licence allows public display.

**Not on this site**
- No `/blog`, `/glossary` or `/learn`. The plan dropped the glossary; explainers in /guides carry the definitions.

## Hubs and links

- **Hubs fill themselves.** A hub lists its published articles automatically. Nobody edits a hub to add an article.
- **Hub content.** Every hub opens with a 2 to 3 line intro (from the registry), even before its first article.
  - `/guides` groups articles by `group`: connect your AI, options data, MCX, methods. Newest first within each group.
  - `/best` opens with a short note on how lists are put together and kept current.
  - `/rules` shows each page's "checked on" date.
- **Article links.** Every article links:
  - up to its hub, through the breadcrumb;
  - to at least one core page (its matching use case, or /how-it-works);
  - to related articles where they exist.
- **No dead-end URLs.** Every URL segment has a page. No URL may point at a parent path that returns 404.
- **Header and footer links** come from the registry's `nav` field, so every live core page can be reached from the menu or the footer. The footer always links /disclaimer, /privacy and /terms.

## The route registry (`src/data/pages.ts`)

- Every `.astro` page has one entry: `path`, `title`, `description`, `h1`, `nav`, `status` (planned, draft or live), `signoff` and an optional `noindex`.
- Prefer supplies `title`, `description` and `h1`. Copy them in exactly as given.
- **What each status does**
  - A `planned` page has no file yet.
  - A `draft` page exists only on pull-request branches. It renders on deploy previews and never ships to production.
  - A `live` page needs a `signoff`. The build fails if one is missing.
- Pages that were live before 25 Nov and were ported unchanged carry `signoff: { by: "carried over unchanged from the old site", on: "2026-11-25" }` until their next content change.

## Redirects

- **One file:** `public/_redirects`. Each rule gets a comment above it with the date and the reason.
- **Rules from the Astro move**
  - `/privacy.html` to `/privacy` (301)
  - `/terms.html` to `/terms` (301)
  - `/index.html` to `/` (301)
- **Check on the first deploy preview, then record the results here:**
  - What `/how-it-works/` (trailing slash) returns.
  - What `/privacy.html` returns. With `build.format: "file"`, the new page is itself built as `privacy.html`, so make sure the old URL ends on the clean one.
- **Acceptable results:** a 301 to the clean URL, or a 200 whose canonical tag points to the clean URL. Never a 404 for a URL that used to work.

## Renaming or removing a page

1. Add a 301 from the old URL to the new one in `public/_redirects`, with the date and the reason.
2. Update every internal link. The URL gate fails on links that point at redirected URLs.
3. Update the registry or the file name.
4. Tell Prefer, so Search Console gets the change.

## Adding a page

1. Add the registry entry with `status: "planned"`. Ask Prefer for its title, description and H1.
2. Build it on a branch as `draft` and review it on the deploy preview.
3. Get Sahil's sign-off, set `signoff` and `status: "live"`, then merge.
