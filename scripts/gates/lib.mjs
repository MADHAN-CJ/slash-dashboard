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

// The body's text as a reader sees it, split at block elements: no scripts or styles.
// Line breaks inside a block are only whitespace; the block boundary is a character text never holds.
const BREAK = "\u0000";
export function visibleBlocks($) {
  const parts = [];
  const walk = (nodes) => {
    for (const n of nodes) {
      if (n.type === "text") parts.push(n.data);
      else if (n.children && !SKIP.has(n.name)) {
        const block = BLOCK.has(n.name);
        if (block) parts.push(BREAK);
        walk(n.children);
        // Inline elements often sit side by side with spacing from CSS only ("RSI 14" then "15 min delayed").
        parts.push(block ? BREAK : " ");
      }
    }
  };
  walk($("body").toArray());
  return parts
    .join("")
    .split(BREAK)
    .map((b) => b.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

// The text a reader sees in the body, with a space between blocks.
export const visibleText = ($) => visibleBlocks($).join(" ");

// Sentences: each block (heading, paragraph, list item, cell) split after ".", "!" or "?" and a space.
// "slash.markets" stays whole because its dot has no space after it.
export const sentences = (blocks) => blocks.flatMap((b) => b.split(/(?<=[.!?])\s+/)).filter(Boolean);

// The page's title and meta description, plus its body sentences.
export const pageSentences = ($) => sentences([$("head > title").text(), $('head > meta[name="description"]').attr("content") ?? "", ...visibleBlocks($)].filter(Boolean));

// Drafts carry data-draft="true" on <html> (src/layouts/Base.astro). Production never builds them.
export const isDraftPage = ($) => $("html").attr("data-draft") === "true";

// What kind of page a path is: the four article hubs, an article in one of them, or another page.
export const ARTICLE_HUBS = ["guides", "best", "rules", "compare"];
export const collectionOf = (path) => ARTICLE_HUBS.find((c) => path.startsWith(`/${c}/`)) ?? null;
export const isHub = (path) => ARTICLE_HUBS.some((c) => path === `/${c}`);

// Escapes a phrase for use inside a regular expression.
export const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// The frontmatter fields the meta gate compares with the built page. Each must be one double-quoted line,
// as content-model.md asks (it also stops a ": " inside the value from breaking YAML).
export function frontmatter(text, keys) {
  const block = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const values = {};
  const errors = [];
  if (!block) return { values, errors: ["has no frontmatter"] };
  for (const line of block[1].split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z]+):[ \t]*(.*)$/);
    if (!m || !keys.includes(m[1])) continue;
    // A double-quoted value, then optionally a # comment.
    const quoted = m[2].trim().match(/^("(?:[^"\\]|\\.)*")\s*(?:#.*)?$/);
    if (!quoted) {
      errors.push(`put the ${m[1]} in double quotes on one line`);
      continue;
    }
    try {
      values[m[1]] = JSON.parse(quoted[1]);
    } catch {
      errors.push(`can't read the ${m[1]}: use plain double-quoted text`);
    }
  }
  return { values, errors };
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
