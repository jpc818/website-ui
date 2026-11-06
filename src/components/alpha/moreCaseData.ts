// Cases 2 to 4 of the four case studies. Case 1 (Put) is the scroll story in CaseStudy.tsx.
//
// Every number here comes from one scoring run of the same model family as the research page
// (gradient-boosted trees, crowd + news + insider + price features, three-session horizon), trained only on data
// through 2024-12-31 and scored on the held-out stretch after it (Jan 2025 - Oct 2026, 8,333 stock-days).
// "Top 3%" means the highest-scoring 3% of that stretch (250 stock-days): crash score >= 0.492, rise score >= 0.253.
// "Points" are the stock's return minus the S&P 500's, from the entry open to the close three sessions later.
//
// Call and Exotic were picked by rule, not by eye, and the rule is shown on each card:
//   Call:   highest-scoring upside flag that rose 10+ points, with at least 3 people talking.
//   Exotic: highest-scoring flag that was top 3% on BOTH crash and rise, moved 10+ points either way, 3+ people.
// Failed is hand-picked, and says so: six consecutive sessions of one stock, starting with the first session its
// drop warning reached the top 2%. The three-session windows overlap, so they are not six independent calls.
// Stocks and months are in cases/posterProfiles.ts. People and communities are distinct accounts and forums whose posts counted
// toward that session's open. Sessions are weekdays; a session with no posts is 0. Weekend posts count on Monday.
// Percentiles of the flagged session: Call 99.5th (rise); Exotic 99.1st (drop) and 99.6th (rise).
// Failed, drop percentile by session: 98.07, 98.87, 99.45, 99.66, 93.99, 98.69.

// Every stock-day in the held-out stretch, ranked by drop-warning score and cut into ten equal groups,
// lowest score first. drops = how many were followed by a 10-point drop. 1,443 of 8,333 overall (17.3%).
export const dropDeciles = [
  { n: 834, drops: 8 },
  { n: 834, drops: 17 },
  { n: 834, drops: 49 },
  { n: 833, drops: 60 },
  { n: 833, drops: 76 },
  { n: 833, drops: 103 },
  { n: 833, drops: 170 },
  { n: 833, drops: 221 },
  { n: 833, drops: 317 },
  { n: 833, drops: 422 },
];
export const dropBaseRate = 1443 / 8333;

export type Outcome = "landed" | "missed";

export type StreakSession = {
  people: number;
  rank: string;
  // Return minus the S&P 500 over the next three sessions, in points.
  move: number;
  moveLabel: string;
};

type CaseBase = {
  id: string;
  n: number;
  kind: string;
  title: string;
  body: string;
  flag: string;
  outcome: Outcome;
  verdict: string;
  rule: string;
  groupTitle: string;
  group: { label: string; value: string; detail: string }[];
  caveat: string;
};

export type SingleCase = CaseBase & {
  // Distinct people talking about the stock, by session, ending on the flagged session.
  people: number[];
  communities: number;
  // Return minus the S&P 500 over three sessions, in points. Drawn on a +/-40 scale.
  move: number;
  moveLabel: string;
};

export type StreakCase = CaseBase & { streak: StreakSession[] };

export type MoreCase = SingleCase | StreakCase;

export const moreCases: MoreCase[] = [
  {
    id: "call",
    n: 2,
    kind: "Call",
    title: "The spark that caught.",
    body: "Two quiet sessions, one post, two more quiet sessions. Then four different people across two communities in one session, and the upside score landed in the top 0.5% of everything scored. Three sessions later the stock had beaten the S&P 500 by 17 points.",
    flag: "Upside flag",
    people: [0, 0, 1, 0, 0, 4],
    communities: 2,
    move: 16.8,
    moveLabel: "+17 points",
    outcome: "landed",
    verdict: "The flag landed.",
    rule: "Highest-scoring upside flag that rose 10+ points, with at least 3 people talking.",
    groupTitle: "How the upside flag does overall",
    group: [
      { label: "26%", value: "rose 10+ points", detail: "of the top 3% upside flags (64 of 250). Across all stocks: 11%." },
      { label: "63%", value: "finished behind the market", detail: "158 of 250. 45% (112) fell 10+ points." },
    ],
    caveat:
      "This is the weak side. The upside flag beats chance, but most of the time it doesn't pay. We show it because that's the honest rate.",
  },
  {
    id: "exotic",
    n: 3,
    kind: "Exotic",
    title: "The wind hadn't picked a side.",
    body: "Eight people, then twelve, then one, then seven. On the session with seven, both scores landed in the top 1%: the drop score and the rise score at once. Over the next three sessions the stock fell 30 points against the S&P 500.",
    flag: "Two-sided flag",
    people: [0, 0, 8, 12, 1, 7],
    communities: 2,
    move: -29.8,
    moveLabel: "−30 points",
    outcome: "landed",
    verdict: "A big move, down.",
    rule: "Highest-scoring flag in the top 3% on both drop and rise that moved 10+ points either way, with at least 3 people talking.",
    groupTitle: "How the two-sided flag does overall",
    group: [
      { label: "83%", value: "moved 10+ points, either way", detail: "of the top 3% on both scores (44 of 53). Across all stocks: 28%." },
      { label: "60%", value: "of them fell", detail: "32 fell 10+ points. 12 rose 10+ points." },
    ],
    caveat:
      "Only 53 flags, and we chose this definition after looking at the held-out data, so treat it as a lead, not a result. It measures the stock's move, not an options profit. We haven't published priced options results, and a straddle also has to earn back its premium.",
  },
  {
    id: "failed",
    n: 4,
    kind: "Failed",
    title: "Early three times. Then right.",
    body: "The drop warning fired on three sessions in a row while the crowd grew, and each time the stock ripped higher instead: up almost six-fold, then more than triple, then another 23 points. A put bought on any of them would have been wiped out. On the fourth session, 36 people in three communities, the warning hit its highest level yet. Over the next three sessions the stock fell 65 points against the market.",
    flag: "Drop warning",
    streak: [
      { people: 2, rank: "top 2%", move: 494, moveLabel: "+494" },
      { people: 20, rank: "top 2%", move: 251, moveLabel: "+251" },
      { people: 11, rank: "top 1%", move: 23, moveLabel: "+23" },
      { people: 36, rank: "top 1%", move: -65, moveLabel: "−65" },
      { people: 17, rank: "top 6%", move: -41, moveLabel: "−41" },
      { people: 20, rank: "top 2%", move: -42, moveLabel: "−42" },
    ],
    outcome: "missed",
    verdict: "Wrong three times, then right.",
    rule: "Hand-picked, not chosen by a rule: it's the clearest example we have of a warning that was early. Each session's three-session window overlaps the next, so these are not six independent calls.",
    groupTitle: "How often the drop warning misses",
    group: [
      { label: "37%", value: "were not followed by a 10-point drop", detail: "of the top 3% drop warnings (92 of 250). 63% were (158). Across all stocks: 17%." },
      { label: "21%", value: "went the other way and rose 10+ points", detail: "53 of 250, like the first three here." },
    ],
    caveat:
      "Early and wrong look identical until the crowd turns. Shorting the stock on each warning with a fixed three-session hold, the first three would have lost far more than the last three made. Being right eventually doesn't pay if you can't survive being early.",
  },
];
