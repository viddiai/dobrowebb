// @ts-check
import { defineConfig, envField } from "astro/config";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";

export default defineConfig({
  // Byt till den riktiga domänen vid lansering – canonical, JSON-LD, sitemap och robots.txt följer med.
  site: "https://dobro-renovering.stefanpeakmarketing.chatgpt.site",
  trailingSlash: "always",
  integrations: [sitemap({ filter: (page) => !page.includes("/404") })],
  // Sidorna är statiska; bara endpoints med `prerender = false` (src/pages/api/) körs som
  // Vercel-funktioner.
  adapter: vercel(),
  env: {
    schema: {
      // Delad nyckel för HMAC-signering av leads till Dobro Lead Hub. Sätts i Vercel → Settings →
      // Environment Variables. Läses vid körning och byggs aldrig in i koden.
      DOBRO_WEBHOOK_SECRET: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      // Mottagare för leads. Behöver bara sättas för att peka om mot test/staging.
      DOBRO_LEADS_URL: envField.string({
        context: "server",
        access: "secret",
        optional: true,
        url: true,
      }),
    },
  },
});
