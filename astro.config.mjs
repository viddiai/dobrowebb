// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  // Byt till den riktiga domänen vid lansering – canonical, JSON-LD, sitemap och robots.txt följer med.
  site: "https://dobro-renovering.stefanpeakmarketing.chatgpt.site",
  trailingSlash: "always",
  integrations: [sitemap({ filter: (page) => !page.includes("/404") })],
});
