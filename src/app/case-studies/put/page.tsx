import type { Metadata } from "next";
import { AlphaFooter } from "@/components/alpha/AlphaFooter";
import { AlphaHeader } from "@/components/alpha/AlphaHeader";
import { CaseStudy } from "@/components/alpha/CaseStudy";
import { caseStudyJsonLd } from "@/components/alpha/cases/caseJsonLd";
import { CaseNav } from "@/components/alpha/cases/CaseNav";
import { JsonLd, pageMetadata } from "@/lib/seo";

const path = "/case-studies/put";
const title = "Case study: the campfire that became a wildfire";
const description =
  "Where there's smoke, there's fire. Opendoor (OPEN) in July 2025, an out-of-sample event replayed day by day: how a small conversation spread into a crowd, when jargAI's downside warning fired, and what happened when the crowd turned.";

export const metadata: Metadata = pageMetadata({ title, description, path });

export default function PutCase() {
  return (
    <>
      <JsonLd data={caseStudyJsonLd("put", title, description)} />
      <AlphaHeader />
      <main id="main">
        <CaseStudy standalone />
        <section aria-labelledby="more-title" className="border-t border-white/8 py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <h2 id="more-title" className="font-[family-name:var(--font-heading)] text-2xl font-bold md:text-3xl">
              All four case studies
            </h2>
            <div className="mt-6">
              <CaseNav current="put" />
            </div>
          </div>
        </section>
      </main>
      <AlphaFooter />
    </>
  );
}
