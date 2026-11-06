import type { Metadata } from "next";
import { CaseStoryPage } from "@/components/alpha/cases/CaseStoryPage";
import { caseStudyJsonLd } from "@/components/alpha/cases/caseJsonLd";
import { JsonLd, pageMetadata } from "@/lib/seo";

const path = "/case-studies/failed";
const title = "Case study: the boy who cried wolf was right";
const description =
  "A failed call, told honestly: a drop warning that fired three times while the stock soared, then once more before it fell 65 points. Right about what was coming, wrong about when.";

export const metadata: Metadata = pageMetadata({ title, description, path });

export default function FailedCase() {
  return (
    <>
      <JsonLd data={caseStudyJsonLd("failed", title, description)} />
      <CaseStoryPage id="failed" />
    </>
  );
}
