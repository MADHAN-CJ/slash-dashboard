// compliance-words gate: the single words "tips", "signals" and "recommendation(s)" (.claude/rules/compliance.md).
// A warning, for review: options vocabulary ("call option", "put-call ratio") is never flagged.
// An approved use goes in compliance/allow.json with the word as the phrase.
import { copyText } from "./lib.mjs";

export const WORDS = ["tips", "signals", "recommendation", "recommendations"];
const RE = new RegExp(`\\b(${WORDS.join("|")})\\b`, "gi");

export default function complianceWords(ctx) {
  const warnings = [];
  const allowed = (path, word) => (ctx.allow ?? []).some((a) => a.path === path && a.phrase.toLowerCase() === word);
  const scan = (path, text) => {
    const found = new Set([...text.matchAll(RE)].map((m) => m[1].toLowerCase()));
    for (const w of found) if (!allowed(path, w)) warnings.push(`${path}: "${w}" (write "analysis", "briefs" or "alerts" instead, or ask Sahil for an allow.json entry)`);
  };
  for (const page of ctx.pages) scan(page.path, copyText(page.$));
  if (ctx.llms) scan("/llms.txt", ctx.llms);
  return { errors: [], warnings };
}
