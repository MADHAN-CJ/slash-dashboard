// style gate: no em dashes in src/ (CLAUDE.md, rule 10). Vendored or licensed text can be excluded by path.
const EM_DASH = "\u2014"; // the em dash character

export default function style(ctx) {
  const errors = [];
  const excluded = ctx.styleExclude ?? [];
  for (const { file, text } of ctx.src) {
    if (excluded.some((p) => file.startsWith(p))) continue;
    text.split("\n").forEach((line, i) => {
      if (line.includes(EM_DASH)) errors.push(`${file}:${i + 1}: em dash (use a comma, a colon or a full stop)`);
    });
  }
  return { errors, warnings: [] };
}
