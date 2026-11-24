import { SectionHeading } from "@/components/alpha/SectionHeading";
import { evalTargets, modelLabels, modelOrder, universe } from "@/components/alpha/results";

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

const notes = [
  {
    name: "What this is",
    body: "Research on how online crowds behave around US stocks. Nothing here is advice or an offer to sell you anything. The results show how well a model would have spotted drops in the past.",
  },
  {
    name: "Which stocks are included",
    body: `Stocks that online investing groups talked about. A stock is only included on days it was mentioned. It also has to be a real, listed stock that gets talked about regularly and was trading at $1 or more. That gives ${universe.examples.toLocaleString("en-US")} cases across ${universe.tickers} stocks, ${universe.from} to ${universe.to}. Because stocks only show up when people notice them, the results may not apply to stocks nobody is talking about.`,
  },
  {
    name: "When a prediction counts from",
    body: "Each prediction starts at the next time the market opens after the posts. A post made after 9:30 a.m. New York time counts toward the next day. The model only uses information that existed before that opening bell.",
  },
  {
    name: "The model",
    body: "A common type of machine-learning model (gradient-boosted trees). We built three versions. The first sees 13 pieces of information about the price and the market. The second sees 35, adding news and insider trades. The third sees 53, adding online chatter. Each version sees everything the one before it did, so any difference comes from the new information. We don't yet publish a chart showing whether, say, a 40% warning is followed by a drop about 40% of the time.",
  },
  {
    name: "How it was tested",
    body: "Two ways. First, five rounds where the model learns from earlier years and is tested on the next stretch, with a 9-day gap in between so no answers slip through. Second, one final test: the model learns from everything up to 31 December 2024 and is tested on everything after. The last two rounds overlap in time with the final test, so they aren't fully separate checks.",
  },
  {
    name: "Error bars",
    body: "Each range shows how much a result could change by chance. We get it by reshuffling the data 2,000 times in chunks of five trading days. Using chunks keeps predictions that overlap in time together, which stops the range looking tighter than it should.",
  },
  {
    name: "Where the data comes from",
    body: "Posts come from a public archive of retail-investor forums. We haven't named the archive. News comes from GDELT, a free public news database. Insider trades come from SEC Form 4 filings, which company insiders must file when they trade. Past prices come from Yahoo Finance, and live prices from Schwab. We publish totals, not the posts themselves. Posts that look like they came from bots are kept in. Questions about this: contact@jarg.ai.",
  },
];

export function MethodNote() {
  const [bigDrop] = evalTargets;
  return (
    <section id="method" aria-labelledby="method-title" className="border-t border-white/8 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading id="method-title" eyebrow="Method" title="How the numbers were made.">
          The details, so you can judge the results for yourself and argue with them.
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
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan">The five test rounds</p>
          <h3 className="mt-2 font-[family-name:var(--font-heading)] text-xl font-bold md:text-2xl">
            Hard drops: how many cases and drops in each round, and the score each version got
          </h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[44rem] border-separate border-spacing-0 text-left">
              <caption className="sr-only">
                Dates tested, number of cases, number of hard drops and score for each test round
              </caption>
              <thead>
                <tr className="text-sm text-muted">
                  <th scope="col" className="pb-3 pr-4 font-semibold">Round</th>
                  <th scope="col" className="pb-3 pr-4 font-semibold">Dates tested</th>
                  <th scope="col" className="pb-3 pr-4 text-right font-semibold">Cases</th>
                  <th scope="col" className="pb-3 pr-4 text-right font-semibold">Hard drops</th>
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
            The score is lowest in the first round, when the model had the least to learn from (about 4,000 cases),
            and rises as it gets more. The three versions stay within about 0.015 of each other every time.
          </p>
        </div>
      </div>
    </section>
  );
}
