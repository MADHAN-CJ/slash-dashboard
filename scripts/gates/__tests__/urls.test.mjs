import { describe, expect, it } from "vitest";
import urls from "../urls.mjs";
import { ctx, EXAMPLE, expectErrors, fixture, HOME, HOME_HTML, page } from "./helpers.mjs";

const files = new Set(["assets/chart.webp", "assets/icons/logo.svg", "og/default.jpg"]);
const redirects = [{ from: "/old.html", to: "/example", status: "301!" }];

describe("urls gate", () => {
  it("passes clean links, files that exist and pages that match the registry", () => {
    const r = urls(ctx({ registry: [HOME, EXAMPLE], pages: [page("/", HOME_HTML), page("/example", fixture("page-pass.html"))], files, redirects }));
    expect(r.errors).toEqual([]);
  });

  it("fails bad links, missing files, pages outside the registry and broken redirects", () => {
    const r = urls(
      ctx({
        registry: [HOME, EXAMPLE, { ...EXAMPLE, path: "/soon", status: "planned" }, { ...EXAMPLE, path: "/missing-page" }],
        pages: [page("/", HOME_HTML), page("/example", fixture("urls-fail.html")), page("/soon", HOME_HTML), page("/Bad_Slug", HOME_HTML), page("/a/b", HOME_HTML)],
        files,
        redirects: [...redirects, { from: "/gone.html", to: "/nowhere", status: "301!" }],
      }),
    );
    expectErrors(r.errors, [
      "/example: link /example/ has a trailing slash",
      "/example: link /example.html uses .html",
      "/example: link /old.html points at a redirected URL",
      "/example: link /nowhere has no target",
      "/example: link #nothing points at a missing id",
      "/example: link /#gone points at a missing id",
      "/example: <img> /assets/missing.webp is not in dist/",
      "/example: <link> /missing.css?v=1 is not in dist/",
      '/soon is built, but the registry says "planned"',
      "/Bad_Slug is built, but is not in src/data/pages.ts or a collection",
      '/Bad_Slug: "Bad_Slug" is not lowercase words joined by hyphens',
      "/a/b: the parent URL /a has no page",
      "/missing-page is live in the registry, but was not built",
      "_redirects: /gone.html -> /nowhere has no target",
    ]);
  });
});

describe("urls gate: collection pages", () => {
  const hub = { ...EXAMPLE, path: "/guides", h1: "Guides" };
  const collectionRoutes = ["/guides/", "/best/", "/rules/", "/compare/"];
  const BARE = '<!doctype html><html lang="en"><head><title>Page</title></head><body><h1>Page</h1></body></html>';

  it("accepts an article under its built hub", () => {
    const r = urls(ctx({ registry: [HOME, hub], collectionRoutes, pages: [page("/", BARE), page("/guides", BARE), page("/guides/example-guide", BARE)] }));
    expect(r.errors).toEqual([]);
  });

  it("fails an article whose hub was not built, and a page outside every collection", () => {
    const r = urls(ctx({ registry: [HOME, { ...hub, status: "draft" }], collectionRoutes, pages: [page("/", BARE), page("/guides/example-guide", BARE), page("/blog/example", BARE)] }));
    expectErrors(r.errors, ["/guides/example-guide: the parent URL /guides has no page", "/blog/example is built, but is not in src/data/pages.ts or a collection"]);
  });
});
