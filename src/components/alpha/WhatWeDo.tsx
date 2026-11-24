import { SectionHeading } from "@/components/alpha/SectionHeading";

const points = [
  {
    name: "What we study",
    body: "US stocks over the next few trading days. The market is our first test because it's tough to predict and the results are public.",
  },
  {
    name: "What we look at",
    body: "What people online are doing around a stock, plus the price, the news, and trades by company insiders. Some online buzz is fake, so we treat coordinated posting as a warning sign.",
  },
  {
    name: "How we check ourselves",
    body: "We test the model only on dates it never saw while learning. Since October 2026 we've also kept a diary of predictions written down before the outcome. It's too new to grade yet.",
  },
];

export function WhatWeDo() {
  return (
    <section id="what" aria-labelledby="what-title" className="border-t border-white/8 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading id="what-title" eyebrow="What we do" title="A small research company with one question.">
          Does what the crowd is doing tell you something the stock price doesn&apos;t? We&apos;re finding out in
          public.
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
