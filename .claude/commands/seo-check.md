---
description: Check a page or article against the SEO, structured data and sign-off checklist, and report what fails
argument-hint: <URL path or content file, e.g. /guides/zerodha-kite-mcp>
---

Check this page against the slash.markets checklist: $ARGUMENTS

Read `.claude/rules/seo-aeo.md` and the sign-off checklist in `.claude/rules/quality-gates.md` first. This is a review: report findings, and change nothing unless asked.

1. **Build it.** Run `npm run check`, then `SHOW_DRAFTS=true npm run build` (drafts show) and `npm run build` (production). Note every gate error and warning that mentions this page. A draft should be absent from the production build.
2. **Read the built HTML** in `dist/` (`dist/<path>.html`), not the source, because that's what engines read.
3. **Check each item and mark it pass or fail, with the fix:**
   1. `<title>` up to 60 characters, meta description 70 to 160, exactly one H1. They match what Prefer supplied (the registry in `src/data/pages.ts`, or the entry's frontmatter).
   2. The first two lines under the H1 answer the page's question (the `answer` field for articles).
   3. The name is written `slash.markets` everywhere: title, description, H1, body, alt text, structured data. Note any "/markets" coming from `SITE.name` (fixed by the rename pull request).
   4. Prompts and outputs are real, use sample or past data, and carry a date caption.
   5. No banned phrases or claims (`.claude/rules/compliance.md`), no forecasts, no returns.
   6. Nothing is claimed that isn't live; coming integrations are marked "coming" (`src/data/facts.json`).
   7. All the text is in the server-rendered HTML, and the page ships no client JavaScript beyond analytics.
   8. One JSON-LD block with the right nodes for the page kind: Article (with the author and the publisher), BreadcrumbList, FAQPage when there are questions, ItemList for best lists and comparisons, CollectionPage for hubs. Every FAQ question in the markup appears on the page. For a new page type, suggest running Google's Rich Results Test on the deploy preview.
   9. The canonical is absolute with no trailing slash; `og:url` matches it; the page is in `sitemap.xml` once signed off (and absent while a draft).
   10. It links up to its hub, to at least one live core page and to related articles, and the footer links `/disclaimer`. Anchor text names the target.
   11. Works at 1440, 390 and 320 px with no sideways scrolling: check on the deploy preview or with `npm run dev`.
   12. Sahil's sign-off is recorded (`signoff` in the frontmatter, or in the registry) before it goes live.
4. **Report** a short table of the 12 items with pass or fail, then the fixes in order of importance.
