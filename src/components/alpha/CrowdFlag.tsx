import Link from "next/link";
import { squeezeFlag } from "@/components/alpha/results";

const pct = (n: number) => `${Math.round(n * 100)}%`;
const MAX = 0.5;

export function CrowdFlag({ linkToResearch = false }: { linkToResearch?: boolean }) {
  const { holdout, train, byVolatility, positions } = squeezeFlag;
  return (
    <section id="flag" aria-labelledby="flag-title" className="border-t border-white/8 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-cyan">One simple pattern</p>
        <h2
          id="flag-title"
          className="mt-3 max-w-3xl text-balance font-[family-name:var(--font-heading)] text-[clamp(1.875rem,5vw,3.25rem)] font-bold leading-[1.1] tracking-tight"
        >
          When the crowd is most excited, the stock is more likely to fall.
        </h2>
        <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted md:text-xl">
          On investing forums, people label their posts. When most posts about a stock were labeled
          &ldquo;Squeeze&rdquo; or &ldquo;Bullish&rdquo; (meaning &ldquo;this is going up&rdquo;), the stock dropped
          hard{" "}
          <span className="font-mono font-semibold tabular-nums text-foreground">{pct(holdout.flagged)}</span> of the
          time. Otherwise it was{" "}
          <span className="font-mono font-semibold tabular-nums text-foreground">{pct(holdout.others)}</span>.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-accent/30 bg-accent/5 p-6 md:p-8">
            <p className="text-sm font-semibold text-muted">Crowd says &ldquo;going up&rdquo;</p>
            <p className="mt-2 font-mono text-6xl font-bold tabular-nums text-accent md:text-7xl">
              {pct(holdout.flagged)}
            </p>
            <p className="mt-2 text-base text-muted">dropped hard within three trading days</p>
          </div>
          <div className="rounded-3xl border border-white/8 bg-surface p-6 md:p-8">
            <p className="text-sm font-semibold text-muted">Everything else</p>
            <p className="mt-2 font-mono text-6xl font-bold tabular-nums text-foreground md:text-7xl">
              {pct(holdout.others)}
            </p>
            <p className="mt-2 text-base text-muted">dropped hard in the same window</p>
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">
          Based on {holdout.n.toLocaleString("en-US")} cases from {holdout.window}. A case is one stock on one day.
          That&apos;s a modest sample, so treat the gap as a pattern worth watching, not a law.
        </p>

        <div className="mt-5 rounded-3xl border border-white/8 bg-surface p-6 md:p-8">
          <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold md:text-2xl">
            It&apos;s not just the wild stocks.
          </h3>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted">
            Hyped stocks tend to be jumpy anyway. So we compared calm stocks with calm stocks, and wild with wild. The
            hyped ones still dropped more often in every group. Some groups are small.
          </p>
          <ul className="mt-6 space-y-5" aria-label="How often stocks dropped hard, from calmest to wildest">
            {byVolatility.map((g) => (
              <li key={g.group}>
                <div className="flex items-baseline justify-between gap-4 text-sm">
                  <span className="font-semibold">
                    {g.group}{" "}
                    <span className="font-normal text-muted">
                      · <span className="font-mono tabular-nums">{g.n}</span> cases
                    </span>
                  </span>
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
              Crowd says &ldquo;going up&rdquo;
            </span>
            <span>
              <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-white/40 align-middle" />
              Everything else
            </span>
          </p>
        </div>

        <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted">
          <span className="font-semibold text-foreground">The opposite also showed up.</span> When most posts were
          people sharing their own trades and results, stocks dropped hard only{" "}
          <span className="font-mono tabular-nums">{pct(positions.flagged)}</span> of the time, against{" "}
          <span className="font-mono tabular-nums">{pct(positions.others)}</span> otherwise.
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
          These dates were never used to build anything, and the same gap showed up in the years before (
          {pct(train.flagged)} vs {pct(train.others)}). Still, this tells you a stock is riskier. It doesn&apos;t tell
          you how to profit from it, and it barely improves the main model.
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
