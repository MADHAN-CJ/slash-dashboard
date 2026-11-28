// Collection schemas (.claude/rules/content-model.md). The SEO limits, the required substance and the
// compliance sign-off live here, so a bad entry fails the build instead of going live.
import { defineCollection, reference } from "astro:content";
import { file, glob, type Loader } from "astro/loaders";
import { z } from "astro/zod";
import { facts } from "./lib/facts";

const signoff = z.object({ by: z.string().min(2), on: z.coerce.date() });
const faq = z.object({ q: z.string().trim().endsWith("?"), a: z.string().min(40).max(500) });
const source = z.object({ name: z.string().min(2), url: z.url(), note: z.string().optional() });
// A product in a best list or comparison. Our own product takes its URL from SITE.url, so it needs none.
const product = z.object({ name: z.string().min(2), url: z.url().optional(), ours: z.boolean().default(false) });

const USE_CASES = ["option-chain", "alerts", "pre-market-brief", "python", "check-my-study"] as const;
// Rules pages cite at least one of these (content-model.md).
const OFFICIAL_HOSTS = ["nseindia.com", "bseindia.com", "mcxindia.com", "sebi.gov.in"];
const isOfficial = (url: string) => {
  const host = new URL(url).hostname;
  return OFFICIAL_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
};

// Shared article fields (guides, best, rules, compare).
const article = z.object({
  title: z.string().max(70), // the H1
  seoTitle: z.string().max(60).optional(), // the <title>, when it differs from the H1
  description: z.string().min(70).max(160),
  answer: z.string().min(80).max(320), // the lead under the H1: says plainly what the page answers
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  author: reference("authors"),
  faqs: z.array(faq).max(8).default([]),
  draft: z.boolean().default(false),
  signoff: signoff.optional(), // compliance sign-off: required before draft is false
});

type Signable = { draft: boolean; signoff?: unknown };
const requireSignoff = (d: Signable, ctx: z.RefinementCtx) => {
  if (!d.draft && !d.signoff) {
    ctx.addIssue({ code: "custom", path: ["signoff"], message: "Compliance sign-off is required before draft: false" });
  }
};

type Article = Signable & { title: string; seoTitle?: string; publishedAt: Date; updatedAt?: Date };
const articleChecks = (d: Article, ctx: z.RefinementCtx) => {
  requireSignoff(d, ctx);
  // The <title> allows 60 characters and the H1 allows 70, so a long H1 needs its own seoTitle.
  if (d.title.length > 60 && !d.seoTitle) {
    ctx.addIssue({ code: "custom", path: ["seoTitle"], message: `seoTitle is required when the title is over 60 characters (this one has ${d.title.length})` });
  }
  if (d.updatedAt && d.updatedAt < d.publishedAt) {
    ctx.addIssue({ code: "custom", path: ["updatedAt"], message: "updatedAt is earlier than publishedAt" });
  }
};

const productChecks = (key: "items" | "products") => (d: Article & Record<string, unknown>, ctx: z.RefinementCtx) => {
  articleChecks(d, ctx);
  (d[key] as { url?: string; ours: boolean }[]).forEach((p, i) => {
    if (!p.ours && !p.url) ctx.addIssue({ code: "custom", path: [key, i, "url"], message: "url is required for products that are not ours" });
  });
};

// Hubs exist before their first article, so an empty or missing folder is normal on this site.
// Drop the glob loader's two "nothing found" warnings and pass every other message through.
const QUIET = [/^No files found matching /, /^The base directory .* does not exist\.$/];
function folder(dir: string): Loader {
  const inner = glob({ base: `./src/content/${dir}`, pattern: "**/*.{md,mdx}" });
  return {
    ...inner,
    load: (context) => {
      const logger = Object.create(context.logger);
      logger.warn = (message: string) => {
        if (!QUIET.some((re) => re.test(message))) context.logger.warn(message);
      };
      return inner.load({ ...context, logger });
    },
  };
}

const guides = defineCollection({
  loader: folder("guides"),
  schema: article
    .extend({
      group: z.enum(["connect-your-ai", "options-data", "mcx", "methods"]),
      useCase: z.enum(USE_CASES).optional(),
      checkedOn: z.coerce.date().optional(), // shown as "Facts checked on" when the guide states other products' facts
      sources: z.array(source).default([]),
    })
    .superRefine(articleChecks),
});

const rules = defineCollection({
  loader: folder("rules"),
  schema: article
    .extend({
      checkedOn: z.coerce.date(),
      sources: z
        .array(source)
        .min(1)
        .refine((s) => s.some((x) => isOfficial(x.url)), { message: `Cite at least one official source (${OFFICIAL_HOSTS.join(", ")})` }),
    })
    .superRefine(articleChecks),
});

const best = defineCollection({
  loader: folder("best"),
  schema: article
    .extend({
      reviewedOn: z.coerce.date(),
      items: z.array(product.extend({ summary: z.string().max(200) })).min(3),
    })
    .superRefine(productChecks("items")),
});

const compare = defineCollection({
  loader: folder("compare"),
  schema: article
    .extend({
      reviewedOn: z.coerce.date(),
      products: z.array(product).min(1),
    })
    .superRefine(productChecks("products")),
});

// Routes for worksWith, useCases and faqs come in Phase 3, with /works-with, /use-cases and /faq.
const worksWith = defineCollection({
  loader: folder("works-with"),
  schema: z
    .object({
      integration: z.enum(["claude", "chatgpt", "kite", "whatsapp"]),
      title: z.string().max(70),
      seoTitle: z.string().max(60),
      description: z.string().min(70).max(160),
      faqs: z.array(faq).max(8).default([]),
      draft: z.boolean().default(false),
      signoff: signoff.optional(),
    })
    .superRefine((d, ctx) => {
      requireSignoff(d, ctx);
      const status = facts.integrations.find((i) => i.id === d.integration)?.status;
      if (!d.draft && status !== "live") {
        ctx.addIssue({ code: "custom", path: ["integration"], message: `${d.integration} is "${status}" in src/data/facts.json; only live integrations get a published page` });
      }
    }),
});

const useCases = defineCollection({
  loader: folder("use-cases"),
  schema: z
    .object({
      title: z.string().max(70),
      seoTitle: z.string().max(60),
      description: z.string().min(70).max(160),
      order: z.number().int(),
      problem: z.string().min(40),
      prompts: z
        .array(z.object({ prompt: z.string(), output: z.string(), dataDate: z.coerce.date() }))
        .min(2)
        .max(3),
      faqs: z.array(faq).min(3).max(5),
      draft: z.boolean().default(false),
      signoff: signoff.optional(),
    })
    .superRefine(requireSignoff),
});

// The page's title, description and H1 come from the registry (src/data/pages.ts); the meta gate checks them there.
const legal = defineCollection({
  loader: glob({ base: "./src/content/legal", pattern: "*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    description: z.string().min(70).max(160),
    lastUpdated: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

// An object keyed by author id (the id goes in an article's `author` field).
const authors = defineCollection({
  loader: file("src/content/authors.json"),
  schema: z.object({
    name: z.string(),
    type: z.enum(["Person", "Organization"]),
    role: z.string(),
    sameAs: z.array(z.url()).default([]),
    bio: z.string().max(300).optional(), // one line, shown under the byline
  }),
});

const faqs = defineCollection({
  loader: file("src/content/faq.yaml"),
  schema: faq.extend({ order: z.number().int() }),
});

export const collections = { guides, best, rules, compare, useCases, worksWith, legal, authors, faqs };
