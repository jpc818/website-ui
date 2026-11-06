import type { Metadata } from "next";
import { alt, size } from "@/app/opengraph-image";
import { siteUrl } from "@/app/site";

const ogImage = { ...size, alt };

// Per-page metadata. Next.js replaces the parent's openGraph/twitter objects instead of merging them, so a
// sub-page that sets none inherits the home page's og:url and og:title. Setting them here keeps each page's
// canonical, social title and URL consistent with each other.
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const socialTitle = `${title} · jargAI`;
  // The root opengraph-image file is dropped when a page sets its own openGraph/twitter, so point at it here.
  const images = [{ url: "/opengraph-image", width: ogImage.width, height: ogImage.height, alt: ogImage.alt }];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      siteName: "jargAI",
      title: socialTitle,
      description,
      locale: "en_US",
      images,
    },
    twitter: { card: "summary_large_image", title: socialTitle, description, images },
  };
}

// JSON-LD node for a non-home page. It points back at the entities defined on the home page by @id, so the
// whole site reads as one graph: Organization -> WebSite -> WebPage.
export function pageJsonLd({
  path,
  name,
  description,
  dateModified,
  type = "WebPage",
  parent,
  extra = {},
}: {
  path: string;
  name: string;
  description: string;
  dateModified?: string;
  type?: "WebPage" | "AboutPage" | "CollectionPage";
  // An intermediate breadcrumb level, e.g. Case studies for /case-studies/put.
  parent?: { name: string; path: string };
  // Additional properties for the page node, such as mainEntity.
  extra?: Record<string, unknown>;
}) {
  const url = `${siteUrl}${path}`;
  const crumbs = [
    { name: "jargAI", item: siteUrl },
    ...(parent ? [{ name: parent.name, item: `${siteUrl}${parent.path}` }] : []),
    { name, item: url },
  ];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": type,
        "@id": `${url}#webpage`,
        url,
        name,
        description,
        inLanguage: "en-US",
        ...(dateModified ? { dateModified } : {}),
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${siteUrl}/#organization` },
        publisher: { "@id": `${siteUrl}/#organization` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        ...extra,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: crumbs.map((crumb, i) => ({ "@type": "ListItem", position: i + 1, ...crumb })),
      },
    ],
  };
}

// Native <script>, not next/script: JSON-LD is data, not executable code. "<" is escaped so no string in the
// payload can close the tag early.
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
