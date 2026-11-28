import { describe, expect, it } from "vitest";
import freshness from "../freshness.mjs";
import { ctx, fixture, page } from "./helpers.mjs";

describe("freshness gate", () => {
  it("passes a rules page checked within the last 60 days", () => {
    const r = freshness(ctx({ pages: [page("/rules/example-rule", fixture("freshness-pass.html"))] }));
    expect(r.errors).toEqual([]);
    expect(r.warnings).toEqual([]);
  });

  it("warns, without failing the build, on a rules page checked more than 60 days ago", () => {
    const r = freshness(ctx({ pages: [page("/rules/example-rule", fixture("freshness-fail.html"))] }));
    expect(r.errors).toEqual([]);
    expect(r.warnings).toEqual(["/rules/example-rule: checked 88 days ago (2026-09-01); re-check it against the official source"]);
  });

  it("warns on a rules page with no checked-on date, and ignores pages outside /rules", () => {
    const r = freshness(ctx({ pages: [page("/rules/no-date", fixture("page-pass.html")), page("/guides/example-guide", fixture("freshness-fail.html"))] }));
    expect(r.warnings).toEqual(['/rules/no-date: no "Checked on" date']);
  });
});
