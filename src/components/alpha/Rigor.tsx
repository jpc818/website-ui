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
    title: "Whether posts sound happy or angry didn't help.",
    body:
      "We expected the tone of posts and headlines to matter. So we removed it completely and re-ran the same tests on about 25,000 cases over five years. The model didn't get worse. Three times it didn't change at all, and once it got slightly better. What matters is what people do, not how they sound.",
    rows: textMoodRows,
    scale: SCALE,
    rowLabel: "Change in score when tone is removed",
    footnote:
      "Each row shows how the score changed when we removed tone. The middle line is zero, meaning no change. The bar shows how much the result could wobble by chance. A change of 0.001 is too small to notice. This is one test on one model, so it doesn't prove tone never matters. It does mean we can't say it does.",
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
    body: "The model learns from the past, then gets tested on later dates it has never seen. We repeat this several times.",
  },
  {
    name: "A locked vault",
    body: "Everything after a set date is kept away from the model while it learns. We only open it at the end, to check the result.",
  },
  {
    name: "No hindsight",
    body: "The model can only use information that existed before the prediction. Anything recorded later gets thrown out.",
  },
  {
    name: "Beat the obvious",
    body: "Every new source of information has to beat a simpler model. Online chatter beats the price-only model, but barely adds anything once news and insider trades are in.",
  },
  {
    name: "Honest error bars",
    body: "Every result comes with a range showing how much it could wobble by chance. We work these out in a way that doesn't make them look tighter than they are.",
  },
  {
    name: "Publish the misses",
    body: "Most patterns that look real turn out to be luck or something obvious. When that happens, we say so.",
  },
];

const limits = [
  {
    name: "Being right isn't the same as making money",
    body: "The 80% score is about spotting drops, not about profit. The practice portfolios above test profit, and buying the model's favorites didn't clearly beat owning the market. Trading costs aren't included anywhere.",
  },
  {
    name: "Most of it is the stock price",
    body: "The stock price alone scores 0.79. Everything together scores 0.80. These are jumpy stocks: about 1 in 6 drops hard in any three-day stretch. Once we account for how jumpy each stock is, every version scores about 0.65–0.67. A lot of the headline score is just knowing which stocks swing wildly.",
  },
  {
    name: "Only stocks people were talking about",
    body: "A stock only shows up in our data on days the online crowd we follow talked about it. The results may not apply to stocks nobody is discussing, or to other groups of people.",
  },
  {
    name: "One stretch of time",
    body: "The final test covers 22 months, so it's really one kind of market. Our other tests overlap with the same period, so they aren't fully separate checks. Looking at the same stretch many times can turn up small wins by luck.",
  },
  {
    name: "One question",
    body: "Everything here is about one question: will the stock drop hard over the next three trading days? It says nothing about other questions or longer periods.",
  },
  {
    name: "Tags help, but not the main score",
    body: "The Squeeze tag points to higher drop risk. But most of what online chatter knows, the price and news already show. Adding chatter to the full model barely changes its score.",
  },
  {
    name: "Not a track record",
    body: "All of this looks back at past data, including the practice portfolios, where no real money was used. Our live diary started in October 2026. With only two hard drops so far, it's too new to count as a track record.",
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
          eyebrow="How we test"
          title="We try to break it before you do."
        >
          Every prediction is checked against what really happened, on dates
          the model never saw. A score of 0.50 is a coin flip. A result only
          counts if it passes these six rules.
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
