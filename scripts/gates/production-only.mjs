// production-only gate: a production build ships no drafts (.claude/rules/quality-gates.md).
// No page carries the draft marker, and no page the registry calls "draft" was built.
// Deploy previews (SHOW_DRAFTS=true) show drafts on purpose, so the gate skips them.
import { isDraftPage } from "./lib.mjs";

export default function productionOnly(ctx) {
  const errors = [];
  if (ctx.showDrafts) return { errors, warnings: [] };
  const registry = new Map(ctx.registry.map((e) => [e.path, e]));
  for (const page of ctx.pages) {
    if (isDraftPage(page.$)) errors.push(`${page.path}: a draft is in the production build`);
    if (registry.get(page.path)?.status === "draft") errors.push(`${page.path}: the registry says "draft", but the page is in the production build`);
  }
  return { errors, warnings: [] };
}
