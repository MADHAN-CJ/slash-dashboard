// freshness gate: a rules page whose "Checked on" date is more than 60 days old (.claude/rules/content-model.md).
// A warning: re-check the page against its official source, then update checkedOn.
export const MAX_AGE_DAYS = 60;
const DAY = 24 * 60 * 60 * 1000;

export default function freshness(ctx) {
  const warnings = [];
  const now = ctx.now ?? new Date();
  for (const page of ctx.pages) {
    if (!page.path.startsWith("/rules/")) continue;
    const when = page.$("time[data-checked-on]").attr("datetime");
    if (!when) {
      warnings.push(`${page.path}: no "Checked on" date`);
      continue;
    }
    const age = Math.floor((now - new Date(`${when}T00:00:00Z`)) / DAY);
    if (age > MAX_AGE_DAYS) warnings.push(`${page.path}: checked ${age} days ago (${when}); re-check it against the official source`);
  }
  return { errors: [], warnings };
}
