---
description: Start a rules page (market rules and facts, checked against an official source) as a draft in src/content/rules/
argument-hint: <slug> <the rule or fact, plus Prefer's title, description and FAQ questions if you have them>
---

Start a new rules page for slash.markets from: $ARGUMENTS

Read `CLAUDE.md`, `.claude/rules/content-model.md` and `.claude/rules/compliance.md` first. Prefer supplies the title, description, H1 and FAQ questions; ask for any that are missing.

Rules pages state facts (expiry days, lot sizes, trading hours, margins, taxes) exactly as the official source does, with the date you checked. They never predict prices or say what to trade.

## 1. The file

`src/content/rules/<slug>.md` (3 to 6 lowercase words with hyphens, no year: put the year in the title), served at `/rules/<slug>`.

## 2. The frontmatter

Keep `title`, `seoTitle`, `description` and `answer` in double quotes on one line.

```yaml
---
title: ""           # the H1, up to 70 characters. Over 60 needs a seoTitle
seoTitle: ""        # optional: the <title>, up to 60 characters
description: ""     # 70 to 160 characters
answer: ""          # 80 to 320 characters: the rule itself, plainly, as of checkedOn
publishedAt: 2026-12-02
author: raunaq      # raunaq or markets-team
checkedOn: 2026-11-28     # when you last checked the facts against the source. Shown on the page and the /rules hub
sources:            # at least 1 from nseindia.com, bseindia.com, mcxindia.com or sebi.gov.in (the build checks)
  - name: ""        # e.g. the circular's title and number
    url: ""         # the exact page or circular you checked
    note: ""        # optional: what it supports
faqs:
  - q: ""
    a: ""
draft: true
---
```

## 3. The body

- Lead with the current rule and the date it applies from. Use a table when there are several contracts or dates.
- Quote numbers exactly as the source gives them, and link the circular. When a rule is changing, give both dates.
- Examples use past data, dated.

## 4. Staying current

The build warns when `checkedOn` is more than 60 days old. Re-check against the source, update `checkedOn`, and change `updatedAt` only if the content changed. When SEBI, NSE, BSE or MCX change a rule, update the affected pages before new work.

## 5. Compliance and checks

Follow section 4 and section 5 of `.claude/commands/new-guide.md`. Then run `npm run check`, `SHOW_DRAFTS=true npm run build` and `npm run build`, check `/rules/<slug>` at 1440, 390 and 320 px, and report. Don't commit or push unless asked. The `/rules` hub must be live before the first rules page goes live.
