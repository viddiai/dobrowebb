# CLAUDE.md

Guide för Claude Code i det här repot. Läs detta innan du ändrar något.

## Vad projektet är

Marknadssajt för **Dobro Byggkonsult AB** – renoveringsfirma i Göteborg med omnejd (badrum som specialitet, även kök, totalrenovering, snickeri, måleri/fasad, takbyten, el). Målet med sajten är att generera förfrågningar om **kostnadsfritt hembesök**.

Sajten är ursprungligen genererad i ChatGPT och flyttad hit. All text på sajten är på **svenska**.

## Teknik

- **Ren statisk HTML/CSS/JS.** Inget ramverk, ingen build, ingen `package.json`, inga beroenden.
- Varje sida är en egen `index.html` i en mapp → snygga URL:er (`/badrumsrenovering/`).
- HTML-filerna är **minifierade på en rad** (hela sidan på en rad). Redigera med exakta sök/ersätt-strängar, inte radnummer.
- Alla länkar och resurser använder **absoluta sökvägar från roten** (`/style.css`, `/assets/...`, `/kontakt/`). Sajten måste därför serveras från domänroten.

### Förhandsgranska lokalt

```bash
python3 -m http.server 8000
# öppna http://localhost:8000
```

Öppna inte filerna direkt via `file://` – absoluta sökvägar fungerar då inte.

## Struktur

```
index.html                 Startsida
404.html                   Felsida (se "Kända problem")
style.css                  All layout och design (minifierad)
motion.css                 Animationer, hover, press-feedback
script.js                  Mobilmeny, dropdown, formulär, projektfilter
motion.js                  Bild-entréer, FAQ-accordion, formulärfeedback
robots.txt, sitemap.xml    SEO
assets/                    Bilder, endast .webp

Tjänstesidor:   badrumsrenovering/, koksrenovering/, totalrenovering/,
                snickeri-tillbyggnad/, maleri-fasadmalning/, takbyte/,
                elinstallation/, tjanster/ (översikt)
Innehåll:       om-oss/, sa-gar-det-till/, prisguide/, vara-omraden/,
                kundportal/, dobro-aftercare/, kontakt/,
                badrumsrenovering-fore-och-efter/
Projekt:        projekt/ (lista med filter) + 7 case-sidor i projekt/<slug>/
Blogg/guider:   blogg/ (lista) + 8 artiklar i blogg/<slug>/
```

### Delade block – dupliceras i varje fil

Det finns ingen templating. **Header (nav), footer och `<head>` är kopierade in i alla 35 HTML-filer.** Ändras något i nav eller footer måste det ändras i *alla* filer, och de ska förbli identiska (verifiera t.ex. med `grep -o '<header.*</header>' **/index.html | sort -u`).

Varje sida har i `<head>`:
- `<title>`, `meta description`, `og:title`, `og:description`, `og:type`
- `<link rel="canonical">` med full URL
- Inline SVG-favicon (data-URI)
- `style.css` + `motion.css`, `script.js` + `motion.js` (båda `defer`)
- Ett `application/ld+json`-block med `@graph`: `WebPage` + `HomeAndConstructionBusiness` (+ `FAQPage` på sidor med FAQ). FAQ-texten i JSON-LD ska matcha den synliga FAQ:n på sidan.

De flesta sidor (inte projekt-casen) avslutas med samma kontaktsektion och formulär `#request-form`.

## Ny sida – checklista

1. Kopiera en befintlig sida av samma typ (tjänst → tjänst, artikel → artikel, case → case).
2. Uppdatera title, description, og-taggar, canonical och JSON-LD (`name`, `description`, `url`, ev. FAQ).
3. Lägg till URL:en i `sitemap.xml`.
4. Länka in sidan där den hör hemma: nav-dropdown (tjänster), `tjanster/`, `blogg/`, `projekt/` (med rätt `data-category` för filtret), footer vid behov.
5. Bilder: `.webp`, lägg i `assets/`, ange alltid `width`, `height`, beskrivande svensk `alt` och `loading="lazy"` (utom hero-bild som har `fetchpriority="high"`).

## Design och kod-konventioner

- **Färger** (CSS-variabler i `:root` i `style.css`): `--ink #142e37`, `--muted #5b6c71`, `--accent #c5e6a4` (ljusgrön), `--light #f3f5f4`, `--line #dce2df`, `--dark #112e38`. Använd variablerna, inte nya hex-värden.
- **Typsnitt:** Manrope (rubriker), DM Sans (brödtext), via Google Fonts `@import` i `style.css`.
- **Återkommande klasser:** `.wrap`, `.section`, `.section.soft`, `.eyebrow`, `.button` / `.button.dark` / `.button.outline`, `.textlink`, `.card`, `.split`, `.faq`, `.editorial-head`, `.article-layout`, `.breadcrumb`, `.project-facts`, `.case-quote`.
- **Tillgänglighet är prioriterat:** fokus-outline, `aria-expanded`/`aria-label` på meny, `inert` på stängd mobilmeny, Escape stänger meny/dropdown, `role="status"` på formulärstatus. Behåll detta.
- **Rörelse:** all animation respekterar `prefers-reduced-motion` och stängs av i tangentbordsläge (`.keyboard-mode`). Innehåll ska alltid vara synligt utan JS – animationer är ren progressive enhancement. Easing: `cubic-bezier(0.23,1,0.32,1)`, 160–300 ms.
- JS är vanilla, utan bibliotek. Håll det så.

## Formuläret

`#request-form` skickar **inget till någon server**. `script.js` bygger ett `mailto:`-länk till `info@dobro-byggkonsult.se` med projekt, namn, telefon och beskrivning, och öppnar användarens e-postprogram. Texterna på sidan säger uttryckligen att inget skickas förrän användaren skickar mejlet – ändra inte det utan att formuläret faktiskt kopplas till en backend (t.ex. GoHighLevel-webhook/formulär).

## Företagsfakta (används på många ställen – håll konsekvent)

- Dobro Byggkonsult AB, Mölnlycke/Göteborg
- Tel: 073-985 70 94 (`tel:+46739857094`), e-post: info@dobro-byggkonsult.se
- Öppet mån–fre 07.00–17.00
- Områden: Göteborg, Mölndal, Kungsbacka, Partille, Mölnlycke, Härryda, Lerum, Kungälv
- Nyckelbudskap: 3–5 veckor för badrum, 10 års garanti på tätskikt/våtrum, 5 år på kök, BKR-anslutet, 4,9/5 på Google & Eniro, 500+ projekt, 20+ år, gratis hembesök + 3D-ritning, kundportal, Dobro Aftercare

Ändras ett av dessa värden ska det ändras överallt (text, `tel:`/`mailto:`-länkar, JSON-LD).

## Kända problem / att göra

- **Tillfällig domän:** canonical, `og`, JSON-LD, `sitemap.xml` och `robots.txt` pekar på `https://dobro-renovering.stefanpeakmarketing.chatgpt.site`. Byt till riktig domän överallt vid lansering (sök/ersätt i alla filer).
- **`404.html` är inaktuell:** använder en ännu äldre domän (`polite-egret-3302.chatgpt.site`) och den gamla navigationen utan tjänste-dropdown. Synka med övriga sidor.
- **Formuläret** är mailto-baserat (se ovan) – ingen leadsinsamling eller spårning.
- **Ingen analys/spårning** (GA, pixel e.d.) finns installerad.
- **Ingen hosting-konfiguration** finns i repot. Sajten kan läggas direkt på t.ex. Netlify, Vercel, Cloudflare Pages eller GitHub Pages som statisk sajt utan build-steg (publiceringskatalog = roten).
