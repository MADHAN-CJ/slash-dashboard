import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Phase 1 has only the legal pages. Phase 2 adds guides, best, rules, compare, useCases,
// worksWith, faqs and authors, with the schemas in docs/starter-code.md (section 7).
const legal = defineCollection({
  loader: glob({ base: "./src/content/legal", pattern: "*.md" }),
  schema: z.object({
    title: z.string(),
    description: z.string().min(70).max(160),
    lastUpdated: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { legal };
