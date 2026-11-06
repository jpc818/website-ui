import type { MetadataRoute } from "next";
import { siteUrl } from "@/app/site";

export const dynamic = "force-static";

// lastModified is only set where there is a real date to point at (the legal pages state theirs). A build
// timestamp on every URL says "everything changed" on each deploy, and crawlers learn to ignore the field.
// Update these dates when the pages change.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/research`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/case-studies`, changeFrequency: "monthly", priority: 0.7 },
    ...["put", "call", "exotic", "failed"].map((id) => ({
      url: `${siteUrl}/case-studies/${id}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    { url: `${siteUrl}/privacy`, lastModified: "2026-11-02", changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/terms`, lastModified: "2026-11-02", changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/llms.txt`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteUrl}/llms-full.txt`, changeFrequency: "weekly", priority: 0.6 },
  ];
}
