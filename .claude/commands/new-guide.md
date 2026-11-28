---
description: Start a guide (a connect-your-AI guide or an explainer) as a draft in src/content/guides/
argument-hint: <slug> <group> <what the guide answers, plus Prefer's title, description and FAQ questions if you have them>
---

Start a new guide for slash.markets from: $ARGUMENTS

Read `CLAUDE.md`, `.claude/rules/content-model.md` and `.claude/rules/compliance.md` first. Prefer supplies the title, description, H1 and FAQ questions. Use the ones in the arguments; if any are missing, ask for them instead of inventing them.

## 1. The file

- `src/content/guides/<slug>.md`. The slug is the file name: 3 to 6 lowercase words joined by hyphens, with no year. It becomes `/guides/<slug>`.
- Use `.mdx` only if the guide states a product fact, so it can use `<Fact>` (see below). In `.mdx`, escape `{` and `}` in prose as `\{` and `\}`.

## 2. The frontmatter

Copy this, fill every field, and delete the optional lines you don't use. Keep `title`, `seoTitle`, `description` and `answer` in double quotes on one line: the build checks it.

```yaml
---
title: ""           # the H1, up to 70 characters. Over 60 needs a seoTitle
seoTitle: ""        # optional: the <title>, up to 60 characters
description: ""     # the meta description, 70 to 160 characters
answer: ""          # 80 to 320 characters: two plain lines that answer the page's question. Shown under the H1, and in llms.txt and RSS
publishedAt: 2026-12-02   # the go-live date
updatedAt: 2026-12-09     # optional: only for real content changes
author: raunaq      # raunaq or markets-team (src/content/authors.json)
group: connect-your-ai    # connect-your-ai, options-data, mcx or methods
useCase: option-chain     # optional: option-chain, alerts, pre-market-brief, python or check-my-study
checkedOn: 2026-11-28     # optional: when you checked other products' facts. Shows "Facts checked on"
sources:            # optional: every competitor fact needs a source link
  - name: ""
    url: ""
    note: ""        # optional: what the source supports, and when you read it
faqs:               # up to 8. q ends with "?"; a is 40 to 500 characters
  - q: ""
    a: ""
draft: true         # stays true until Sahil signs off
---
```

## 3. The body

- No `#` heading: the template renders the H1. Start at `##`; the `##` headings become the contents box. Question-shaped headings work well, each opening with a one-sentence answer.
- Show real prompts and outputs in fenced blocks, with a caption line under the output:

  ````md
  ```prompt
  Show me where call open interest is building for this expiry.
  ```

  ```output
  The largest call build-up is at 26,500.
  ```

  Sample data, 12 Nov 2026.
  ````

- Setup blocks (JSON, commands) go in fenced code blocks. They scroll sideways on phones.
- Product facts: never type the data delay, markets, prices or integration status. In `.mdx`, write `<Fact name="data.delayMinutes" />` (no import needed). Other names: `data.exchanges`, `access.price`, `company.emails.hello` (add `link` for a mailto link). In `.md`, describe the feature without a number that can change.
- Links: link at least one live core page, and related guides that exist. Check `src/data/pages.ts`: link only pages whose status is `live`, or published entries. A link to anything else fails the URL gate in production. The breadcrumb links the hub for you.

## 4. Compliance

- Write the name as `slash.markets`, lowercase, even at the start of a sentence. Never "/markets", "Slash" or "Slash Markets".
- Banned phrases fail the build (list in `compliance.md`): watch for "target price" (write "the second trigger"), "buy call" (write "buy a call option") and "guaranteed". The single words "tips", "signals" and "recommendation(s)" raise a warning: write "analysis" instead.
- No forecasts and no returns. Examples use sample or past data, dated. Never show a real user's name, account, trades or P&L.
- Say slash.markets places no orders and has read-only access wherever a reader could wonder. Alerts "can be delayed".
- Mark integrations that aren't live as "coming", or leave them out (`src/data/facts.json`). The build flags a sentence that names slash.markets with a coming integration.
- Name only competitors the slash.markets team approved (Kite MCP and Dhan MCP so far). Say where they do better, and give each fact a source and the date you checked it.
- No em dashes.

## 5. Check and stop

1. `npm run check`, then `SHOW_DRAFTS=true npm run build`. Both must pass. Open `/guides/<slug>` with `npm run dev` or in the deploy preview, at 1440, 390 and 320 px.
2. `npm run build` (production) must pass, without the draft.
3. Report the file, the build results and anything you couldn't fill. Don't commit, push or open a pull request unless the person you work for asks.

Going live, later: Sahil reviews the preview, then the same pull request adds `signoff: { by: "Sahil", on: <date> }` and sets `draft: false`. The `/guides` hub must be live first.
