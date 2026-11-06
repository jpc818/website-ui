import { SectionHeading } from "@/components/alpha/SectionHeading";

const lenses = [
  {
    name: "Fundamentals",
    question: "What is it worth?",
    verdict: "Slow, public, and already known by everyone who's looking.",
    ours: false,
  },
  {
    name: "Sentiment",
    question: "How do people feel?",
    verdict: "Easy to misread. Feelings often never turn into actions. In our one test, text mood added nothing measurable.",
    ours: false,
  },
  {
    name: "Behavior",
    question: "What will people do next?",
    verdict:
      "Who shows up, when, coordination, and author track records — plus price, news, and insiders. Behavior can be staged too, which is why we score coordination as a risk signal. It's our bet, not a settled result: it hasn't yet beaten a full public stack.",
    ours: true,
  },
];

export function Approach() {
  return (
    <section
      id="approach"
      aria-labelledby="approach-title"
      className="border-t border-white/8 py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading
          id="approach-title"
          eyebrow="Our approach"
          title="We start from a different question."
        >
          Two people can feel exactly the same and do opposite things, so we
          start from behavior instead of opinion. We think that&apos;s a
          better place to look, and we&apos;re testing whether it is.
        </SectionHeading>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {lenses.map((lens) => (
            <article
              key={lens.name}
              className={`rounded-3xl border p-7 md:p-8 ${
                lens.ours
                  ? "border-cyan/40 bg-gradient-to-b from-cyan/10 to-surface shadow-[0_0_60px_-20px] shadow-cyan/40"
                  : "border-white/8 bg-surface"
              }`}
            >
              <p
                className={`text-sm font-semibold uppercase tracking-wider ${lens.ours ? "text-cyan" : "text-muted"}`}
              >
                {lens.ours ? "What we model" : "What we don't"}
              </p>
              <h3 className="relative mt-3 inline-block font-[family-name:var(--font-heading)] text-2xl font-bold md:text-3xl">
                {lens.name}
                {!lens.ours && (
                  <span
                    aria-hidden="true"
                    className="strike absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-accent"
                  />
                )}
              </h3>
              <p
                className={`mt-4 text-lg font-medium ${lens.ours ? "text-foreground" : "text-muted"}`}
              >
                &ldquo;{lens.question}&rdquo;
              </p>
              <p className="mt-3 text-base leading-relaxed text-muted">
                {lens.verdict}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
