import Link from "next/link";
import { squeezeFlag } from "@/components/alpha/results";

const pct = (n: number) => `${Math.round(n * 100)}%`;
const MAX = 0.5;

export function CrowdFlag({ linkToResearch = false }: { linkToResearch?: boolean }) {
  const { holdout, train, byVolatility, positions } = squeezeFlag;
  return (
    <section id="flag" aria-labelledby="flag-title" className="border-t border-white/8 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-cyan">What the crowd tells us</p>
        <h2
          id="flag-title"
          className="mt-3 max-w-3xl text-balance font-[family-name:var(--font-heading)] text-[clamp(1.875rem,5vw,3.25rem)] font-bold leading-[1.1] tracking-tight"
        >
          When the crowd calls a squeeze, the stock is more likely to <span className="text-accent">fall.</span>
        </h2>
        <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted md:text-xl">
          When most posts about a stock are tagged Squeeze or Bullish, it fell 10 points or more behind the S&amp;P
          500 within three sessions{" "}
          <span className="font-mono font-semibold tabular-nums text-foreground">{pct(holdout.flagged)}</span> of the time, against{" "}
          <span className="font-mono font-semibold tabular-nums text-foreground">{pct(holdout.others)}</span> for other stocks people were
          discussing.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-accent/30 bg-accent/5 p-6 md:p-8">
            <p className="text-sm font-semibold text-muted">Squeeze or Bullish posts</p>
            <p className="mt-2 font-mono text-6xl font-bold tabular-nums text-accent md:text-7xl">
              {pct(holdout.flagged)}
            </p>
            <p className="mt-2 text-base text-muted">
              fell 10+ points in three sessions · <span className="font-mono tabular-nums">{holdout.n.toLocaleString("en-US")}</span> stock-days
            </p>
          </div>
          <div className="rounded-3xl border border-white/8 bg-surface p-6 md:p-8">
            <p className="text-sm font-semibold text-muted">All other discussed stocks</p>
            <p className="mt-2 font-mono text-6xl font-bold tabular-nums text-foreground md:text-7xl">
              {pct(holdout.others)}
            </p>
            <p className="mt-2 text-base text-muted">same drop, same three sessions</p>
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-white/8 bg-surface p-6 md:p-8">
          <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold md:text-2xl">
            It isn&apos;t just the wild stocks.
          </h3>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted">
            Squeeze talk lands on jumpy names, so we compared stocks that were moving about as much. The flag still
            marked more drops in every group.
          </p>
          <ul className="mt-6 space-y-5" aria-label="Share of stock-days followed by a 10-point drop, by volatility group">
            {byVolatility.map((g) => (
              <li key={g.group}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-semibold">{g.group}</span>
                  <span className="font-mono tabular-nums text-muted">
                    <span className="text-accent">{pct(g.flagged)}</span> vs {pct(g.others)}
                  </span>
                </div>
                <div className="mt-2 space-y-1.5" aria-hidden="true">
                  <div className="h-2.5 rounded-full bg-white/8">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${(g.flagged / MAX) * 100}%` }} />
                  </div>
                  <div className="h-2.5 rounded-full bg-white/8">
                    <div className="h-full rounded-full bg-white/40" style={{ width: `${(g.others / MAX) * 100}%` }} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
            <span>
              <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-accent align-middle" />
              Squeeze or Bullish posts
            </span>
            <span>
              <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-white/40 align-middle" />
              Other discussed stocks
            </span>
          </p>
        </div>

        <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted">
          <span className="font-semibold text-foreground">The flip side:</span> when most posts are people showing
          their own positions and results, the drop rate was <span className="font-mono tabular-nums">{pct(positions.flagged)}</span>, against{" "}
          <span className="font-mono tabular-nums">{pct(positions.others)}</span>.
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
          Tags are set by the poster when the post goes up, so nothing here uses information from after the call.
          Figures are {holdout.window}, on data no model trained on. The same pattern held from {train.window}:{" "}
          <span className="font-mono tabular-nums">{pct(train.flagged)}</span> against{" "}
          <span className="font-mono tabular-nums">{pct(train.others)}</span>. It flags risk; it doesn&apos;t raise the overall ranking
          score, and it says nothing yet about returns after costs.
          {linkToResearch && (
            <>
              {" "}
              <Link
                href="/research"
                className="font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
              >
                See the research →
              </Link>
            </>
          )}
        </p>
      </div>
    </section>
  );
}
