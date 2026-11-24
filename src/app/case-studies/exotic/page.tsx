import type { Metadata } from "next";
import { CaseStoryPage } from "@/components/alpha/cases/CaseStoryPage";
import { caseStudyJsonLd } from "@/components/alpha/cases/caseJsonLd";
import { JsonLd, pageMetadata } from "@/lib/seo";

const path = "/case-studies/exotic";
const title = "Case study: the barometer doesn't point";
const description =
  "A storm story about Nuburu (BURU) in October 2025: a crowd loud in both directions, the drop and rise scores high at the same time, and what it means when the model expects a big move but can't tell which way.";

export const metadata: Metadata = pageMetadata({ title, description, path });

export default function ExoticCase() {
  return (
    <>
      <JsonLd data={caseStudyJsonLd("exotic", title, description)} />
      <CaseStoryPage id="exotic" />
    </>
  );
}
