# CLAUDE.md

Guide för Claude Code i det här repot. Läs detta innan du ändrar något.

## Vad projektet är

Marknadssajt för **Dobro Byggkonsult AB** – renoveringsfirma i Göteborg med omnejd (badrum som
specialitet, även kök, totalrenovering, snickeri, måleri/fasad, takbyten, el). Målet med sajten är
att generera förfrågningar om **kostnadsfritt hembesök**.

Sajten byggdes först som statisk HTML i ChatGPT och är ombyggd till Astro med identisk HTML-output.
All text på sajten är på **svenska**.

## Teknik och kommandon

- **Astro 7**, helt statisk output (ingen adapter, inga server-endpoints). Node ≥ 22.12.
- Hosting: **Vercel** (auto-detekterar Astro; `vercel.json` sätter `trailingSlash: true`).
- Inga UI-ramverk, ingen Tailwind. CSS och JS är handskrivna och ligger i `public/`.

```bash
npm install
npm run dev      # utvecklingsserver, http://localhost:4321
npm run build    # bygger till dist/
npm run preview  # servera dist/ lokalt
npm run check    # astro check (typer + .astro-filer) – ska ge 0 fel
npm run format   # prettier (inkl. .astro)
```

Kör alltid `npm run check` och `npm run build` innan commit.

## Struktur

```
astro.config.mjs          site-URL (domän), trailingSlash, sitemap
src/config.ts             Företagsuppgifter: namn, telefon, e-post, områden (JSON-LD)
src/content.config.ts     Scheman för innehållssamlingarna projekt + blogg
src/layouts/BaseLayout.astro   <head>, SEO-taggar, JSON-LD, Header, Footer, scripts
src/components/
  Header.astro            Topbar + huvudmeny (inkl. tjänste-dropdown)
  Footer.astro
  ContactSection.astro    Kontaktsektion + formulär #request-form
  FaqSection.astro        Gemensam FAQ (data i src/data/faq.ts)
  CaseCard.astro          Projektkort (projektlista + "Fler hem")
src/data/faq.ts           FAQ-frågor – visas på sidan OCH i FAQPage-JSON-LD
src/data/projekt.ts       getProjects() (sorterad), kategori → tjänstesida
src/content/projekt/*.md  Ett projekt-case per fil
src/content/blogg/*.md    En guide per fil
src/pages/                En .astro per sida; URL = mappnamn (/kontakt/ = pages/kontakt/index.astro)
  projekt/[slug].astro    Mall för projekt-case
  blogg/[slug].astro      Mall för guider
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

## Formuläret

`#request-form` (i `ContactSection.astro`) skickar **inget till någon server** idag. `public/script.js`
bygger en `mailto:`-länk med projekt, namn, telefon och beskrivning (mottagare och telefon läses från
formulärets `data-email`/`data-phone`) och öppnar användarens e-postprogram. Texterna säger uttryckligen
att inget skickas förrän användaren skickar mejlet – ändra dem när formuläret kopplas till en backend.

**Planerat:** koppla formuläret till Dobro Lead Hub.

## Företagsfakta (håll konsekvent)

- Dobro Byggkonsult AB, Mölnlycke/Göteborg · 073-985 70 94 · info@dobro-byggkonsult.se
- Öppet mån–fre 07.00–17.00
- Områden: Göteborg, Mölndal, Kungsbacka, Partille, Mölnlycke, Härryda, Lerum, Kungälv
- Nyckelbudskap: 3–5 veckor för badrum, 10 års garanti på tätskikt/våtrum, 5 år på kök,
  BKR-anslutet, 4,9/5 på Google & Eniro, 500+ projekt, 20+ år, gratis hembesök + 3D-ritning,
  kundportal, Dobro Aftercare

## Kända problem / att göra

- Tillfällig domän i `astro.config.mjs` (se SEO).
- Formuläret är mailto-baserat – ingen leadsinsamling eller spårning (se Formuläret).
- Ingen analys/spårning (GA, pixel e.d.) installerad.
- Texten "sju projekt" på `/projekt/` är hårdkodad – uppdatera vid nya case.
