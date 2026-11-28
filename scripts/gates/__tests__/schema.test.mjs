import { describe, expect, it } from "vitest";
import schema from "../schema.mjs";
import { ctx, expectErrors, fixture, page } from "./helpers.mjs";

const withGraph = (graph) => `<!doctype html><html lang="en"><head><script type="application/ld+json">${graph}</script></head><body><h1>Home</h1></body></html>`;

describe("schema gate", () => {
  it("passes one graph with one Organization, a WebSite and the page's own node", () => {
    expect(schema(ctx({ pages: [page("/example", fixture("page-pass.html"))] })).errors).toEqual([]);
  });

  it("fails two blocks, a second Organization, a missing WebSite and a dangling @id", () => {
    const r = schema(ctx({ pages: [page("/example", fixture("schema-fail.html"))] }));
    expectErrors(r.errors, [
      "/example: 2 JSON-LD blocks (exactly one required)",
      "/example: 2 Organization nodes (exactly one required)",
      "/example: needs exactly one WebSite node, with @id https://slash.markets/#website",
      "/example: @id https://slash.markets/#website is referenced, but no node has it",
      "/example: no node with @id https://slash.markets/example#webpage",
    ]);
  });

  it("fails JSON-LD that does not parse", () => {
    expectErrors(schema(ctx({ pages: [page("/example", withGraph('{"@graph": ['))] })).errors, ["/example: JSON-LD does not parse"]);
  });

  it("needs a SoftwareApplication node on the home page", () => {
    const graph = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "Organization", "@id": "https://slash.markets/#organization" },
        { "@type": "WebSite", "@id": "https://slash.markets/#website" },
        { "@type": "WebPage", "@id": "https://slash.markets/#webpage" },
      ],
    });
    expect(schema(ctx({ pages: [page("/", withGraph(graph))] })).errors).toEqual(["/: the home page needs a SoftwareApplication node"]);
  });
});

describe("schema gate: articles and hubs", () => {
  it("passes an article with breadcrumbs, an Article and FAQ markup that matches the page", () => {
    expect(schema(ctx({ pages: [page("/guides/example-guide", fixture("article-pass.html"))] })).errors).toEqual([]);
  });

  it("fails a nested Organization, missing breadcrumb data, a bad author and publisher, and FAQ markup the page doesn't show", () => {
    const r = schema(ctx({ pages: [page("/guides/example-guide", fixture("article-fail.html"))] }));
    expectErrors(r.errors, [
      "/guides/example-guide: 1 nested Organization node(s): refer to https://slash.markets/#organization by @id instead",
      "/guides/example-guide: the page shows breadcrumbs, but has no BreadcrumbList node",
      "/guides/example-guide: the Article's author must be a Person with a name, or a reference to the Organization",
      "/guides/example-guide: the Article's publisher must be https://slash.markets/#organization",
      '/guides/example-guide: FAQPage question "Is this question on the page?" is not on the page',
      '/guides/example-guide: FAQPage answer to "Is this question on the page?" is not on the page',
    ]);
  });

  it("needs an ItemList on best lists and comparisons, breadcrumbs on articles, and a CollectionPage on hubs", () => {
    const best = schema(ctx({ pages: [page("/best/example-guide", fixture("article-pass.html").replaceAll("/guides/example-guide", "/best/example-guide"))] }));
    expect(best.errors).toEqual(["/best/example-guide: a best list needs an ItemList node"]);
    const noCrumbs = fixture("article-pass.html").replace(/<nav aria-label="Breadcrumb">[\s\S]*?<\/nav>/, "");
    expectErrors(schema(ctx({ pages: [page("/guides/example-guide", noCrumbs)] })).errors, ["/guides/example-guide: articles and hubs show breadcrumbs"]);
    const hub = fixture("article-pass.html").replaceAll("/guides/example-guide", "/guides");
    expectErrors(schema(ctx({ pages: [page("/guides", hub)] })).errors, ["/guides: a hub's page node must be a CollectionPage"]);
    expect(schema(ctx({ pages: [page("/guides", hub.replace('"@type":"WebPage"', '"@type":"CollectionPage"'))] })).errors).toEqual([]);
  });
});
