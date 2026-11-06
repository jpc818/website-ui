import { SectionHeading } from "@/components/alpha/SectionHeading";

const points = [
  {
    name: "What we study",
    body: "US-listed stocks, over short horizons of a few trading sessions. Markets are the first test, not the last: they're the hardest place to predict a crowd, and the score is public.",
  },
  {
    name: "What we model",
    body: "How online crowds behave around a stock, alongside price, news and insider filings. Behavior can be staged, so coordinated activity counts as a reason for caution, not a signal.",
  },
  {
    name: "How we work",
    body: "Models are tested only on data from after the period they learned from. A live record of calls made before the outcome has been running since October 2026.",
  },
];

export function WhatWeDo() {
  return (
    <section id="what" aria-labelledby="what-title" className="border-t border-white/8 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading id="what-title" eyebrow="What we do" title="A small research company with one question.">
          Does crowd behavior around a stock tell you something the price doesn&apos;t? We&apos;re working that
          out in the open. What comes after depends on the answer.
        </SectionHeading>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {points.map((point) => (
            <article key={point.name} className="rounded-3xl border border-white/8 bg-surface p-7">
              <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold">{point.name}</h3>
              <p className="mt-3 text-base leading-relaxed text-muted">{point.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
