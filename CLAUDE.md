# CLAUDE.md

Guide för Claude Code i det här repot. Läs detta innan du ändrar något.

## Vad projektet är

Marknadssajt för **Dobro Byggkonsult AB** – renoveringsfirma i Göteborg med omnejd (badrum som
specialitet, även kök, totalrenovering, snickeri, måleri/fasad, takbyten, el). Målet med sajten är
att generera förfrågningar om **kostnadsfritt hembesök**.

Sajten byggdes först som statisk HTML i ChatGPT och är ombyggd till Astro med identisk HTML-output.
All text på sajten är på **svenska**.

## Teknik och kommandon

- **Astro 7** med `@astrojs/vercel`. Alla sidor är statiska; bara `src/pages/api/lead.ts`
  (`prerender = false`) körs on-demand som Vercel-funktion. Node ≥ 22.12.
- Hosting: **Vercel** (auto-detekterar Astro; `vercel.json` sätter `trailingSlash: true`).
- Byggutdata hamnar i `.vercel/output/` (statiska filer i `static/`, funktionen i `functions/`).
- Inga UI-ramverk, ingen Tailwind. CSS och JS är handskrivna och ligger i `public/`.

```bash
npm install
npm run dev      # utvecklingsserver, http://localhost:4321
npm run build    # bygger till .vercel/output/
npm run check    # astro check (typer + .astro-filer) – ska ge 0 fel
npm run format   # prettier (inkl. .astro)
```

Kör alltid `npm run check` och `npm run build` innan commit.

## Struktur

```
astro.config.mjs          site-URL (domän), trailingSlash, sitemap, Vercel-adapter, env-schema
src/config.ts             Företagsuppgifter: namn, telefon, e-post, områden (JSON-LD)
src/content.config.ts     Scheman för innehållssamlingarna projekt + blogg
src/layouts/BaseLayout.astro   <head>, SEO-taggar, JSON-LD, Header, Footer, scripts
src/components/
  Header.astro            Topbar + huvudmeny (inkl. tjänste-dropdown)
  Footer.astro
  ContactSection.astro    Kontaktsektion + formulär #request-form (+ skript som postar till /api/lead/)
  FaqSection.astro        Gemensam FAQ (data i src/data/faq.ts)
  CaseCard.astro          Projektkort (projektlista + "Fler hem")
  BeforeAfter.astro       Före/efter-slider på projekt-case (styrs av beforeImage)
src/data/faq.ts           FAQ-frågor – visas på sidan OCH i FAQPage-JSON-LD
src/data/projekt.ts       getProjects() (sorterad), kategori → tjänstesida
src/content/projekt/*.md  Ett projekt-case per fil
src/content/blogg/*.md    En guide per fil
src/pages/                En .astro per sida; URL = mappnamn (/kontakt/ = pages/kontakt/index.astro)
  projekt/[slug].astro    Mall för projekt-case
  blogg/[slug].astro      Mall för guider
  api/lead.ts             Tar emot formuläret och skickar signerat lead till Dobro Lead Hub
  404.astro, robots.txt.ts
public/                   style.css, motion.css, script.js, motion.js, assets/*.webp
```

Alla länkar och resurser använder **absoluta sökvägar med avslutande snedstreck** (`/kontakt/`,
`/assets/kitchen.webp`).

## Vanliga uppgifter

### Nytt projekt-case

Skapa `src/content/projekt/<slug>.md`:

```md
---
title: "Marmorbadrum i Majorna"
description: "En mening – används som ingress, metabeskrivning och korttext."
category: Badrum # Badrum | Kök | Totalrenovering
place: Majorna
weeks: 4
image: /assets/majorna.webp # lägg bilden i public/assets/
quote: "Kundcitat utan citattecken" # valfritt
beforeImage: /assets/majorna-fore.webp # valfritt – ger före/efter-slider (efter = image)
order: 8 # plats i projektlistan
---

Brödtext under "Resultatet".
```

Sidan, projektlistan, filtret, "Fler hem"-korten och sitemap uppdateras automatiskt. Ny kategori
kräver ändring i schemat (`content.config.ts`), `serviceByCategory` och filterknapparna i
`pages/projekt/index.astro`.

### Ny guide (blogg)

Skapa `src/content/blogg/<slug>.md` med `title`, `description`, `order` (guidenummer). Brödtexten
skrivs som `## Rubrik` + stycken. Varje `##` blir automatiskt en egen sektion (`#avsnitt-N`) och en
rad i innehållsförteckningen. Använd bara `##`-rubriker och stycken – layouten är stylad för det.

### Ny vanlig sida

1. Kopiera en befintlig sida av samma typ i `src/pages/`.
2. Sätt `title` (utan " | Dobro Byggkonsult" – läggs till automatiskt) och `description` på
   `<BaseLayout>`.
3. Lägg till `<ContactSection />` sist om sidan ska ha formuläret, och `<FaqSection />` + `faq`-prop
   på `<BaseLayout>` om den ska ha FAQ (då kommer FAQPage-schemat med).
4. Länka in sidan: meny i `Header.astro`, `tjanster/`, footer vid behov. Sitemap sköts automatiskt.

### Bilder

`.webp` i `public/assets/`. Ange alltid `width`, `height`, beskrivande svensk `alt` och
`loading="lazy"` (utom hero-bild som har `fetchpriority="high"`).

## SEO

`BaseLayout` genererar för varje sida: `<title>`, meta description, `og:*`, canonical (från
`site` + sökväg) och JSON-LD (`WebPage` + `HomeAndConstructionBusiness` + ev. `FAQPage`).
Sitemap (`/sitemap-index.xml`) och `robots.txt` genereras vid build. 404-sidan har `noindex`.

**Domän:** `site` i `astro.config.mjs` pekar fortfarande på den tillfälliga
`dobro-renovering.stefanpeakmarketing.chatgpt.site`. Byt där vid lansering – allt annat följer med.

## Design och kod-konventioner

- **Ändra inte visuell design i förbigående.** Ombyggnaden verifierades pixel för pixel mot
  originalet; håll markup och klasser stabila.
- **Färger** (CSS-variabler i `:root` i `public/style.css`): `--ink #142e37`, `--muted #5b6c71`,
  `--accent #c5e6a4`, `--light #f3f5f4`, `--line #dce2df`, `--dark #112e38`. Använd variablerna.
- **Typsnitt:** Manrope (rubriker), DM Sans (brödtext), via Google Fonts `@import` i `style.css`.
- `style.css` är minifierad – redigera med exakta sök/ersätt-strängar.
- **Återkommande klasser:** `.wrap`, `.section`, `.section.soft`, `.eyebrow`, `.button` /
  `.button.dark` / `.button.outline`, `.textlink`, `.card`, `.split`, `.faq`, `.editorial-head`,
  `.article-layout`, `.breadcrumb`, `.project-facts`, `.case-quote`, `.case-card`, `.guide-card`.
- **Tillgänglighet är prioriterat:** fokus-outline, `aria-expanded`/`aria-label` på meny, `inert` på
  stängd mobilmeny, Escape stänger meny/dropdown, `role="status"` på formulärstatus. Behåll detta.
- **Rörelse:** all animation respekterar `prefers-reduced-motion` och stängs av i tangentbordsläge
  (`.keyboard-mode`). Innehåll ska vara synligt utan JS. Easing `cubic-bezier(0.23,1,0.32,1)`,
  160–300 ms.
- JS i `public/` är vanilla och laddas med `<script is:inline src="..." defer>`. Håll det så.
- Företagsuppgifter (telefon, e-post) hämtas från `src/config.ts` – skriv inte in dem på nytt i
  komponenter. Löptext på enskilda sidor kan nämna dem; sök igenom `src/` vid ändring.

## Formuläret och Dobro Lead Hub

Flöde: `#request-form` (i `ContactSection.astro`) → skriptet i samma komponent postar JSON med
`fetch` till `/api/lead/` → `src/pages/api/lead.ts` validerar, bygger payload, signerar och skickar
till `https://www.dobro-leads.se/api/leads/inbound`.

- **Fält:** namn\*, telefon, e-post, "Vad gäller det?" (`division`: renovering/badrum/annat), adress,
  ort, önskad start, budget, meddelande\*, GDPR-samtycke\*. Minst ett av telefon/e-post krävs.
  Dolt honeypot-fält `website` skickas vidare oförändrat (Lead Hub filtrerar spam).
- **Validering** sker både i webbläsaren och i endpointen. Endpointen svarar `{ ok: true }` (200),
  `{ ok: false, errors }` (400), `{ ok: false }` (500 om nyckel saknas, 502/504 om Lead Hub fallerar).
  Lead Hubs felsvar loggas server-side (Vercel → Logs, prefix `[lead]`).
- **Signering:** `X-Dobro-Signature: sha256=<HMAC-SHA256(body, DOBRO_WEBHOOK_SECRET) i hex>` och
  `Idempotency-Key: <uuid>`. Body-strängen som signeras är exakt den som skickas – bygg aldrig om den
  mellan signering och `fetch`.
- **Hemligheter** deklareras i `env.schema` i `astro.config.mjs` (`astro:env/server`, `access: "secret"`)
  och läses vid körning. `DOBRO_WEBHOOK_SECRET` sätts i Vercel; `DOBRO_LEADS_URL` är valfri
  (test/staging). Se `.env.example`. Nyckeln får aldrig hamna i klientkod eller byggutdata – kontrollera
  med `grep -r <nyckel> .vercel/output` efter build om du ändrar i endpointen.
- Ändras payloadens format: höj `formVersion` och stäm av med Lead Hub först.

**Testa lokalt** utan att skicka riktiga leads: kör en mock-server som verifierar signaturen och
starta `DOBRO_WEBHOOK_SECRET=test DOBRO_LEADS_URL=http://localhost:9999/... npm run dev`.

## Företagsfakta (håll konsekvent)

- Dobro Byggkonsult AB, Mölnlycke/Göteborg · 073-985 70 94 · info@dobro-byggkonsult.se
- Öppet mån–fre 07.00–17.00
- Områden: Göteborg, Mölndal, Kungsbacka, Partille, Mölnlycke, Härryda, Lerum, Kungälv
- Nyckelbudskap: 3–5 veckor för badrum, 10 års garanti på tätskikt/våtrum, 5 år på kök,
  BKR-anslutet, 4,9/5 på Google & Eniro, 500+ projekt, 20+ år, gratis hembesök + 3D-ritning,
  kundportal, Dobro Aftercare

## Kända problem / att göra

- Tillfällig domän i `astro.config.mjs` (se SEO).
- Samtyckestexten saknar länk till integritetspolicy – det finns ingen sådan sida än.
- Ingen rate limiting på `/api/lead/` utöver honeypot (Lead Hub filtrerar spam).
- Ingen analys/spårning (GA, pixel e.d.) installerad.
- Texten "sju projekt" på `/projekt/` är hårdkodad – uppdatera vid nya case.
