// Story scripts for the case-study pages. Each step is one real session (or run of sessions) from the held-out
// replay described in moreCaseData.ts; the metaphor is told over the numbers, never instead of them.
// Ranks are percentiles of that session's score among all 8,333 held-out stock-days ("top 0.5%" = 99.5th).
// "Next 3" is the stock's return minus the S&P 500 over the three sessions after that session's open.
//
// Call, by session:   0, 0, 1 (rise 93.5th, next 3 +84), 0, 0, 4 (rise 99.5th, next 3 +17).
// Exotic, by session: 0, 0, 8 (drop 98.7th, rise 96.4th, +65), 12 (97.7th, 93.6th, +144), 1 (97.4th, 95.7th, +41),
//                     7 (99.1st, 99.6th, -30). The two-sided rule needs both in the top 3%; session 6 is the first.
// Failed: see the streak in moreCaseData.ts.

export type CaseId = "put" | "call" | "exotic" | "failed";

export type StoryStep = {
  label: string;
  title: string;
  body: string;
  caption: string;
  people: number;
  // Score chips shown on the illustration, e.g. { name: "Rise score", rank: "top 0.5%" }.
  scores: { name: string; rank: string }[];
  // What the next three sessions did, when the step is a scored session.
  next?: string;
};

export type CaseMeta = {
  id: CaseId;
  n: number;
  kind: string;
  theme: string;
  title: string;
  tagline: string;
  href: string;
  // What happened, in one line, so the card shows the outcome without a click.
  result: string;
  // How often this kind of score worked across the holdout. Shown ahead of the story.
  rate: string;
  // Plain outcome label. Replaces a win/loss badge.
  mark: string;
  landed: boolean;
  // ISO year-month of the event, for structured data.
  period: string;
};

export const caseIndex: CaseMeta[] = [
  {
    id: "put",
    n: 1,
    kind: "Drop warning",
    theme: "Wildfire",
    title: "The campfire that became a wildfire.",
    tagline: "A downside warning that fired on the smoke, days before the crowd ran for the exits.",
    href: "/case-studies/put",
    result: "Warned when 18 people were posting. The stock later lost more than a quarter of its value.",
    rate: "When the model was most worried, the stock dropped hard 63% of the time. Normally it's 17%.",
    mark: "The drop happened",
    landed: true,
    period: "2025-07",
  },
  {
    id: "call",
    n: 2,
    kind: "Rise signal",
    theme: "Gold rush",
    title: "Color in the pan.",
    tagline: "One prospector finds a fleck. Four stake claims on the same creek. The assay comes back.",
    href: "/case-studies/call",
    result: "Flagged when just 4 people were posting. It beat the market by 17% in three days.",
    rate: "When the model was most hopeful, the stock jumped 26% of the time. Most of the time (63%) it lagged the market.",
    mark: "It rose",
    landed: true,
    period: "2025-02",
  },
  {
    id: "exotic",
    n: 3,
    kind: "Big move",
    theme: "Storm front",
    title: "The barometer doesn't point.",
    tagline: "Pressure says a storm is coming. It can't say which way the wind will blow. Sometimes that's enough.",
    href: "/case-studies/exotic",
    result: "The model expected a big move either way. It fell 30% behind the market in three days.",
    rate: "When the model expected a big move but couldn't tell which way, 83% made one. Only 53 cases, so treat it as a hint.",
    mark: "It moved",
    landed: true,
    period: "2025-10",
  },
  {
    id: "failed",
    n: 4,
    kind: "Wrong, then right",
    theme: "Cried wolf",
    title: "The boy who cried wolf was right.",
    tagline: "Three alarms, three empty fields, three wiped-out believers. The wolf came on the fourth.",
    href: "/case-studies/failed",
    result: "The warning was wrong three times in a row while the stock soared. Then it fell 65%.",
    rate: "Even when the model was most worried, 37% of stocks didn't drop. About 1 in 5 jumped instead.",
    mark: "Early, then right",
    landed: false,
    period: "2025-10",
  },
];

export const stories: Record<Exclude<CaseId, "put">, { intro: string; steps: StoryStep[]; moral: string }> = {
  call: {
    intro:
      "Prospectors don't find gold by looking for gold. They look for color: a glint in the pan, then other people working the same creek. Our upside score looks for the same thing in a crowd, and like most prospecting, it's usually wrong.",
    steps: [
      {
        label: "Days 1–2",
        title: "A cold creek.",
        body: "Nobody working it. No posts, no people, no score: the model only scores a stock when someone is talking about it.",
        caption: "0 people",
        people: 0,
        scores: [],
      },
      {
        label: "Day 3",
        title: "A fleck in the pan.",
        body: "One person, one community, one post. The rise score noticed, higher than 93% of everything else, but not high enough to flag. That fleck was real: the stock beat the market by 84% over the next three days. The model saw it and passed.",
        caption: "1 person · not flagged",
        people: 1,
        scores: [{ name: "Rise score", rank: "top 7%" }],
        next: "+84%, not flagged",
      },
      {
        label: "Days 4–5",
        title: "The creek goes quiet.",
        body: "Two more days with nobody talking. Most flecks end here.",
        caption: "0 people",
        people: 0,
        scores: [],
      },
      {
        label: "Day 6",
        title: "Claims staked.",
        body: "Four different people across two communities, all working the same creek on the same day. The rise score jumped higher than 99.5% of everything else it scored, and the flag went up.",
        caption: "4 people · 2 communities · flagged",
        people: 4,
        scores: [{ name: "Rise score", rank: "top 0.5%" }],
      },
      {
        label: "Days 7–9",
        title: "The assay.",
        body: "Three days later the claim had paid: the stock beat the S&P 500 by 17%.",
        caption: "+17% vs the S&P 500",
        people: 4,
        scores: [{ name: "Rise score", rank: "top 0.5%" }],
        next: "+17%",
      },
      {
        label: "Every claim",
        title: "Mostly fool's gold.",
        body: "Here's the honest part. We looked at the 250 times the rise score was highest. In 64, about one in four, the stock beat the market by 10% or more. Normally that happens 11% of the time, so it's better than twice as good as chance. But 158 of the 250 still did worse than the market. This is our weakest signal, and we'd rather say so than sell you the nugget.",
        caption: "64 of 250 struck gold",
        people: 4,
        scores: [],
      },
    ],
    moral: "A fleck is a reason to look, not a reason to buy. Even a staked claim is fool's gold three times out of four.",
  },
  exotic: {
    intro:
      "A barometer is the most honest instrument on a ship. It tells you pressure is falling and a storm is coming. It never tells you which way the wind will blow. Some crowds read the same way: something big is coming, direction unknown. There are trades that pay off on a big move either way, without picking a side.",
    steps: [
      {
        label: "Days 1–2",
        title: "Still air.",
        body: "Nobody talking. The glass reads fair.",
        caption: "0 people · fair",
        people: 0,
        scores: [],
      },
      {
        label: "Day 3",
        title: "The pressure drops.",
        body: "Eight people across two communities, out of nowhere. The drop score and the rise score both shot up at the same time. Over the next three days the stock blew upward, beating the market by 65%.",
        caption: "8 people · the wind blows up",
        people: 8,
        scores: [
          { name: "Drop score", rank: "top 1.3%" },
          { name: "Rise score", rank: "top 3.6%" },
        ],
        next: "+65%",
      },
      {
        label: "Day 4",
        title: "The first wall.",
        body: "Twelve people in three communities. Up again, harder: 144% ahead of the market over the next three days. Anyone betting on calm was already losing.",
        caption: "12 people · 3 communities",
        people: 12,
        scores: [
          { name: "Drop score", rank: "top 2.3%" },
          { name: "Rise score", rank: "top 6.4%" },
        ],
        next: "+144%",
      },
      {
        label: "Day 5",
        title: "The eye.",
        body: "One person. The talk almost stopped, the way the air goes still in the middle of a hurricane. Both scores stayed high. Calm in the eye isn't the end of the storm.",
        caption: "1 person · the eye",
        people: 1,
        scores: [
          { name: "Drop score", rank: "top 2.6%" },
          { name: "Rise score", rank: "top 4.3%" },
        ],
        next: "+41%",
      },
      {
        label: "Day 6",
        title: "Both walls at once.",
        body: "Seven people came back, and both scores hit the top 1% on the same day. The model wasn't confused. It was saying a big move was coming, without picking a side. That's the two-sided flag.",
        caption: "7 people · two-sided flag",
        people: 7,
        scores: [
          { name: "Drop score", rank: "top 0.9%" },
          { name: "Rise score", rank: "top 0.4%" },
        ],
      },
      {
        label: "Days 7–9",
        title: "Landfall.",
        body: "This time the wind blew down: the stock fell 30% behind the S&P 500 in three days. Anyone who bet on another rise got wrecked. A bet on a big move either way didn't care which way it went, only how far.",
        caption: "−30% vs the S&P 500",
        people: 7,
        scores: [
          { name: "Drop score", rank: "top 0.9%" },
          { name: "Rise score", rank: "top 0.4%" },
        ],
        next: "−30%",
      },
      {
        label: "Every forecast",
        title: "How often the glass is right.",
        body: "There were 53 times when both scores were in the top 3%. In 44 of them, the stock moved 10% or more against the market within three days, up or down. Normally only 28% do. That looks promising, but be careful: we came up with this rule after looking at the data, it's only 53 storms, and it measures how much the stock moved, not whether a trade made money after costs.",
        caption: "44 of 53 storms hit",
        people: 7,
        scores: [],
      },
    ],
    moral: "When the crowd is loud in both directions, the honest forecast is 'big move, unknown direction.' Bet on the size of the move, not a guess at which way.",
  },
  failed: {
    intro:
      "Everyone knows how the fable ends: the boy cries wolf too many times, nobody comes, and the wolf eats the flock. Nobody tells the other version, where the boy is right but early, and everyone who believed him goes broke before the wolf shows up.",
    steps: [
      {
        label: "Day 1",
        title: "“Wolf!”",
        body: "Two people talking, and the drop warning jumped into the top 2%. The village ran out with pitchforks. There was no wolf: over the next three days the stock rose almost six-fold.",
        caption: "2 people · first alarm",
        people: 2,
        scores: [{ name: "Drop warning", rank: "top 2%" }],
        next: "+494%",
      },
      {
        label: "Day 2",
        title: "“Wolf!” again.",
        body: "Twenty people in three communities. The warning held in the top 2%. Anyone who answered: wrong again. The stock more than tripled.",
        caption: "20 people · second alarm",
        people: 20,
        scores: [{ name: "Drop warning", rank: "top 2%" }],
        next: "+251%",
      },
      {
        label: "Day 3",
        title: "Fewer come running.",
        body: "Eleven people. The warning climbed into the top 1%. It beat the market by another 23%. By now, anyone who had bet on a fall at every alarm had been wrong three times in a row.",
        caption: "11 people · third alarm",
        people: 11,
        scores: [{ name: "Drop warning", rank: "top 1%" }],
        next: "+23%",
      },
      {
        label: "Day 4",
        title: "The wolf.",
        body: "Thirty-six people in three communities, the biggest crowd of the run, and the warning at its highest yet. This time the wolf came: the stock fell 65% behind the market over the next three days.",
        caption: "36 people · the wolf",
        people: 36,
        scores: [{ name: "Drop warning", rank: "top 1%" }],
        next: "−65%",
      },
      {
        label: "Days 5–6",
        title: "The flock thins.",
        body: "The warning kept firing, and the stock kept falling behind the market: 41%, then 42%.",
        caption: "17, then 20 people",
        people: 20,
        scores: [{ name: "Drop warning", rank: "top 6%, then 2%" }],
        next: "−41%, −42%",
      },
      {
        label: "The moral",
        title: "Right isn't the same as on time.",
        body: "If you had bet against the stock at every alarm and held for three days, the first three bets would have lost far more than the last three made. And this isn't rare. Of the 250 times the model was most worried, 92 weren't followed by a hard drop, and in 53 the stock jumped 10% or more instead.",
        caption: "37% of alarms find no wolf",
        people: 20,
        scores: [],
      },
    ],
    moral: "The fable's moral is 'don't lie.' This one's is about timing: a warning can be right about what's coming and still ruin everyone who acts on it too early.",
  },
};
