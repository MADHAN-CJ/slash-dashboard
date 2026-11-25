import { describe, expect, it } from "vitest";
import meta from "../meta.mjs";
import { ctx, EXAMPLE, expectErrors, fixture, page } from "./helpers.mjs";

const files = new Set(["og/default.jpg"]);
const good = () => [page("/example", fixture("page-pass.html"))];

describe("meta gate", () => {
  it("passes a head that matches the registry", () => {
    expect(meta(ctx({ registry: [EXAMPLE], pages: good(), files })).errors).toEqual([]);
  });

  it("fails a broken head", () => {
    const r = meta(ctx({ registry: [EXAMPLE], pages: [page("/example", fixture("meta-fail.html"))], files }));
    expectErrors(r.errors, [
      "/example: 2 H1 elements (exactly one required)",
      "(60 at most)",
      "/example: <title> \"An example page title",
      "/example: meta description is 10 characters (70 to 160)",
      "/example: meta description is not the registry's",
      "/example: canonical https://slash.markets/example/ is not https://slash.markets/example",
      "/example: og:url https://slash.markets/other is not https://slash.markets/example",
      '/example: og:image "https://slash.markets/og/missing.jpg" is not a file in dist/',
      '/example: <html lang="en"> is missing',
    ]);
  });

  it("needs noindex and no canonical where the registry says noindex", () => {
    const r = meta(ctx({ registry: [{ ...EXAMPLE, noindex: true }], pages: good(), files }));
    expectErrors(r.errors, ["/example: robots is \"index, follow, max-image-preview:large\", but the registry's noindex is true", "/example: noindex pages have no canonical"]);
  });

  it("needs noindex on every page of a deploy preview", () => {
    expect(meta(ctx({ registry: [EXAMPLE], pages: good(), files, showDrafts: true })).errors).toEqual(["/example: deploy previews must send noindex"]);
  });
});
