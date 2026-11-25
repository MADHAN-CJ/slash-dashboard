import { z } from "astro/zod";
import raw from "../data/facts.json";

const Facts = z.object({
  description: z.string().min(80).max(240),
  descriptionLocked: z.boolean(),
  access: z.object({ status: z.enum(["waitlist", "open"]), price: z.string() }),
  data: z.object({ delayMinutes: z.number().int().positive(), exchanges: z.array(z.string()).min(1) }),
  integrations: z.array(z.object({ id: z.string(), name: z.string(), status: z.enum(["live", "coming"]) })),
  company: z.object({
    legalName: z.string().nullable(),
    emails: z.object({ hello: z.email(), privacy: z.email() }),
  }),
  founders: z.array(z.object({ id: z.string(), name: z.string(), sameAs: z.array(z.url()) })),
  sameAs: z.array(z.url()),
});

// Parsed once at import: a bad facts file fails the build with a clear message.
export const facts = Facts.parse(raw);
export const liveIntegrations = facts.integrations.filter((i) => i.status === "live");
