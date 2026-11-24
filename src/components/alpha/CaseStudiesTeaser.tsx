import Link from "next/link";
import { CaseNav } from "@/components/alpha/cases/CaseNav";
import { SectionHeading } from "@/components/alpha/SectionHeading";

export function CaseStudiesTeaser() {
  return (
    <section id="case" aria-labelledby="case-title" className="border-t border-white/8 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading id="case-title" eyebrow="Case studies" title="Four real stories, told simply.">
          A wildfire, a gold rush, a storm and a wolf. We picked these because they show how it works, so
          they&apos;re not a fair sample. Three went the way the model expected. One was wrong three times first.
          The line at the top of each card shows how often that kind of prediction is right overall.
        </SectionHeading>
        <div className="mt-10">
          <CaseNav />
        </div>
        <Link
          href="/case-studies"
          className="mt-8 inline-block text-sm font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
        >
          All case studies, and every warning at a glance →
        </Link>
      </div>
    </section>
  );
}
