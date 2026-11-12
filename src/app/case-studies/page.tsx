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
  "Four real events, named by stock and month, from data jargAI's model never trained on: a put, a call, a two-sided exotic, and one that failed. Each told as a story, then shown beside how that kind of flag does overall.";

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
              Four stories. One of them is a failure.
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted md:text-xl">
              A wildfire, a gold rush, a storm front and a wolf. Each is a real event from January 2025 to October
              2026, a stretch the model never saw in training, replayed session by session. The metaphor is there to
              make it stick. The numbers underneath are the point.
            </p>
            <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-foreground md:text-lg">
              Read them as illustrations, not evidence. Each names the stock and the month: Opendoor in July 2025,
              BigBear.ai in February 2025, Nuburu and Beyond Meat in October 2025. Posters are described by profile,
              never by account. Nothing here is a trade we made, and the chart below is the honest summary: every
              warning, not just the four we chose to tell.
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
