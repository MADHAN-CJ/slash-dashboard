# /markets website guidelines

This is the implementation guide for AI agents and people editing the current /markets website. The homepage is the visual source of truth. Preserve its style when adding sections; do not redesign it unless asked.

## Pages and source of truth

- `index.html`: current landing page, promoted from `/fresh/`.
- `brand-guidelines/index.html`: visual reference for these rules.
- `brand/index.html`: the original Pixel study and logo behaviour specimens. Its Google Sans fonts are specific to that study, not the landing-page font system.
- `fresh/index.html`: compatibility redirect only. Edit the root homepage instead.
- `archive/landing-v1/`: old homepage with its own CSS, JavaScript and font. Historical reference only. Do not copy its design into the current site.

These paths are relative to the website root. In the local working project that root is `dist/`; in the clean GitHub export it is the repository root.

The archive and `/fresh/` compatibility redirect exist in the local working project only. Both are deliberately excluded from the clean public export; its active pages are the homepage, brand guidelines and Pixel study.

## Design character

Warm, calm and capable. Editorial serif headlines, approachable sans-serif explanations, generous space and soft pastel artwork. Real trading actions are the story: read charts, draw levels, build tools and keep watch. The audience uses TradingView and wants AI that has real market data.

Keep the existing white page, ink text, yellow selections, warm glass surfaces and pastel illustrations. Do not introduce a new dashboard aesthetic, dark terminal theme, blue/purple SaaS gradient, stock-photo trading desk, or repeated generic feature-card grid.

## Typography

Use the existing self-hosted files in `assets/fonts/`. No new font requests or remote font imports.

| Role | Typeface | Size and weight |
| --- | --- | --- |
| Hero | Libre Baskerville | `clamp(32px, 4.2vw, 64px)`, 500; line-height 1.08; tracking -0.025em |
| Section headlines | Libre Baskerville | Usually 34–56px desktop, 29–42px mobile; 500; line-height 1.2–1.25; tracking about -0.04em |
| Body | Onest | `clamp(16px, 1.5vw, 19px)`, 400; line-height 1.7 |
| Buttons | Onest | 16px, 400; do not make heavier |
| Main chat/tool UI | Onest | 16px. Claude conversation text uses the existing serif treatment. Preserve the component's platform styles. |
| Terminal contents | Departure Mono | 16px, 400; only inside terminal content |
| Terminal chrome/headings | Onest | 16px, 500 |
| Supporting notes | Onest | Usually 14px; benchmark/savings footer notes stay 16px |

The landing page has exactly three font families: Libre Baskerville, Onest and Departure Mono. Preserve ligatures and kerning. Keep headings' intentional line breaks; use `text-wrap: pretty` for descriptions and avoid splitting meaningful phrases on mobile. Do not force long desktop copy onto one overflowing line on a phone.

## Colour

These are values already used by the homepage, not a request to recolour every existing component.

| Purpose | Value |
| --- | --- |
| Page | `#ffffff` |
| Primary ink | `#20251b` (hero uses `#161816`) |
| Secondary text | `#62675f` (hero uses `#60645f`) |
| Warm conversation/popup surface | `#f7f6f2` |
| Selected prompts and user messages | `#f6d64d` |
| Primary button | `#171a17`, white text |
| Quiet border | `#e4e7dc` |
| CTA base | `#f5f0d9` |
| Savings panel | `#f5f2f8` |
| Benchmark panel | `#f3f5ee` |

Mint, sky blue, blush pink, butter yellow and lavender belong mainly to imagery or existing feature surfaces. Use yellow for selected states and user questions. Do not use pastel colours for body text.

## Layout and spacing

- Main content width: 1360px maximum, centred.
- Desktop outer gutters: `clamp(24px, 3.5vw, 48px)`.
- Mobile outer gutters: 16–24px. A full-width card still needs an inset from the viewport.
- Most section gaps: 80–112px desktop, 48–64px mobile. Use the neighbouring section's existing pattern.
- The central serif statement intentionally has extra breathing room: padding 132px above and 224px below on desktop, 80px above and 128px below on mobile. The preceding section adds to the visible upper gap.
- Hero split: copy 40%, visual 60%; actual conversation width capped at 500px.
- Keep chat height stable when prompts switch. Do not recreate the conversation as it travels between sections.
- Comparison panels use a two-column layout on desktop and stack on phones. Preserve their existing order and responsive rules.
- Reuse the actual component breakpoints: 680px for most small-screen layouts, 900px for navigation and 980px for intermediate layouts. Do not replace them with a new breakpoint system.

## Identity and inline /markets

- Use `assets/icons/markets-logomark-mono.svg` for the pixel logomark. Keep its proportions, sharp pixel edges and original orientation. No rotation.
- Use the existing yellow avatar treatment where appropriate. The backend terminal uses the monochrome mark without a surrounding container.
- Use `assets/icons/markets-slash.svg` for the slash in the wordmark. It is 0.8em tall, not a typed replacement or a recreated drawing.
- In descriptive prose, always put /markets inside the inline badge. Inherit the local text colour; its 10%-ink fill must blend with the current surface. Keep the natural line height.
- Do not add badges around every heading, navigation label or logo: the prose rule is specific to descriptions.

```html
<span class="markets-wordmark markets-label"><span class="markets-slash">/</span>markets</span>
```

The base rules live in `styles.css`: inline display, 2px 6px padding, 4px radius, `color-mix(in srgb, currentColor 10%, transparent)` and `white-space: nowrap`.

## Components

### Primary action

Reuse `.button.button-primary`: Onest 16px/400, 50px minimum height, 999px radius, dark fill and a Tabler arrow-up-right icon. One main action per section. Copy is “Connect your AI”. The final signup destination is intentionally not wired yet; do not invent a signup URL.

### Prompt pills

Reuse `.example-choice`. Fully rounded, 16px text and a plus icon on the right. Selected fill is `#f6d64d`. Hover/focus changes the plus to the existing up-arrow. Keep prompts short and preserve the current accessible pressed-state behaviour.

### Glass

Use a 74% surface fill, not opacity on the whole element. Text and icons remain fully opaque.

```css
background: rgb(247 246 242 / .74);
backdrop-filter: blur(8px) saturate(1.1);
-webkit-backdrop-filter: blur(8px) saturate(1.1);
```

Use the existing platform-specific or white 74% fill where the component already calls for it. Navigation, chat, chart cards, watch chat and phone notifications share this soft 8px blur. Do not increase it to a heavy frosted overlay. Use a subtle full border and restrained shadow; do not add a single coloured side border.

### Corners

- Buttons, selectors and prompt pills: fully rounded.
- Main artwork containers: usually 12–24px, using the existing neighbouring component.
- Glass chat/chart cards: about 14px.
- User-message bubbles: preserve the asymmetric bubble corners.
- Backend terminal: square corners, light mode, separator lines and scan-friendly values. No Windows 98 styling, dark console theme or decorative code wall.

### Icons

Use Tabler for interface icons. Brand marks use the existing supplied assets. Do not draw substitute UI icons, use emoji, rotate feature icons, or replace a logo with plain text. Existing hand-drawn benchmark/savings marks are an intentional exception; reuse those files rather than creating a second style.

### Details popups

Reuse `.details-dialog`, `details-popup.css` and `details-popup.js`. Native `<dialog>` supplies the modal layer. Keep the title and close action visible while long content scrolls. Opening is 180ms; closing is 120ms. Close button, Escape and outside click dismiss it; focus returns to the trigger. Prevent accidental dismissal after dragging from inside. Tables may scroll horizontally on narrow screens. Honour reduced motion. The homepage uses buttons for these actions so no separate detail page is required.

## Imagery and dithering

Prefer approved WebP assets over regenerating artwork. Keep PNG only when transparency is required, such as the iPhone frame. Compress new photographs/illustrations before using them. Do not ship rejected versions or original large downloads in a clean public export.

| Placement | Approved source |
| --- | --- |
| Hero | `assets/images/nature-market-v3.webp` |
| Interactive examples | `assets/images/market-flow-v2.webp` |
| Market checks | `assets/images/checks-*-bg-v3.webp` |
| Tool tiles | Current referenced `assets/images/studio-icons/` assets |
| Watch chat and phone background | `watch-chat-background-v1.webp`, `watch-background-v1.webp` |
| Savings and accuracy | Existing compressed MP4 videos and WebP posters |
| Final CTA | `cta-background-v2.webp`, with `cta-background-v2-dithered.webp` |
| Footer | `footer-horizon-v1.webp`, with its dithered sibling |

Art direction: softly sculpted pastel surfaces, organic curves and gentle light. Keep text areas quiet. The CTA is a symmetrical frame with a warm yellow centre. Avoid literal chart wallpaper, trading clichés, busy flowing knots, jungle scenes, neon circuitry or a new visual direction.

Reuse the existing Paper-derived 8×8 dither implementation and its license notices. Do not substitute random dithering or put a fake checkerboard over the artwork. Maintain native source colours. Preserve masks that protect text and the clear centre lens of the accuracy video.

- Hero dither: size 10px → 4px.
- Example-section dither: 6px → 2px.
- Both animate image scale 1.08 → 1 in 250ms, and replay when the conversation snaps into that section.
- Accuracy video dither: 10px → 2px, keeping the centre lens clear.
- Final CTA: static image dither faded out at the top, stronger below. Footer dither remains clear through the upper 70%.
- These are visual demonstration effects; they must not block rendering the actual image.

## Motion and interaction

Motion explains a sequence. Reuse `scroll-motion.js` for demo timing; do not add another independent animation clock.

- Typing begins after a one-second blinking cursor. Type into the composer, then send the bubble into the conversation.
- Tool windows appear with the existing reveal and remain readable; normal step duration is 3.5 seconds.
- Market-check sequence: question → answer → chart builds. Reveals run once unless the user chooses replay.
- Scroll velocity smoothly accelerates demo timing from 1× to at most 2.5× and eases back to 1×. Never change video playback rate, turn a fixed interaction into a scroll-timed interaction, or restart completed scenes on backscroll.
- The desktop conversation travels from hero to examples and snaps into place; it must continue its current animation through that move. Do not enable that travel on mobile.
- Desktop tool details appear on hover/focus. Mobile tools expand inside the conversation, open during their step, close when done, and can be reopened by touch.
- The central serif reveal is letter-staggered: coarse pixels → fine pixels after 100ms → coloured letters → black, with the existing subsequent 200ms wave gaps. Preserve its current implementation rather than approximating the effect.
- Most small hover/appearance feedback is 150–180ms. Keep interactions quick, not bouncy or continuously looping.
- Reduced motion must show readable completed content without requiring a replay. Pause video/rendering when offscreen or the document is hidden.

## Voice and claims

Speak to a trader, not an API buyer. Lead with what they can do, use short concrete sentences, and avoid em dashes, jargon and inflated promises. “Read charts, draw levels and keep watch” is the tone. Python, tokens and implementation details belong in explanations where needed, not headline copy.

Indian markets are supported now; international markets are coming soon. Claude and ChatGPT are the familiar chat tools. /markets supplies data and tools; it is not a separate app builder or a financial adviser. Do not imply autonomous orders, guaranteed results or investment advice.

Preserve the comparison context: 7/8 correct with /markets versus 4/8 with a basic broker connection, one eight-question run. 90% is rounded from 87.5%; it is not a general accuracy guarantee. The 86% API-cost comparison is an assumption-based estimate, not a measured product-wide saving or a reduction in a fixed-price chat subscription. Keep explanations in the details popups. Do not invent names, attributed testimonials, test runs or performance figures.

## Where to edit

| File | Responsibility |
| --- | --- |
| `index.html` | Copy, section order, semantic content, popup contents |
| `styles.css` | Base fonts, hero, conversation, examples, market checks, statement reveal |
| `experience.js` | Shared chat, tool steps, responsive handoff, replay |
| `market-checks.js` | SVG charts and one-time market-check animation |
| `scroll-motion.js` | Shared virtual clock and scroll-speed response |
| `dither-background.js` | Compiled image dither; generated by the local design helper |
| `lens-dither.js`, `clarity-lens.js` | Video dithering and accuracy lens |
| `tool-studio.css/js` | Tool tiles, callouts, API-savings panel |
| `watch-alerts.css/js` | Watch conversation, phone and notifications |
| `get-connected.css/js` | Claude/ChatGPT setup tabs |
| `faq-footer.css` | FAQ, final CTA, footer |
| `floating-nav.css/js` | Floating navigation and mobile menu |
| `details-popup.css/js` | Details modal, keyboard and close behaviour |

Edit the owning component rather than appending unrelated overrides to the end of another stylesheet. Keep new section styles isolated. Do not change global typography to fix one local component.

## Before sharing changes

1. Read this guide and the existing component first. Use the smallest complete change.
2. Check desktop at 1440px and mobile at 390px and 320px. No horizontal page overflow, edge-stuck cards, clipped text or unstable chat heights.
3. Verify buttons/links, visible focus, mobile navigation, popup dismissal/focus return, replay and reduced-motion behaviour for the changed component.
4. Check both directions of scrolling and refresh while in a later section when changing the shared chat or animation logic.
5. Run relevant local tests and JavaScript syntax checks. Inspect browser console errors and missing assets.
6. Preserve licensed assets, accessible names, comparison explanations and the disclaimer. Do not publish, push or change repository visibility unless the user authorises it.
