import { describe, expect, it } from "vitest";
import style from "../style.mjs";
import { ctx, fixture } from "./helpers.mjs";

describe("style gate", () => {
  it("passes text without em dashes", () => {
    expect(style(ctx({ src: [{ file: "src/content/example.md", text: fixture("style-pass.md") }] })).errors).toEqual([]);
  });

  it("fails an em dash, naming the file and line", () => {
    expect(style(ctx({ src: [{ file: "src/content/example.md", text: fixture("style-fail.md") }] })).errors).toEqual([
      "src/content/example.md:4: em dash (use a comma, a colon or a full stop)",
    ]);
  });

  it("skips excluded vendored or licensed text", () => {
    const r = style(ctx({ src: [{ file: "src/vendor/licence.md", text: fixture("style-fail.md") }], styleExclude: ["src/vendor/"] }));
    expect(r.errors).toEqual([]);
  });
});
