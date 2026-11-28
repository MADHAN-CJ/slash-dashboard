// schema gate: one JSON-LD graph per page, one Organization, a WebSite, no dangling @id, and the page's own nodes.
import { collectionOf, isHub, urlOf, visibleText } from "./lib.mjs";

const typesOf = (node) => [].concat(node["@type"] ?? []);

export default function schema(ctx) {
  const errors = [];
  const ORG = `${ctx.site}/#organization`;
  const WEBSITE = `${ctx.site}/#website`;
  for (const page of ctx.pages) {
    const { $, path } = page;
    const err = (m) => errors.push(`${path}: ${m}`);
    const blocks = $('script[type="application/ld+json"]');
    if (blocks.length !== 1) err(`${blocks.length} JSON-LD blocks (exactly one required)`);
    if (!blocks.length) continue;
    let data;
    try {
      data = JSON.parse(blocks.first().text());
    } catch (e) {
      err(`JSON-LD does not parse: ${e.message}`);
      continue;
    }
    const graph = data["@graph"];
    if (data["@context"] !== "https://schema.org" || !Array.isArray(graph)) {
      err('JSON-LD needs "@context": "https://schema.org" and an @graph array');
      continue;
    }

    const orgs = graph.filter((n) => typesOf(n).includes("Organization"));
    if (orgs.length !== 1) err(`${orgs.length} Organization nodes (exactly one required)`);
    else if (orgs[0]["@id"] !== ORG) err(`the Organization's @id is ${orgs[0]["@id"]}, not ${ORG}`);
    // Never a second Organization, not even nested (an Organization author refers to the one by @id).
    const nested = [];
    const findOrgs = (v, top) => {
      if (Array.isArray(v)) return v.forEach((x) => findOrgs(x, false));
      if (!v || typeof v !== "object") return;
      if (!top && typesOf(v).includes("Organization")) nested.push(v);
      for (const [k, x] of Object.entries(v)) if (k !== "@type") findOrgs(x, false);
    };
    graph.forEach((n) => findOrgs(n, true));
    if (nested.length) err(`${nested.length} nested Organization node(s): refer to ${ORG} by @id instead`);
    const sites = graph.filter((n) => typesOf(n).includes("WebSite"));
    if (sites.length !== 1 || sites[0]["@id"] !== WEBSITE) err(`needs exactly one WebSite node, with @id ${WEBSITE}`);

    // A reference is an object holding only "@id"; any other object with an @id defines a node.
    const defined = new Set();
    const refs = [];
    const walk = (v) => {
      if (Array.isArray(v)) return v.forEach(walk);
      if (!v || typeof v !== "object") return;
      const keys = Object.keys(v);
      if (keys.length === 1 && keys[0] === "@id") refs.push(v["@id"]);
      else if (typeof v["@id"] === "string") defined.add(v["@id"]);
      for (const k of keys) if (k !== "@id") walk(v[k]);
    };
    walk(graph);
    for (const r of new Set(refs)) if (!defined.has(r)) err(`@id ${r} is referenced, but no node has it`);

    // The page's own node, and the types its kind needs (.claude/rules/seo-aeo.md).
    const own = `${urlOf(ctx.site, path)}#webpage`;
    const ownNode = graph.find((n) => n["@id"] === own);
    if (!ownNode) err(`no node with @id ${own}`);
    const has = (type) => graph.some((n) => typesOf(n).includes(type));
    if (path === "/" && !has("SoftwareApplication")) err("the home page needs a SoftwareApplication node");

    // Breadcrumbs: articles and hubs show them, and any page that shows them has a BreadcrumbList.
    const crumbs = $('nav[aria-label="Breadcrumb"]').length > 0;
    const collection = collectionOf(path);
    if ((collection || isHub(path)) && !crumbs) err("articles and hubs show breadcrumbs");
    if (crumbs && !has("BreadcrumbList")) err("the page shows breadcrumbs, but has no BreadcrumbList node");

    // Hubs are CollectionPages. Articles have an Article with an author and the publisher; best lists and comparisons an ItemList.
    if (isHub(path) && ownNode && !typesOf(ownNode).includes("CollectionPage")) err("a hub's page node must be a CollectionPage");
    if (collection) {
      const article = graph.find((n) => typesOf(n).includes("Article"));
      if (!article) err("an article needs an Article node");
      else {
        const a = article.author ?? {};
        const isOrgRef = Object.keys(a).length === 1 && a["@id"] === ORG;
        if (!isOrgRef && !(typesOf(a).includes("Person") && a.name)) err("the Article's author must be a Person with a name, or a reference to the Organization");
        if (article.publisher?.["@id"] !== ORG) err(`the Article's publisher must be ${ORG}`);
      }
      if ((collection === "best" || collection === "compare") && !has("ItemList")) err(`a ${collection === "best" ? "best list" : "comparison"} needs an ItemList node`);
    }

    // FAQ markup must match what the page shows.
    const text = visibleText($);
    const squash = (t) => String(t ?? "").replace(/\s+/g, " ").trim();
    for (const faq of graph.filter((n) => typesOf(n).includes("FAQPage"))) {
      for (const q of [].concat(faq.mainEntity ?? [])) {
        if (!text.includes(squash(q.name))) err(`FAQPage question "${q.name}" is not on the page`);
        const answer = q.acceptedAnswer?.text;
        if (answer && !text.includes(squash(answer))) err(`FAQPage answer to "${q.name}" is not on the page`);
      }
    }
  }
  return { errors, warnings: [] };
}
