import { SectionHeading } from "@/components/alpha/SectionHeading";
import { forwardLog } from "@/components/alpha/forwardLogCounts";

const rows = [
  {
    status: "Recorded before the outcome",
    value: String(forwardLog.recorded),
    detail: `${forwardLog.stocks} stocks across ${forwardLog.sessions} sessions`,
  },
  {
    status: "Still open",
    value: String(forwardLog.open),
    detail: "Inside the three-session window",
  },
  {
    status: "Resolved",
    value: String(forwardLog.resolved),
    detail: "Three sessions have closed",
  },
  {
    status: "Big drops among resolved calls",
    value: String(forwardLog.bigDrops),
    detail: "Underperformance of 10 percentage points or more versus the S&P 500",
  },
  {
    status: "Ranking score",
    value: "Withheld",
    detail: "A score on two drops would look precise and mean nothing. One will be published here once enough drops have resolved, with a range around it.",
  },
  {
    status: "Filled in after the fact",
    value: String(forwardLog.excludedAfterFact),
    detail: "Excluded. The log counts only calls recorded before the outcome.",
  },
];

export function ForwardLog() {
  const resolvedShare = (forwardLog.resolved / forwardLog.recorded) * 100;
  const openShare = (forwardLog.open / forwardLog.recorded) * 100;

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

        <div className="mt-12 rounded-3xl border border-white/8 bg-surface p-6 md:p-8">
          <p className="text-sm font-semibold text-muted">
            Resolution tracker, published counts as of {forwardLog.asOf}. The log runs from {forwardLog.started}.
          </p>
          <div
            className="mt-5 flex h-3 overflow-hidden rounded-full bg-white/10"
            role="img"
            aria-label={`${forwardLog.resolved} of ${forwardLog.recorded} calls resolved, ${forwardLog.open} still open`}
          >
            <div className="h-full bg-accent" style={{ width: `${resolvedShare}%` }} />
            <div className="h-full bg-cyan" style={{ width: `${openShare}%` }} />
          </div>
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            <span className="font-semibold text-foreground">Status of the {forwardLog.recorded} recorded calls.</span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
              <span className="font-mono tabular-nums">{forwardLog.resolved}</span> resolved
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan" aria-hidden="true" />
              <span className="font-mono tabular-nums">{forwardLog.open}</span> still open
            </span>
          </p>

          <ul className="mt-6 divide-y divide-white/8 border-t border-white/8">
            {rows.map((row) => (
              <li
                key={row.status}
                className="grid gap-1 py-4 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-8"
              >
                <div>
                  <p className="text-base font-semibold">{row.status}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{row.detail}</p>
                </div>
                <p className="font-mono text-2xl font-bold tabular-nums sm:text-right">{row.value}</p>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-8 max-w-3xl text-base leading-relaxed text-muted">
          A call is the stock&apos;s return minus the S&amp;P 500 from that day&apos;s open to the close three
          sessions later. A big drop is an underperformance of 10 percentage points or more.
        </p>
      </div>
    </section>
  );
}
