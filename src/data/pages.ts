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
  { path: "/use-cases", title: "", description: "", h1: "", nav: "header", status: "planned" },
  { path: "/markets-covered", title: "", description: "", h1: "", nav: "footer", status: "planned" },
  { path: "/works-with", title: "", description: "", h1: "", nav: "footer", status: "planned" },
  { path: "/security", title: "", description: "", h1: "", nav: "both", status: "planned" },
  { path: "/about", title: "", description: "", h1: "", nav: "footer", status: "planned" },
  { path: "/faq", title: "", description: "", h1: "", nav: "both", status: "planned" },
  { path: "/disclaimer", title: "", description: "", h1: "", nav: "footer", status: "planned" },
  { path: "/guides", title: "", description: "", h1: "", nav: "both", status: "planned" },
  { path: "/best", title: "", description: "", h1: "", nav: "footer", status: "planned" },
  { path: "/rules", title: "", description: "", h1: "", nav: "footer", status: "planned" },
  { path: "/compare", title: "", description: "", h1: "", nav: "footer", status: "planned" },
  { path: "/privacy", title: "/markets · Privacy Policy", description: "How /markets handles personal data collected on this website, in line with India's Digital Personal Data Protection Act, 2023.", h1: "Privacy Policy", nav: "footer", status: "live", signoff: CARRIED_OVER },
  { path: "/terms", title: "/markets · Terms of Use", description: "The terms for using the /markets website: what /markets is and is not, how you may use the market data it shows, and that trading decisions are yours.", h1: "Terms of Use", nav: "footer", status: "live", signoff: CARRIED_OVER },
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
