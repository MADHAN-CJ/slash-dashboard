// Route registry: every page that is an .astro file. Collections own their own entries.
// Drives header and footer links, the sitemap, llms.txt and the URL, meta and sign-off gates.
// Prefer supplies title, description, h1 and the hub intros; copy them in exactly as given.
// Plain TypeScript with no Astro imports: the build gates import this file directly with Node.
export type PageEntry = {
  path: string; // clean URL, no trailing slash
  title: string; // <title>, max 60 characters
  description: string; // meta description, 70 to 160 characters
  h1: string;
  label?: string; // short name for nav links and breadcrumbs; defaults to the h1
  intro?: string; // hubs: the 2 to 3 line intro under the H1, shown even before the first article
  note?: string; // /best: how the lists are made and kept current
  nav: "header" | "footer" | "both" | "none";
  status: "planned" | "draft" | "live"; // draft: built on deploy previews only, never in production
  signoff?: { by: string; on: string }; // required when status is "live"
  noindex?: boolean;
};

const CARRIED_OVER = { by: "carried over unchanged from the old site", on: "2026-11-25" };
// The live-copy rename changed the text of /, /privacy, /terms and /404 (slash.markets in place of the old word mark).
// Before it merges, record Sahil's sign-off here: { by: "Sahil", on: "<date>" }.
const RENAMED = CARRIED_OVER;

export const PAGES: PageEntry[] = [
  { path: "/", title: "slash.markets · Search the market like the web", description: "slash.markets is a charting platform you can search. Ask about a stock, a level or an indicator, here or from your AI agent, and get a chart back.", h1: "Search the market like you search the web.", nav: "none", status: "live", signoff: RENAMED },
  { path: "/how-it-works", title: "", description: "", h1: "", nav: "header", status: "planned" },
  { path: "/use-cases", title: "", description: "", h1: "", nav: "header", status: "planned" },
  { path: "/markets-covered", title: "", description: "", h1: "", nav: "footer", status: "planned" },
  { path: "/works-with", title: "", description: "", h1: "", nav: "footer", status: "planned" },
  { path: "/security", title: "", description: "", h1: "", nav: "both", status: "planned" },
  { path: "/about", title: "", description: "", h1: "", nav: "footer", status: "planned" },
  { path: "/faq", title: "", description: "", h1: "", nav: "both", status: "planned" },
  {
    path: "/guides",
    title: "Guides for Indian traders who use AI · slash.markets",
    description: "How to use AI with Indian market data: connect your AI to a data source, read option chains and open interest, follow MCX contracts and check your method.",
    h1: "Guides for traders who use AI",
    label: "Guides",
    intro: "Connect your AI to Indian market data, then put it to work: read the option chain and open interest, follow MCX contracts and check your own method. Every example uses sample or past data, and shows its date.",
    nav: "both",
    status: "draft",
  },
  {
    path: "/best",
    title: "Best trading tools and apps in India · slash.markets",
    description: "Ranked lists of trading tools and apps for Indian traders, with prices, limits and who each one suits. We rank products, never stocks.",
    h1: "Best tools for Indian traders",
    label: "Best lists",
    intro: "Ranked lists of tools for Indian options and MCX traders: AI assistants, MCP servers, option chain tools and trading apps. Each list judges tools on one job and gives prices, limits and who each one suits. We rank products, never stocks.",
    note: "How we make these lists: we check every tool against its official pages and link the source for each price and feature. Each list shows the date we last reviewed it. We make slash.markets, so when it appears in a list we say so at the top, and say where other tools do better.",
    nav: "footer",
    status: "draft",
  },
  {
    path: "/rules",
    title: "F&O and MCX rules: expiry, lot sizes, hours · slash.markets",
    description: "Expiry days, lot sizes, trading hours, the F&O ban list and tax rules for NSE, BSE and MCX traders, each checked against the official source and dated.",
    h1: "Indian market rules, checked and dated",
    label: "Rules",
    intro: "Expiry days, lot sizes, trading hours, margins and taxes for NSE, BSE and MCX traders. Each page is checked against the official source, links to it, and shows the date we checked. Rules change often, so look at that date before you rely on a page.",
    nav: "footer",
    status: "draft",
  },
  {
    path: "/compare",
    title: "Trading tool reviews and comparisons · slash.markets",
    description: "Side-by-side comparisons, reviews and alternatives for trading tools Indian traders use. Every price and feature links its source and shows the date checked.",
    h1: "Trading tools compared",
    label: "Compare",
    intro: "Tools Indian traders weigh up, side by side: what each does, what it costs, its limits and who it suits. Every price and feature links its official source and shows the date we checked it. We make slash.markets, so we say so wherever it appears, and say where other tools do better.",
    nav: "footer",
    status: "draft",
  },
  {
    path: "/disclaimer",
    title: "Disclaimer · slash.markets",
    description: "slash.markets is a charting and analytics application, not a SEBI-registered adviser. It gives no investment advice, places no orders, and its data is delayed.",
    h1: "Disclaimer",
    label: "Disclaimer",
    nav: "footer",
    status: "draft", // Prefer's temporary text, for Sahil to edit and sign off
  },
  { path: "/privacy", title: "Privacy Policy · slash.markets", description: "How slash.markets handles personal data collected on this website, in line with India's Digital Personal Data Protection Act, 2023.", h1: "Privacy Policy", nav: "footer", status: "live", signoff: RENAMED },
  { path: "/terms", title: "Terms of Use · slash.markets", description: "The terms for using the slash.markets website: what it is and is not, how you may use the market data it shows, and that trading decisions are yours.", h1: "Terms of Use", nav: "footer", status: "live", signoff: RENAMED },
  { path: "/404", title: "Page not found · slash.markets", description: "This page does not exist. Go back to the slash.markets home page and try again.", h1: "Page not found", nav: "none", status: "live", noindex: true, signoff: RENAMED },
];

// The four article hubs. Each lists its collection and opens with the intro above.
export const HUB_PATHS = ["/guides", "/best", "/rules", "/compare"];

// Fails the build at import time, like a schema error.
for (const p of PAGES) {
  if (p.status === "live" && !p.signoff) throw new Error(`${p.path} is live without a compliance sign-off in src/data/pages.ts`);
  if (p.status !== "planned" && (!p.title || !p.description || !p.h1)) throw new Error(`${p.path} needs the title, description and h1 from Prefer before it can be built`);
  if (p.status !== "planned" && HUB_PATHS.includes(p.path) && !p.intro) throw new Error(`${p.path} is a hub and needs its intro from Prefer before it can be built`);
}

export const isPublic = (p: PageEntry, showDrafts: boolean) => p.status === "live" || (showDrafts && p.status === "draft");

// The name used in nav links and breadcrumbs.
export const navLabel = (p: PageEntry) => p.label ?? p.h1;

export function page(path: string): PageEntry {
  const entry = PAGES.find((p) => p.path === path);
  if (!entry) throw new Error(`${path} is missing from src/data/pages.ts`);
  return entry;
}
