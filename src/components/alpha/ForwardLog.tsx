import { SectionHeading } from "@/components/alpha/SectionHeading";
import { forwardLog } from "@/components/alpha/forwardLogCounts";

const rows = [
  {
    status: "Predictions written down",
    value: String(forwardLog.recorded),
    detail: `${forwardLog.stocks} stocks over ${forwardLog.sessions} trading days`,
  },
  {
    status: "Still waiting",
    value: String(forwardLog.open),
    detail: "The three trading days aren't up yet",
  },
  {
    status: "Finished",
    value: String(forwardLog.resolved),
    detail: "We know how these turned out",
  },
  {
    status: "Hard drops so far",
    value: String(forwardLog.bigDrops),
    detail: "Fell at least 10% behind the S&P 500",
  },
  {
    status: "Grade",
    value: "Not yet",
    detail: "Grading on two drops would be like judging a basketball player on two shots. We'll post a grade once there's enough to go on.",
  },
  {
    status: "Added too late",
    value: String(forwardLog.excludedAfterFact),
    detail: "Written down after we already knew the answer, so they don't count.",
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
          eyebrow="Live diary"
          title="We started writing predictions down on 15 October. It's too early to grade."
        >
          Everything above looks backward. This doesn&apos;t. Each prediction
          is recorded before we know the answer, then checked three trading
          days later. That&apos;s the honest test, and it takes time.
        </SectionHeading>

        <div className="mt-12 rounded-3xl border border-white/8 bg-surface p-6 md:p-8">
          <p className="text-sm font-semibold text-muted">
            As of {forwardLog.asOf}. The diary started {forwardLog.started}.
          </p>
          <div
            className="mt-5 flex h-3 overflow-hidden rounded-full bg-white/10"
            role="img"
            aria-label={`${forwardLog.resolved} of ${forwardLog.recorded} predictions finished, ${forwardLog.open} still waiting`}
          >
            <div className="h-full bg-accent" style={{ width: `${resolvedShare}%` }} />
            <div className="h-full bg-cyan" style={{ width: `${openShare}%` }} />
          </div>
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            <span className="font-semibold text-foreground">{forwardLog.recorded} predictions.</span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
              <span className="font-mono tabular-nums">{forwardLog.resolved}</span> finished
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan" aria-hidden="true" />
              <span className="font-mono tabular-nums">{forwardLog.open}</span> still waiting
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
      </div>
    </section>
  );
}
