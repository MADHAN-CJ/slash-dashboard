import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { SITE } from "../config/site";
import { facts } from "../lib/facts";
import { ARTICLE_COLLECTIONS, articlePath, getPublished, signedOff } from "../lib/content";

// One feed for all four article hubs, newest first. Drafts never appear, even on deploy previews.
export const GET: APIRoute = async ({ site }) => {
  const items = (
    await Promise.all(
      ARTICLE_COLLECTIONS.map(async (c) =>
        signedOff(await getPublished(c)).map((e) => ({
          title: e.data.title,
          description: e.data.answer,
          pubDate: e.data.publishedAt,
          link: articlePath(c, e.id),
        })),
      ),
    )
  )
    .flat()
    .sort((a, b) => +b.pubDate - +a.pubDate);
  return rss({ title: SITE.name, description: facts.description, site: site!, items, trailingSlash: false, customData: `<language>${SITE.ogLocale.replace("_", "-")}</language>` });
};
