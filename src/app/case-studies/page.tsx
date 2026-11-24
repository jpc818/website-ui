import type { Metadata } from "next";
import { AlphaFooter } from "@/components/alpha/AlphaFooter";
import { AlphaHeader } from "@/components/alpha/AlphaHeader";
import { DropDeciles } from "@/components/alpha/CaseEvidence";
import { CaseNav } from "@/components/alpha/cases/CaseNav";
import { caseIndexJsonLd } from "@/components/alpha/cases/caseJsonLd";
import { JsonLd, pageMetadata } from "@/lib/seo";

const path = "/case-studies";
const title = "Case studies";
const description =
  "Four real stories from dates the model never saw while learning. Each one starts with how often that kind of prediction works overall, because one story can't prove anything.";

export const metadata: Metadata = pageMetadata({ title, description, path });

export default function CaseStudies() {
  return (
    <>
      <JsonLd data={caseIndexJsonLd(title, description)} />
      <AlphaHeader />
      <main id="main">
        <section aria-labelledby="cases-title" className="pt-28 pb-16 md:pt-36 md:pb-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-cyan">Case studies</p>
            <h1
              id="cases-title"
              className="mt-3 max-w-3xl text-balance font-[family-name:var(--font-heading)] text-[clamp(2.25rem,6vw,4rem)] font-extrabold leading-[1.05] tracking-tight"
            >
              Four stories. The rate is on the card.
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted md:text-xl">
              A wildfire, a gold rush, a storm and a wolf. Each is a real stock from 2025, a period the model never
              saw while it was learning. We picked them because they show how it works, including one where it was
              wrong first.
            </p>
            <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-foreground md:text-lg">
              Four hand-picked stories can&apos;t prove anything, so each card starts with how often that kind of
              prediction works overall. The chart below the cards covers every prediction, not just these four. The
              stocks are Opendoor, BigBear.ai, Nuburu and Beyond Meat. We describe the people posting, but never name
              them. These aren&apos;t trades we made.
            </p>
            <div className="mt-10">
              <CaseNav heading="h2" />
            </div>
            <DropDeciles />
          </div>
        </section>
      </main>
      <AlphaFooter />
    </>
  );
}
