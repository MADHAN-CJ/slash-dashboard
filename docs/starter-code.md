# Starter code for the Astro setup

Every file in this document was built in a scratch copy of this repo on 25 Nov 2026 (Astro 7.4.13, Node 24.13.1). `astro check` reported 0 errors and 0 warnings. Copy these files in Phases 1 and 2, then extend them.

Not verifiable locally: the Netlify behaviour in section 14. Check it on the first deploy preview.

**What the dry run proved**
- **Homepage port.** The ported homepage matches the old one: identical visible text (4,364 characters), identical element counts, and all 323 `id`, `class`, `data-*`, `aria-*` and `style` attributes.
- **Whitespace.** `compressHTML: true` is required. Astro 7's default (`"jsx"`) turned "Nasdaq 5m 15m 1H" into "Nasdaq5m15m1H".
- **File format.** With `build.format: "file"`, `/guides.html` and `/guides/<slug>.html` sit side by side, and `/robots.txt`, `/sitemap.xml`, `/llms.txt` and `/rss.xml` build as files.
- **Structured data.** Every page has one JSON-LD graph, one Organization, and no references to missing nodes.
- **Sign-off is enforced.**
  - An entry with `draft: false` and no `signoff` fails the build with "signoff: Compliance sign-off is required before draft: false".
  - A live registry page without a sign-off fails it too.
- **Drafts** render only with `SHOW_DRAFTS=true`. The production build leaves them out of pages, the sitemap, llms.txt and RSS.
- **Analytics and JavaScript.** The GA4 tag renders only when `PUBLIC_GA4_ID` is set. Content pages ship no first-party JavaScript files.
- **Build failures worth knowing:**
  - `{period}` in `.mdx` prose fails the build;
  - an unquoted frontmatter value containing ": " fails the YAML parse.
- **Tooling.** Every dependency in section 1 installs together without peer conflicts.

## 1. `package.json` (exact versions; `.nvmrc` contains `24`)

```json
{
  "name": "slash-markets-site",
  "type": "module",
  "private": true,
  "engines": {
    "node": ">=22.23.4"
  },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build && node scripts/gates/run.mjs",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "format": "prettier --write ."
  },
  "dependencies": {
    "@astrojs/mdx": "8.1.6",
    "@astrojs/rss": "4.0.19",
    "astro": "7.4.13"
  },
  "devDependencies": {
    "@astrojs/check": "0.9.12",
    "@axe-core/playwright": "4.14.1",
    "@lhci/cli": "0.16.1",
    "@playwright/test": "1.65.1",
    "cheerio": "1.2.0",
    "eslint": "10.15.0",
    "eslint-plugin-astro": "3.2.1",
    "prettier": "3.10.1",
    "prettier-plugin-astro": "1.1.2",
    "typescript": "6.0.3",
    "typescript-eslint": "8.74.0",
    "vitest": "5.1.1"
  }
}
```

## 2. `astro.config.mjs`

```js
// @ts-check
import { defineConfig, envField, fontProviders } from "astro/config";
import mdx from "@astrojs/mdx";
import { SITE } from "./src/config/site.ts";

export default defineConfig({
  site: SITE.url,
  trailingSlash: "never",
  build: { format: "file" },
  compressHTML: true,

  integrations: [mdx()],
  markdown: {
    shikiConfig: { theme: "github-light", langAlias: { prompt: "text", output: "text" } },
  },
  fonts: [
    {
      provider: fontProviders.local(),
      name: "Libre Baskerville",
      cssVariable: "--font-serif",
      options: { variants: [{ src: ["./src/assets/fonts/libre-baskerville-500-latin.woff2"], weight: "500", style: "normal" }] },
    },
    {
      provider: fontProviders.local(),
      name: "Onest",
      cssVariable: "--font-sans",
      options: { variants: [{ src: ["./src/assets/fonts/onest-latin.woff2"], weight: "400 600", style: "normal" }] },
    },
    {
      provider: fontProviders.local(),
      name: "Departure Mono",
      cssVariable: "--font-mono",
      options: { variants: [{ src: ["./src/assets/fonts/departure-mono.woff2"], weight: "400", style: "normal" }] },
    },
  ],
  env: {
    schema: {
      PUBLIC_GA4_ID: envField.string({ context: "client", access: "public", optional: true }),
      PUBLIC_GSC_VERIFICATION: envField.string({ context: "client", access: "public", optional: true }),
      PUBLIC_BING_VERIFICATION: envField.string({ context: "client", access: "public", optional: true }),
      SHOW_DRAFTS: envField.boolean({ context: "server", access: "public", default: false }),
    },
  },
});
```

## 3. `tsconfig.json`

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "design", "public"],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

## 4. `src/config/site.ts`

```ts
// The only place the domain, brand strings and site-wide IDs live.
export const SITE = {
  url: "https://slash.markets",
  name: "/markets",
  alternateNames: ["slash markets", "slash.markets"],
  lang: "en",
  ogLocale: "en_IN",
  appUrl: "https://app.slash.markets",
  waitlistEndpoint:
    "https://script.google.com/macros/s/AKfycbwSZiOdsnn9nk83jMygXsKNbQFwKw7EVOz3bHYTeqVkpPy1cZgSTS_xlauvz0J3SBrk/exec",
  defaultOgImage: "/og/default.jpg",
  logo: "/assets/icons/markets-logomark.svg",
} as const;
```

## 5. `src/data/facts.json` and `src/lib/facts.ts`

Seeded from the live site and the brief. Anil and Raunaq confirm each value; until they do, nothing new is claimed from it.

```json
{
  "description": "/markets gives your AI live Indian market data, option chain analytics, charts and a Python sandbox, so it can answer any NSE, BSE or MCX question from real data and watch the market for you.",
  "descriptionLocked": false,
  "access": { "status": "waitlist", "price": "Free for now" },
  "data": { "delayMinutes": 15, "exchanges": ["NSE", "BSE", "MCX"] },
  "integrations": [
    { "id": "claude", "name": "Claude", "status": "live" },
    { "id": "chatgpt", "name": "ChatGPT", "status": "coming" },
    { "id": "kite", "name": "Kite", "status": "coming" },
    { "id": "whatsapp", "name": "WhatsApp", "status": "coming" }
  ],
  "company": { "legalName": null, "emails": { "hello": "hello@slash.markets", "privacy": "privacy@slash.markets" } },
  "founders": [
    { "id": "anil", "name": "Anil Dukkipatty", "sameAs": [] },
    { "id": "raunaq", "name": "Raunaq Vaisoha", "sameAs": [] }
  ],
  "sameAs": []
}
```

```ts
import { z } from "astro/zod";
import raw from "../data/facts.json";

const Facts = z.object({
  description: z.string().min(80).max(240),
  descriptionLocked: z.boolean(),
  access: z.object({ status: z.enum(["waitlist", "open"]), price: z.string() }),
  data: z.object({ delayMinutes: z.number().int().positive(), exchanges: z.array(z.string()).min(1) }),
  integrations: z.array(z.object({ id: z.string(), name: z.string(), status: z.enum(["live", "coming"]) })),
  company: z.object({
    legalName: z.string().nullable(),
    emails: z.object({ hello: z.email(), privacy: z.email() }),
  }),
  founders: z.array(z.object({ id: z.string(), name: z.string(), sameAs: z.array(z.url()) })),
  sameAs: z.array(z.url()),
});

// Parsed once at import: a bad facts file fails the build with a clear message.
export const facts = Facts.parse(raw);
export const liveIntegrations = facts.integrations.filter((i) => i.status === "live");
```

## 6. `src/data/pages.ts` (route registry)

The build fails if a live page has no sign-off, or a built page lacks Prefer's title, description or H1. Fill each page's fields from Prefer's week-one list. The `/use-cases` and `/guides` values below are placeholders from the dry run: replace them.

```ts
// Route registry: every page that is an .astro file. Collections own their own entries.
// Drives header and footer links, the sitemap, llms.txt and the URL, meta and sign-off gates.
// Prefer supplies title, description and h1 (week 1); copy them in exactly as given.
export type PageEntry = {
  path: string; // clean URL, no trailing slash
  title: string; // <title>, max 60 characters
  description: string; // meta description, 70 to 160 characters
  h1: string;
  nav: "header" | "footer" | "both" | "none";
  status: "planned" | "draft" | "live";
  signoff?: { by: string; on: string }; // required when status is "live"
  noindex?: boolean;
};

const CARRIED_OVER = { by: "carried over unchanged from the old site", on: "2026-11-25" };

export const PAGES: PageEntry[] = [
  { path: "/", title: "/markets · Search the market like the web", description: "/markets is a charting platform you can search. Ask about a stock, a level or an indicator, here or from your AI agent, and get a chart back.", h1: "Search the market like you search the web.", nav: "none", status: "live", signoff: CARRIED_OVER },
  { path: "/how-it-works", title: "", description: "", h1: "", nav: "header", status: "planned" },
  { path: "/use-cases", title: "What /markets does: use cases", description: "Option chain analysis, alerts, pre-market briefs, Python on real data and a second opinion on your chart study.", h1: "Use cases", nav: "header", status: "draft" },
  { path: "/markets-covered", title: "", description: "", h1: "", nav: "footer", status: "planned" },
  { path: "/works-with", title: "", description: "", h1: "", nav: "footer", status: "planned" },
  { path: "/security", title: "", description: "", h1: "", nav: "both", status: "planned" },
  { path: "/about", title: "", description: "", h1: "", nav: "footer", status: "planned" },
  { path: "/faq", title: "", description: "", h1: "", nav: "both", status: "planned" },
  { path: "/disclaimer", title: "", description: "", h1: "", nav: "footer", status: "planned" },
  { path: "/guides", title: "Guides for Indian traders using AI", description: "Guides for Indian traders using AI: connect your AI to market data, read options data, trade MCX and check your methods.", h1: "Guides", nav: "both", status: "draft" },
  { path: "/best", title: "", description: "", h1: "", nav: "footer", status: "planned" },
  { path: "/rules", title: "", description: "", h1: "", nav: "footer", status: "planned" },
  { path: "/compare", title: "", description: "", h1: "", nav: "footer", status: "planned" },
  { path: "/privacy", title: "/markets · Privacy Policy", description: "How /markets handles personal data collected on this website, in line with India's Digital Personal Data Protection Act, 2023.", h1: "Privacy Policy", nav: "footer", status: "live", signoff: CARRIED_OVER },
  { path: "/terms", title: "", description: "", h1: "", nav: "footer", status: "planned" },
  { path: "/404", title: "Page not found · /markets", description: "This page does not exist. Go back to the /markets home page and try again.", h1: "Page not found", nav: "none", status: "live", noindex: true, signoff: CARRIED_OVER },
];

// Fails the build at import time, like a schema error.
for (const p of PAGES) {
  if (p.status === "live" && !p.signoff) throw new Error(`${p.path} is live without a compliance sign-off in src/data/pages.ts`);
  if (p.status !== "planned" && (!p.title || !p.description || !p.h1)) throw new Error(`${p.path} needs the title, description and h1 from Prefer before it can be built`);
}

export const isPublic = (p: PageEntry, showDrafts: boolean) => p.status === "live" || (showDrafts && p.status === "draft");

export function page(path: string): PageEntry {
  const entry = PAGES.find((p) => p.path === path);
  if (!entry) throw new Error(`${path} is missing from src/data/pages.ts`);
  return entry;
}
```

## 7. `src/content.config.ts`

> **Phase 2 shipped revised versions of sections 7 to 12** (28 Nov 2026). The code in `src/` is now the source of truth; the blocks below are the original dry run. What changed: `authors.json` is an object keyed by id; empty collections stay quiet; draft registry pages skip production with an empty response; guides gained `checkedOn` and `sources`, authors a `bio`, best and compare items an `ours` flag; the endpoints read `SITE.name` and never list drafts.

```ts
import { defineCollection, reference } from "astro:content";
import { glob, file } from "astro/loaders";
import { z } from "astro/zod";

const signoff = z.object({ by: z.string().min(2), on: z.coerce.date() });
const faq = z.object({ q: z.string().trim().endsWith("?"), a: z.string().min(40).max(500) });

// Shared article fields. SEO limits live here so a bad entry fails the build.
const article = z.object({
  title: z.string().max(70), // the H1
  seoTitle: z.string().max(60).optional(), // the <title>, when it differs from the H1
  description: z.string().min(70).max(160),
  answer: z.string().min(80).max(320), // the first two lines: says plainly what the page answers
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  author: reference("authors"),
  faqs: z.array(faq).max(8).default([]),
  draft: z.boolean().default(false),
  signoff: signoff.optional(), // compliance sign-off: required before draft is false
});

type Signable = { draft: boolean; signoff?: unknown };
const requireSignoff = (d: Signable, ctx: z.RefinementCtx) => {
  if (!d.draft && !d.signoff) {
    ctx.addIssue({ code: "custom", path: ["signoff"], message: "Compliance sign-off is required before draft: false" });
  }
};

const articles = (dir: string) => glob({ base: `./src/content/${dir}`, pattern: "**/*.{md,mdx}" });

const guides = defineCollection({
  loader: articles("guides"),
  schema: article
    .extend({
      group: z.enum(["connect-your-ai", "options-data", "mcx", "methods"]),
      useCase: z.enum(["option-chain", "alerts", "pre-market-brief", "python", "check-my-study"]).optional(),
    })
    .superRefine(requireSignoff),
});

const rules = defineCollection({
  loader: articles("rules"),
  schema: article
    .extend({
      checkedOn: z.coerce.date(),
      sources: z.array(z.object({ name: z.string(), url: z.url() })).min(1),
    })
    .superRefine(requireSignoff),
});

const best = defineCollection({
  loader: articles("best"),
  schema: article
    .extend({
      reviewedOn: z.coerce.date(),
      items: z
        .array(z.object({ name: z.string(), url: z.url(), summary: z.string().max(200), ours: z.boolean().default(false) }))
        .min(3),
    })
    .superRefine(requireSignoff),
});

const compare = defineCollection({
  loader: articles("compare"),
  schema: article
    .extend({
      reviewedOn: z.coerce.date(),
      products: z.array(z.object({ name: z.string(), url: z.url() })).min(1),
    })
    .superRefine(requireSignoff),
});

const worksWith = defineCollection({
  loader: articles("works-with"),
  schema: z
    .object({
      integration: z.enum(["claude", "chatgpt", "kite", "whatsapp"]),
      title: z.string().max(70),
      seoTitle: z.string().max(60),
      description: z.string().min(70).max(160),
      faqs: z.array(faq).max(8).default([]),
      draft: z.boolean().default(false),
      signoff: signoff.optional(),
    })
    .superRefine(requireSignoff),
});

const useCases = defineCollection({
  loader: articles("use-cases"),
  schema: z
    .object({
      title: z.string().max(70),
      seoTitle: z.string().max(60),
      description: z.string().min(70).max(160),
      order: z.number().int(),
      problem: z.string().min(40),
      prompts: z
        .array(z.object({ prompt: z.string(), output: z.string(), dataDate: z.coerce.date() }))
        .min(2)
        .max(3),
      faqs: z.array(faq).min(3).max(5),
      draft: z.boolean().default(false),
      signoff: signoff.optional(),
    })
    .superRefine(requireSignoff),
});

const legal = defineCollection({
  loader: glob({ base: "./src/content/legal", pattern: "*.md" }),
  schema: z.object({
    title: z.string(),
    description: z.string().min(70).max(160),
    lastUpdated: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

const authors = defineCollection({
  loader: file("src/content/authors.json"),
  schema: z.object({
    name: z.string(),
    type: z.enum(["Person", "Organization"]),
    role: z.string(),
    sameAs: z.array(z.url()).default([]),
  }),
});

const faqs = defineCollection({
  loader: file("src/content/faq.yaml"),
  schema: faq.extend({ order: z.number().int() }),
});

export const collections = { guides, best, rules, compare, useCases, worksWith, legal, authors, faqs };
```

## 8. `src/lib/content.ts` and `src/lib/graph.ts`

```ts
import { getCollection } from "astro:content";
import { SHOW_DRAFTS } from "astro:env/server";

// Drafts render on deploy previews (SHOW_DRAFTS=true) and never in production.
export async function getPublished<C extends "guides" | "best" | "rules" | "compare" | "useCases" | "worksWith" | "legal">(name: C) {
  const entries = await getCollection(name);
  return entries.filter((e) => SHOW_DRAFTS || !e.data.draft);
}
```

```ts
// One JSON-LD @graph per page, built here and nowhere else.
import { SITE } from "../config/site";
import { facts } from "./facts";

type Node = Record<string, unknown>;
const abs = (path: string) => new URL(path, SITE.url).href;
export const ORG_ID = `${SITE.url}/#organization`;
export const WEBSITE_ID = `${SITE.url}/#website`;

export const organization = (): Node => ({
  "@type": "Organization",
  "@id": ORG_ID,
  name: SITE.name,
  alternateName: [...SITE.alternateNames],
  url: abs("/"),
  logo: { "@type": "ImageObject", url: abs(SITE.logo) },
  description: facts.description,
  email: facts.company.emails.hello,
  ...(facts.company.legalName ? { legalName: facts.company.legalName } : {}),
  ...(facts.sameAs.length ? { sameAs: facts.sameAs } : {}),
  founder: facts.founders.map((f) => ({ "@type": "Person", "@id": abs(`/about#${f.id}`), name: f.name })),
});

export const website = (): Node => ({
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: abs("/"),
  name: SITE.name,
  publisher: { "@id": ORG_ID },
  inLanguage: SITE.lang,
});

export const webPage = (p: { path: string; name: string; description: string; type?: string; crumbs?: boolean }): Node => ({
  "@type": p.type ?? "WebPage",
  "@id": `${abs(p.path)}#webpage`,
  url: abs(p.path),
  name: p.name,
  description: p.description,
  isPartOf: { "@id": WEBSITE_ID },
  about: { "@id": ORG_ID },
  ...(p.crumbs ? { breadcrumb: { "@id": `${abs(p.path)}#breadcrumb` } } : {}),
});

export const breadcrumbs = (path: string, trail: { name: string; path: string }[]): Node => ({
  "@type": "BreadcrumbList",
  "@id": `${abs(path)}#breadcrumb`,
  itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, item: abs(t.path) })),
});

export const articleNode = (p: { path: string; headline: string; description: string; published: Date; modified?: Date; authorName: string; authorType: string }): Node => ({
  "@type": "Article",
  "@id": `${abs(p.path)}#article`,
  headline: p.headline,
  description: p.description,
  datePublished: p.published.toISOString(),
  dateModified: (p.modified ?? p.published).toISOString(),
  author: { "@type": p.authorType, name: p.authorName },
  publisher: { "@id": ORG_ID },
  mainEntityOfPage: { "@id": `${abs(p.path)}#webpage` },
  inLanguage: SITE.lang,
});

export const faqPage = (path: string, items: { q: string; a: string }[]): Node => ({
  "@type": "FAQPage",
  "@id": `${abs(path)}#faq`,
  mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});

export const softwareApplication = (): Node => ({
  "@type": "SoftwareApplication",
  "@id": `${SITE.url}/#software`,
  name: SITE.name,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  url: abs("/"),
  publisher: { "@id": ORG_ID },
  description: facts.description,
});

// Every page: Organization + WebSite + its own nodes, in one graph.
export const graph = (...nodes: Node[]) => ({ "@context": "https://schema.org", "@graph": [organization(), website(), ...nodes] });

// Escape "<" so content can never close the script tag early.
export const serialize = (g: unknown) => JSON.stringify(g).replace(/</g, "\\u003c");
```

## 9. `src/components/seo/Seo.astro`

```astro
---
import { PUBLIC_GA4_ID, PUBLIC_GSC_VERIFICATION, PUBLIC_BING_VERIFICATION } from "astro:env/client";
import { SHOW_DRAFTS } from "astro:env/server";
import { SITE } from "../../config/site";
import { serialize } from "../../lib/graph";

interface Props {
  title: string;
  description: string;
  path: string;
  graph: unknown;
  noindex?: boolean;
  ogType?: "website" | "article";
  ogImage?: string;
}
const { title, description, path, graph, noindex = false, ogType = "website", ogImage = SITE.defaultOgImage } = Astro.props;
const canonical = new URL(path, Astro.site).href;
const robots = noindex || SHOW_DRAFTS ? "noindex, nofollow" : "index, follow, max-image-preview:large";
---
<title>{title}</title>
<meta name="description" content={description} />
{!noindex && <link rel="canonical" href={canonical} />}
<meta name="robots" content={robots} />
<link rel="icon" href={SITE.logo} type="image/svg+xml" />
<meta property="og:site_name" content={SITE.name} />
<meta property="og:locale" content={SITE.ogLocale} />
<meta property="og:type" content={ogType} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonical} />
<meta property="og:image" content={new URL(ogImage, Astro.site).href} />
<meta name="twitter:card" content="summary_large_image" />
{PUBLIC_GSC_VERIFICATION && <meta name="google-site-verification" content={PUBLIC_GSC_VERIFICATION} />}
{PUBLIC_BING_VERIFICATION && <meta name="msvalidate.01" content={PUBLIC_BING_VERIFICATION} />}
<link rel="alternate" type="application/rss+xml" title="/markets guides" href="/rss.xml" />
<script type="application/ld+json" is:inline set:html={serialize(graph)} />
{PUBLIC_GA4_ID && <script is:inline async src={`https://www.googletagmanager.com/gtag/js?id=${PUBLIC_GA4_ID}`}></script>}
{PUBLIC_GA4_ID && (
  <script is:inline define:vars={{ id: PUBLIC_GA4_ID }}>
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag("js", new Date());
    gtag("config", id);
    const ai = /(chatgpt\.com|chat\.openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|copilot\.microsoft\.com)/;
    const ref = document.referrer;
    if (ai.test(ref)) gtag("event", "ai_referral", { ai_source: new URL(ref).hostname });
  </script>
)}
```

## 10. `src/layouts/Base.astro` (temporary)

A bare layout that proves the head and footer wiring. Sunny's shared template replaces the body and footer markup in Phase 3. Keep the head.

```astro
---
import { Font } from "astro:assets";
import Seo from "../components/seo/Seo.astro";
import { PAGES } from "../data/pages";
type SeoProps = import("astro/types").ComponentProps<typeof Seo>;
interface Props { seo: SeoProps }
const { seo } = Astro.props;
// Footer links come from the registry. /disclaimer, /privacy and /terms appear as soon as they are live.
const footer = PAGES.filter((p) => p.status === "live" && (p.nav === "footer" || p.nav === "both"));
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <Font cssVariable="--font-serif" preload />
    <Font cssVariable="--font-sans" preload />
    <Seo {...seo} />
  </head>
  <body>
    <main><slot /></main>
    <footer>
      <nav aria-label="Footer">
        {footer.map((p) => <a href={p.path}>{p.h1}</a>)}
      </nav>
    </footer>
  </body>
</html>
<style is:global>
  body { margin: 0; font-family: var(--font-sans); }
  h1, h2 { font-family: var(--font-serif); font-weight: 500; }
  pre[data-language="prompt"] { background: #f6d64d; }
</style>
```

## 11. Route patterns

`/best`, `/rules` and `/compare` follow the guides pattern. Each adds its own fields to the template: `items` and `reviewedOn`; `checkedOn` and `sources`; `products` and `reviewedOn`.

### `src/pages/guides/index.astro` (hub)

```astro
---
import Base from "../../layouts/Base.astro";
import { page } from "../../data/pages";
import { getPublished } from "../../lib/content";
import { graph, webPage, breadcrumbs } from "../../lib/graph";
const p = page("/guides");
const groups = { "connect-your-ai": "Connect your AI", "options-data": "Options data", mcx: "MCX", methods: "Methods" } as const;
const guides = (await getPublished("guides")).sort((a, b) => +b.data.publishedAt - +a.data.publishedAt);
const g = graph(
  webPage({ path: p.path, name: p.title, description: p.description, type: "CollectionPage", crumbs: true }),
  breadcrumbs(p.path, [{ name: "Home", path: "/" }, { name: p.h1, path: p.path }]),
);
---
<Base seo={{ title: p.title, description: p.description, path: p.path, graph: g }}>
  <h1>{p.h1}</h1>
  {Object.entries(groups).map(([key, label]) => {
    const list = guides.filter((x) => x.data.group === key);
    return list.length > 0 && (
      <section>
        <h2>{label}</h2>
        <ul>{list.map((x) => <li><a href={`/guides/${x.id}`}>{x.data.title}</a></li>)}</ul>
      </section>
    );
  })}
</Base>
```

### `src/pages/guides/[slug].astro` (article)

```astro
---
import { getEntry, render } from "astro:content";
import Base from "../../layouts/Base.astro";
import { getPublished } from "../../lib/content";
import { graph, webPage, breadcrumbs, articleNode, faqPage } from "../../lib/graph";

export async function getStaticPaths() {
  const entries = await getPublished("guides");
  return entries.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}
const { entry } = Astro.props;
const { Content, headings } = await render(entry);
const author = await getEntry(entry.data.author);
const path = `/guides/${entry.id}`;
const d = entry.data;
const g = graph(
  webPage({ path, name: d.seoTitle ?? d.title, description: d.description, crumbs: true }),
  breadcrumbs(path, [{ name: "Home", path: "/" }, { name: "Guides", path: "/guides" }, { name: d.title, path }]),
  articleNode({ path, headline: d.title, description: d.description, published: d.publishedAt, modified: d.updatedAt, authorName: author.data.name, authorType: author.data.type }),
  ...(d.faqs.length ? [faqPage(path, d.faqs)] : []),
);
---
<Base seo={{ title: d.seoTitle ?? d.title, description: d.description, path, graph: g, ogType: "article" }}>
  <article>
    <h1>{d.title}</h1>
    <p class="answer">{d.answer}</p>
    <nav aria-label="On this page">{headings.filter((h) => h.depth === 2).map((h) => <a href={`#${h.slug}`}>{h.text}</a>)}</nav>
    <Content />
  </article>
</Base>
```

### `src/pages/use-cases/[slug].astro` (use case)

```astro
---
import { render } from "astro:content";
import Base from "../../layouts/Base.astro";
import { getPublished } from "../../lib/content";
import { graph, webPage, breadcrumbs, faqPage } from "../../lib/graph";
export async function getStaticPaths() {
  return (await getPublished("useCases")).map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}
const { entry } = Astro.props;
const { Content } = await render(entry);
const d = entry.data;
const path = `/use-cases/${entry.id}`;
const g = graph(
  webPage({ path, name: d.seoTitle, description: d.description, crumbs: true }),
  breadcrumbs(path, [{ name: "Home", path: "/" }, { name: "Use cases", path: "/use-cases" }, { name: d.title, path }]),
  faqPage(path, d.faqs),
);
---
<Base seo={{ title: d.seoTitle, description: d.description, path, graph: g }}>
  <h1>{d.title}</h1>
  <p>{d.problem}</p>
  {d.prompts.map((x) => (
    <figure>
      <pre data-language="prompt">{x.prompt}</pre>
      <pre data-language="output">{x.output}</pre>
      <figcaption>Sample data, {x.dataDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</figcaption>
    </figure>
  ))}
  <Content />
  <section><h2>Questions</h2>{d.faqs.map((f) => <details><summary>{f.q}</summary><p>{f.a}</p></details>)}</section>
</Base>
```

### `src/pages/privacy.astro` (legal page)

```astro
---
import { getEntry, render } from "astro:content";
import Base from "../layouts/Base.astro";
import { page } from "../data/pages";
import { graph, webPage } from "../lib/graph";
const p = page("/privacy");
const entry = await getEntry("legal", "privacy");
if (!entry) throw new Error("src/content/legal/privacy.md is missing");
const { Content } = await render(entry);
const g = graph(webPage({ path: p.path, name: p.title, description: p.description }));
---
<Base seo={{ title: p.title, description: p.description, path: p.path, graph: g }}>
  <h1>{p.h1}</h1>
  <p>Last updated {entry.data.lastUpdated.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
  <Content />
</Base>
```

## 12. Endpoints

### `src/pages/sitemap.xml.ts`

Add the `best`, `rules`, `compare` and `worksWith` collections in the same way as `guides`.

```ts
import type { APIRoute } from "astro";
import { PAGES } from "../data/pages";
import { getPublished } from "../lib/content";

// One sitemap, built from the same registry and collections that build the pages.
export const GET: APIRoute = async ({ site }) => {
  const url = (path: string) => new URL(path, site).href;
  const rows: { loc: string; lastmod?: Date }[] = PAGES.filter((p) => p.status === "live" && !p.noindex).map((p) => ({ loc: url(p.path) }));
  for (const e of await getPublished("guides")) rows.push({ loc: url(`/guides/${e.id}`), lastmod: e.data.updatedAt ?? e.data.publishedAt });
  for (const e of await getPublished("useCases")) rows.push({ loc: url(`/use-cases/${e.id}`) });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows
    .map((r) => `  <url><loc>${r.loc}</loc>${r.lastmod ? `<lastmod>${r.lastmod.toISOString().slice(0, 10)}</lastmod>` : ""}</url>`)
    .join("\n")}\n</urlset>\n`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
```

### `src/pages/robots.txt.ts`

```ts
import type { APIRoute } from "astro";

const AI_CRAWLERS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "Bingbot"];

export const GET: APIRoute = ({ site }) => {
  const groups = AI_CRAWLERS.map((ua) => `User-agent: ${ua}\nAllow: /`).join("\n\n");
  const body = `User-agent: *\nAllow: /\n\n${groups}\n\nSitemap: ${new URL("/sitemap.xml", site).href}\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
```

### `src/pages/llms.txt.ts`

```ts
import type { APIRoute } from "astro";
import { facts } from "../lib/facts";
import { PAGES } from "../data/pages";
import { getPublished } from "../lib/content";

export const GET: APIRoute = async ({ site }) => {
  const url = (path: string) => new URL(path, site).href;
  const core = PAGES.filter((p) => p.status === "live" && !p.noindex).map((p) => `- [${p.h1}](${url(p.path)}): ${p.description}`);
  const guides = (await getPublished("guides")).map((e) => `- [${e.data.title}](${url(`/guides/${e.id}`)}): ${e.data.answer}`);
  const body = `# /markets\n\n> ${facts.description}\n\n/markets is research and analysis software. It is not a financial adviser and places no orders. Market data is delayed by at least ${facts.data.delayMinutes} minutes.\n\n## Pages\n\n${core.join("\n")}\n\n## Guides\n\n${guides.join("\n")}\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
```

### `src/pages/rss.xml.ts`

```ts
import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { facts } from "../lib/facts";
import { getPublished } from "../lib/content";

const HUBS = ["guides", "best", "rules", "compare"] as const;

export const GET: APIRoute = async ({ site }) => {
  const items = (await Promise.all(HUBS.map(async (hub) => (await getPublished(hub)).map((e) => ({
    title: e.data.title,
    description: e.data.answer,
    pubDate: e.data.publishedAt,
    link: `/${hub}/${e.id}`,
  }))))).flat().sort((a, b) => +b.pubDate - +a.pubDate);
  return rss({ title: "/markets", description: facts.description, site: site!, items, trailingSlash: false });
};
```

## 13. Homepage port and comparison (Phase 1)

Keep a copy of the old file before deleting it, for the comparison:

```sh
cp index.html /tmp/old-index.html
node scripts/port-homepage.mjs index.html src/pages/index.astro
git rm index.html   # privacy.html and terms.html go once their text is in src/content/legal/
npm run build
node scripts/compare-homepage.mjs /tmp/old-index.html dist/index.html   # must exit 0
```

### `scripts/port-homepage.mjs`

The script stops with an error if `index.html` has changed shape since 25 Nov.

```js
// Phase 1: port index.html to src/pages/index.astro without changing the page.
// Usage: node scripts/port-homepage.mjs index.html src/pages/index.astro
import { readFileSync, writeFileSync } from "node:fs";

const [src, out] = process.argv.slice(2);
const html = readFileSync(src, "utf8");
const between = (from, to, start = 0) => {
  const a = html.indexOf(from, start);
  const b = html.indexOf(to, a + from.length);
  if (a < 0 || b < 0) throw new Error(`Marker not found: ${from} ... ${to}`);
  return { text: html.slice(a + from.length, b), end: b + to.length };
};
const style = between("<style>", "</style>");
const bodyStart = html.indexOf("<body>") + "<body>".length;
const scriptAt = html.indexOf("<script>", bodyStart);
const script = between("<script>", "</script>", bodyStart);
if (bodyStart < 6 || scriptAt < 0) throw new Error("Unexpected index.html structure: stop and check by hand");
let body = html.slice(bodyStart, scriptAt).replace(/^\n+|\s+$/g, "");
// The only body changes: the legal links move to clean URLs.
body = body.replaceAll('href="privacy.html"', 'href="/privacy"').replaceAll('href="terms.html"', 'href="/terms"');
const tail = html.slice(script.end, html.indexOf("</body>"));
for (const tag of ['src="tool-studio.js?v=8"', 'src="waitlist.js?v=1"']) {
  if (!tail.includes(tag)) throw new Error(`Expected ${tag} after the inline script: stop and check by hand`);
}

writeFileSync(out, `---
// The homepage, ported unchanged from index.html (Phase 1). Only <head> metadata and the
// legal links changed. Legacy CSS and JS stay inline (is:inline) so Astro neither scopes nor bundles them.
// Sunny's new Home replaces this file in Phase 3.
import Seo from "../components/seo/Seo.astro";
import { page } from "../data/pages";
import { graph, webPage, softwareApplication } from "../lib/graph";
const p = page("/");
const g = graph(webPage({ path: p.path, name: p.title, description: p.description }), softwareApplication());
---
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<Seo title={p.title} description={p.description} path={p.path} graph={g} />
<link rel="stylesheet" href="/tool-studio.css?v=15">
<style is:inline>${style.text}</style>
</head>
<body>
${body}

<script is:inline>${script.text}</script>
<script is:inline src="/tool-studio.js?v=8" defer></script>
<script is:inline type="module" src="/waitlist.js?v=1"></script>
</body>
</html>
`);
console.log(`Wrote ${out}`);
```

### `scripts/compare-homepage.mjs`

```js
// Phase 1 check: the ported homepage must match the old one.
// Usage: node scripts/compare-homepage.mjs <old index.html> dist/index.html
import { readFileSync } from "node:fs";

const [oldFile, newFile] = process.argv.slice(2);
const a = readFileSync(oldFile, "utf8");
const b = readFileSync(newFile, "utf8");
const body = (h) => h.slice(h.indexOf("<body"), h.lastIndexOf("</body>"));
const text = (h) => body(h)
  .replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ")
  .replace(/<[^>]+>/g, (t) => (/^<\/?(span|a|strong|b|i|em|code|small|img)\b/i.test(t) ? "" : " "))
  .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const tags = (h) => { const m = {}; for (const x of body(h).matchAll(/<([a-z0-9-]+)[\s>]/gi)) m[x[1].toLowerCase()] = (m[x[1].toLowerCase()] || 0) + 1; return m; };
const attrs = (h) => [...body(h).matchAll(/\s(id|class|data-[a-z-]+|aria-[a-z-]+|style)="([^"]*)"/g)].map((m) => `${m[1]}=${m[2]}`);

const ta = text(a), tb = text(b);
const A = tags(a), B = tags(b);
const tagDiff = Object.keys({ ...A, ...B }).filter((k) => A[k] !== B[k]);
const sameAttrs = JSON.stringify(attrs(a)) === JSON.stringify(attrs(b));
console.log(`visible text identical: ${ta === tb} (${ta.length} vs ${tb.length} characters)`);
if (ta !== tb) { let i = 0; while (ta[i] === tb[i]) i++; console.log(`  old: ${JSON.stringify(ta.slice(i - 50, i + 50))}\n  new: ${JSON.stringify(tb.slice(i - 50, i + 50))}`); }
console.log(`element counts identical: ${tagDiff.length === 0}${tagDiff.length ? ` (${tagDiff.join(", ")})` : ""}`);
console.log(`id, class, data-*, aria-* and style attributes identical: ${sameAttrs}`);
process.exit(ta === tb && tagDiff.length === 0 && sameAttrs ? 0 : 1);
```

## 14. `netlify.toml` and `public/_redirects` (verify on the deploy preview)

```toml
[build]
  command = "npm run build"
  publish = "dist"

# Deploy previews show drafts (with noindex). Production never does.
[context.deploy-preview.environment]
  SHOW_DRAFTS = "true"

# Analytics and verification IDs: production only. They are public values.
# [context.production.environment]
#   PUBLIC_GA4_ID = "G-XXXXXXXXXX"
#   PUBLIC_GSC_VERIFICATION = ""
#   PUBLIC_BING_VERIFICATION = ""

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
    X-Frame-Options = "DENY"

[[headers]]
  for = "/_astro/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# Legacy homepage files have no hash in their names, so keep a short cache.
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=86400"

[[headers]]
  for = "/brand/*"
  [headers.values]
    X-Robots-Tag = "noindex"

[[headers]]
  for = "/brand-guidelines/*"
  [headers.values]
    X-Robots-Tag = "noindex"
```

```text
# 2026-11-25: moved to Astro. Old .html URLs end on the clean URLs.
# Verify on the first deploy preview: /privacy must return 200 (no loop) and
# /privacy.html must return 301 to /privacy. If /privacy loops, delete the two
# .html rules: Netlify's Pretty URLs handle them and the canonical covers the rest.
/privacy.html   /privacy   301!
/terms.html     /terms     301!
/index.html     /          301!
```

## 15. Phase 1 file moves

Run these from the repo root on the `astro-foundation` branch.

```sh
# Homepage files keep their paths, under public/
mkdir -p public
git mv assets brand brand-guidelines tool-studio.css tool-studio.js waitlist.js public/

# The previous homepage's files: not deployed, kept until Sunny confirms deletion
mkdir -p design/legacy-v1/assets/images design/legacy-v1/assets/video design/legacy-v1/assets/icons
git mv clarity-lens.js details-popup.css details-popup.js dither-background.js experience.js \
  faq-footer.css floating-nav.css floating-nav.js get-connected.css get-connected.js legal.css \
  lens-dither.js market-checks.js scroll-motion.js styles.css text-reveal.js watch-alerts.css \
  watch-alerts.js design/legacy-v1/
cd public/assets/images && git mv clarity-lens-video-poster.webp cta-background-v2-dithered.webp \
  footer-horizon-v1-dithered.webp footer-horizon-v1.webp savings-piggy-poster.webp setup-dither-fade.svg \
  watch-background-v1.webp watch-chat-background-v1.webp watch-iphone-v1.png ../../../design/legacy-v1/assets/images/ && cd -
git mv public/assets/video/* design/legacy-v1/assets/video/
cd public/assets/icons && git mv clock.svg lock.svg refresh.svg savings-pig-handdrawn.svg seeing-eye.svg \
  ../../../design/legacy-v1/assets/icons/ && cd -

# The waitlist backend is not website code
mkdir -p ops && git mv waitlist-apps-script.gs ops/

# Fonts for Astro's fonts API (the homepage keeps its own copies in public/assets/fonts)
mkdir -p src/assets/fonts && cp public/assets/fonts/*.woff2 src/assets/fonts/
```
