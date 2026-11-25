// @ts-check
import { defineConfig, envField, fontProviders } from "astro/config";
import mdx from "@astrojs/mdx";
import { SITE } from "./src/config/site.ts";

export default defineConfig({
  site: SITE.url,
  trailingSlash: "never",
  build: { format: "file" },
  compressHTML: true,

  integrations: [mdx()],
  markdown: {
    shikiConfig: { theme: "github-light", langAlias: { prompt: "text", output: "text" } },
  },
  fonts: [
    {
      provider: fontProviders.local(),
      name: "Libre Baskerville",
      cssVariable: "--font-serif",
      options: { variants: [{ src: ["./src/assets/fonts/libre-baskerville-500-latin.woff2"], weight: "500", style: "normal" }] },
    },
    {
      provider: fontProviders.local(),
      name: "Onest",
      cssVariable: "--font-sans",
      options: { variants: [{ src: ["./src/assets/fonts/onest-latin.woff2"], weight: "400 600", style: "normal" }] },
    },
    {
      provider: fontProviders.local(),
      name: "Departure Mono",
      cssVariable: "--font-mono",
      options: { variants: [{ src: ["./src/assets/fonts/departure-mono.woff2"], weight: "400", style: "normal" }] },
    },
  ],
  env: {
    schema: {
      PUBLIC_GA4_ID: envField.string({ context: "client", access: "public", optional: true }),
      PUBLIC_GSC_VERIFICATION: envField.string({ context: "client", access: "public", optional: true }),
      PUBLIC_BING_VERIFICATION: envField.string({ context: "client", access: "public", optional: true }),
      SHOW_DRAFTS: envField.boolean({ context: "server", access: "public", default: false }),
    },
  },
});
