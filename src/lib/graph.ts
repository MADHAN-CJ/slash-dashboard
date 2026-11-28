// One JSON-LD @graph per page, built here and nowhere else.
import { SITE } from "../config/site";
import { facts } from "./facts";

type Node = Record<string, unknown>;
const abs = (path: string) => new URL(path, SITE.url).href;
export const ORG_ID = `${SITE.url}/#organization`;
export const WEBSITE_ID = `${SITE.url}/#website`;

export const organization = (): Node => ({
  "@type": "Organization",
  "@id": ORG_ID,
  name: SITE.name,
  alternateName: [...SITE.alternateNames],
  url: abs("/"),
  logo: { "@type": "ImageObject", url: abs(SITE.logo) },
  description: facts.description,
  email: facts.company.emails.hello,
  ...(facts.company.legalName ? { legalName: facts.company.legalName } : {}),
  ...(facts.sameAs.length ? { sameAs: facts.sameAs } : {}),
  founder: facts.founders.map((f) => ({ "@type": "Person", "@id": personId(f.id), name: f.name, ...(f.sameAs.length ? { sameAs: f.sameAs } : {}) })),
});

// A person's node id. Founders and article authors share it, so engines see one person.
export const personId = (id: string) => abs(`/about#${id}`);

export const website = (): Node => ({
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: abs("/"),
  name: SITE.name,
  publisher: { "@id": ORG_ID },
  inLanguage: SITE.lang,
});

export const webPage = (p: { path: string; name: string; description: string; type?: string; crumbs?: boolean }): Node => ({
  "@type": p.type ?? "WebPage",
  "@id": `${abs(p.path)}#webpage`,
  url: abs(p.path),
  name: p.name,
  description: p.description,
  isPartOf: { "@id": WEBSITE_ID },
  about: { "@id": ORG_ID },
  ...(p.crumbs ? { breadcrumb: { "@id": `${abs(p.path)}#breadcrumb` } } : {}),
});

export const breadcrumbs = (path: string, trail: { name: string; path: string }[]): Node => ({
  "@type": "BreadcrumbList",
  "@id": `${abs(path)}#breadcrumb`,
  itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, item: abs(t.path) })),
});

// A Person author gets a full node; the Organization author is the one Organization, by reference.
export type Author = { type: "Person"; id: string; name: string; jobTitle: string; sameAs: string[] } | { type: "Organization" };

export const articleNode = (p: { path: string; headline: string; description: string; published: Date; modified?: Date; author: Author; image?: string }): Node => ({
  "@type": "Article",
  "@id": `${abs(p.path)}#article`,
  headline: p.headline,
  description: p.description,
  datePublished: p.published.toISOString(),
  dateModified: (p.modified ?? p.published).toISOString(),
  author:
    p.author.type === "Person"
      ? { "@type": "Person", "@id": personId(p.author.id), name: p.author.name, jobTitle: p.author.jobTitle, ...(p.author.sameAs.length ? { sameAs: p.author.sameAs } : {}) }
      : { "@id": ORG_ID },
  publisher: { "@id": ORG_ID },
  mainEntityOfPage: { "@id": `${abs(p.path)}#webpage` },
  image: abs(p.image ?? SITE.defaultOgImage),
  inLanguage: SITE.lang,
});

// Best lists and comparisons: the products, in order.
export const itemList = (path: string, name: string, items: { name: string; url: string }[]): Node => ({
  "@type": "ItemList",
  "@id": `${abs(path)}#items`,
  name,
  numberOfItems: items.length,
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, url: it.url })),
});

export const faqPage = (path: string, items: { q: string; a: string }[]): Node => ({
  "@type": "FAQPage",
  "@id": `${abs(path)}#faq`,
  mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});

export const softwareApplication = (): Node => ({
  "@type": "SoftwareApplication",
  "@id": `${SITE.url}/#software`,
  name: SITE.name,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  url: abs("/"),
  publisher: { "@id": ORG_ID },
  description: facts.description,
});

// Every page: Organization + WebSite + its own nodes, in one graph.
export const graph = (...nodes: Node[]) => ({ "@context": "https://schema.org", "@graph": [organization(), website(), ...nodes] });

// Escape "<" so content can never close the script tag early.
export const serialize = (g: unknown) => JSON.stringify(g).replace(/</g, "\\u003c");
