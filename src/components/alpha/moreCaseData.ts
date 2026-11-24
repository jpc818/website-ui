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
    kind: "Rise signal",
    title: "The spark that caught.",
    body: "Two quiet days, one post, two more quiet days. Then four different people in two forums on the same day, and the rise score went higher than 99.5% of everything else it scored. Three days later the stock had beaten the S&P 500 by 17%.",
    flag: "Rise flag",
    people: [0, 0, 1, 0, 0, 4],
    communities: 2,
    move: 16.8,
    moveLabel: "+17%",
    outcome: "landed",
    verdict: "It rose.",
    rule: "How we picked it: the highest rise score that was followed by a 10%+ gain, with at least 3 people talking.",
    groupTitle: "How the rise flag does overall",
    group: [
      { label: "26%", value: "beat the market by 10% or more", detail: "64 of the 250 highest rise scores. Normally: 11%." },
      { label: "63%", value: "did worse than the market", detail: "158 of 250. 45% (112) fell 10% or more behind it." },
    ],
    caveat:
      "This is our weaker signal. It does better than chance, but most of the time it doesn't pay. We show it because that's the honest number.",
  },
  {
    id: "exotic",
    n: 3,
    kind: "Big move",
    title: "The wind hadn't picked a side.",
    body: "Eight people, then twelve, then one, then seven. On the day with seven, the drop score and the rise score both hit the top 1% at once. Over the next three days the stock fell 30% behind the S&P 500.",
    flag: "Two-sided flag",
    people: [0, 0, 8, 12, 1, 7],
    communities: 2,
    move: -29.8,
    moveLabel: "−30%",
    outcome: "landed",
    verdict: "A big move, down.",
    rule: "How we picked it: the highest-scoring case where both scores were in the top 3% and the stock moved 10%+ either way, with at least 3 people talking.",
    groupTitle: "How the two-sided flag does overall",
    group: [
      { label: "83%", value: "moved 10% or more, up or down", detail: "44 of the 53 cases with both scores in the top 3%. Normally: 28%." },
      { label: "60%", value: "of them fell", detail: "32 fell 10% or more. 12 rose 10% or more." },
    ],
    caveat:
      "Only 53 cases, and we came up with this rule after looking at the data, so treat it as a hint, not a result. It measures how much the stock moved, not whether a trade made money. Trades that pay off on a big move either way cost money up front, and we haven't tested whether they'd earn it back.",
  },
  {
    id: "failed",
    n: 4,
    kind: "Wrong, then right",
    title: "Early three times. Then right.",
    body: "The drop warning went off three days in a row while the crowd grew, and each time the stock shot up instead: almost six-fold, then more than triple, then another 23% ahead of the market. Anyone betting on a fall would have been wiped out. On the fourth day, with 36 people in three forums, the warning hit its highest level yet. Over the next three days the stock fell 65% behind the market.",
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
    rule: "Hand-picked, not chosen by a rule. It's the clearest example we have of a warning that came too early. Each day's three-day window overlaps the next, so these aren't six separate predictions.",
    groupTitle: "How often the drop warning misses",
    group: [
      { label: "37%", value: "weren't followed by a hard drop", detail: "92 of the 250 strongest drop warnings. The other 63% (158) were. Normally: 17%." },
      { label: "21%", value: "went the other way and jumped 10% or more", detail: "53 of 250, like the first three here." },
    ],
    caveat:
      "Being early looks exactly like being wrong until the crowd turns. If you had bet against the stock at every warning and held for three days, the first three bets would have lost far more than the last three made. Being right in the end doesn't help if you can't survive being early.",
  },
];
