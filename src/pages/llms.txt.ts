import type { APIRoute } from "astro";
import { SITE } from "../config/site";
import { facts } from "../lib/facts";
import { PAGES, navLabel } from "../data/pages";
import { ARTICLE_COLLECTIONS, articlePath, getPublished, hubPage, newestFirst, signedOff } from "../lib/content";

// The one-line description, the compliance line, every live core page, then every published article
// with its answer, one section per hub. Drafts never appear, even on deploy previews.
export const GET: APIRoute = async ({ site }) => {
  const url = (path: string) => new URL(path, site).href;
  const core = PAGES.filter((p) => p.status === "live" && !p.noindex).map((p) => `- [${p.h1}](${url(p.path)}): ${p.description}`);
  const hubs = await Promise.all(
    ARTICLE_COLLECTIONS.map(async (c) => {
      const entries = newestFirst(signedOff(await getPublished(c)));
      if (!entries.length) return "";
      return `\n## ${navLabel(hubPage(c))}\n\n${entries.map((e) => `- [${e.data.title}](${url(articlePath(c, e.id))}): ${e.data.answer}`).join("\n")}\n`;
    }),
  );
  const body = `# ${SITE.name}\n\n> ${facts.description}\n\n${SITE.name} is research and analysis software. It is not a financial adviser and places no orders. Market data is delayed by at least ${facts.data.delayMinutes} minutes.\n\n## Pages\n\n${core.join("\n")}\n${hubs.join("")}`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
