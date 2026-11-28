import { existsSync, readdirSync } from "node:fs";
import { getCollection, type CollectionEntry } from "astro:content";
import { SHOW_DRAFTS } from "astro:env/server";
import { isPublic, navLabel, page, type PageEntry } from "../data/pages";

export type ArticleCollection = "guides" | "best" | "rules" | "compare";
export type ArticleEntry = CollectionEntry<ArticleCollection>;
type Published = ArticleCollection | "useCases" | "worksWith" | "legal";

export const ARTICLE_COLLECTIONS: ArticleCollection[] = ["guides", "best", "rules", "compare"];

// Each collection's folder under src/content/, as in the loaders in src/content.config.ts.
const FOLDERS: Record<Published, string> = {
  guides: "guides",
  best: "best",
  rules: "rules",
  compare: "compare",
  useCases: "use-cases",
  worksWith: "works-with",
  legal: "legal",
};

// getCollection() logs a warning for a collection with no entries, and a hub exists before its first article.
function hasFiles(name: Published) {
  const dir = `src/content/${FOLDERS[name]}`;
  return existsSync(dir) && readdirSync(dir, { recursive: true }).some((f) => /\.mdx?$/.test(String(f)));
}

// Drafts render on deploy previews (SHOW_DRAFTS=true) and never in production.
export async function getPublished<C extends Published>(name: C): Promise<CollectionEntry<C>[]> {
  if (!hasFiles(name)) return [];
  const entries = await getCollection(name);
  return entries.filter((e) => SHOW_DRAFTS || !e.data.draft);
}

// The sitemap, RSS and llms.txt list only signed-off entries, even on deploy previews.
export const signedOff = <T extends { data: { draft: boolean } }>(entries: T[]) => entries.filter((e) => !e.data.draft);

// Registry pages build when they are live, or drafts on a deploy preview.
export const isBuilt = (p: PageEntry) => isPublic(p, SHOW_DRAFTS);
// A page that answers with an empty response is not written to dist/ (Astro skips it without a warning).
export const notBuilt = () => new Response(null, { status: 204 });

export const hubPage = (c: ArticleCollection) => page(`/${c}`);
export const articlePath = (c: ArticleCollection, id: string) => `/${c}/${id}`;

// Newest first, by go-live date.
export const newestFirst = <T extends ArticleEntry>(entries: T[]) =>
  [...entries].sort((a, b) => +b.data.publishedAt - +a.data.publishedAt || a.data.title.localeCompare(b.data.title));

export const GUIDE_GROUPS = { "connect-your-ai": "Connect your AI", "options-data": "Options data", mcx: "MCX", methods: "Methods" } as const;

// Related articles: guides in the same use case or group first, then the newest in the same collection.
export async function related(entry: ArticleEntry, limit = 3) {
  const others = newestFirst((await getPublished(entry.collection)) as ArticleEntry[]).filter((e) => e.id !== entry.id);
  if (entry.collection !== "guides") return others.slice(0, limit);
  const d = entry.data as CollectionEntry<"guides">["data"];
  const score = (e: ArticleEntry) => {
    const o = e.data as CollectionEntry<"guides">["data"];
    return (d.useCase && o.useCase === d.useCase ? 2 : 0) + (o.group === d.group ? 1 : 0);
  };
  return others
    .map((e, i) => ({ e, s: score(e), i }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, limit)
    .map((x) => x.e);
}

export const crumb = (p: PageEntry) => ({ name: navLabel(p), path: p.path });

// Dates show as "28 Nov 2026". Frontmatter dates are midnight UTC, so format in UTC.
export const showDate = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);
