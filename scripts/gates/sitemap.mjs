// sitemap gate: every indexable page is in /sitemap.xml, no draft or noindex page is, and every URL in it was built.
import { loadXml, urlOf } from "./lib.mjs";

export default function sitemap(ctx) {
  const errors = [];
  if (!ctx.sitemap) return { errors: ["dist/sitemap.xml is missing"], warnings: [] };
  const $ = loadXml(ctx.sitemap);
  const locs = $("url > loc").map((_, e) => $(e).text().trim()).get();
  const listed = new Set(locs);
  if (listed.size !== locs.length) errors.push("sitemap.xml lists a URL more than once");

  const registry = new Map(ctx.registry.map((e) => [e.path, e]));
  const built = new Set();
  for (const page of ctx.pages) {
    const url = urlOf(ctx.site, page.path);
    built.add(url);
    const entry = registry.get(page.path);
    // Registry pages: live and not noindex. Phase 2 adds collection entries (published, not draft).
    const indexable = entry ? entry.status === "live" && !entry.noindex : true;
    if (indexable && !listed.has(url)) errors.push(`${page.path} is indexable, but is not in sitemap.xml`);
    if (!indexable && listed.has(url)) errors.push(`${page.path} is ${entry.noindex ? "noindex" : entry.status}, but is in sitemap.xml`);
  }
  for (const loc of listed) if (!built.has(loc)) errors.push(`sitemap.xml lists ${loc}, which is not a built page`);
  return { errors, warnings: [] };
}
