import { getCollection, type CollectionEntry } from "astro:content";

export type Project = CollectionEntry<"projekt">;

/** Tjänstesidan som varje projektkategori länkar till. */
export const serviceByCategory: Record<
  Project["data"]["category"],
  { href: string; label: string }
> = {
  Badrum: { href: "/badrumsrenovering/", label: "badrumsrenovering" },
  Kök: { href: "/koksrenovering/", label: "köksrenovering" },
  Totalrenovering: { href: "/totalrenovering/", label: "totalrenovering" },
};

export async function getProjects(): Promise<Project[]> {
  const projects = await getCollection("projekt");
  return projects.sort((a, b) => a.data.order - b.data.order);
}
