---
paths:
  - "src/**/*.astro"
  - "src/styles/**"
  - "src/components/**"
  - "src/layouts/**"
  - "public/**"
---

# Design system: how slash.markets looks and how pages are built

## Sources of truth, in order

1. **The live homepage** (ported to `src/pages/index.astro` in Phase 1). Its `:root` tokens and components are the current design.
2. **Sunny's designs** for the shared template and the new pages, as they arrive.
3. **`BRAND_GUIDELINES.md`** for typography, colour, components, imagery, motion and voice.
   - **Caveat:** its "Where to edit" table and several components (watch alerts, setup tabs, FAQ footer, floating nav, dithered videos) describe the previous homepage. Those files now sit in `design/legacy-v1/` and are not deployed.
   - Where the guide and the live homepage disagree, the homepage wins.
   - **Naming beats both.** CLAUDE.md hard rule 1 overrides the guide's "Identity and inline /markets" section and the homepage's inline badge: text always says slash.markets.
   - Sunny updates the guide in Phase 4.

Preserve the style. Do not introduce a dashboard look, a dark terminal theme, a blue or purple SaaS gradient, stock photos of trading desks, or a grid of identical feature cards.

## Tokens (from the homepage `:root`)

| Token | Value | Use |
|---|---|---|
| `--ink` | `#20251b` | body text |
| `--head` | `#161816` | headings |
| `--muted` | `#62675f` | secondary text |
| `--line` | `#e4e7dc` | borders |
| `--soft` | `#fbfbf8` | soft panels |
| `--warm` | `#f7f6f2` | warm surfaces, popups |
| `--btn` | `#171a17` | primary button |
| `--yellow` | `#f6d64d` | selected states, user prompts |
| `--yellow-ink` | `#c9a514` | lines drawn on charts |
| `--up` / `--down` | `#3f8f6b` / `#cf5a4b` | chart candles only |

New pages read these from `src/styles/tokens.css`, lifted unchanged from the homepage in Phase 2 (`Base.astro` imports it). Never invent new colours. Pastels belong to imagery and existing feature surfaces, never body text.

## Type

- **Exactly three families**, self-hosted through Astro's fonts API (`fontProviders.local()` in `astro.config.mjs`):
  - Libre Baskerville 500 (`--font-serif`) for headlines;
  - Onest 400 to 600 (`--font-sans`) for body and UI;
  - Departure Mono 400 (`--font-mono`) only inside terminal and code content.
- **Loading.** Add `<Font cssVariable="--font-serif" preload />` and the same for `--font-sans` in the layout head.
- **Google Sans** belongs to the Pixel study in `/brand/` only.
- **Sizes and spacing** follow the guide:
  - Hero: `clamp(32px, 4.2vw, 64px)`.
  - Body: `clamp(16px, 1.5vw, 19px)`, line height 1.7.
  - Buttons: 16px, weight 400.
  - Descriptions: `text-wrap: pretty`.

## Layout

- **Content width.** The homepage uses `max-width: 1280px`; the guide says 1360px. Sunny decides for the shared template (open item).
- **Gutters:** `clamp(24px, 3.5vw, 48px)` on desktop, 16 to 24px on mobile.
- **Breakpoints:** reuse the existing 680, 900 and 980px. No new breakpoint system.
- **Section gaps:** 80 to 112px on desktop, 48 to 64px on mobile.

## Components to reuse

- **Primary button.** `.button`: a pill (`border-radius: 999px`), dark fill, Onest 16px/400, with the Tabler arrow-up-right icon. One main action per section.
- **The word mark is visual only.** "/markets" appears only as the logo and in images (`public/assets/icons/`). Never set it as text in prose, headings, buttons or alt text. Write slash.markets as plain text instead (CLAUDE.md, hard rule 1). The homepage's inline badge (`.markets-wordmark`) predates this rule: remove it when that copy is renamed, and don't use it on new pages.
- **Glass surfaces:** 74% fill, `backdrop-filter: blur(8px) saturate(1.1)`, a subtle full border. Never a coloured side border.
- **Corners:**
  - buttons and pills fully rounded;
  - cards 12 to 24px;
  - chat and chart cards about 14px;
  - terminals square.
- **Icons:** Tabler for interface icons. Brand marks come from `public/assets/icons/`. No emoji, no hand-drawn substitutes.
- **Prompt and output blocks** (built in `src/layouts/Article.astro`):
  - `pre[data-language="prompt"]` is styled like the yellow user bubble, with the asymmetric corner;
  - `pre[data-language="output"]` sits on the warm surface;
  - both wrap, while code and setup blocks scroll sideways inside themselves;
  - the date caption sits below.
  - Set Shiki to a light theme (`markdown.shikiConfig.theme: "github-light"`) so code blocks match the light brand.

## JavaScript

- **No JavaScript by default.** Content pages, hubs and core pages ship no client scripts apart from analytics.
- **Homepage scripts.** The current homepage's scripts stay inline and unchanged until Sunny's new Home replaces the page.
- **New interaction** (mobile menu, popups) is a small vanilla `<script>` in its component.
  - No React, Vue or Svelte.
  - No WebGL in the shared header or footer.
- **Motion.**
  - Respect `prefers-reduced-motion`: show the finished state without needing a replay.
  - Pause animation when it is offscreen or the tab is hidden.

## Astro 7 gotchas (all confirmed on 7.4.13, 25 Nov 2026)

- **Whitespace.** Keep `compressHTML: true` in the config. Astro 7's default (`"jsx"`) drops spaces between inline elements: the homepage's "Nasdaq 5m 15m" became "Nasdaq5m15m".
- **Porting legacy CSS and JS.** Use `<style is:inline>` and `<script is:inline>`. Astro's scoped styles do not reach elements that scripts create at runtime (the homepage draws its charts with JavaScript). It would also bundle the scripts differently.
- **Strict compiler.** Astro 7's Rust compiler rejects unclosed tags and invalid nesting, such as a `<div>` inside a `<p>`. Write valid HTML.
- **Markdown processor.** Sätteri is now the default, and it adds heading ids itself. Remark and rehype plugins need `@astrojs/markdown-remark`, so avoid them unless a feature really needs one.

## Images

- **New images** go through `astro:assets` (`<Image>` and `<Picture>`):
  - WebP or AVIF, with explicit width and height;
  - lazy-loaded below the fold;
  - descriptive file names and alt text.
- **Legacy images.** Homepage images stay in `public/assets/` at their current paths until the new Home lands.
- **Art direction:** soft pastel surfaces, organic curves, gentle light, quiet text areas. Reuse approved WebP assets rather than generating new art.

## Every visual change is checked

- **Widths:** 1440, 390 and 320 px. No horizontal scroll, no edge-stuck cards, no clipped text.
- **Interaction:** visible focus, keyboard navigation, popup dismissal with focus returning to the trigger, and reduced motion.
- **Console:** no errors and no missing assets.
