// facts gate: product facts in the copy match src/data/facts.json (CLAUDE.md, rule 5).
// - The data delay: every "delayed by at least N minutes" (and similar) must use the delay in facts.json.
//   Registry pages and llms.txt are checked in full. Articles describe other products too, so only their
//   sentences that name slash.markets are checked.
// - llms.txt carries the current one-line description.
import { collectionOf, escapeRe, pageSentences, sentences } from "./lib.mjs";

const MIN = "min(?:ute)?s?\\b";
export const DELAY_PATTERNS = [
  new RegExp(`delayed\\s+by\\s+(?:at\\s+least\\s+)?(\\d+)\\s*-?\\s*${MIN}`, "gi"),
  new RegExp(`delay\\s+of\\s+(?:at\\s+least\\s+)?(\\d+)\\s*-?\\s*${MIN}`, "gi"),
  new RegExp(`(\\d+)\\s*-?\\s*${MIN}\\s+(?:of\\s+)?delay`, "gi"),
  new RegExp(`(\\d+)\\s*-?\\s*${MIN}\\s+delayed`, "gi"),
];

export default function facts(ctx) {
  const errors = [];
  const f = ctx.facts;
  if (!f) return { errors: ["facts.json was not loaded"], warnings: [] };
  const delay = f.data.delayMinutes;
  const brands = [...new Set(["slash.markets", ...(ctx.brandNames ?? [])])].map((b) => new RegExp(escapeRe(b), "i"));
  const check = (where, list) => {
    for (const s of list) {
      for (const re of DELAY_PATTERNS) {
        for (const m of s.matchAll(re)) {
          if (Number(m[1]) !== delay) errors.push(`${where}: says a ${m[1]}-minute data delay, but facts.json says ${delay}: "${s.slice(0, 140)}"`);
        }
      }
    }
  };
  for (const page of ctx.pages) {
    const all = pageSentences(page.$);
    check(page.path, collectionOf(page.path) ? all.filter((s) => brands.some((b) => b.test(s))) : all);
  }
  if (ctx.llms) {
    check("/llms.txt", sentences(ctx.llms.split("\n")));
    if (!ctx.llms.includes(f.description)) errors.push("/llms.txt: does not carry the current description from facts.json");
  }
  return { errors, warnings: [] };
}
