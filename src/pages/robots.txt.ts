import type { APIRoute } from "astro";

const AI_CRAWLERS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "Bingbot"];

export const GET: APIRoute = ({ site }) => {
  const groups = AI_CRAWLERS.map((ua) => `User-agent: ${ua}\nAllow: /`).join("\n\n");
  const body = `User-agent: *\nAllow: /\n\n${groups}\n\nSitemap: ${new URL("/sitemap.xml", site).href}\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
