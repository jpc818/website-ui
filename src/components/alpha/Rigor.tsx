import { SectionHeading } from "@/components/alpha/SectionHeading";
import { signed, textMoodRows, type ResultRow } from "@/components/alpha/results";

const SCALE = 0.012;
const at = (scale: number, n: number) => `${((n / scale + 1) / 2) * 100}%`;

type PublishedResult = {
  eyebrow: string;
  title: string;
  body: string;
  rows: ResultRow[];
  scale: number;
  footnote: string;
  rowLabel: string;
};

const published: PublishedResult[] = [
  {
    eyebrow: "A miss we're publishing",
    title: "Text mood didn't earn its place.",
    body:
      "We expected the tone of posts and headlines to help. So we took every text-mood input out and re-ran the same tests on about 25,000 examples spanning five years. The score didn't drop. On three of four checks it didn't move at all, and on one it went up slightly. Whatever is doing the work, it isn't how people sound.",
    rows: textMoodRows,
    scale: SCALE,
    rowLabel: "Change in score when text mood is removed",
    footnote:
      "Each row is the change in score after removing text mood. Zero means no difference; the line marks it. Scores run from 0.50 (a coin flip) upward, so a change of 0.001 is invisible. Ranges are 95%, resampled by whole days (an earlier run). It's one test on one model, so it doesn't prove mood never matters. It does mean we can't claim it does.",
  },
];

function PublishedCard({ result }: { result: PublishedResult }) {
  const { scale } = result;
  return (
    <div className="mt-8 rounded-3xl border border-white/8 bg-surface p-6 md:p-9">
      <p className="font-mono text-sm font-semibold uppercase tracking-wider text-accent">{result.eyebrow}</p>
      <h3 className="mt-3 font-[family-name:var(--font-heading)] text-2xl font-bold md:text-3xl">{result.title}</h3>
      <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted">{result.body}</p>

      <ul className="mt-6 divide-y divide-white/8" aria-label={result.rowLabel}>
        {result.rows.map((row) => (
          <li
            key={row.label}
            className="grid items-center gap-x-6 gap-y-2 py-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.9fr)]"
          >
            <span className="text-base font-semibold">{row.label}</span>
            <span className="relative block h-2.5" aria-hidden="true">
              <span className="absolute inset-y-0 left-0 right-0 rounded-full bg-white/8" />
              <span className="absolute -top-1 bottom-[-4px] w-px bg-white/40" style={{ left: "50%" }} />
              <span
                className="absolute inset-y-0 rounded-full bg-cyan/50"
                style={{ left: at(scale, row.lo), width: `${((row.hi - row.lo) / (scale * 2)) * 100}%` }}
              />
              <span
                className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan"
                style={{ left: at(scale, row.est) }}
              />
            </span>
            <span className="text-sm text-muted">
              <span className="font-mono font-semibold tabular-nums text-foreground">{signed(row.est)}</span>{" "}
              <span className="font-mono tabular-nums">
                ({signed(row.lo)} to {signed(row.hi)})
              </span>
              <span className="block">{row.verdict}</span>
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">{result.footnote}</p>
    </div>
  );
}

const checks = [
  {
    name: "Test on the future",
    body: "Models learn from the past and get tested on a later stretch they've never seen, over and over.",
  },
  {
    name: "A locked vault",
    body: "Everything after a fixed date stays out of training. It's only used to check whether a result holds up.",
  },
  {
    name: "No peeking",
    body: "A signal only counts if it existed before the moment of the prediction. Anything recorded later gets thrown out.",
  },
  {
    name: "Beat the obvious",
    body: "Every data source has to beat a baseline on new data. Crowd signals clear the price-only baseline, but not yet price plus news and insider filings.",
  },
  {
    name: "Honest error bars",
    body: "Crowd-signal ranges resample blocks of five consecutive days, longer than the three-session horizon, so overlapping outcomes stay together. Resampling single days gave slightly narrower ranges and the same conclusions. The text-mood ranges, from an earlier run, still resample single days.",
  },
  {
    name: "Publish the misses",
    body: "Most patterns that look real turn out to be noise or something obvious. When that happens, we say so.",
  },
];

const limits = [
  {
    name: "Ranking, not returns",
    body: "AUC says how well we rank outcomes. It isn't a return. The investment tool above simulates the returns instead, and on unseen data the two long books show no edge over the index that we can tell apart from zero. Costs, capacity and drawdowns aren't modelled anywhere.",
  },
  {
    name: "Mostly price and volatility",
    body: "A model with only price and market data scores 0.793 on the holdout, against 0.800 with everything. These stocks are unusually volatile (about 18% fall 10 points or more behind the market in three sessions), and sized against each stock's own volatility every model drops to about 0.65–0.67. Knowing which stocks swing hard explains much of the headline score.",
  },
  {
    name: "Only stocks the crowd noticed",
    body: "A stock enters the data only on days the crowd we track talked about it. Results may not carry over to stocks nobody is discussing, or to other crowds.",
  },
  {
    name: "One final holdout",
    body: "The holdout is a single 22-month stretch, so effectively one market regime. The last two walk-forward folds cover the same period, so the two tests aren't independent. Several results are checked against that same stretch, and repeated looks at one stretch can produce small lifts by chance.",
  },
  {
    name: "One model, one target",
    body: "Each result is one model family on one big-drop call (and its volatility-adjusted version). None of it says crowd signals help on other targets, horizons or periods.",
  },
  {
    name: "Flags, not a better score",
    body: "The squeeze flag marks higher drop risk, but most of what crowd signals know, price and news already show. Adding them to the full model barely moves its ranking score.",
  },
  {
    name: "Not a track record",
    body: "These are back-tests on past data, including the simulated books in the investment tool, where no money was ever at risk. The forward log of calls made in advance started in October 2026 and is far too young to count as a track record.",
  },
];

export function Rigor() {
  return (
    <section
      id="rigor"
      aria-labelledby="rigor-title"
      className="border-t border-white/8 py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading
          id="rigor-title"
          eyebrow="Rigor"
          title="We try to break it before you do."
        >
          Every prediction is scored by how well it ranks what really happened,
          on data it never trained on. A score of 0.50 is a coin flip. A number
          only matters if it survives these six rules.
        </SectionHeading>

        <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {checks.map((check, i) => (
            <li
              key={check.name}
              className="rounded-3xl border border-white/8 bg-surface p-6 md:p-7"
            >
              <span className="font-mono text-base font-semibold text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-[family-name:var(--font-heading)] text-xl font-bold">
                {check.name}
              </h3>
              <p className="mt-2 text-base leading-relaxed text-muted">
                {check.body}
              </p>
            </li>
          ))}
        </ol>

        {published.map((result) => (
          <PublishedCard key={result.title} result={result} />
        ))}

        <div className="mt-8 rounded-3xl border border-amber-400/30 bg-amber-400/[0.04] p-6 md:p-9">
          <p className="font-mono text-sm font-semibold uppercase tracking-wider text-amber-400">
            What these results don&apos;t show
          </p>
          <h3 className="mt-3 font-[family-name:var(--font-heading)] text-2xl font-bold md:text-3xl">
            Early research, with real gaps.
          </h3>
          <ul className="mt-5 grid gap-x-8 gap-y-4 md:grid-cols-2">
            {limits.map((limit) => (
              <li key={limit.name} className="text-base leading-relaxed text-muted">
                <span className="font-semibold text-foreground">{limit.name}.</span> {limit.body}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
