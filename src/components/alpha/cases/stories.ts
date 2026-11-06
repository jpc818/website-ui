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
  // Score chips shown on the illustration, e.g. { name: "Upside score", rank: "top 0.5%" }.
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
  landed: boolean;
  // ISO year-month of the event, for structured data.
  period: string;
};

export const caseIndex: CaseMeta[] = [
  {
    id: "put",
    n: 1,
    kind: "Put",
    theme: "Wildfire",
    title: "The campfire that became a wildfire.",
    tagline: "A downside warning that fired on the smoke, days before the crowd ran for the exits.",
    href: "/case-studies/put",
    result: "Warning fired at 18 people. The run later gave back more than a quarter of its value.",
    landed: true,
    period: "2025-07",
  },
  {
    id: "call",
    n: 2,
    kind: "Call",
    theme: "Gold rush",
    title: "Color in the pan.",
    tagline: "One prospector finds a fleck. Four stake claims on the same creek. The assay comes back.",
    href: "/case-studies/call",
    result: "Upside flag at 4 people. Beat the S&P 500 by 17 points in three sessions.",
    landed: true,
    period: "2025-02",
  },
  {
    id: "exotic",
    n: 3,
    kind: "Exotic",
    theme: "Storm front",
    title: "The barometer doesn't point.",
    tagline: "Pressure says a storm is coming. It can't say which way the wind will blow. A straddle doesn't need it to.",
    href: "/case-studies/exotic",
    result: "Drop and rise scores both in the top 1%. Fell 30 points against the market in three sessions.",
    landed: true,
    period: "2025-10",
  },
  {
    id: "failed",
    n: 4,
    kind: "Failed",
    theme: "Cried wolf",
    title: "The boy who cried wolf was right.",
    tagline: "Three alarms, three empty fields, three wiped-out believers. The wolf came on the fourth.",
    href: "/case-studies/failed",
    result: "Drop warning wrong three times (+494, +251, +23 points) before the stock fell 65.",
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
        label: "Sessions 1–2",
        title: "A cold creek.",
        body: "Nobody working it. No posts, no people, no score: the model only scores a stock when someone is talking about it.",
        caption: "0 people",
        people: 0,
        scores: [],
      },
      {
        label: "Session 3",
        title: "A fleck in the pan.",
        body: "One person, one community, one post. The upside score saw some color, top 7%, but not enough to stake a claim. That fleck was real: the stock rose 84 points against the market over the next three sessions. The model saw it and passed.",
        caption: "1 person · not flagged",
        people: 1,
        scores: [{ name: "Upside score", rank: "top 7%" }],
        next: "+84, unflagged",
      },
      {
        label: "Sessions 4–5",
        title: "The creek goes quiet.",
        body: "Two more sessions with nobody talking. Most flecks end here.",
        caption: "0 people",
        people: 0,
        scores: [],
      },
      {
        label: "Session 6",
        title: "Claims staked.",
        body: "Four different people across two communities, all working the same creek in a single session. The upside score jumped into the top 0.5% of everything it scored, and the flag went up.",
        caption: "4 people · 2 communities · flagged",
        people: 4,
        scores: [{ name: "Upside score", rank: "top 0.5%" }],
      },
      {
        label: "Sessions 7–9",
        title: "The assay.",
        body: "Three sessions later the claim had paid: the stock beat the S&P 500 by 17 points.",
        caption: "+17 points vs the S&P 500",
        people: 4,
        scores: [{ name: "Upside score", rank: "top 0.5%" }],
        next: "+17",
      },
      {
        label: "Every claim",
        title: "Mostly fool's gold.",
        body: "Here's the honest part. Of the 250 top-3% upside flags in the held-out data, 64 rose 10 points or more, about one in four. That's more than twice the 11% you'd get by chance, and 158 of the 250 still finished behind the market. This is the weakest of our signals, and we'd rather say so than sell you the nugget.",
        caption: "64 of 250 struck gold",
        people: 4,
        scores: [],
      },
    ],
    moral: "A fleck is a reason to look, not a reason to buy. Even a staked claim is fool's gold three times out of four.",
  },
  exotic: {
    intro:
      "A barometer is the most honest instrument on a ship. It tells you pressure is falling and a storm is coming. It never tells you which way the wind will blow. Some crowds read the same way, and a straddle (owning a put and a call at once) is the trade that pays for wind, not direction.",
    steps: [
      {
        label: "Sessions 1–2",
        title: "Still air.",
        body: "Nobody talking. The glass reads fair.",
        caption: "0 people · fair",
        people: 0,
        scores: [],
      },
      {
        label: "Session 3",
        title: "The pressure drops.",
        body: "Eight people across two communities, out of nowhere. Both scores climbed at once, drop in the top 1.3% and rise in the top 3.6%. The next three sessions blew upward, 65 points against the market.",
        caption: "8 people · the wind blows up",
        people: 8,
        scores: [
          { name: "Drop score", rank: "top 1.3%" },
          { name: "Rise score", rank: "top 3.6%" },
        ],
        next: "+65",
      },
      {
        label: "Session 4",
        title: "The first wall.",
        body: "Twelve people in three communities. Up again, harder: 144 points over the next three sessions. Anyone betting on calm was already underwater.",
        caption: "12 people · 3 communities",
        people: 12,
        scores: [
          { name: "Drop score", rank: "top 2.3%" },
          { name: "Rise score", rank: "top 6.4%" },
        ],
        next: "+144",
      },
      {
        label: "Session 5",
        title: "The eye.",
        body: "One person. The talk almost stopped, the way the air goes still in the middle of a hurricane. Both scores stayed high. Calm in the eye isn't the end of the storm.",
        caption: "1 person · the eye",
        people: 1,
        scores: [
          { name: "Drop score", rank: "top 2.6%" },
          { name: "Rise score", rank: "top 4.3%" },
        ],
        next: "+41",
      },
      {
        label: "Session 6",
        title: "Both walls at once.",
        body: "Seven people came back, and both scores landed in the top 1% on the same session: drop at the 99.1st percentile, rise at the 99.6th. The model wasn't confused. It was saying a big move was coming, without picking a side. That's the two-sided flag.",
        caption: "7 people · two-sided flag",
        people: 7,
        scores: [
          { name: "Drop score", rank: "top 0.9%" },
          { name: "Rise score", rank: "top 0.4%" },
        ],
      },
      {
        label: "Sessions 7–9",
        title: "Landfall.",
        body: "This time the wind blew down: the stock fell 30 points against the S&P 500 in three sessions. A plain call would have been wrecked. A straddle doesn't care which way it hits, only how hard.",
        caption: "−30 points vs the S&P 500",
        people: 7,
        scores: [
          { name: "Drop score", rank: "top 0.9%" },
          { name: "Rise score", rank: "top 0.4%" },
        ],
        next: "−30",
      },
      {
        label: "Every forecast",
        title: "How often the glass is right.",
        body: "Of the 53 stock-days with both scores in the top 3%, 44 moved 10 points or more within three sessions, either way. Across all stocks, 28% do. That's the signal a straddle needs. But we defined this flag after looking at the held-out data, it's only 53 storms, and it measures the stock's move, not options profit. A straddle also has to earn back what it costs.",
        caption: "44 of 53 storms hit",
        people: 7,
        scores: [],
      },
    ],
    moral: "When the crowd is loud in both directions, the honest forecast is 'big move, unknown direction.' Trade the size of the move, not a guess at which way.",
  },
  failed: {
    intro:
      "Everyone knows how the fable ends: the boy cries wolf too many times, nobody comes, and the wolf eats the flock. Nobody tells the other version, where the boy is right but early, and everyone who believed him goes broke before the wolf shows up.",
    steps: [
      {
        label: "Session 1",
        title: "“Wolf!”",
        body: "Two people talking, and the drop warning jumped into the top 2%. The village ran out with pitchforks. There was no wolf: over the next three sessions the stock rose almost six-fold.",
        caption: "2 people · first alarm",
        people: 2,
        scores: [{ name: "Drop warning", rank: "top 2%" }],
        next: "+494",
      },
      {
        label: "Session 2",
        title: "“Wolf!” again.",
        body: "Twenty people in three communities. The warning held in the top 2%. Anyone who answered: wrong again. The stock more than tripled.",
        caption: "20 people · second alarm",
        people: 20,
        scores: [{ name: "Drop warning", rank: "top 2%" }],
        next: "+251",
      },
      {
        label: "Session 3",
        title: "Fewer come running.",
        body: "Eleven people. The warning climbed into the top 1%. Up another 23 points. By now, anyone who had acted on every alarm with a put had lost it three times over.",
        caption: "11 people · third alarm",
        people: 11,
        scores: [{ name: "Drop warning", rank: "top 1%" }],
        next: "+23",
      },
      {
        label: "Session 4",
        title: "The wolf.",
        body: "Thirty-six people in three communities, the biggest crowd of the run, and the warning at its highest yet. This time the wolf came: the stock fell 65 points against the market over the next three sessions.",
        caption: "36 people · the wolf",
        people: 36,
        scores: [{ name: "Drop warning", rank: "top 1%" }],
        next: "−65",
      },
      {
        label: "Sessions 5–6",
        title: "The flock thins.",
        body: "The warning kept firing, and the stock kept falling: 41 points, then 42, on the next two sessions' windows.",
        caption: "17, then 20 people",
        people: 20,
        scores: [{ name: "Drop warning", rank: "top 6%, then 2%" }],
        next: "−41, −42",
      },
      {
        label: "The moral",
        title: "Right isn't the same as on time.",
        body: "Shorting on every alarm with a fixed three-session hold, the first three would have lost far more than the last three made. And this isn't rare: of the 250 top-3% drop warnings in the held-out data, 92 were not followed by a 10-point drop, and 53 went the other way and rose 10 points or more.",
        caption: "37% of alarms find no wolf",
        people: 20,
        scores: [],
      },
    ],
    moral: "The fable's moral is 'don't lie.' This one's is about timing: a warning can be right about what's coming and still ruin everyone who acts on it too early.",
  },
};
