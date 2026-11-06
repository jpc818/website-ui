import { SectionHeading } from "@/components/alpha/SectionHeading";
import { evalTargets, modelLabels, modelOrder, universe } from "@/components/alpha/results";

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

const notes = [
  {
    name: "What this is",
    body: "Research on how crowds behave around publicly traded US stocks. Nothing here is advice or an offer. The results describe how well a model ranks outcomes on past data.",
  },
  {
    name: "Who is in the data",
    body: `Stocks that online investing communities talked about. A stock enters a given day only if it was mentioned, and it has to be a recognized ticker with a minimum level of discussion overall and a prior close of at least $1. That gives ${universe.examples.toLocaleString("en-US")} stock-days across ${universe.tickers} tickers, ${universe.from} to ${universe.to}. Because stocks only appear when crowds notice them, these results may not hold for stocks nobody is talking about.`,
  },
  {
    name: "When a call is made",
    body: "Each stock-day is entered at the next market open after the posts, so a post made after 9:30 ET counts toward the next session. Every feature is built from information available before that open.",
  },
  {
    name: "Model",
    body: "Gradient-boosted trees, one model per target and feature set. The three feature sets are nested, so the only difference between rows in the table above is what the model is allowed to see.",
  },
  {
    name: "Validation",
    body: "Two tests. Walk-forward: five expanding folds, each trained only on earlier data, with a 9-day gap between training and test so overlapping three-session outcomes can't leak. Final holdout: trained on data through 31 December 2024 and tested on everything after. The last two walk-forward folds and the holdout cover overlapping time, so they are not independent confirmations of each other.",
  },
  {
    name: "Error bars",
    body: "95% ranges from 2,000 resamples of blocks of five consecutive entry days, which is longer than the three-session horizon. Resampling single days gave slightly narrower ranges and the same conclusions.",
  },
  {
    name: "Data sources",
    body: "Public posts from retail-investor communities, collected from a public archive. News volume and tone from GDELT's public BigQuery tables. Insider transactions from SEC EDGAR Form 4 filings. Historical prices from Yahoo Finance, live quotes from Schwab. We publish aggregate results only, not raw posts. Questions about terms, licensing or privacy: contact@jarg.ai.",
  },
];

export function MethodNote() {
  const [bigDrop] = evalTargets;
  return (
    <section id="method" aria-labelledby="method-title" className="border-t border-white/8 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading id="method-title" eyebrow="Method" title="How the numbers were made.">
          A short methodology note, so you can judge the results and argue with them.
        </SectionHeading>

        <dl className="mt-10 grid gap-x-12 gap-y-6 md:grid-cols-2">
          {notes.map((note) => (
            <div key={note.name}>
              <dt className="text-base font-semibold text-foreground">{note.name}</dt>
              <dd className="mt-1 text-base leading-relaxed text-muted">{note.body}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-12 rounded-3xl border border-white/8 bg-surface p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan">Walk-forward, fold by fold</p>
          <h3 className="mt-2 font-[family-name:var(--font-heading)] text-xl font-bold md:text-2xl">
            {bigDrop.name}: examples and positives in each test fold
          </h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[44rem] border-separate border-spacing-0 text-left">
              <caption className="sr-only">
                Test window, number of examples, number of big drops and ranking score for each walk-forward fold
              </caption>
              <thead>
                <tr className="text-sm text-muted">
                  <th scope="col" className="pb-3 pr-4 font-semibold">Fold</th>
                  <th scope="col" className="pb-3 pr-4 font-semibold">Test window</th>
                  <th scope="col" className="pb-3 pr-4 text-right font-semibold">Examples</th>
                  <th scope="col" className="pb-3 pr-4 text-right font-semibold">Big drops</th>
                  {modelOrder.map((key) => (
                    <th key={key} scope="col" className="pb-3 pr-4 text-right font-semibold last:pr-0">
                      {modelLabels[key].name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bigDrop.folds.map((fold) => (
                  <tr key={fold.fold}>
                    <th scope="row" className="border-t border-white/8 py-3 pr-4 font-mono text-sm font-semibold tabular-nums">
                      {fold.fold}
                    </th>
                    <td className="border-t border-white/8 py-3 pr-4 text-sm text-muted">{fold.window}</td>
                    <td className="border-t border-white/8 py-3 pr-4 text-right font-mono text-sm tabular-nums">
                      {fold.n.toLocaleString("en-US")}
                    </td>
                    <td className="border-t border-white/8 py-3 pr-4 text-right font-mono text-sm tabular-nums">
                      {fold.positives.toLocaleString("en-US")}
                      <span className="text-muted"> ({pct(fold.baseRate)})</span>
                    </td>
                    {modelOrder.map((key) => (
                      <td
                        key={key}
                        className="border-t border-white/8 py-3 pr-4 text-right font-mono text-sm tabular-nums last:pr-0"
                      >
                        {fold.auc[key].toFixed(3)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">
            The score is lowest in the first fold, which has the least training data (about 4,000 examples), and
            rises as the training set grows. The three models stay within about 0.015 of each other in every fold.
          </p>
        </div>
      </div>
    </section>
  );
}
