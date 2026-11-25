"use client";

import { useEffect, useState } from "react";

type Call = {
  entry_day: string;
  ticker: string;
  crash_pct: number | null;
  price: number | null;
  released_at: string | null;
  published_before_outcome: boolean | null;
  excess_return: number | null;
  big_drop: boolean | null;
};

type State = { status: "loading" } | { status: "error" } | { status: "ready"; calls: Call[] };

const dash = "—";

const day = (value: string) =>
  new Date(`${value}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

const percentile = (n: number | null) => (n === null ? dash : n.toLocaleString("en-US", { maximumFractionDigits: 1 }));

const price = (n: number | null) =>
  n === null ? dash : `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function signedPct(n: number) {
  const text = Math.abs(n * 100).toFixed(1);
  if (text === "0.0") return "0.0%";
  return `${n < 0 ? "−" : "+"}${text}%`;
}

const published = (value: boolean | null) => (value === null ? dash : value ? "Same morning" : "After outcome");

function Totals({ calls }: { calls: Call[] }) {
  const resolved = calls.filter((call) => call.excess_return !== null);
  const bigDrops = resolved.filter((call) => call.big_drop === true).length;
  const items = [
    { label: "Calls shown", value: calls.length },
    { label: "Finished", value: resolved.length },
    { label: "Big drops among finished", value: bigDrops },
  ];
  return (
    <dl className="grid gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-3xl border border-white/8 bg-surface p-5 md:p-6">
          <dt className="text-sm font-semibold text-muted">{item.label}</dt>
          <dd className="mt-1 font-mono text-3xl font-bold tabular-nums">{item.value.toLocaleString("en-US")}</dd>
        </div>
      ))}
    </dl>
  );
}

function CallsTable({ calls }: { calls: Call[] }) {
  return (
    <div className="mt-8 rounded-3xl border border-white/8 bg-surface p-6 md:p-8">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[44rem] border-separate border-spacing-0 text-left">
          <caption className="sr-only">
            Every released call: entry day, stock, drop-risk percentile, price at the call, when it was published, and
            its outcome against the S&amp;P 500
          </caption>
          <thead>
            <tr className="text-sm text-muted">
              <th scope="col" className="pb-3 pr-4 font-semibold">Entry day</th>
              <th scope="col" className="pb-3 pr-4 font-semibold">Stock</th>
              <th scope="col" className="pb-3 pr-4 text-right font-semibold">Drop-risk percentile</th>
              <th scope="col" className="pb-3 pr-4 text-right font-semibold">Price at call</th>
              <th scope="col" className="pb-3 pr-4 font-semibold">Published</th>
              <th scope="col" className="pb-3 text-right font-semibold">Outcome vs S&amp;P 500</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call) => (
              <tr key={`${call.entry_day}|${call.ticker}`}>
                <td className="border-t border-white/8 py-3 pr-4 font-mono text-sm whitespace-nowrap tabular-nums text-muted">
                  {day(call.entry_day)}
                </td>
                <th scope="row" className="border-t border-white/8 py-3 pr-4 font-mono text-sm font-semibold">
                  {call.ticker}
                </th>
                <td className="border-t border-white/8 py-3 pr-4 text-right font-mono text-sm tabular-nums">
                  {percentile(call.crash_pct)}
                </td>
                <td className="border-t border-white/8 py-3 pr-4 text-right font-mono text-sm tabular-nums">
                  {price(call.price)}
                </td>
                <td className="border-t border-white/8 py-3 pr-4 text-sm whitespace-nowrap text-muted">
                  {published(call.published_before_outcome)}
                </td>
                <td className="border-t border-white/8 py-3 text-right text-sm whitespace-nowrap">
                  {call.excess_return === null ? (
                    <span className="text-muted">Open</span>
                  ) : (
                    <>
                      <span className="font-mono font-semibold tabular-nums">{signedPct(call.excess_return)}</span>
                      {call.big_drop ? (
                        <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
                          Big drop
                        </span>
                      ) : null}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Scoreboard() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/calls", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<{ calls?: unknown }>;
      })
      .then((data) => {
        if (!Array.isArray(data.calls)) throw new Error("Unexpected response");
        setState({ status: "ready", calls: data.calls as Call[] });
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: "error" });
      });
    return () => controller.abort();
  }, [attempt]);

  if (state.status === "loading") {
    return (
      <p role="status" className="rounded-3xl border border-white/8 bg-surface p-6 text-base text-muted md:p-8">
        Loading calls…
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <div role="alert" className="rounded-3xl border border-amber-400/30 bg-amber-400/[0.04] p-6 md:p-8">
        <p className="text-base text-foreground">We couldn&apos;t load the scoreboard just now.</p>
        <button
          type="button"
          onClick={() => {
            setState({ status: "loading" });
            setAttempt((n) => n + 1);
          }}
          className="mt-4 cursor-pointer rounded-full border border-white/15 px-4 py-1.5 text-sm font-semibold text-foreground transition-colors hover:border-white/30"
        >
          Try again
        </button>
      </div>
    );
  }

  if (state.calls.length === 0) {
    return (
      <p className="rounded-3xl border border-white/8 bg-surface p-6 text-base text-foreground md:p-8">
        The test hasn&apos;t started yet. Calls will appear here from its first trading day.
      </p>
    );
  }

  return (
    <>
      <Totals calls={state.calls} />
      <CallsTable calls={state.calls} />
    </>
  );
}
