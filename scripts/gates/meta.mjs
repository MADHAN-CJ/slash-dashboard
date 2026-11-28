// meta gate: one H1, title and description within limits and equal to the registry or the entry's frontmatter,
// canonical, robots and Open Graph.
import { urlOf } from "./lib.mjs";

const clean = (s) => s.replace(/\s+/g, " ").trim();

export default function meta(ctx) {
  const errors = [];
  const registry = new Map(ctx.registry.map((e) => [e.path, e]));
  for (const page of ctx.pages) {
    const { $, path } = page;
    const self = urlOf(ctx.site, path);
    const entry = registry.get(path);
    const err = (m) => errors.push(`${path}: ${m}`);

    const h1 = $("h1");
    if (h1.length !== 1) err(`${h1.length} H1 elements (exactly one required)`);
    const title = $("head > title").text();
    const description = $('head > meta[name="description"]').attr("content") ?? "";
    if (!title) err("no <title>");
    else if (title.length > 60) err(`<title> is ${title.length} characters (60 at most)`);
    if (!description) err("no meta description");
    else if (description.length < 70 || description.length > 160) err(`meta description is ${description.length} characters (70 to 160)`);
    if (entry) {
      if (title !== entry.title) err(`<title> "${title}" is not the registry's "${entry.title}"`);
      if (description !== entry.description) err(`meta description is not the registry's`);
      if (h1.length === 1 && clean(h1.text()) !== entry.h1) err(`H1 "${clean(h1.text())}" is not the registry's "${entry.h1}"`);
    }
    // Collection pages compare with their entry's frontmatter: <title> is seoTitle or title, the H1 is title.
    const fm = ctx.entries?.get(path);
    if (fm) {
      for (const e of fm.errors) err(`${fm.file}: ${e}`);
      const v = fm.values;
      if (v.title !== undefined && title !== (v.seoTitle ?? v.title)) err(`<title> "${title}" is not the frontmatter's "${v.seoTitle ?? v.title}"`);
      if (v.description !== undefined && description !== v.description) err("meta description is not the frontmatter's");
      if (v.title !== undefined && h1.length === 1 && clean(h1.text()) !== v.title) err(`H1 "${clean(h1.text())}" is not the frontmatter's title "${v.title}"`);
    }

    // Robots: previews send noindex everywhere; production only where the registry says so.
    const robots = $('meta[name="robots"]').attr("content") ?? "";
    const sendsNoindex = robots.split(",").map((s) => s.trim()).includes("noindex");
    const noindex = Boolean(entry?.noindex);
    if (ctx.showDrafts && !sendsNoindex) err("deploy previews must send noindex");
    if (!ctx.showDrafts && sendsNoindex !== noindex) err(`robots is "${robots}", but the registry's noindex is ${noindex}`);

    // Canonical: absolute, self-referencing, no trailing slash. noindex pages have none.
    const canonical = $('link[rel="canonical"]');
    if (noindex) {
      if (canonical.length) err("noindex pages have no canonical");
    } else if (canonical.length !== 1) err(`${canonical.length} canonical links (exactly one required)`);
    else if (canonical.attr("href") !== self) err(`canonical ${canonical.attr("href")} is not ${self}`);

    const ogUrl = $('meta[property="og:url"]').attr("content");
    if (ogUrl !== self) err(`og:url ${ogUrl} is not ${self}`);
    const ogImage = $('meta[property="og:image"]').attr("content") ?? "";
    if (!ogImage.startsWith(`${ctx.site}/`) || !ctx.files.has(new URL(ogImage).pathname.slice(1))) err(`og:image "${ogImage}" is not a file in dist/`);
    if ($("html").attr("lang") !== "en") err('<html lang="en"> is missing');
  }
  return { errors, warnings: [] };
}
