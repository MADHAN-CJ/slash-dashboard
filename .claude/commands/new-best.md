---
description: Start a best list (ranked products, never securities) as a draft in src/content/best/
argument-hint: <slug> <the job the list ranks tools for, plus Prefer's title, description and FAQ questions if you have them>
---

Start a new best list for slash.markets from: $ARGUMENTS

Read `CLAUDE.md`, `.claude/rules/content-model.md` and `.claude/rules/compliance.md` first. Prefer supplies the title, description, H1 and FAQ questions; ask for any that are missing.

**Products only.** Best lists rank products by how well they do one job, never stocks or other securities. Name only competitors the slash.markets team approved (Kite MCP and Dhan MCP so far); anything else waits for their approval.

## 1. The file

`src/content/best/<slug>.md` (3 to 6 lowercase words with hyphens, no year), served at `/best/<slug>`. Use `.mdx` only for `<Fact>`.

## 2. The frontmatter

Keep `title`, `seoTitle`, `description` and `answer` in double quotes on one line.

```yaml
---
title: ""           # the H1, up to 70 characters. Over 60 needs a seoTitle
seoTitle: ""        # optional: the <title>, up to 60 characters
description: ""     # 70 to 160 characters
answer: ""          # 80 to 320 characters: which tool suits which trader, in two plain lines
publishedAt: 2026-12-02
author: raunaq      # raunaq or markets-team
reviewedOn: 2026-11-28    # the date you checked every price and feature. Shows "Reviewed on"
items:              # at least 3, in ranked order. summary is up to 200 characters
  - name: ""
    url: ""         # the product's official page
    summary: ""
  - name: "slash.markets"
    ours: true      # our own product: no url needed, and the page marks it "We make this"
    summary: ""
faqs:
  - q: ""
    a: ""
draft: true
---
```

## 3. The body

- Start with how the tools were judged, then one `##` section per product: price, what it does well, its limits, who it suits.
- When slash.markets is in the list, say in the first lines that we make it, and say plainly where other tools do better.
- Every price and feature links its official source. Re-check them all before publishing and update `reviewedOn`.
- No Review or AggregateRating markup, and no star ratings. The template adds the ItemList data from `items`.
- Product facts about slash.markets come from `<Fact>` (in `.mdx`) or are described without numbers that can change.

## 4. Compliance and checks

Follow section 4 and section 5 of `.claude/commands/new-guide.md`: the name `slash.markets`, banned phrases and warning words, no returns or forecasts, coming integrations, no em dashes. Then run `npm run check`, `SHOW_DRAFTS=true npm run build` and `npm run build`, check `/best/<slug>` at 1440, 390 and 320 px, and report. Don't commit or push unless asked. The `/best` hub must be live before the first list goes live.
