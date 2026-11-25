// Runs every build gate on dist/ after `astro build` (npm run build). Any error fails the build.
// See .claude/rules/quality-gates.md. Node 24 imports the TypeScript registry and site config directly.
import { existsSync, readFileSync } from "node:fs";
import { PAGES } from "../../src/data/pages.ts";
import { SITE } from "../../src/config/site.ts";
import { fileToPath, listFiles, load, parseRedirects } from "./lib.mjs";
import urls from "./urls.mjs";
import meta from "./meta.mjs";
import schema from "./schema.mjs";
import sitemap from "./sitemap.mjs";
import style from "./style.mjs";
import compliance from "./compliance.mjs";

const GATES = { urls, meta, schema, sitemap, style, compliance };
const TEXT = /\.(astro|ts|mts|js|mjs|md|mdx|json|ya?ml|css|html|txt)$/;

const dist = process.argv[2] ?? "dist";
const read = (f) => (existsSync(f) ? readFileSync(f, "utf8") : null);
if (!existsSync(dist)) {
  console.error(`gates: ${dist}/ does not exist. Run astro build first.`);
  process.exit(1);
}

const files = listFiles(dist);
// Files in public/ are served as-is (/brand/, /brand-guidelines/): they are not built pages.
const asIs = new Set(listFiles("public"));
const pages = files
  .filter((f) => f.endsWith(".html") && !asIs.has(f))
  .map((file) => {
    const html = readFileSync(`${dist}/${file}`, "utf8");
    return { file, path: fileToPath(file), html, $: load(html) };
  });

const ctx = {
  site: SITE.url,
  showDrafts: process.env.SHOW_DRAFTS === "true",
  registry: PAGES,
  collectionRoutes: [],
  pages,
  files: new Set(files),
  redirects: parseRedirects(read(`${dist}/_redirects`) ?? ""),
  sitemap: read(`${dist}/sitemap.xml`),
  llms: read(`${dist}/llms.txt`),
  src: listFiles("src")
    .filter((f) => TEXT.test(f))
    .map((f) => ({ file: `src/${f}`, text: readFileSync(`src/${f}`, "utf8") })),
  styleExclude: [],
  allow: JSON.parse(read("compliance/allow.json") ?? "[]"),
};

console.log(`\ngates: ${pages.length} pages in ${dist}/ (${ctx.showDrafts ? "deploy preview: drafts shown" : "production"})`);
let failed = 0;
for (const [name, gate] of Object.entries(GATES)) {
  const { errors, warnings } = gate(ctx);
  console.log(`  ${errors.length ? "✗" : "✓"} ${name.padEnd(11)} ${errors.length} errors, ${warnings.length} warnings`);
  for (const e of errors) console.log(`      error: ${e}`);
  for (const w of warnings) console.log(`      warning: ${w}`);
  failed += errors.length;
}
if (failed) {
  console.error(`\ngates: ${failed} errors. The build fails.`);
  process.exit(1);
}
console.log("gates: all passed.\n");
