// All numbers on this page come from one evaluation run of the production model code
// (social-alpha: scripts/ablation.py + scripts/evaluation_report.py, output data/research/evaluation_block_bootstrap.json).
//
// Model: gradient-boosted trees, three-session horizon. Walk-forward: five expanding folds, 9-day purge gap.
// Holdout: trained on data through 2024-12-31, tested on everything after. 95% ranges resample blocks of five
// consecutive entry days (2,000 resamples), so overlapping three-session outcomes stay together.

export type ModelKey = "price_market" | "public" | "public_plus_social";

export const modelLabels: Record<ModelKey, { name: string; detail: string }> = {
  price_market: { name: "Price and market only", detail: "13 features: returns, volatility, volume, VIX, calendar" },
  public: { name: "+ news and insider filings", detail: "35 features: the above plus news volume and tone, SEC Form 4" },
  public_plus_social: { name: "+ crowd signals", detail: "53 features: the above plus mentions, bursts, coordination, author track records" },
};

export const modelOrder: ModelKey[] = ["price_market", "public", "public_plus_social"];

export type ModelScore = { auc: number; lo: number; hi: number; top10: number };
export type SplitResult = {
  n: number;
  positives: number;
  baseRate: number;
  window: string;
  scores: Record<ModelKey, ModelScore>;
};
export type FoldRow = {
  fold: number;
  window: string;
  n: number;
  positives: number;
  baseRate: number;
  auc: Record<ModelKey, number>;
};
export type EvalTarget = {
  key: string;
  name: string;
  definition: string;
  holdout: SplitResult;
  walkForward: SplitResult;
  folds: FoldRow[];
};

export const evalTargets: EvalTarget[] = [
  {
    key: "crash10_3d",
    name: "Big drop",
    definition:
      "The stock underperforms the S&P 500 (SPY) by 10 percentage points or more over three sessions, measured from the next open.",
    holdout: {
      n: 8330,
      positives: 1443,
      baseRate: 0.1732,
      window: "Jan 2025 – Oct 2026",
      scores: {
        price_market: { auc: 0.7931, lo: 0.777, hi: 0.8095, top10: 0.5186 },
        public: { auc: 0.7968, lo: 0.7825, hi: 0.8124, top10: 0.5162 },
        public_plus_social: { auc: 0.7997, lo: 0.7848, hi: 0.8149, top10: 0.5162 },
      },
    },
    walkForward: {
      n: 21037,
      positives: 3818,
      baseRate: 0.1815,
      window: "Dec 2021 – Oct 2026",
      scores: {
        price_market: { auc: 0.7564, lo: 0.7431, hi: 0.7694, top10: 0.4886 },
        public: { auc: 0.7677, lo: 0.7552, hi: 0.7794, top10: 0.5062 },
        public_plus_social: { auc: 0.7673, lo: 0.7548, hi: 0.7791, top10: 0.5024 },
      },
    },
    folds: [
      { fold: 1, window: "Dec 2021 – Feb 2023", n: 4221, positives: 825, baseRate: 0.1955, auc: { price_market: 0.6853, public: 0.6994, public_plus_social: 0.7003 } },
      { fold: 2, window: "Feb 2023 – Mar 2024", n: 4226, positives: 778, baseRate: 0.1841, auc: { price_market: 0.7638, public: 0.7752, public_plus_social: 0.7717 } },
      { fold: 3, window: "Mar 2024 – Dec 2024", n: 4232, positives: 773, baseRate: 0.1827, auc: { price_market: 0.7753, public: 0.7858, public_plus_social: 0.7838 } },
      { fold: 4, window: "Dec 2024 – Sep 2025", n: 4252, positives: 772, baseRate: 0.1816, auc: { price_market: 0.7843, public: 0.7947, public_plus_social: 0.7953 } },
      { fold: 5, window: "Sep 2025 – Oct 2026", n: 4213, positives: 708, baseRate: 0.1681, auc: { price_market: 0.7949, public: 0.7992, public_plus_social: 0.8006 } },
    ],
  },
  {
    key: "crash_voladj_3d",
    name: "Volatility-adjusted drop",
    definition:
      "The stock underperforms SPY over three sessions by at least one standard deviation of its own recent (20-day) volatility.",
    holdout: {
      n: 8330,
      positives: 1177,
      baseRate: 0.1413,
      window: "Jan 2025 – Oct 2026",
      scores: {
        price_market: { auc: 0.6522, lo: 0.6303, hi: 0.6731, top10: 0.2809 },
        public: { auc: 0.6665, lo: 0.6477, hi: 0.6844, top10: 0.3097 },
        public_plus_social: { auc: 0.6673, lo: 0.6483, hi: 0.6848, top10: 0.3133 },
      },
    },
    walkForward: {
      n: 21037,
      positives: 3005,
      baseRate: 0.1428,
      window: "Dec 2021 – Oct 2026",
      scores: {
        price_market: { auc: 0.6338, lo: 0.6186, hi: 0.6497, top10: 0.2657 },
        public: { auc: 0.6497, lo: 0.635, hi: 0.6643, top10: 0.2899 },
        public_plus_social: { auc: 0.6505, lo: 0.6365, hi: 0.6647, top10: 0.2861 },
      },
    },
    folds: [
      { fold: 1, window: "Dec 2021 – Feb 2023", n: 4221, positives: 612, baseRate: 0.145, auc: { price_market: 0.6153, public: 0.631, public_plus_social: 0.6365 } },
      { fold: 2, window: "Feb 2023 – Mar 2024", n: 4226, positives: 633, baseRate: 0.1498, auc: { price_market: 0.6209, public: 0.6416, public_plus_social: 0.6383 } },
      { fold: 3, window: "Mar 2024 – Dec 2024", n: 4232, positives: 588, baseRate: 0.1389, auc: { price_market: 0.6701, public: 0.6888, public_plus_social: 0.6902 } },
      { fold: 4, window: "Dec 2024 – Sep 2025", n: 4252, positives: 551, baseRate: 0.1296, auc: { price_market: 0.6357, public: 0.659, public_plus_social: 0.662 } },
      { fold: 5, window: "Sep 2025 – Oct 2026", n: 4213, positives: 645, baseRate: 0.1531, auc: { price_market: 0.6619, public: 0.6665, public_plus_social: 0.6671 } },
    ],
  },
];

export const universe = { examples: 25244, tickers: 444, from: "January 2021", to: "October 2026" };

export type ResultRow = { label: string; est: number; lo: number; hi: number; verdict: string };

export const signed = (n: number) => `${n < 0 ? "−" : "+"}${Math.abs(n).toFixed(4)}`;

// Change in score when text-mood inputs are removed. Positive means the score went UP without it.
// Scores run from 0.50 (coin flip) up. Ranges are 95%, resampled by whole days. From an earlier run (not re-run
// with five-day blocks).
export const textMoodRows: ResultRow[] = [
  { label: "Upside call, tested through time", est: -0.0012, lo: -0.004, hi: 0.0016, verdict: "No difference" },
  { label: "Upside call, final held-out stretch", est: 0.0062, lo: 0.0007, hi: 0.0116, verdict: "Slightly better without it" },
  { label: "Downside call, tested through time", est: 0.0002, lo: -0.0011, hi: 0.0015, verdict: "No difference" },
  { label: "Downside call, final held-out stretch", est: 0.0002, lo: -0.0006, hi: 0.0009, verdict: "No difference" },
];

// Squeeze/Bullish flag (social-alpha: scripts/crowd_lens.py, output data/research/crowd_lens.json).
// A stock-day is flagged when half or more of its posts carry a Squeeze or Bullish flair, which the poster
// sets when the post goes up. Big drop = 10+ points behind SPY over three sessions from the next open.
// Volatility groups are fifths of trailing 20-day volatility, cut on 2021–2024 data.
export type FlagGroup = { group: string; flagged: number; others: number; n: number };
export const squeezeFlag = {
  holdout: { window: "Jan 2025 – Oct 2026", n: 1214, flagged: 0.2545, others: 0.1594 },
  train: { window: "Jan 2021 – Dec 2024", n: 2555, flagged: 0.2622, others: 0.1687 },
  byVolatility: [
    { group: "Calmest", flagged: 0.058, others: 0.025, n: 172 },
    { group: "2nd", flagged: 0.144, others: 0.078, n: 181 },
    { group: "3rd", flagged: 0.179, others: 0.132, n: 251 },
    { group: "4th", flagged: 0.266, others: 0.234, n: 308 },
    { group: "Wildest", flagged: 0.487, others: 0.431, n: 298 },
  ] satisfies FlagGroup[],
  positions: { window: "Jan 2025 – Oct 2026", n: 1220, flagged: 0.1033, others: 0.1852 },
};

// Lift when crowd signals are added, big-drop target. Ranges resample five-day blocks.
export const crowdHitRows: ResultRow[] = [
  {
    label: "Big drop, vs price-only · tested through time",
    est: 0.0109,
    lo: 0.0063,
    hi: 0.0156,
    verdict: "Clear lift",
  },
  {
    label: "Big drop, vs price-only · final held-out stretch",
    est: 0.0066,
    lo: 0.001,
    hi: 0.012,
    verdict: "Holds on holdout",
  },
  {
    label: "Big drop, vs price + news + insider data · tested through time",
    est: -0.0003,
    lo: -0.0025,
    hi: 0.0018,
    verdict: "No difference",
  },
  {
    label: "Big drop, vs price + news + insider data · final held-out stretch",
    est: 0.0029,
    lo: 0.0004,
    hi: 0.0053,
    verdict: "Small extra lift on holdout",
  },
];
