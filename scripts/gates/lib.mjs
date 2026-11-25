// Shared helpers for the build gates (.claude/rules/quality-gates.md).
// Gates parse HTML and XML with cheerio, never with regular expressions.
import { readdirSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import * as cheerio from "cheerio";

export const load = (html) => cheerio.load(html);
export const loadXml = (xml) => cheerio.load(xml, { xml: true });

// Every file under dir, as a POSIX path relative to dir.
export function listFiles(dir) {
  const out = [];
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else out.push(relative(dir, p).split(sep).join("/"));
    }
  };
  if (existsSync(dir)) walk(dir);
  return out;
}

// A built file's URL: index.html is "/", privacy.html is "/privacy" (build.format "file").
export const fileToPath = (file) => (file === "index.html" ? "/" : `/${file.replace(/\.html$/, "")}`);

// The absolute URL of a page path, e.g. https://slash.markets/privacy.
export const urlOf = (site, path) => new URL(path, site).href;

// Same rule as isPublic() in src/data/pages.ts.
export const isPublicEntry = (entry, showDrafts) => entry.status === "live" || (showDrafts && entry.status === "draft");

// Where a link on pagePath goes. null for other sites, mailto:, tel: and data: URLs.
export function internalTarget(href, pagePath, site) {
  if (href === undefined) return null;
  if (href.startsWith("#")) return { samePage: true, hash: decodeURIComponent(href.slice(1)) };
  let u;
  try {
    u = new URL(href, urlOf(site, pagePath));
  } catch {
    return null;
  }
  if (u.origin !== new URL(site).origin) return null;
  return { samePage: false, path: decodeURIComponent(u.pathname), hash: decodeURIComponent(u.hash.slice(1)) };
}

export const hasId = ($, id) => $("[id]").filter((_, e) => $(e).attr("id") === id).length > 0;

const SKIP = new Set(["script", "style", "noscript", "template"]);
const BLOCK = new Set([
  "address", "article", "aside", "blockquote", "br", "button", "dd", "div", "dl", "dt", "fieldset", "figcaption",
  "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr", "label", "li", "main", "nav",
  "ol", "option", "p", "pre", "section", "table", "td", "th", "tr", "ul",
]);

// The text a reader sees in the body: no scripts or styles, with a space between blocks.
export function visibleText($) {
  const parts = [];
  const walk = (nodes) => {
    for (const n of nodes) {
      if (n.type === "text") parts.push(n.data);
      else if (n.children && !SKIP.has(n.name)) {
        const block = BLOCK.has(n.name);
        if (block) parts.push(" ");
        walk(n.children);
        if (block) parts.push(" ");
      }
    }
  };
  walk($("body").toArray());
  return parts.join("").replace(/\s+/g, " ").trim();
}

// All the copy on a page that compliance rules cover: body text, title, descriptions and attribute text.
export function copyText($) {
  const attrs = [];
  $("[alt], [aria-label], [title], [placeholder]").each((_, e) => {
    for (const a of ["alt", "aria-label", "title", "placeholder"]) if ($(e).attr(a)) attrs.push($(e).attr(a));
  });
  const metas = ['meta[name="description"]', 'meta[property="og:title"]', 'meta[property="og:description"]'].map((s) => $(s).attr("content") ?? "");
  return [$("head > title").text(), ...metas, visibleText($), ...attrs].join(" \n ");
}

// public/_redirects lines: "from to status". Comments and blank lines are skipped.
export function parseRedirects(text) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const [from, to, status] = l.split(/\s+/);
      return { from, to, status };
    });
}
