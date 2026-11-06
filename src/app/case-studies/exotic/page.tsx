import type { Metadata } from "next";
import { CaseStoryPage } from "@/components/alpha/cases/CaseStoryPage";
import { caseStudyJsonLd } from "@/components/alpha/cases/caseJsonLd";
import { JsonLd, pageMetadata } from "@/lib/seo";

const path = "/case-studies/exotic";
const title = "Case study: the barometer doesn't point";
const description =
  "A storm-front story told over Nuburu (BURU) in October 2025, out-of-sample data: a crowd loud in both directions, drop and rise scores in the top 1% at once, and why that is the shape a straddle is built for.";

export const metadata: Metadata = pageMetadata({ title, description, path });

export default function ExoticCase() {
  return (
    <>
      <JsonLd data={caseStudyJsonLd("exotic", title, description)} />
      <CaseStoryPage id="exotic" />
    </>
  );
}
