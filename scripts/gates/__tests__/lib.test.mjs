import { describe, expect, it } from "vitest";
import { frontmatter, load, pageSentences, visibleBlocks } from "../lib.mjs";

describe("gate helpers", () => {
  it("reads double-quoted frontmatter fields and refuses the rest", () => {
    const text = '---\ntitle: "Kite MCP: what it does" # the H1\nseoTitle: Unquoted title\ndescription: "Says \\"hello\\" twice."\ndraft: true\n---\n\n## Body\n';
    expect(frontmatter(text, ["title", "seoTitle", "description"])).toEqual({
      values: { title: "Kite MCP: what it does", description: 'Says "hello" twice.' },
      errors: ["put the seoTitle in double quotes on one line"],
    });
    expect(frontmatter("no frontmatter here", ["title"]).errors).toEqual(["has no frontmatter"]);
  });

  it("splits text at blocks and sentences, and keeps side-by-side inline elements apart", () => {
    const $ = load('<html><head><title>A title</title></head><body><p>One. Two at slash.markets.</p><div><span>RSI 14</span><span>15 min delayed</span></div><pre>line one\nline two</pre></body></html>');
    expect(visibleBlocks($)).toEqual(["One. Two at slash.markets.", "RSI 14 15 min delayed", "line one line two"]);
    expect(pageSentences($)).toEqual(["A title", "One.", "Two at slash.markets.", "RSI 14 15 min delayed", "line one line two"]);
  });
});
