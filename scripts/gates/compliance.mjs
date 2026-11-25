// compliance gate, first version: the banned phrases in .claude/rules/compliance.md, in all of a page's copy.
// Exceptions live in compliance/allow.json ({ path, phrase, reason, approvedBy, date }); only Sahil approves them.
// Later versions add: the /disclaimer link on every page (once /disclaimer is live), "coming" integrations,
// and placeholder text. The single words "tips", "signals" and "recommendation(s)" are the compliance-words warning.
import { copyText } from "./lib.mjs";

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

export default function compliance(ctx) {
  const errors = [];
  const allowed = (path, phrase) => (ctx.allow ?? []).some((a) => a.path === path && a.phrase.toLowerCase() === phrase);
  const scan = (path, text) => {
    const t = text.toLowerCase();
    for (const [phrase, re] of PATTERNS) if (re.test(t) && !allowed(path, phrase)) errors.push(`${path}: banned phrase "${phrase}"`);
  };
  for (const page of ctx.pages) scan(page.path, copyText(page.$));
  if (ctx.llms) scan("/llms.txt", ctx.llms);
  return { errors, warnings: [] };
}
