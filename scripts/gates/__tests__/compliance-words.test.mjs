import { describe, expect, it } from "vitest";
import complianceWords from "../compliance-words.mjs";
import { ctx, fixture, page } from "./helpers.mjs";

describe("compliance-words gate", () => {
  it("passes copy without the single words, including options vocabulary", () => {
    const r = complianceWords(ctx({ pages: [page("/example", fixture("page-pass.html"))], llms: "# slash.markets\n\nResearch and analysis software." }));
    expect(r.errors).toEqual([]);
    expect(r.warnings).toEqual([]);
  });

  it("warns on tips, signals and recommendation in the copy and in llms.txt, without failing the build", () => {
    const r = complianceWords(ctx({ pages: [page("/example", fixture("compliance-words-fail.html"))], llms: "Our recommendations." }));
    expect(r.errors).toEqual([]);
    expect(r.warnings.map((w) => w.split(" (")[0])).toEqual(['/example: "tips"', '/example: "signals"', '/example: "recommendation"', '/llms.txt: "recommendations"']);
  });

  it("skips a word that compliance/allow.json approves for that page", () => {
    const allow = [{ path: "/example", phrase: "tips", reason: "Quoting a rule's title", approvedBy: "test", date: "2026-11-28" }];
    const r = complianceWords(ctx({ pages: [page("/example", fixture("compliance-words-fail.html"))], allow }));
    expect(r.warnings.map((w) => w.split(" (")[0])).toEqual(['/example: "signals"', '/example: "recommendation"']);
  });
});
