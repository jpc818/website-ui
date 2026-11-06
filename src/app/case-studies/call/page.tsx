import type { Metadata } from "next";
import { CaseStoryPage } from "@/components/alpha/cases/CaseStoryPage";
import { caseStudyJsonLd } from "@/components/alpha/cases/caseJsonLd";
import { JsonLd, pageMetadata } from "@/lib/seo";

const path = "/case-studies/call";
const title = "Case study: color in the pan";
const description =
  "A gold-rush story told over BigBear.ai (BBAI) in February 2025, out-of-sample data: one post, then four people on the same stock, an upside flag in the top 0.5%, and an honest count of how often that flag turns out to be fool's gold.";

export const metadata: Metadata = pageMetadata({ title, description, path });

export default function CallCase() {
  return (
    <>
      <JsonLd data={caseStudyJsonLd("call", title, description)} />
      <CaseStoryPage id="call" />
    </>
  );
}
