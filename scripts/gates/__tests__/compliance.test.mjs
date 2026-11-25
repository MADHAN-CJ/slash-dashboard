import { describe, expect, it } from "vitest";
import compliance from "../compliance.mjs";
import { ctx, expectErrors, fixture, page } from "./helpers.mjs";

describe("compliance gate", () => {
  it("passes clean copy, including options vocabulary", () => {
    const r = compliance(ctx({ pages: [page("/example", fixture("page-pass.html"))], llms: "# /markets\n\nResearch and analysis software." }));
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
