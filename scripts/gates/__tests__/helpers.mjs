// Shared setup for the gate tests: fixtures, registry entries and a gate context.
import { readFileSync } from "node:fs";
import { expect } from "vitest";
import { load } from "../lib.mjs";

export const SITE = "https://slash.markets";
export const fixture = (name) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");
export const page = (path, html) => ({ file: path === "/" ? "index.html" : `${path.slice(1)}.html`, path, html, $: load(html) });

const signoff = { by: "test", on: "2026-11-25" };
export const EXAMPLE = {
  path: "/example",
  title: "Example page · /markets",
  description: "A short example page used by the gate tests. It has a title, a description, one H1 and a valid graph.",
  h1: "Example page",
  nav: "footer",
  status: "live",
  signoff,
};
export const HOME = {
  path: "/",
  title: "Home · /markets",
  description: "The home page of the gate tests, with a link to the example page and nothing else on it.",
  h1: "Home",
  nav: "none",
  status: "live",
  signoff,
};
export const HOME_HTML = `<!doctype html><html lang="en"><head><title>Home · /markets</title></head><body><h1>Home</h1><a href="/example">Example page</a></body></html>`;

export const ctx = (over = {}) => ({
  site: SITE,
  showDrafts: false,
  registry: [],
  collectionRoutes: [],
  pages: [],
  files: new Set(),
  redirects: [],
  sitemap: null,
  llms: null,
  src: [],
  styleExclude: [],
  allow: [],
  ...over,
});

// Each expected message must appear in at least one error.
export function expectErrors(errors, expected) {
  for (const m of expected) expect(errors.some((e) => e.includes(m)), `expected an error containing: ${m}\ngot:\n${errors.join("\n")}`).toBe(true);
}
