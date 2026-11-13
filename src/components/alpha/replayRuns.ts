// Playable runs for the Replay game. Moves and ranks are restated from cases/stories.ts, caseSteps.ts and
// moreCaseData.ts: the same held-out scoring run (trained through 2024-12-31, scored on Jan 2025 - Oct 2026).
// "move" is the stock's return minus the S&P 500's, from that session's open to the close three sessions later.
// The three-session windows overlap, so consecutive sessions in a run are not independent calls.
//
// "room" is what the model could know before that session's open, from social-alpha
// scripts/case_poster_profiles.py (data/research/case_poster_profiles.json). Posters are described by profile, never
// by account name, and no post text is shown. Only the most notable posters are listed: champions, then fades, then
// the highest engagement. That script was only run for the flagged session of the call and exotic cases, so their
// earlier scored sessions have no room.
//
// A session is scored only when someone was talking about the stock, so the quiet sessions have no move and no rank.
// A flag is the top 3% of the held-out stretch on that score; the two-sided flag needs both at once. "flag" is what a
// direction-taking reader of the model would have done: a lone drop warning is a short, a lone upside flag is a long,
// and anything else (including the two-sided flag, a forecast of size rather than direction) is staying out.
// The put case reports its warning per phase, not per session, so its ranks are the phase levels from caseSteps.ts.

import type { CaseId } from "@/components/alpha/cases/stories";

export type Position = "drop" | "rise" | "out";

export type PostTag = "squeeze" | "gains" | "research" | "meme";

export type Poster = {
  posts: number;
  tags: PostTag[];
  // Typical engagement of their own earlier posts, as a multiple of the typical post. null with no settled posts.
  engagement: number | null;
  // Earlier posts on stocks that have since resolved, and how many of those stocks beat the S&P 500.
  calls: number;
  hits: number;
  role: "champion" | "fade" | null;
};

export type Room = {
  posts: number;
  // People with no settled posts, so no engagement or track record the model could use.
  newcomers: number;
  // Percent of the session's posts carrying each tag. The rest were untagged.
  mix: Record<PostTag, number>;
  // Sessions out of the previous 20 on which the stock came up.
  discussed: number;
  posters: Poster[];
};

// What the market looked like at the open, from social-alpha's held-out feature rows (data/research/_replay_rows.pkl).
// Price figures use the close before the session; the gap uses that session's open against that close.
export type Context = {
  // Percent of the 25,247 scored stock-sessions with fewer people talking.
  busier: number;
  posts: number;
  // Posts per session on this stock over the trailing window.
  usualPosts: number;
  // Percent moves over the five sessions before, for the stock and for the S&P 500.
  runUp: number;
  market: number;
  // Percent from the previous close to this session's open.
  gap: number;
  // The previous session's volume as a multiple of its recent average.
  volume: number;
};

export type ReplaySession = {
  label: string;
  crowd: string;
  context: Context | null;
  room: Room | null;
  // Everything below stays hidden until the session has been played.
  dropRank: string | null;
  riseRank: string | null;
  flag: Position;
  // Points against the S&P 500 over the next three sessions. null when nobody was talking and nothing was scored.
  move: number | null;
  outcome: string;
};

export type ReplayRun = {
  id: CaseId;
  // Shown before play. Never names the stock: recognising the ticker would give the run away.
  setup: string;
  sessions: ReplaySession[];
  // The reward for finishing ahead.
  reveal: {
    stock: string;
    ticker: string;
    month: string;
    href: string;
    verdict: string;
    moral: string;
  };
};

const quiet = (label: string): ReplaySession => ({
  label,
  crowd: "Nobody talking.",
  context: null,
  room: null,
  dropRank: null,
  riseRank: null,
  flag: "out",
  move: null,
  outcome: "The model only scores a stock on days someone is talking about it, so this day was never scored.",
});

const ctx = (
  busier: number,
  posts: number,
  usualPosts: number,
  runUp: number,
  market: number,
  gap: number,
  volume: number,
): Context => ({ busier, posts, usualPosts, runUp, market, gap, volume });

const mix = (squeeze: number, gains: number, research: number, meme: number): Record<PostTag, number> => ({
  squeeze,
  gains,
  research,
  meme,
});

export const replayRuns: ReplayRun[] = [
  {
    id: "put",
    setup:
      "Six trading days on one stock, starting with a single post. The crowd builds fast, and every day was scored.",
    sessions: [
      {
        label: "Day 1",
        crowd: "1 person · 1 community",
        context: ctx(3.9, 1, 0.55, 42, 0.3, 14.9, 1.4),
        room: {
          posts: 1,
          newcomers: 0,
          mix: mix(0, 0, 100, 0),
          discussed: 6,
          posters: [{ posts: 1, tags: ["research"], engagement: 6.3, calls: 14, hits: 7, role: null }],
        },
        dropRank: "below the flag line",
        riseRank: null,
        flag: "out",
        move: 88,
        outcome:
          "One research post. The model took note and stayed below its alarm line. The stock beat the S&P 500 by 88% over the next three trading days.",
      },
      {
        label: "Day 2",
        crowd: "18 people · 3 communities",
        context: ctx(99.7, 24, 0.6, 102, 0, 28.2, 2.7),
        room: {
          posts: 23,
          newcomers: 11,
          mix: mix(8, 50, 12, 4),
          discussed: 7,
          posters: [
            { posts: 1, tags: ["squeeze"], engagement: 10.5, calls: 8, hits: 1, role: "fade" },
            { posts: 1, tags: ["research"], engagement: 22.9, calls: 1, hits: 1, role: null },
            { posts: 1, tags: ["research"], engagement: 7, calls: 4, hits: 3, role: null },
          ],
        },
        dropRank: "top 3%",
        riseRank: null,
        flag: "drop",
        move: 67,
        outcome:
          "Overnight the crowd went from one person to eighteen, and the drop warning jumped into the top 3%. The run kept going: up 67% against the market.",
      },
      {
        label: "Day 3",
        crowd: "10 people · 3 communities",
        context: ctx(98.8, 14, 1.8, 87, 0.4, 11.8, 4.9),
        room: {
          posts: 13,
          newcomers: 5,
          mix: mix(7, 7, 43, 0),
          discussed: 8,
          posters: [
            { posts: 1, tags: [], engagement: 9.5, calls: 0, hits: 0, role: null },
            { posts: 1, tags: [], engagement: 5.9, calls: 2, hits: 1, role: null },
          ],
        },
        dropRank: "top 3%",
        riseRank: null,
        flag: "drop",
        move: 56,
        outcome: "The warning didn't budge, and neither did the run: up another 56%.",
      },
      {
        label: "Day 4",
        crowd: "51 people · 3 communities",
        context: ctx(100, 56, 2.5, 189, 0.6, 23.6, 4.3),
        room: {
          posts: 56,
          newcomers: 35,
          mix: mix(9, 38, 12, 9),
          discussed: 9,
          posters: [
            { posts: 1, tags: ["squeeze"], engagement: 10.5, calls: 8, hits: 1, role: "fade" },
            { posts: 2, tags: ["squeeze"], engagement: 8.1, calls: 16, hits: 4, role: "fade" },
            { posts: 1, tags: ["gains"], engagement: 224.6, calls: 1, hits: 1, role: null },
          ],
        },
        dropRank: "top 3%",
        riseRank: null,
        flag: "drop",
        move: -19,
        outcome:
          "The peak of the crowd, with two fades in the room and the warning still holding. This time the crowd turned: the stock fell 19% behind the market.",
      },
      {
        label: "Day 5",
        crowd: "27 people · 3 communities",
        context: ctx(99.9, 28, 5.3, 256, 0.6, 21.2, 11.7),
        room: {
          posts: 28,
          newcomers: 22,
          mix: mix(11, 50, 7, 4),
          discussed: 10,
          posters: [
            { posts: 1, tags: ["squeeze"], engagement: 3.7, calls: 1, hits: 0, role: null },
            { posts: 1, tags: ["squeeze"], engagement: 3.5, calls: 1, hits: 1, role: null },
          ],
        },
        dropRank: "top 3%",
        riseRank: null,
        flag: "drop",
        move: -39,
        outcome:
          "Half the posts were still gains-or-losses posts while the stock gave back 39% against the market.",
      },
      {
        label: "Day 6",
        crowd: "10 people · 3 communities",
        context: ctx(98.8, 11, 6.7, 177, 1.1, -11.8, 4.3),
        room: {
          posts: 11,
          newcomers: 3,
          mix: mix(18, 9, 27, 0),
          discussed: 11,
          posters: [
            { posts: 1, tags: ["squeeze"], engagement: 8.1, calls: 16, hits: 4, role: "fade" },
            { posts: 2, tags: ["research"], engagement: 29.4, calls: 1, hits: 0, role: null },
            { posts: 1, tags: ["research"], engagement: 11.8, calls: 271, hits: 124, role: null },
          ],
        },
        dropRank: "below the flag line",
        riseRank: null,
        flag: "out",
        move: -1,
        outcome:
          "As the crowd thinned, the warning cooled below the flag line on its own. The next three trading days were roughly flat against the market.",
      },
    ],
    reveal: {
      stock: "Opendoor Technologies",
      ticker: "OPEN",
      month: "July 2025",
      href: "/case-studies/put",
      verdict: "The warning fired on the smoke, three trading days before the crowd turned. Right, and early enough to hurt.",
      moral:
        "Of the 250 top-3% drop warnings in the held-out data, 158 were followed by a 10% drop within three trading days and 92 were not. A warning on the smoke is a warning about the crowd, not about the calendar.",
    },
  },
  {
    id: "call",
    setup:
      "Six trading days on one stock, in order. Most of them, nobody is working the creek. Twice, somebody is.",
    sessions: [
      quiet("Day 1"),
      quiet("Day 2"),
      {
        label: "Day 3",
        crowd: "1 person · 1 community",
        context: ctx(3.9, 1, 0.45, 3, -1, -9.8, 1.1),
        room: null,
        dropRank: null,
        riseRank: "top 7%",
        flag: "out",
        move: 84,
        outcome:
          "The upside score saw color at top 7%, but the flag line is the top 3%, so the model passed. The fleck was real: the stock beat the S&P 500 by 84% over the next three trading days.",
      },
      quiet("Day 4"),
      quiet("Day 5"),
      {
        label: "Day 6",
        crowd: "4 people · 2 communities",
        context: ctx(94.2, 5, 0.35, 95, 0.4, 5.2, 7.8),
        room: {
          posts: 5,
          newcomers: 2,
          mix: mix(0, 20, 40, 0),
          discussed: 5,
          posters: [
            { posts: 1, tags: [], engagement: 9.8, calls: 7, hits: 3, role: null },
            { posts: 2, tags: ["research"], engagement: 1.7, calls: 4, hits: 1, role: null },
          ],
        },
        dropRank: null,
        riseRank: "top 0.5%",
        flag: "rise",
        move: 17,
        outcome:
          "Four people on the same creek in one day put the upside score in the top 0.5% of everything scored, and the flag went up. The stock beat the market by 17%.",
      },
    ],
    reveal: {
      stock: "BigBear.ai",
      ticker: "BBAI",
      month: "February 2025",
      href: "/case-studies/call",
      verdict: "The flag landed, and the one it passed on would have paid five times better.",
      moral:
        "This is the weakest signal we have. Of the 250 top-3% upside flags in the held-out data, 64 rose 10% or more: about one in four, against 11% by chance. 158 of the 250 still finished behind the market.",
    },
  },
  {
    id: "exotic",
    setup:
      "Six trading days on one stock. The crowd arrives all at once and never quite leaves. Four of those days were scored, and the model has an opinion on every one of them.",
    sessions: [
      quiet("Day 1"),
      quiet("Day 2"),
      {
        label: "Day 3",
        crowd: "8 people · 2 communities",
        context: ctx(98.3, 8, 1.05, 60, 1.7, 30.3, 8.1),
        room: null,
        dropRank: "top 1.3%",
        riseRank: "top 3.6%",
        flag: "drop",
        move: 65,
        outcome:
          "Both scores climbed at once, but only the drop score cleared the top 3%, so a direction-taking reader was short. The next three trading days went up 65% against the market.",
      },
      {
        label: "Day 4",
        crowd: "12 people · 3 communities",
        context: ctx(99.3, 13, 1.45, 80, 1.1, 20.2, 11.6),
        room: null,
        dropRank: "top 2.3%",
        riseRank: "top 6.4%",
        flag: "drop",
        move: 144,
        outcome: "Up again, harder: 144% over the next three trading days. Anyone short was now badly underwater.",
      },
      {
        label: "Day 5",
        crowd: "1 person",
        context: ctx(3.9, 1, 2.05, 96, 1.2, 28.6, 3.4),
        room: null,
        dropRank: "top 2.6%",
        riseRank: "top 4.3%",
        flag: "drop",
        move: 41,
        outcome:
          "The talk almost stopped, the way the air goes still in the eye of a hurricane, and both scores stayed high. Up another 41%.",
      },
      {
        label: "Day 6",
        crowd: "7 people · 2 communities",
        context: ctx(97.7, 10, 2.1, 219, 0.4, 47.8, 8.9),
        room: {
          posts: 10,
          newcomers: 4,
          mix: mix(10, 40, 20, 0),
          discussed: 12,
          posters: [
            { posts: 1, tags: [], engagement: 1.6, calls: 183, hits: 70, role: "fade" },
            { posts: 1, tags: [], engagement: 19.2, calls: 3, hits: 1, role: null },
            { posts: 2, tags: ["research", "squeeze"], engagement: 1, calls: 4, hits: 1, role: null },
          ],
        },
        dropRank: "top 0.9%",
        riseRank: "top 0.4%",
        flag: "out",
        move: -30,
        outcome:
          "Both scores landed in the top 1% on the same day. That's the two-sided flag, and it isn't a direction: it says a big move is coming without picking a side, so there was no directional bet to take. The stock fell 30%.",
      },
    ],
    reveal: {
      stock: "Nuburu",
      ticker: "BURU",
      month: "October 2025",
      href: "/case-studies/exotic",
      verdict: "Three wrong-footed shorts, then a flag that refused to pick a side and was right about the size.",
      moral:
        "Of the 53 stock-days with both scores in the top 3%, 44 moved 10% or more either way, against 28% across all stocks. We defined that flag after looking at the held-out data, and it measures the stock's move, not an options profit, so treat it as a lead rather than a result.",
    },
  },
  {
    id: "failed",
    setup:
      "Six trading days in a row on one stock, starting the first time its drop warning reached the top 2%. The crowd grows the whole way. Every day is yours to play.",
    sessions: [
      {
        label: "Day 1",
        crowd: "2 people · 2 communities",
        context: ctx(77.5, 3, 0.75, -74, -1.6, 16.9, 6.3),
        room: {
          posts: 3,
          newcomers: 1,
          mix: mix(0, 0, 33, 0),
          discussed: 4,
          posters: [{ posts: 1, tags: [], engagement: 1, calls: 1, hits: 1, role: null }],
        },
        dropRank: "top 2%",
        riseRank: null,
        flag: "drop",
        move: 494,
        outcome:
          "The drop warning fired on two people talking. There was no wolf: the stock rose almost six-fold, 494% against the market, over the next three trading days.",
      },
      {
        label: "Day 2",
        crowd: "20 people · 3 communities",
        context: ctx(99.8, 27, 0.9, -68, 1.7, 57.9, 12.3),
        room: {
          posts: 27,
          newcomers: 12,
          mix: mix(48, 0, 15, 0),
          discussed: 5,
          posters: [
            { posts: 5, tags: ["squeeze"], engagement: 8.1, calls: 36, hits: 23, role: "champion" },
            { posts: 1, tags: ["research"], engagement: 13.7, calls: 384, hits: 177, role: null },
            { posts: 1, tags: [], engagement: 5.7, calls: 2, hits: 0, role: null },
          ],
        },
        dropRank: "top 2%",
        riseRank: null,
        flag: "drop",
        move: 251,
        outcome:
          "The warning held in the top 2%, and the stock more than tripled. The champion in the room was right, and the warning was early.",
      },
      {
        label: "Day 3",
        crowd: "11 people · 2 communities",
        context: ctx(99.1, 11, 2.25, 42, 1.2, 57.1, 21),
        room: {
          posts: 11,
          newcomers: 4,
          mix: mix(36, 18, 18, 9),
          discussed: 6,
          posters: [
            { posts: 1, tags: [], engagement: 1.1, calls: 10, hits: 6, role: "champion" },
            { posts: 1, tags: ["squeeze"], engagement: 4.2, calls: 37, hits: 9, role: "fade" },
            { posts: 1, tags: ["gains"], engagement: 10.7, calls: 9, hits: 3, role: "fade" },
          ],
        },
        dropRank: "top 1%",
        riseRank: null,
        flag: "drop",
        move: 23,
        outcome: "The warning climbed into the top 1%. Up another 23%. Three alarms, three empty fields.",
      },
      {
        label: "Day 4",
        crowd: "36 people · 3 communities",
        context: ctx(99.9, 49, 2.8, 364, 1.4, 70.4, 17.7),
        room: {
          posts: 49,
          newcomers: 20,
          mix: mix(45, 8, 6, 2),
          discussed: 7,
          posters: [
            { posts: 1, tags: [], engagement: 6.3, calls: 8, hits: 3, role: "fade" },
            { posts: 2, tags: ["squeeze"], engagement: 33, calls: 2, hits: 1, role: null },
            { posts: 1, tags: [], engagement: 10.6, calls: 0, hits: 0, role: null },
          ],
        },
        dropRank: "top 1%",
        riseRank: null,
        flag: "drop",
        move: -65,
        outcome:
          "The biggest crowd of the run, no champions left, and the warning at its highest yet. This time the wolf came: the stock fell 65% against the market.",
      },
      {
        label: "Day 5",
        crowd: "17 people · 3 communities",
        context: ctx(99.6, 20, 5.25, 434, 0.4, -17.6, 9.9),
        room: {
          posts: 20,
          newcomers: 8,
          mix: mix(20, 15, 30, 0),
          discussed: 8,
          posters: [
            { posts: 1, tags: [], engagement: 5.8, calls: 1, hits: 0, role: null },
            { posts: 1, tags: ["research"], engagement: 5.2, calls: 4, hits: 0, role: null },
          ],
        },
        dropRank: "top 6%",
        riseRank: null,
        flag: "out",
        move: -41,
        outcome:
          "The warning cooled to the top 6%, below the flag line, so the model wasn't calling this one. It fell 41% anyway.",
      },
      {
        label: "Day 6",
        crowd: "20 people · 3 communities",
        context: ctx(99.8, 24, 6.25, 446, 1.7, 16.7, 2.4),
        room: {
          posts: 24,
          newcomers: 12,
          mix: mix(21, 12, 29, 4),
          discussed: 9,
          posters: [
            { posts: 2, tags: ["gains"], engagement: 23.4, calls: 1, hits: 1, role: null },
            { posts: 2, tags: [], engagement: 16.9, calls: 0, hits: 0, role: null },
          ],
        },
        dropRank: "top 2%",
        riseRank: null,
        flag: "drop",
        move: -42,
        outcome: "Back into the top 2%, and down another 42%.",
      },
    ],
    reveal: {
      stock: "Beyond Meat",
      ticker: "BYND",
      month: "October 2025",
      href: "/case-studies/failed",
      verdict: "Wrong three times, then right three times, and the order is what ruins you.",
      moral:
        "Of the 250 top-3% drop warnings in the held-out data, 92 were not followed by a 10% drop, and 53 went the other way and rose 10% or more. Early and wrong look identical until the crowd turns.",
    },
  },
];
