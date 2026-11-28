import type { APIRoute } from "astro";
import { PAGES } from "../data/pages";
import { ARTICLE_COLLECTIONS, articlePath, getPublished, signedOff } from "../lib/content";

// One sitemap, built from the same registry and collections that build the pages.
// Drafts and noindex pages never appear, even on deploy previews.
// lastmod comes from updatedAt, then publishedAt; rules pages use checkedOn (.claude/rules/seo-aeo.md).
export const GET: APIRoute = async ({ site }) => {
  const url = (path: string) => new URL(path, site).href;
  const rows: { loc: string; lastmod?: Date }[] = PAGES.filter((p) => p.status === "live" && !p.noindex).map((p) => ({ loc: url(p.path) }));
  for (const c of ARTICLE_COLLECTIONS) {
    for (const e of signedOff(await getPublished(c))) {
      const lastmod = e.collection === "rules" ? e.data.checkedOn : (e.data.updatedAt ?? e.data.publishedAt);
      rows.push({ loc: url(articlePath(c, e.id)), lastmod });
    }
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows
    .map((r) => `  <url><loc>${r.loc}</loc>${r.lastmod ? `<lastmod>${r.lastmod.toISOString().slice(0, 10)}</lastmod>` : ""}</url>`)
    .join("\n")}\n</urlset>\n`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
