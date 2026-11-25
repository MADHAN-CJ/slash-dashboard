---
paths:
  - "src/content/**"
  - "src/content.config.ts"
  - "src/lib/**"
---

# Content model: collections, fields and how to write an entry

Content lives in `src/content/` as Markdown with YAML frontmatter. The schemas live in `src/content.config.ts`. They enforce the SEO limits, the required substance and the compliance sign-off, so a bad entry fails the build instead of going live.

## Collections

| Collection | Folder | URL | What goes in it | Required beyond the shared fields |
|---|---|---|---|---|
| `guides` | `src/content/guides/` | `/guides/<slug>` | Connect-your-AI guides and explainers | `group` (`connect-your-ai`, `options-data`, `mcx`, `methods`); optional `useCase` |
| `best` | `src/content/best/` | `/best/<slug>` | Best lists of products (never securities) | `reviewedOn`, `items` (at least 3: `name`, `url`, `summary` up to 200 characters, `ours`) |
| `rules` | `src/content/rules/` | `/rules/<slug>` | Market rules and facts | `checkedOn`, `sources` (at least 1 official source: NSE, BSE, MCX or SEBI) |
| `compare` | `src/content/compare/` | `/compare/<slug>` | Comparisons, reviews, pricing and alternatives pages | `reviewedOn`, `products` (`name`, `url`) |
| `useCases` | `src/content/use-cases/` | `/use-cases/<slug>` | The 5 day-one use cases | `seoTitle`, `order`, `problem` (the trader's words), `prompts` (2 to 3, each with `dataDate`), `faqs` (3 to 5) |
| `worksWith` | `src/content/works-with/` | `/works-with/<slug>` | Setup pages for live integrations | `integration` (its status in `facts.json` must be `live`) |
| `legal` | `src/content/legal/` | `/privacy`, `/terms`, `/disclaimer` | Legal text | `lastUpdated` |
| `faqs` | `src/content/faq.yaml` | `/faq` | The 12 to 15 site questions | `q` ends with "?"; `a` is 2 to 3 sentences |
| `authors` | `src/content/authors.json` | bylines | Authors | `name`, `type` (Person or Organization), `role` |

**Where the 90-article list maps**
- "Connect AI guide" and "Explainer" go to `guides`.
- "Best list" goes to `best`.
- "Rules" goes to `rules`.
- "Comparison" goes to `compare`.

## Shared article fields (`guides`, `best`, `rules`, `compare`)

| Field | Rule | Used for |
|---|---|---|
| `title` | up to 70 characters | the H1 |
| `seoTitle` | up to 60 characters, optional | the `<title>` when it differs from the H1 |
| `description` | 70 to 160 characters | the meta description |
| `answer` | 80 to 320 characters | the lead under the H1: two plain lines that answer the page's question. Also used in llms.txt and RSS |
| `publishedAt` | date | the go-live date |
| `updatedAt` | date, optional | only for real content changes, not typo fixes |
| `author` | an id from `authors.json` | byline and Article schema |
| `faqs` | up to 8 `{ q, a }` | FAQ block and FAQPage schema |
| `draft` | true or false | drafts render only on deploy previews |
| `signoff` | `{ by, on }` | Sahil's compliance sign-off. Required before `draft: false` |

## Writing an entry

- **Format.** Use `.md` by default. Use `.mdx` only when you need a component.
  - In `.mdx`, a `{` or `}` in prose breaks the build (it is read as code). Escape it as `\{` and `\}`, or keep that text in `.md`. We confirmed this on Astro 7.4.13.
- **Quote frontmatter text.** Put double quotes around `title`, `description` and `answer`. An unquoted value containing ": " (colon and space) breaks the YAML parser and fails the build. We confirmed this on Astro 7.4.13.
- **No `#` heading in the body.** The template renders the H1 from `title`. Start body headings at `##`; they become the table of contents.
- **Prompts and outputs** use fenced blocks with the languages `prompt` and `output`. Add a caption line with the data date underneath:

  ````md
  ```prompt
  Show me where call open interest is building for this expiry.
  ```

  ```output
  The largest call build-up is at 26,500.
  ```

  Sample data, 12 Nov 2026.
  ````

- **Images.**
  - Put them next to the entry or in `src/assets/`, so Astro optimises them.
  - Use descriptive file names (`nifty-oi-by-strike.webp`) and alt text that says what the image shows.
  - Screenshots show sample or past data, with the date.
- **Product facts.** Never type the data delay, prices, markets or integration status into an article.
  - In `.mdx`, use the `<Fact>` component (Phase 2).
  - In `.md`, describe the feature in words that carry no number that can change.
- **Year in titles.** Allowed ("in 2027"). Never in the slug.

## Drafts and sign-off (the publishing flow)

1. **Prefer drafts.** Prefer opens a pull request adding the entry with `draft: true`.
2. **Preview.** Netlify builds a deploy preview with `SHOW_DRAFTS=true`. The draft shows there with a "Draft" banner and `noindex`. Production never builds drafts.
3. **Review.** Prefer reviews against the sign-off checklist (`.claude/rules/quality-gates.md`), then Sahil reviews the preview.
4. **Sign-off.** In the same pull request, add `signoff: { by: "Sahil", on: 2026-12-02 }` and set `draft: false`. Prefer or Madhan merge it.

The build refuses `draft: false` without `signoff`.

## Rules pages stay current

- **`checkedOn`** is the date someone last checked the facts against the official source. Both the page and the /rules hub show it.
- **Staleness.** The build warns when a rules page's `checkedOn` is more than 60 days old. Re-check it, update `checkedOn`, and update `updatedAt` only if something changed.
- **When SEBI, NSE, BSE or MCX change a rule,** update the affected pages first, before new work.

## Fill-themselves rules

- **Hubs** list entries automatically. Never hand-edit a hub to add one.
- **Use-case links.** A guide with `useCase: option-chain` appears on `/use-cases/option-chain` automatically.
- **llms.txt, RSS and the sitemap** include every published entry automatically.

## Authors

- Until the byline policy is decided (open item in `docs/site-build-plan.md`), `author` is `markets-team`.
- Real people get an `authors.json` entry with their `sameAs` profile links.

## Adding a collection

Only together with:
- its hub page;
- a registry entry;
- a template;
- a schema;
- a line in the table above.
