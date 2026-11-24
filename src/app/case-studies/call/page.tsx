import type { Metadata } from "next";
import { CaseStoryPage } from "@/components/alpha/cases/CaseStoryPage";
import { caseStudyJsonLd } from "@/components/alpha/cases/caseJsonLd";
import { JsonLd, pageMetadata } from "@/lib/seo";

const path = "/case-studies/call";
const title = "Case study: color in the pan";
const description =
  "A gold-rush story about BigBear.ai (BBAI) in February 2025: one post, then four people talking about the same stock, a rise flag, and an honest count of how often that flag turns out to be fool's gold.";

export const metadata: Metadata = pageMetadata({ title, description, path });

export default function CallCase() {
  return (
    <>
      <JsonLd data={caseStudyJsonLd("call", title, description)} />
      <CaseStoryPage id="call" />
    </>
  );
}
