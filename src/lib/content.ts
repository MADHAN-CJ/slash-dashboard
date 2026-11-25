import { getCollection } from "astro:content";
import { SHOW_DRAFTS } from "astro:env/server";

// Drafts render on deploy previews (SHOW_DRAFTS=true) and never in production.
// Phase 1 has only the legal collection. Phase 2 adds "guides" | "best" | "rules" | "compare" | "useCases" | "worksWith".
export async function getPublished<C extends "legal">(name: C) {
  const entries = await getCollection(name);
  return entries.filter((e) => SHOW_DRAFTS || !e.data.draft);
}
