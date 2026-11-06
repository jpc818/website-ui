"use client";

import { useId, useState } from "react";
import { SectionHeading } from "@/components/alpha/SectionHeading";
import {
  bookLabels,
  bookOrder,
  curveLabels,
  scenarioOrder,
  scenarios,
  type BookKey,
  type ScenarioKey,
} from "@/components/alpha/simulation";

const W = 760;
const H = 280;

// The short book runs to several hundred percent and would flatten everything else, so the chart shows the
// two long books and the table carries all three.
const plotted: BookKey[] = ["long_crash_filter", "long_q80"];
const colors: Record<BookKey, string> = {
  long_crash_filter: "#22d3ee",
  long_q80: "#f59e0b",
  short_crash: "#a78bfa",
};
const SPY = "rgba(179,186,197,0.8)";

// One vertical scale for both scenarios. Rescaling per scenario would hide the very thing the toggle exists
// to show: flipping to the peeking model has to move the lines, not relabel the axis.
const spread = scenarioOrder.flatMap((key) => [
  ...plotted.flatMap((book) => scenarios[key].curve[book]),
  ...scenarios[key].spyCurve,
]);
const lo = Math.floor(Math.min(...spread) / 25) * 25;
const hi = Math.ceil(Math.max(...spread) / 25) * 25;
const gridlines = Array.from({ length: Math.round((hi - lo) / 25) + 1 }, (_, i) => lo + i * 25);
const tickIndexes = curveLabels.map((_, i) => i).filter((i) => i % 6 === 0 || i === curveLabels.length - 1);

const x = (i: number) => (i / (curveLabels.length - 1)) * W;
const y = (v: number) => H - ((v - lo) / (hi - lo)) * H;
const path = (values: number[]) => values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");

// Confidence-interval strip, shared scale so the three books stay comparable.
const CI = 12;
const at = (n: number) => `${((n / CI + 1) / 2) * 100}%`;
const signedPct = (n: number, digits = 2) => `${n < 0 ? "−" : "+"}${Math.abs(n).toFixed(digits)}%`;
const rate = (n: number) => `${(n * 100).toFixed(1)}%`;

export function InvestmentTool() {
  const [active, setActive] = useState<ScenarioKey>("tested");
  const scenario = scenarios[active];
  const groupId = useId();

  return (
    <section id="tool" aria-labelledby="tool-title" className="border-t border-white/8 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading id="tool-title" eyebrow="Investment tool" title="The same strategy, with and without hindsight.">
          We replayed the paper books over {scenario.tradingDays} trading days using the same entry and exit rules
          the live books run. Flip the switch to see what the identical code reports when the model is allowed to
          train on the days it then traded. That gap is why we don&apos;t trust backtests, including our own.
        </SectionHeading>

        <div
          role="group"
          aria-labelledby={`${groupId}-label`}
          className="mt-10 inline-flex rounded-full border border-white/15 bg-surface p-1"
        >
          <span id={`${groupId}-label`} className="sr-only">
            Choose which data the model was allowed to learn from
          </span>
          {scenarioOrder.map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={active === key}
              onClick={() => setActive(key)}
              className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-colors sm:px-5 ${
                active === key ? "bg-cyan text-background" : "text-muted hover:text-foreground"
              }`}
            >
              {scenarios[key].label}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-3xl border border-white/8 bg-surface p-6 md:p-8">
          <p aria-live="polite" className="max-w-3xl text-base leading-relaxed text-muted">
            <span className={`font-semibold ${scenario.outOfSample ? "text-cyan" : "text-amber-400"}`}>
              {scenario.label}.
            </span>{" "}
            {scenario.detail}
          </p>

          <figure className="mt-6">
            <figcaption className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
              {plotted.map((book) => (
                <span key={book} className="inline-flex items-center gap-2">
                  <span aria-hidden="true" className="h-0.5 w-5 rounded-full" style={{ background: colors[book] }} />
                  {bookLabels[book].name}
                </span>
              ))}
              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-0.5 w-5 rounded-full"
                  style={{ background: `repeating-linear-gradient(90deg, ${SPY} 0 4px, transparent 4px 8px)` }}
                />
                S&amp;P 500 (SPY)
              </span>
            </figcaption>

            <svg
              viewBox={`0 0 ${W} ${H}`}
              preserveAspectRatio="none"
              role="img"
              aria-label={`Cumulative return over ${scenario.tradingDays} trading days, ${scenario.label.toLowerCase()}. The long book with the crash filter ends at ${signedPct(scenario.books.long_crash_filter.totalReturnPct)} and the S&P 500 at ${signedPct(scenario.spyReturnPct)}.`}
              className="mt-3 block h-64 w-full overflow-visible md:h-72"
            >
              {gridlines.map((v) => (
                <line
                  key={v}
                  x1="0"
                  x2={W}
                  y1={y(v)}
                  y2={y(v)}
                  stroke={v === 0 ? "rgba(179,186,197,0.5)" : "rgba(255,255,255,0.07)"}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              <polyline
                points={path(scenario.spyCurve)}
                fill="none"
                stroke={SPY}
                strokeWidth="2"
                strokeDasharray="5 5"
                vectorEffect="non-scaling-stroke"
              />
              {plotted.map((book) => (
                <polyline
                  key={book}
                  points={path(scenario.curve[book])}
                  fill="none"
                  stroke={colors[book]}
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>

            <div className="mt-2 flex justify-between text-xs text-muted" aria-hidden="true">
              {tickIndexes.map((i) => (
                <span key={i} className="font-mono tabular-nums">
                  {curveLabels[i]}
                </span>
              ))}
            </div>
            <p className="mt-1 text-xs text-muted">
              Cumulative return from the first close, {gridlines[0]}% to {gridlines[gridlines.length - 1]}% on a fixed
              scale shared by both settings.
            </p>
          </figure>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[46rem] border-separate border-spacing-0 text-left">
              <caption className="sr-only">
                Per-book results for the {scenario.label.toLowerCase()} setting, with 95% ranges on the average
                per-trade return over the S&amp;P 500
              </caption>
              <thead>
                <tr className="text-sm text-muted">
                  <th scope="col" className="pb-3 pr-4 font-semibold">Book</th>
                  <th scope="col" className="pb-3 pr-4 text-right font-semibold">Trades</th>
                  <th scope="col" className="pb-3 pr-4 text-right font-semibold">
                    Total return
                    <span className="block text-xs font-normal">SPY: {signedPct(scenario.spyReturnPct)}</span>
                  </th>
                  <th scope="col" className="pb-3 pr-4 text-right font-semibold">
                    Beat SPY
                    <span className="block text-xs font-normal">per trade</span>
                  </th>
                  <th scope="col" className="pb-3 font-semibold">
                    Average return over SPY, per trade
                    <span className="block text-xs font-normal">95% range</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookOrder.map((book) => {
                  const s = scenario.books[book];
                  return (
                    <tr key={book}>
                      <th scope="row" className="border-t border-white/8 py-4 pr-4 align-top">
                        <span className="flex items-center gap-2 text-base font-semibold">
                          <span
                            aria-hidden="true"
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ background: colors[book] }}
                          />
                          {bookLabels[book].name}
                        </span>
                        <span className="mt-1 block max-w-xs text-sm font-normal text-muted">
                          {bookLabels[book].detail}
                        </span>
                      </th>
                      <td className="border-t border-white/8 py-4 pr-4 text-right align-top font-mono tabular-nums">
                        {s.trades}
                      </td>
                      <td className="border-t border-white/8 py-4 pr-4 text-right align-top">
                        <span className="font-mono text-lg font-semibold tabular-nums">
                          {signedPct(s.totalReturnPct, 1)}
                        </span>
                      </td>
                      <td className="border-t border-white/8 py-4 pr-4 text-right align-top font-mono tabular-nums">
                        {rate(s.beatSpyRate)}
                      </td>
                      <td className="border-t border-white/8 py-4 align-top">
                        <span className="relative mt-1 block h-2.5 w-full min-w-[9rem]" aria-hidden="true">
                          <span className="absolute inset-0 rounded-full bg-white/8" />
                          <span className="absolute -top-1 bottom-[-4px] w-px bg-white/40" style={{ left: "50%" }} />
                          <span
                            className="absolute inset-y-0 rounded-full"
                            style={{
                              left: at(s.ciPct[0]),
                              width: `${((s.ciPct[1] - s.ciPct[0]) / (CI * 2)) * 100}%`,
                              background: `${colors[book]}80`,
                            }}
                          />
                          <span
                            className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
                            style={{ left: at(s.meanExcessPct), background: colors[book] }}
                          />
                        </span>
                        <span className="mt-2 block text-sm text-muted">
                          <span className="font-mono font-semibold tabular-nums text-foreground">
                            {signedPct(s.meanExcessPct)}
                          </span>{" "}
                          <span className="font-mono tabular-nums">
                            ({signedPct(s.ciPct[0])} to {signedPct(s.ciPct[1])})
                          </span>
                          <span className="block">
                            {s.straddlesZero
                              ? "Range includes zero: no measurable edge"
                              : s.robust === false
                                ? `Excludes zero on only ${s.seedsExcludingZero} of ${s.seeds} resampling seeds: treat as unproven`
                                : "Range excludes zero"}
                          </span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-amber-400/30 bg-amber-400/[0.04] p-6 md:p-9">
          <p className="font-mono text-sm font-semibold uppercase tracking-wider text-amber-400">
            Read this before you read the numbers
          </p>
          <h3 className="mt-3 font-[family-name:var(--font-heading)] text-2xl font-bold md:text-3xl">
            A simulation, not a track record, and not advice.
          </h3>
          <ul className="mt-5 grid gap-x-8 gap-y-4 md:grid-cols-2">
            <li className="text-base leading-relaxed text-muted">
              <span className="font-semibold text-foreground">Nobody traded this.</span> No money was at risk in
              either setting. Every figure here is what the rules would have done on past prices, and we are not
              offering to run it for you.
            </li>
            <li className="text-base leading-relaxed text-muted">
              <span className="font-semibold text-foreground">Costs are not modelled.</span> Returns are gross of
              commission, slippage, borrow cost and market impact. Short books in particular need borrow that a cash
              account doesn&apos;t have.
            </li>
            <li className="text-base leading-relaxed text-muted">
              <span className="font-semibold text-foreground">Beating the index per trade isn&apos;t beating it.</span>{" "}
              The crash-filtered long book earns more than the index on the average trade and still finishes behind it,
              because it holds at most nine names for three days and is out of the market the rest of the time.
            </li>
            <li className="text-base leading-relaxed text-muted">
              <span className="font-semibold text-foreground">One stretch, one regime.</span> Twenty-two months of a
              rising market is a single sample. The tested setting uses models frozen at the end of 2024 and never
              updated, which is conservative in one direction and stale in the other.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
