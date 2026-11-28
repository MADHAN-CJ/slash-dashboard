// compliance gate (.claude/rules/compliance.md):
// - the banned phrases, in all of a page's copy and in llms.txt;
// - a /disclaimer link on every page, whenever /disclaimer is built;
// - a "coming" integration named in the same sentence as slash.markets, without "coming" or "soon"
//   (an error on registry pages, a warning in articles);
// - placeholder text in production (TODO, TBD, Lorem, [copy]);
// - the name (CLAUDE.md, hard rule 1): never the "/markets" word mark as text, and never "slash markets" in copy.
//   Structured data may keep "slash markets" as an alternateName.
// Banned-phrase exceptions live in compliance/allow.json ({ path, phrase, reason, approvedBy, date }); only Sahil approves them.
// The single words "tips", "signals" and "recommendation(s)" are the compliance-words gate (a warning).
import { collectionOf, copyText, escapeRe, pageSentences } from "./lib.mjs";

export const BANNED = [
  "stock tips", "trading tips",
  "buy call", "sell call", "buy or sell calls",
  "trading signals", "buy signal", "sell signal",
  "stock recommendations", "target price", "best stocks",
  "guaranteed returns", "guaranteed", "win rate", "backtest returns",
  "never miss a move",
];

const pattern = (phrase) => new RegExp(`(?:^|[^a-z0-9])${phrase.split(" ").join("\\s+")}(?=$|[^a-z0-9])`);
const PATTERNS = BANNED.map((phrase) => [phrase, pattern(phrase)]);

export const PLACEHOLDERS = [/\bTODO\b/, /\bTBD\b/, /\blorem\b/i, /\[copy\]/i];
// "/markets" on its own: not "slash.markets", and not a path such as "/markets-covered".
export const WORD_MARK = /(?<![\w.])\/markets(?![\w-])/;
export const WRONG_NAME = /\bslash\s+markets\b/i;
const SOON = /\b(coming|soon)\b/i;

export default function compliance(ctx) {
  const errors = [];
  const warnings = [];
  const allowed = (path, phrase) => (ctx.allow ?? []).some((a) => a.path === path && a.phrase.toLowerCase() === phrase);
  const scan = (path, text) => {
    const t = text.toLowerCase();
    for (const [phrase, re] of PATTERNS) if (re.test(t) && !allowed(path, phrase)) errors.push(`${path}: banned phrase "${phrase}"`);
  };
  for (const page of ctx.pages) scan(page.path, copyText(page.$));
  if (ctx.llms) scan("/llms.txt", ctx.llms);

  // Every page links /disclaimer from the footer once the page exists in this build.
  if (ctx.pages.some((p) => p.path === "/disclaimer")) {
    for (const page of ctx.pages) {
      if (page.path === "/disclaimer") continue;
      if (!page.$('a[href="/disclaimer"]').length) errors.push(`${page.path}: no link to /disclaimer`);
    }
  }

  // Coming integrations: only sentences that name slash.markets claim anything about them.
  const coming = (ctx.facts?.integrations ?? []).filter((i) => i.status === "coming");
  const brands = [...new Set(["slash.markets", ...(ctx.brandNames ?? [])])].map((b) => new RegExp(`(?:^|[^a-z0-9./])${escapeRe(b.toLowerCase())}(?![a-z0-9])`));
  if (coming.length) {
    for (const page of ctx.pages) {
      const inArticle = Boolean(collectionOf(page.path));
      for (const s of pageSentences(page.$)) {
        const lower = s.toLowerCase();
        if (!brands.some((b) => b.test(lower)) || SOON.test(s)) continue;
        for (const i of coming) {
          if (!new RegExp(`\\b${escapeRe(i.name)}\\b`, "i").test(s)) continue;
          const msg = `${page.path}: names ${i.name} (coming, not live) with slash.markets without "coming" or "soon": "${s.slice(0, 140)}"`;
          (inArticle ? warnings : errors).push(msg);
        }
      }
    }
  }

  // The name is written slash.markets: in the copy, og:site_name, structured data, llms.txt and RSS.
  const naming = (where, text, { copy }) => {
    if (WORD_MARK.test(text)) errors.push(`${where}: writes the name as "/markets"; write slash.markets (CLAUDE.md, hard rule 1)`);
    const wrong = copy && text.match(WRONG_NAME);
    if (wrong) errors.push(`${where}: writes the name as "${wrong[0]}"; write slash.markets (CLAUDE.md, hard rule 1)`);
  };
  for (const page of ctx.pages) {
    naming(page.path, copyText(page.$), { copy: true });
    naming(`${page.path} (og:site_name)`, page.$('meta[property="og:site_name"]').attr("content") ?? "", { copy: true });
    naming(`${page.path} (structured data)`, page.$('script[type="application/ld+json"]').text(), { copy: false });
  }
  if (ctx.llms) naming("/llms.txt", ctx.llms, { copy: true });
  if (ctx.rss) naming("/rss.xml", ctx.rss, { copy: true });

  // Placeholder text never ships.
  if (!ctx.showDrafts) {
    for (const page of ctx.pages) {
      const text = copyText(page.$);
      for (const re of PLACEHOLDERS) if (re.test(text)) errors.push(`${page.path}: placeholder text (${re.source.replace(/\\b|\\/g, "")})`);
    }
  }
  return { errors, warnings };
}
