import { SectionHeading } from "@/components/alpha/SectionHeading";

// Counts from social-alpha scripts/forward_log.py, run 2 Nov 2026.
// Live scores only. A ranking score is withheld until at least 20 resolved drops.
const stats = [
  { value: "49", label: "Calls recorded live", detail: "42 stocks across 6 sessions" },
  { value: "34", label: "Resolved", detail: "Three sessions have closed" },
  { value: "15", label: "Still open", detail: "Inside the three-session window" },
  { value: "2", label: "Big drops so far", detail: "Out of the 34 resolved calls" },
];

export function ForwardLog() {
  return (
    <section
      id="forward"
      aria-labelledby="forward-title"
      className="border-t border-white/8 py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading
          id="forward-title"
          eyebrow="Forward log"
          title="The clock started on 15 October. There isn't a score yet."
        >
          These calls were recorded before the outcome. A ranking score on two
          drops would look precise and mean nothing, so none is shown.
        </SectionHeading>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-3xl border border-white/8 bg-surface p-6">
              <p className="font-[family-name:var(--font-heading)] text-4xl font-bold tabular-nums">
                {stat.value}
              </p>
              <p className="mt-2 text-base font-semibold">{stat.label}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{stat.detail}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 max-w-3xl text-base leading-relaxed text-muted">
          A call is the same one as in the table above: the stock&apos;s return
          minus the S&amp;P 500 from that day&apos;s open to the close three
          sessions later. A big drop is an underperformance of 10 percentage
          points or more. Scores filled in after the fact are excluded (198 of
          them). The log runs from 15 October to 2 November 2026, and a score
          will be published here once enough drops have resolved to mean
          something, with a range around it.
        </p>
      </div>
    </section>
  );
}
