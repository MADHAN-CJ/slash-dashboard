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
