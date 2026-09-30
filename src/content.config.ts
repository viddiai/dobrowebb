import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const projekt = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/projekt" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(["Badrum", "Kök", "Totalrenovering"]),
    place: z.string(),
    /** Genomförandetid i veckor. */
    weeks: z.number().int().positive(),
    /** Sökväg under public/, t.ex. /assets/askim.webp */
    image: z.string(),
    /** Kundcitat, utan citattecken. */
    quote: z.string().optional(),
    /** Sorteringsordning i projektlistan. */
    order: z.number(),
  }),
});

const blogg = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/blogg" }),
  schema: z.object({
    title: z.string(),
    /** Ingress under rubriken, metabeskrivning och text på guidekortet. */
    description: z.string(),
    /** Guidens nummer och sorteringsordning ("Guide 01"). */
    order: z.number().int().positive(),
  }),
});

export const collections = { projekt, blogg };
