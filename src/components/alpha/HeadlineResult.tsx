import { evalTargets, modelLabels, modelOrder, universe, type ModelScore } from "@/components/alpha/results";

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
const auc = (s: ModelScore) => s.auc.toFixed(3);
const range = (s: ModelScore) => `${s.lo.toFixed(3)}–${s.hi.toFixed(3)}`;

export function HeadlineResult() {
  const [bigDrop] = evalTargets;
  return (
    <section aria-labelledby="headline-result-title" className="border-t border-white/8 py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <p id="headline-result-title" className="text-sm font-semibold uppercase tracking-wider text-cyan">
          The full model
        </p>
        <h2 className="mt-3 max-w-3xl text-balance font-[family-name:var(--font-heading)] text-2xl font-bold leading-tight md:text-3xl">
          On data it never trained on, the model ranks big drops at 0.80. A coin flip is 0.50.
        </h2>

        <div className="mt-8 rounded-3xl border border-white/8 bg-surface p-6 md:p-8">
          <p className="text-sm font-semibold text-muted">
            Same test, three models. Ranking score (AUC) on data the model never trained on.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[40rem] border-separate border-spacing-0 text-left">
              <caption className="sr-only">
                Ranking scores for three nested models on two big-drop targets, on a final holdout and in a
                walk-forward test
              </caption>
              <thead>
                <tr className="text-sm text-muted">
                  <th scope="col" className="pb-3 pr-4 font-semibold">Model</th>
                  <th scope="col" className="pb-3 pr-4 text-right font-semibold">
                    Final holdout
                    <span className="block text-xs font-normal">95% range</span>
                  </th>
                  <th scope="col" className="pb-3 pr-4 text-right font-semibold">
                    Walk-forward
                    <span className="block text-xs font-normal">95% range</span>
                  </th>
                  <th scope="col" className="pb-3 text-right font-semibold">
                    Hit rate, top-ranked 10%
                    <span className="block text-xs font-normal">holdout</span>
                  </th>
                </tr>
              </thead>
              {evalTargets.map((target) => (
                <tbody key={target.key}>
                  <tr>
                    <th scope="colgroup" colSpan={4} className="border-t border-white/8 pb-2 pt-4 text-left">
                      <span className="text-base font-semibold">{target.name}</span>
                      <span className="mt-0.5 block max-w-2xl text-sm font-normal text-muted">{target.definition}</span>
                      <span className="mt-0.5 block text-sm font-normal text-muted">
                        How often it happens: <span className="font-mono tabular-nums">{pct(target.holdout.baseRate)}</span> on the holdout (
                        <span className="font-mono tabular-nums">{target.holdout.positives.toLocaleString("en-US")}</span> of{" "}
                        <span className="font-mono tabular-nums">{target.holdout.n.toLocaleString("en-US")}</span>
                        ), <span className="font-mono tabular-nums">{pct(target.walkForward.baseRate)}</span> in the walk-forward test (
                        <span className="font-mono tabular-nums">{target.walkForward.positives.toLocaleString("en-US")}</span> of{" "}
                        <span className="font-mono tabular-nums">{target.walkForward.n.toLocaleString("en-US")}</span>).
                      </span>
                    </th>
                  </tr>
                  {modelOrder.map((key) => (
                    <tr key={`${target.key}-${key}`}>
                      <th scope="row" className="border-t border-white/8 py-3 pr-4 align-top text-base font-semibold">
                        {modelLabels[key].name}
                      </th>
                      <td className="border-t border-white/8 py-3 pr-4 text-right">
                        <span className="font-mono text-lg font-semibold tabular-nums">{auc(target.holdout.scores[key])}</span>
                        <span className="block font-mono text-xs tabular-nums text-muted">
                          {range(target.holdout.scores[key])}
                        </span>
                      </td>
                      <td className="border-t border-white/8 py-3 pr-4 text-right">
                        <span className="font-mono text-lg font-semibold tabular-nums">
                          {auc(target.walkForward.scores[key])}
                        </span>
                        <span className="block font-mono text-xs tabular-nums text-muted">
                          {range(target.walkForward.scores[key])}
                        </span>
                      </td>
                      <td className="border-t border-white/8 py-3 text-right font-mono tabular-nums">
                        {pct(target.holdout.scores[key].top10)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">
            0.50 is a coin flip. A model with only price and market data already scores about{" "}
            <span className="font-mono tabular-nums">{bigDrop.holdout.scores.price_market.auc.toFixed(2)}</span> on the holdout, and about half of its top-ranked 10%
            had a big drop, against <span className="font-mono tabular-nums">{pct(bigDrop.holdout.baseRate)}</span> of all examples. Adding news, insider filings and
            crowd signals moves that by a few thousandths. Part of the score is simply knowing which stocks swing
            hard: sized against each stock&apos;s own volatility, every model falls to about 0.65–0.67. The ranges
            resample blocks of five consecutive days. Data: <span className="font-mono tabular-nums">{universe.examples.toLocaleString("en-US")}</span> stock-days
            across <span className="font-mono tabular-nums">{universe.tickers}</span> tickers, {universe.from} to {universe.to}.
          </p>
        </div>

        <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted">
          These are ranking scores (AUC), not returns. What the ranking is worth as a strategy is a separate
          question, and{" "}
          <a
            href="#tool"
            className="font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
          >
            the investment tool
          </a>{" "}
          below simulates it: on unseen data the long books don&apos;t beat the index by anything we can measure.
          This is early research, not a demonstrated edge.{" "}
          <a
            href="#forward"
            className="font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
          >
            The forward log
          </a>{" "}
          has started, and it doesn&apos;t have a score yet.{" "}
          <a
            href="#method"
            className="font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
          >
            See the method, folds and limits →
          </a>
        </p>
      </div>
    </section>
  );
}
