import type { APIRoute } from "astro";
import { facts } from "../lib/facts";
import { PAGES } from "../data/pages";

// Phase 2 adds a "## Guides" section listing every published article with its answer (docs/starter-code.md, section 12).
export const GET: APIRoute = async ({ site }) => {
  const url = (path: string) => new URL(path, site).href;
  const core = PAGES.filter((p) => p.status === "live" && !p.noindex).map((p) => `- [${p.h1}](${url(p.path)}): ${p.description}`);
  const body = `# /markets\n\n> ${facts.description}\n\n/markets is research and analysis software. It is not a financial adviser and places no orders. Market data is delayed by at least ${facts.data.delayMinutes} minutes.\n\n## Pages\n\n${core.join("\n")}\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
