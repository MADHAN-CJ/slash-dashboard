// Phase 1: port index.html to src/pages/index.astro without changing the page.
// Usage: node scripts/port-homepage.mjs index.html src/pages/index.astro
import { readFileSync, writeFileSync } from "node:fs";

const [src, out] = process.argv.slice(2);
const html = readFileSync(src, "utf8");
const between = (from, to, start = 0) => {
  const a = html.indexOf(from, start);
  const b = html.indexOf(to, a + from.length);
  if (a < 0 || b < 0) throw new Error(`Marker not found: ${from} ... ${to}`);
  return { text: html.slice(a + from.length, b), end: b + to.length };
};
const style = between("<style>", "</style>");
const bodyStart = html.indexOf("<body>") + "<body>".length;
const scriptAt = html.indexOf("<script>", bodyStart);
const script = between("<script>", "</script>", bodyStart);
if (bodyStart < 6 || scriptAt < 0) throw new Error("Unexpected index.html structure: stop and check by hand");
let body = html.slice(bodyStart, scriptAt).replace(/^\n+|\s+$/g, "");
// The only body changes: the legal links move to clean URLs.
body = body.replaceAll('href="privacy.html"', 'href="/privacy"').replaceAll('href="terms.html"', 'href="/terms"');
const tail = html.slice(script.end, html.indexOf("</body>"));
for (const tag of ['src="tool-studio.js?v=8"', 'src="waitlist.js?v=1"']) {
  if (!tail.includes(tag)) throw new Error(`Expected ${tag} after the inline script: stop and check by hand`);
}

writeFileSync(out, `---
// The homepage, ported unchanged from index.html (Phase 1). Only <head> metadata and the
// legal links changed. Legacy CSS and JS stay inline (is:inline) so Astro neither scopes nor bundles them.
// Sunny's new Home replaces this file in Phase 3.
import Seo from "../components/seo/Seo.astro";
import { page } from "../data/pages";
import { graph, webPage, softwareApplication } from "../lib/graph";
const p = page("/");
const g = graph(webPage({ path: p.path, name: p.title, description: p.description }), softwareApplication());
---
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<Seo title={p.title} description={p.description} path={p.path} graph={g} />
<link rel="stylesheet" href="/tool-studio.css?v=15">
<style is:inline>${style.text}</style>
</head>
<body>
${body}

<script is:inline>${script.text}</script>
<script is:inline src="/tool-studio.js?v=8" defer></script>
<script is:inline type="module" src="/waitlist.js?v=1"></script>
</body>
</html>
`);
console.log(`Wrote ${out}`);
