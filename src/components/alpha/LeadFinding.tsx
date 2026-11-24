import Link from "next/link";
import { evalTargets } from "@/components/alpha/results";

const pct = (n: number) => `${Math.round(n * 100)}%`;

export function LeadFinding() {
  const [bigDrop] = evalTargets;
  const full = bigDrop.holdout.scores.public_plus_social;
  const price = bigDrop.holdout.scores.price_market;

  return (
    <section id="result" aria-labelledby="result-title" className="border-t border-white/8 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-cyan">The result</p>
        <h2
          id="result-title"
          className="mt-3 max-w-3xl text-balance font-[family-name:var(--font-heading)] text-[clamp(1.875rem,5vw,3.25rem)] font-bold leading-[1.1] tracking-tight"
        >
          The model is right{" "}
          <span className="font-mono tabular-nums text-accent">{pct(full.auc)}</span> of the time. A coin flip is
          right half the time.
        </h2>
        <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted md:text-xl">
          Here&apos;s the test. Take two stocks: one that went on to drop hard, and one that didn&apos;t. Ask the
          model which one is in trouble. It picks the right one{" "}
          <span className="font-semibold text-foreground">{pct(full.auc)}</span> of the time. We tested it on almost
          two years it had never seen.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/8 bg-surface p-6 md:p-8">
            <p className="text-sm font-semibold text-muted">Using only the stock price</p>
            <p className="mt-2 font-mono text-6xl font-bold tabular-nums md:text-7xl">{pct(price.auc)}</p>
            <p className="mt-2 text-base text-muted">
              Almost as good. Most of the skill comes from spotting stocks that already swing a lot.
            </p>
          </div>
          <div className="rounded-3xl border border-accent/30 bg-accent/5 p-6 md:p-8">
            <p className="text-sm font-semibold text-muted">Adding news, insider trades, and online chatter</p>
            <p className="mt-2 font-mono text-6xl font-bold tabular-nums text-accent md:text-7xl">{pct(full.auc)}</p>
            <p className="mt-2 text-base text-muted">
              A small gain. The crowd adds a little. It isn&apos;t a breakthrough yet.
            </p>
          </div>
        </div>

        <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted">
          A &ldquo;hard drop&rdquo; means the stock fell at least 10% behind the overall market (the S&amp;P 500)
          within three trading days. Normally about 1 in 6 stocks we track does that. Among the ones the model worried
          about most, about half did.
        </p>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted">
          <span className="font-semibold text-foreground">Spotting a drop isn&apos;t the same as making money.</span>{" "}
          When we tested buying the stocks the model liked, the results didn&apos;t clearly beat simply owning the
          market.{" "}
          <Link
            href="/research"
            className="font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
          >
            See all the numbers →
          </Link>
        </p>
      </div>
    </section>
  );
}
