// Phase 1 check: the ported homepage must match the old one.
// Usage: node scripts/compare-homepage.mjs <old index.html> dist/index.html
import { readFileSync } from "node:fs";

const [oldFile, newFile] = process.argv.slice(2);
const a = readFileSync(oldFile, "utf8");
const b = readFileSync(newFile, "utf8");
const body = (h) => h.slice(h.indexOf("<body"), h.lastIndexOf("</body>"));
const text = (h) => body(h)
  .replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ")
  .replace(/<[^>]+>/g, (t) => (/^<\/?(span|a|strong|b|i|em|code|small|img)\b/i.test(t) ? "" : " "))
  .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const tags = (h) => { const m = {}; for (const x of body(h).matchAll(/<([a-z0-9-]+)[\s>]/gi)) m[x[1].toLowerCase()] = (m[x[1].toLowerCase()] || 0) + 1; return m; };
const attrs = (h) => [...body(h).matchAll(/\s(id|class|data-[a-z-]+|aria-[a-z-]+|style)="([^"]*)"/g)].map((m) => `${m[1]}=${m[2]}`);

const ta = text(a), tb = text(b);
const A = tags(a), B = tags(b);
const tagDiff = Object.keys({ ...A, ...B }).filter((k) => A[k] !== B[k]);
const sameAttrs = JSON.stringify(attrs(a)) === JSON.stringify(attrs(b));
console.log(`visible text identical: ${ta === tb} (${ta.length} vs ${tb.length} characters)`);
if (ta !== tb) { let i = 0; while (ta[i] === tb[i]) i++; console.log(`  old: ${JSON.stringify(ta.slice(i - 50, i + 50))}\n  new: ${JSON.stringify(tb.slice(i - 50, i + 50))}`); }
console.log(`element counts identical: ${tagDiff.length === 0}${tagDiff.length ? ` (${tagDiff.join(", ")})` : ""}`);
console.log(`id, class, data-*, aria-* and style attributes identical: ${sameAttrs}`);
process.exit(ta === tb && tagDiff.length === 0 && sameAttrs ? 0 : 1);
