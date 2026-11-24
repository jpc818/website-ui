"use client";

import { useId, useState } from "react";
import { SectionHeading } from "@/components/alpha/SectionHeading";
import {
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

const books: Record<BookKey, { name: string; detail: string }> = {
  long_crash_filter: {
    name: "Buy the favorites, skip the risky ones",
    detail: "Buys the stocks the model likes most, but leaves out any it thinks might drop hard.",
  },
  long_q80: {
    name: "Buy a wider group",
    detail: "Buys more of the stocks the model likes, with no safety check. More trades, less picky.",
  },
  short_crash: {
    name: "Bet against the warnings",
    detail: "Bets that the stocks flagged for a hard drop will fall. This needs borrowed shares, which a normal account can't do.",
  },
};

const settings: Record<ScenarioKey, { label: string; detail: string }> = {
  tested: {
    label: "Fair test",
    detail:
      "The model learned from data up to the end of 2024, then was locked. Every day it traded was new to it.",
  },
  peeking: {
    label: "Cheating",
    detail:
      "Same code, but the model was allowed to study the very days it then traded. It's like seeing the exam answers first. This is the mistake that makes many backtests look great.",
  },
};

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
        <SectionHeading id="tool-title" eyebrow="Practice portfolios" title="Does it make money? Here's a fair test, and a cheating one.">
          We pretended to trade on the model&apos;s picks for {scenario.tradingDays} trading days, from January 2025
          to October 2026. No real money. Flip the switch to see how much better the same strategy looks when the
          model is allowed to cheat. That gap is why we don&apos;t trust impressive backtests, including our own.
        </SectionHeading>

        <div
          role="group"
          aria-labelledby={`${groupId}-label`}
          className="mt-10 inline-flex rounded-full border border-white/15 bg-surface p-1"
        >
          <span id={`${groupId}-label`} className="sr-only">
            Choose a fair test or a cheating one
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
              {settings[key].label}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-3xl border border-white/8 bg-surface p-6 md:p-8">
          <p aria-live="polite" className="max-w-3xl text-base leading-relaxed text-muted">
            <span className={`font-semibold ${scenario.outOfSample ? "text-cyan" : "text-amber-400"}`}>
              {settings[active].label}.
            </span>{" "}
            {settings[active].detail}
          </p>

          <figure className="mt-6">
            <figcaption className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
              {plotted.map((book) => (
                <span key={book} className="inline-flex items-center gap-2">
                  <span aria-hidden="true" className="h-0.5 w-5 rounded-full" style={{ background: colors[book] }} />
                  {books[book].name}
                </span>
              ))}
              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-0.5 w-5 rounded-full"
                  style={{ background: `repeating-linear-gradient(90deg, ${SPY} 0 4px, transparent 4px 8px)` }}
                />
                The S&amp;P 500 (just owning the market)
              </span>
            </figcaption>

            <svg
              viewBox={`0 0 ${W} ${H}`}
              preserveAspectRatio="none"
              role="img"
              aria-label={`Total gain over ${scenario.tradingDays} trading days, ${settings[active].label.toLowerCase()}. Buying the favorites and skipping the risky ones ends at ${signedPct(scenario.books.long_crash_filter.totalReturnPct)} and the S&P 500 at ${signedPct(scenario.spyReturnPct)}.`}
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
              Total gain since the start. The chart is the same size for both settings, from {gridlines[0]}% to{" "}
              {gridlines[gridlines.length - 1]}%, so you can compare them fairly. &ldquo;Bet against the warnings&rdquo;
              gains so much it would squash the chart, so it&apos;s only in the table.
            </p>
          </figure>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[46rem] border-separate border-spacing-0 text-left">
              <caption className="sr-only">
                Results for each practice portfolio in the {settings[active].label.toLowerCase()} setting, with the
                likely range of the average gain over the S&amp;P 500 per trade
              </caption>
              <thead>
                <tr className="text-sm text-muted">
                  <th scope="col" className="pb-3 pr-4 font-semibold">Strategy</th>
                  <th scope="col" className="pb-3 pr-4 text-right font-semibold">Trades</th>
                  <th scope="col" className="pb-3 pr-4 text-right font-semibold">
                    Total gain
                    <span className="block font-mono text-xs font-normal tabular-nums">Market: {signedPct(scenario.spyReturnPct)}</span>
                  </th>
                  <th scope="col" className="pb-3 pr-4 text-right font-semibold">
                    Beat the market
                    <span className="block text-xs font-normal">share of trades</span>
                  </th>
                  <th scope="col" className="pb-3 font-semibold">
                    Average edge over the market, per trade
                    <span className="block text-xs font-normal">likely range</span>
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
                          {books[book].name}
                        </span>
                        <span className="mt-1 block max-w-xs text-sm font-normal text-muted">
                          {books[book].detail}
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
                              ? "Could be zero. No proven edge."
                              : s.robust === false
                                ? `Held up in only ${s.seedsExcludingZero} of ${s.seeds} rechecks. Unproven.`
                                : "Above zero, before costs."}
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
            This is a practice run, not a track record, and not advice.
          </h3>
          <ul className="mt-5 grid gap-x-8 gap-y-4 md:grid-cols-2">
            <li className="text-base leading-relaxed text-muted">
              <span className="font-semibold text-foreground">Nobody traded this.</span> No real money was used.
              These numbers show what the rules would have done on past prices. We&apos;re not offering to run it for
              you.
            </li>
            <li className="text-base leading-relaxed text-muted">
              <span className="font-semibold text-foreground">Fees aren&apos;t included.</span> Real trading costs
              money: commissions, worse prices than you hoped for, and fees to borrow shares. Betting against a stock
              needs borrowed shares, which a normal account can&apos;t do.
            </li>
            <li className="text-base leading-relaxed text-muted">
              <span className="font-semibold text-foreground">A good average trade isn&apos;t a good result overall.</span>{" "}
              &ldquo;Buy the favorites&rdquo; beats the market on the average trade and still ends up behind it. It
              owns at most nine stocks at a time, for three days, and sits in cash the rest of the time.
            </li>
            <li className="text-base leading-relaxed text-muted">
              <span className="font-semibold text-foreground">One stretch of time.</span> Twenty-two months of a
              rising market is just one example. The fair-test model was locked at the end of 2024 and never updated.
              That makes the test strict, but also a little out of date.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
