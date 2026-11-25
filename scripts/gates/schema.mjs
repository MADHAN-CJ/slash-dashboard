// schema gate: one JSON-LD graph per page, one Organization, a WebSite, no dangling @id, and the page's own nodes.
import { urlOf } from "./lib.mjs";

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
    // Phase 3 adds BreadcrumbList for inner pages, once the template shows breadcrumbs.
    const own = `${urlOf(ctx.site, path)}#webpage`;
    if (!graph.some((n) => n["@id"] === own)) err(`no node with @id ${own}`);
    if (path === "/" && !graph.some((n) => typesOf(n).includes("SoftwareApplication"))) err("the home page needs a SoftwareApplication node");
  }
  return { errors, warnings: [] };
}
