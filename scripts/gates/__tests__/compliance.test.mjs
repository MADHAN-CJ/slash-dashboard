import { describe, expect, it } from "vitest";
import compliance from "../compliance.mjs";
import { ctx, expectErrors, fixture, HOME_HTML, page } from "./helpers.mjs";

describe("compliance gate", () => {
  it("passes clean copy, including options vocabulary", () => {
    const r = compliance(ctx({ pages: [page("/example", fixture("page-pass.html"))], llms: "# slash.markets\n\nResearch and analysis software." }));
    expect(r.errors).toEqual([]);
  });

  it("fails banned phrases in the title, description, body, alt text and llms.txt", () => {
    const r = compliance(ctx({ pages: [page("/example", fixture("compliance-fail.html"))], llms: "We make sure you never miss a move." }));
    expectErrors(r.errors, [
      '/example: banned phrase "best stocks"',
      '/example: banned phrase "trading tips"',
      '/example: banned phrase "target price"',
      '/example: banned phrase "guaranteed"',
      '/llms.txt: banned phrase "never miss a move"',
    ]);
  });

  it("allows a phrase only where compliance/allow.json approves it", () => {
    const html = '<!doctype html><html lang="en"><head><title>How a buy call option works</title></head><body><h1>How a buy call option works</h1></body></html>';
    const allow = [{ path: "/example", phrase: "buy call", reason: "Educational", approvedBy: "test", date: "2026-11-25" }];
    expect(compliance(ctx({ pages: [page("/example", html)] })).errors).toEqual(['/example: banned phrase "buy call"']);
    expect(compliance(ctx({ pages: [page("/example", html)], allow })).errors).toEqual([]);
    expect(compliance(ctx({ pages: [page("/other", html)], allow })).errors).toEqual(['/other: banned phrase "buy call"']);
  });
});

describe("compliance gate: disclaimer link, coming integrations and placeholders", () => {
  const article = () => page("/guides/example-guide", fixture("article-pass.html"));
  const disclaimer = () => page("/disclaimer", HOME_HTML);

  it("passes an article that links /disclaimer, marks coming integrations and has no placeholder text", () => {
    const r = compliance(ctx({ pages: [article(), disclaimer()] }));
    expect(r.errors).toEqual([]);
    expect(r.warnings).toEqual([]);
  });

  it("needs a /disclaimer link on every page once /disclaimer is built", () => {
    const pages = [page("/guides/example-guide", fixture("article-fail.html")), disclaimer()];
    expectErrors(compliance(ctx({ pages, showDrafts: true })).errors, ["/guides/example-guide: no link to /disclaimer"]);
    expect(compliance(ctx({ pages: [page("/guides/example-guide", fixture("article-fail.html"))], showDrafts: true })).errors).toEqual([]);
  });

  it("errors on a registry page, and warns in an article, that names a coming integration with slash.markets", () => {
    const html = '<!doctype html><html lang="en"><head><title>Example</title></head><body><p>slash.markets works with ChatGPT.</p><p>slash.markets works with Claude, and Kite is coming soon.</p><p>Kite MCP is free, and slash.markets now works with Kite.</p></body></html>';
    expect(compliance(ctx({ pages: [page("/example", html)] })).errors).toEqual([
      '/example: names ChatGPT (coming, not live) with slash.markets without "coming" or "soon": "slash.markets works with ChatGPT."',
      '/example: names Kite (coming, not live) with slash.markets without "coming" or "soon": "Kite MCP is free, and slash.markets now works with Kite."',
    ]);
    const inArticle = compliance(ctx({ pages: [page("/guides/example-guide", fixture("article-fail.html"))], showDrafts: true }));
    expect(inArticle.errors).toEqual([]);
    expect(inArticle.warnings).toEqual(['/guides/example-guide: names ChatGPT (coming, not live) with slash.markets without "coming" or "soon": "slash.markets works with ChatGPT."']);
  });

  it("fails placeholder text in production, but not on deploy previews", () => {
    const pages = [page("/guides/example-guide", fixture("article-fail.html"))];
    expectErrors(compliance(ctx({ pages })).errors, ["/guides/example-guide: placeholder text (TODO)"]);
    expect(compliance(ctx({ pages, showDrafts: true })).errors).toEqual([]);
  });
});

describe("compliance gate: the name", () => {
  it("passes slash.markets in copy, a /markets-covered path, and slash markets as a structured-data alternateName", () => {
    const html = '<!doctype html><html lang="en"><head><title>Markets covered · slash.markets</title><meta property="og:site_name" content="slash.markets"><script type="application/ld+json">{"@graph":[{"@type":"Organization","name":"slash.markets","alternateName":["slash markets"],"logo":"https://slash.markets/assets/icons/markets-logomark.svg"}]}</script></head><body><h1>Markets covered</h1><p>See <a href="/markets-covered">/markets-covered</a> for what slash.markets covers.</p></body></html>';
    const r = compliance(ctx({ pages: [page("/example", html)], llms: "# slash.markets\n", rss: "<rss><channel><title>slash.markets</title></channel></rss>" }));
    expect(r.errors).toEqual([]);
  });

  it("fails the /markets word mark and slash markets written as text, wherever they appear", () => {
    const r = compliance(ctx({ pages: [page("/example", fixture("naming-fail.html"))], llms: "# /markets\n", rss: "<rss><channel><title>Slash Markets</title></channel></rss>" }));
    expect(r.errors).toEqual([
      '/example: writes the name as "/markets"; write slash.markets (CLAUDE.md, hard rule 1)',
      '/example: writes the name as "Slash Markets"; write slash.markets (CLAUDE.md, hard rule 1)',
      '/example (og:site_name): writes the name as "/markets"; write slash.markets (CLAUDE.md, hard rule 1)',
      '/example (structured data): writes the name as "/markets"; write slash.markets (CLAUDE.md, hard rule 1)',
      '/llms.txt: writes the name as "/markets"; write slash.markets (CLAUDE.md, hard rule 1)',
      '/rss.xml: writes the name as "Slash Markets"; write slash.markets (CLAUDE.md, hard rule 1)',
    ]);
  });
});
