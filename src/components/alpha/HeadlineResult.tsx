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
          The main result
        </p>
        <h2 className="mt-3 max-w-3xl text-balance font-[family-name:var(--font-heading)] text-2xl font-bold leading-tight md:text-3xl">
          On dates it never saw, the model is right 80% of the time. A coin flip is right 50%.
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">
          The test: take one stock that dropped hard and one that didn&apos;t. Did the model give the dropper a higher
          warning score? That&apos;s the &ldquo;score&rdquo; below. 0.80 means it picked correctly 80% of the time.
          Researchers call this AUC.
        </p>

        <div className="mt-8 rounded-3xl border border-white/8 bg-surface p-6 md:p-8">
          <p className="text-sm font-semibold text-muted">
            The same test, run three ways, each with more information than the last.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[40rem] border-separate border-spacing-0 text-left">
              <caption className="sr-only">
                Ranking scores for three nested models on two big-drop targets, on a final holdout and in a
                walk-forward test
              </caption>
              <thead>
                <tr className="text-sm text-muted">
                  <th scope="col" className="pb-3 pr-4 font-semibold">What the model sees</th>
                  <th scope="col" className="pb-3 pr-4 text-right font-semibold">
                    Score, 2025–2026
                    <span className="block text-xs font-normal">likely range</span>
                  </th>
                  <th scope="col" className="pb-3 pr-4 text-right font-semibold">
                    Score, 2021–2026
                    <span className="block text-xs font-normal">likely range</span>
                  </th>
                  <th scope="col" className="pb-3 text-right font-semibold">
                    Hit rate
                    <span className="block text-xs font-normal">its 10% most worried picks</span>
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
                        How often it normally happens: <span className="font-mono tabular-nums">{pct(target.holdout.baseRate)}</span> in 2025–2026 (
                        <span className="font-mono tabular-nums">{target.holdout.positives.toLocaleString("en-US")}</span> of{" "}
                        <span className="font-mono tabular-nums">{target.holdout.n.toLocaleString("en-US")}</span> cases
                        ), <span className="font-mono tabular-nums">{pct(target.walkForward.baseRate)}</span> across 2021–2026 (
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
            What this shows: the stock price alone gets you to about{" "}
            <span className="font-mono tabular-nums">{bigDrop.holdout.scores.price_market.auc.toFixed(2)}</span>. About half
            of its most worried picks dropped hard, against{" "}
            <span className="font-mono tabular-nums">{pct(bigDrop.holdout.baseRate)}</span> normally. Adding news,
            insider trades and online chatter barely moves the score. Why is price so strong? Mostly because it spots
            stocks that already swing wildly. When we account for that (the second group of rows), every version drops
            to about 0.65–0.67. The &ldquo;likely range&rdquo; is how much the score could wobble by chance. Data:{" "}
            <span className="font-mono tabular-nums">{universe.examples.toLocaleString("en-US")}</span> cases across{" "}
            <span className="font-mono tabular-nums">{universe.tickers}</span> stocks, {universe.from} to {universe.to}.
            A case is one stock on one day.
          </p>
        </div>

        <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted">
          Being right about which stocks drop isn&apos;t the same as making money.{" "}
          <a
            href="#tool"
            className="font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
          >
            The practice portfolios
          </a>{" "}
          below test that. Buying the stocks the model liked didn&apos;t clearly beat owning the market. This is early
          research, not a proven way to make money.{" "}
          <a
            href="#forward"
            className="font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
          >
            The live diary
          </a>{" "}
          has started, but it&apos;s too new to grade.{" "}
          <a
            href="#method"
            className="font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
          >
            How we did it →
          </a>
        </p>
      </div>
    </section>
  );
}
