---
description: Start a comparison, review, pricing or alternatives page as a draft in src/content/compare/
argument-hint: <slug> <the products and the question, plus Prefer's title, description and FAQ questions if you have them>
---

Start a new comparison for slash.markets from: $ARGUMENTS

Read `CLAUDE.md`, `.claude/rules/content-model.md` and `.claude/rules/compliance.md` first. Prefer supplies the title, description, H1 and FAQ questions; ask for any that are missing.

**Approval first.** Name only competitors the slash.markets team approved (Kite MCP and Dhan MCP so far). Sahil's sign-off on the page records the approval.

## 1. The file

`src/content/compare/<slug>.md` (3 to 6 lowercase words with hyphens, no year), served at `/compare/<slug>`.

## 2. The frontmatter

Keep `title`, `seoTitle`, `description` and `answer` in double quotes on one line.

```yaml
---
title: ""           # the H1, up to 70 characters. Over 60 needs a seoTitle
seoTitle: ""        # optional: the <title>, up to 60 characters
description: ""     # 70 to 160 characters
answer: ""          # 80 to 320 characters: the plain verdict, by who each product suits
publishedAt: 2026-12-02
author: raunaq      # raunaq or markets-team
reviewedOn: 2026-11-28    # the date you checked every price and feature. Shows "Reviewed on"
products:           # at least 1; shown near the top and in the ItemList data
  - name: ""
    url: ""         # the product's official page
  - name: "slash.markets"
    ours: true      # our own product: no url needed
faqs:
  - q: ""
    a: ""
draft: true
---
```

## 3. The body

- If slash.markets is compared, say in the first lines that we make it.
- Compare on what traders decide on: what each does, price, limits, who it suits. A table early helps.
- Be fair: state where each other product is better. Every competitor fact links its official source.
- No Review or AggregateRating markup, and no star ratings.

## 4. Compliance and checks

Follow section 4 and section 5 of `.claude/commands/new-guide.md`. Then run `npm run check`, `SHOW_DRAFTS=true npm run build` and `npm run build`, check `/compare/<slug>` at 1440, 390 and 320 px, and report. Don't commit or push unless asked. The `/compare` hub must be live before the first comparison goes live.
