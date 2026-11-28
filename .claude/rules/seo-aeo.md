---
paths:
  - "src/pages/**"
  - "src/layouts/**"
  - "src/components/seo/**"
  - "src/lib/graph.ts"
  - "src/data/pages.ts"
---

# SEO and AI-search (AEO) rules

Two audiences read every page: people, and AI engines (ChatGPT, Gemini, Perplexity, Claude, Google AI Overviews). Many AI crawlers do not run JavaScript, so what they need must be in the HTML the server sends. Astro builds static HTML, so this holds as long as nobody renders text with client-side code.

## Head tags: `src/components/seo/Seo.astro`

Every page renders `<Seo>` exactly once. Pages never write their own title, canonical, Open Graph or JSON-LD tags.

- **`<title>` and meta description.** Use the registry or frontmatter values exactly. Title up to 60 characters; description 70 to 160.
- **Canonical.** An absolute `https://slash.markets/...` URL with no trailing slash, built from `Astro.site`.
  - `noindex` pages get `noindex, nofollow` and no canonical.
- **Open Graph and Twitter.**
  - `og:url` equals the canonical.
  - `og:image` is absolute and the file must exist. The default is `/og/default.jpg`, a self-hosted copy of today's card, until Sunny's design arrives. Per-page images come in Phase 4.
  - `og:site_name` is "slash.markets", `og:locale` is `en_IN`, and the card is `summary_large_image`.
- **Verification tags.** Rendered only when `PUBLIC_GSC_VERIFICATION` or `PUBLIC_BING_VERIFICATION` is set (DNS verification also works).
- **Other.** An RSS `alternate` link to `/rss.xml`, and analytics (below).

## Structured data: `src/lib/graph.ts`

- **One block per page.** Each page has exactly one `<script type="application/ld+json">` holding one `@graph`, built only with the functions in `graph.ts` and written out with `serialize()`. `serialize()` escapes `<` so content can never break out of the tag.
- **Organization and WebSite** appear on every page:
  - `@id` `https://slash.markets/#organization` (Organization)
  - `@id` `https://slash.markets/#website` (WebSite)
  - Other nodes point at them by `@id`. Never create a second Organization node.
- **Node types per page:**
  - Home: SoftwareApplication.
  - FAQ and use-case pages: FAQPage.
  - Inner pages: BreadcrumbList.
  - Articles: Article, with author and publisher. A Person author has the `@id` `https://slash.markets/about#<id>` (the same node as the founder in the Organization), with `jobTitle` and `sameAs`. The team author is a reference to the Organization, never a second Organization node.
  - Hubs: CollectionPage.
  - Best lists and comparisons: ItemList.
  - FAQPage questions and answers must appear on the page as written. The `schema` gate checks it.
  - About: AboutPage, plus a Person node per founder.
- **Missing facts.** `legalName` stays out of the Organization until the company entity is confirmed in `facts.json`.
- **No Review or AggregateRating markup** for other companies' products.
- **Why FAQ markup at all.** Google shows FAQ rich results for very few sites and no longer shows HowTo. We mark FAQs up for AI engines and accuracy, not for search-result features.

## Sitemap, robots.txt, llms.txt, RSS

- **`/sitemap.xml`** (`src/pages/sitemap.xml.ts`) is built from the same registry and collections that build the pages.
  - Drafts and `noindex` pages never appear in it, even on deploy previews. The same goes for llms.txt and RSS.
  - `lastmod` comes from `updatedAt`, then `publishedAt`; rules pages use `checkedOn`.
- **`/robots.txt`** (`src/pages/robots.txt.ts`) allows everything and names the AI crawlers explicitly in their own allow groups.
  - It also points to the sitemap.
  - To hide a page, use `noindex`, never `Disallow`: a disallowed page can still be indexed, because crawlers cannot see its noindex.
- **`/brand/` and `/brand-guidelines/`** get `X-Robots-Tag: noindex` from `netlify.toml`.
- **`/llms.txt`** lists, in plain Markdown:
  - the one-line description;
  - the compliance line;
  - every live core page and use case;
  - every published article with its `answer`.
- **`/rss.xml`** is one feed for all four article hubs.

## Page furniture that AI engines quote

- **Answer first.** The opening two lines say plainly what the page is or does. For articles this is the `answer` field, rendered under the H1.
- **Real prompts and outputs**, dated, using sample or past data.
- **A FAQ block** with FAQPage schema where the page has questions.
- **Freshness dates.** "Checked on" for rules pages; "Reviewed on" for best lists and comparisons.
- **Navigation.** Breadcrumbs on every inner page, and links to the matching use case and related guides.
- **Consistent description.** The one-line description is used word for word wherever slash.markets is described in one sentence.
- **Consistent name.** Titles, descriptions, structured data, `og:site_name` and llms.txt write the name as slash.markets, never the "/markets" word mark (CLAUDE.md, hard rule 1). Engines learn the name we use most, and we want them to learn the one people can type.

## Internal links

- Use descriptive anchor text that names the target. Never "click here".
- Links use clean URLs: no trailing slash and no `.html`. The URL gate fails otherwise.
- Every article links:
  - up to its hub;
  - to at least one core page;
  - to related articles where they exist.

## Analytics

- **Google Analytics 4 from day 1, production only.**
  - `PUBLIC_GA4_ID` is set only for Netlify's production context, so deploy previews and local builds send nothing.
  - The tag loads `async`.
- **Events:**
  - `ai_referral`, with the source host, when a visit comes from an AI engine (chatgpt.com, perplexity.ai, claude.ai, gemini.google.com, copilot.microsoft.com).
  - `sign_up` (`method: "waitlist"`) when the waitlist form succeeds. Mark it as a key event in GA4.
- **No other trackers** without Sahil's OK. The privacy page lists everything collected.

## Search Console and Bing

- Prefer verifies both and submits `/sitemap.xml`.
- Prefer checks indexing as each page goes live, and requests indexing for new core pages.
