import { describe, expect, it } from "vitest";
import sitemap from "../sitemap.mjs";
import { ctx, EXAMPLE, expectErrors, fixture, HOME, HOME_HTML, page } from "./helpers.mjs";

const registry = [HOME, EXAMPLE, { ...EXAMPLE, path: "/404", noindex: true }];
const pages = [page("/", HOME_HTML), page("/example", HOME_HTML), page("/404", HOME_HTML)];

describe("sitemap gate", () => {
  it("passes a sitemap that lists exactly the indexable pages", () => {
    expect(sitemap(ctx({ registry, pages, sitemap: fixture("sitemap-pass.xml") })).errors).toEqual([]);
  });

  it("fails missing, noindex, unbuilt and repeated URLs", () => {
    const r = sitemap(ctx({ registry, pages, sitemap: fixture("sitemap-fail.xml") }));
    expectErrors(r.errors, [
      "/example is indexable, but is not in sitemap.xml",
      "/404 is noindex, but is in sitemap.xml",
      "sitemap.xml lists https://slash.markets/ghost, which is not a built page",
      "sitemap.xml lists a URL more than once",
    ]);
  });

  it("fails when there is no sitemap", () => {
    expect(sitemap(ctx({ registry, pages })).errors).toEqual(["dist/sitemap.xml is missing"]);
  });
});
