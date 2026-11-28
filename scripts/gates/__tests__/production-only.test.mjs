import { describe, expect, it } from "vitest";
import productionOnly from "../production-only.mjs";
import { ctx, EXAMPLE, fixture, page } from "./helpers.mjs";

describe("production-only gate", () => {
  it("passes a production build with no drafts", () => {
    expect(productionOnly(ctx({ registry: [EXAMPLE], pages: [page("/example", fixture("page-pass.html"))] })).errors).toEqual([]);
  });

  it("fails a draft entry or a draft registry page in a production build", () => {
    const r = productionOnly(ctx({ registry: [{ ...EXAMPLE, status: "draft" }], pages: [page("/example", fixture("page-pass.html")), page("/guides/example-guide", fixture("draft-page.html"))] }));
    expect(r.errors).toEqual(['/example: the registry says "draft", but the page is in the production build', "/guides/example-guide: a draft is in the production build"]);
  });

  it("skips deploy previews, which show drafts on purpose", () => {
    const r = productionOnly(ctx({ showDrafts: true, registry: [{ ...EXAMPLE, status: "draft" }], pages: [page("/example", fixture("draft-page.html"))] }));
    expect(r.errors).toEqual([]);
  });
});
