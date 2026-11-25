// urls gate: pages match the registry, URLs are clean, and every link and file a page loads exists.
import { hasId, internalTarget, isPublicEntry } from "./lib.mjs";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export default function urls(ctx) {
  const errors = [];
  const built = new Map(ctx.pages.map((p) => [p.path, p]));
  const registry = new Map(ctx.registry.map((e) => [e.path, e]));
  const collectionRoutes = ctx.collectionRoutes ?? []; // Phase 2: "/guides/", "/use-cases/" ...
  const redirected = new Set(ctx.redirects.map((r) => r.from));
  const exists = (path) => built.has(path) || ctx.files.has(path.slice(1));

  // Every built page is in the registry or a collection route, and vice versa.
  for (const path of built.keys()) {
    const entry = registry.get(path);
    if (entry && !isPublicEntry(entry, ctx.showDrafts)) errors.push(`${path} is built, but the registry says "${entry.status}"`);
    if (!entry && !collectionRoutes.some((r) => path.startsWith(r))) errors.push(`${path} is built, but is not in src/data/pages.ts or a collection`);
    const segments = path.split("/").filter(Boolean);
    for (const s of segments) if (!SLUG.test(s)) errors.push(`${path}: "${s}" is not lowercase words joined by hyphens`);
    for (let i = 1; i < segments.length; i++) {
      const parent = `/${segments.slice(0, i).join("/")}`;
      if (!built.has(parent)) errors.push(`${path}: the parent URL ${parent} has no page`);
    }
  }
  for (const e of ctx.registry) {
    if (isPublicEntry(e, ctx.showDrafts) && !built.has(e.path)) errors.push(`${e.path} is ${e.status} in the registry, but was not built`);
  }

  for (const page of ctx.pages) {
    const { $ } = page;
    // Internal links: no trailing slash, no .html, not redirected, and the target exists.
    $("a[href]").each((_, a) => {
      const href = $(a).attr("href");
      const t = internalTarget(href, page.path, ctx.site);
      if (!t) return;
      if (t.samePage) {
        if (t.hash && !hasId($, t.hash)) errors.push(`${page.path}: link ${href} points at a missing id`);
        return;
      }
      if (t.path !== "/" && t.path.endsWith("/")) errors.push(`${page.path}: link ${href} has a trailing slash`);
      if (t.path.endsWith(".html")) errors.push(`${page.path}: link ${href} uses .html`);
      if (redirected.has(t.path)) errors.push(`${page.path}: link ${href} points at a redirected URL`);
      else if (!exists(t.path)) errors.push(`${page.path}: link ${href} has no target`);
      else if (t.hash && built.has(t.path) && !hasId(built.get(t.path).$, t.hash)) errors.push(`${page.path}: link ${href} points at a missing id`);
    });
    // Files the page loads.
    $("img[src], script[src], link[href]").each((_, el) => {
      const rel = ($(el).attr("rel") ?? "").split(/\s+/);
      if (rel.includes("canonical") || rel.includes("alternate")) return; // page URLs: the meta gate checks them
      const ref = $(el).attr(el.name === "link" ? "href" : "src");
      const t = internalTarget(ref, page.path, ctx.site);
      if (t && !t.samePage && !ctx.files.has(t.path.slice(1))) errors.push(`${page.path}: <${el.name}> ${ref} is not in dist/`);
    });
  }

  // Every _redirects target exists.
  for (const r of ctx.redirects) {
    const t = internalTarget(r.to, "/", ctx.site);
    if (t && !t.samePage && !exists(t.path)) errors.push(`_redirects: ${r.from} -> ${r.to} has no target`);
  }
  return { errors, warnings: [] };
}
