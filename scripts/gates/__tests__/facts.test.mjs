import { describe, expect, it } from "vitest";
import facts from "../facts.mjs";
import { ctx, expectErrors, FACTS, fixture, page } from "./helpers.mjs";

const llms = `# slash.markets\n\n> ${FACTS.description}\n\nMarket data is delayed by at least 15 minutes.\n`;

describe("facts gate", () => {
  it("passes delays that match facts.json, and leaves other products' delays in articles alone", () => {
    expect(facts(ctx({ pages: [page("/guides/example-guide", fixture("article-pass.html"))], llms })).errors).toEqual([]);
  });

  it("fails a wrong delay anywhere on a registry page, and in an article sentence that names slash.markets", () => {
    const registryPage = '<!doctype html><html lang="en"><head><title>Example</title></head><body><p>Data arrives with a 10-minute delay.</p><p>Market data is delayed by at least 5 mins.</p></body></html>';
    const r = facts(ctx({ pages: [page("/example", registryPage), page("/guides/example-guide", fixture("article-fail.html"))], llms }));
    expectErrors(r.errors, [
      '/example: says a 10-minute data delay, but facts.json says 15: "Data arrives with a 10-minute delay."',
      '/example: says a 5-minute data delay, but facts.json says 15',
      '/guides/example-guide: says a 10-minute data delay, but facts.json says 15: "Market data in slash.markets is delayed by at least 10 minutes."',
    ]);
    expect(r.errors).toHaveLength(3);
  });

  it("fails an llms.txt without the current description or with a wrong delay", () => {
    const r = facts(ctx({ llms: "# slash.markets\n\n> An old description.\n\nMarket data is delayed by at least 20 minutes.\n" }));
    expectErrors(r.errors, ["/llms.txt: says a 20-minute data delay, but facts.json says 15", "/llms.txt: does not carry the current description from facts.json"]);
  });
});
