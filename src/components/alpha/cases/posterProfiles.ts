// Who was posting in each case study, from social-alpha scripts/case_poster_profiles.py.
// Posters are described by profile, never by account name. Everything about a poster is what the model could know
// before that session's open:
//   engagement: the typical engagement of their own earlier posts (each at least 7 days old), as a multiple of the
//               typical post across the crowd over the prior 180 days.
//   calls: earlier sessions they posted about the stock-of-the-day that have since resolved; "beat the market" means the
//          stock beat the S&P 500 over the three sessions after.
//   champion: 8+ resolved calls with at least 60% beating the market. Fade: 8+ calls with 40% or fewer.
// Post types are the tag the poster chose when posting (research, squeeze, gains-or-losses, meme).

import type { CaseId } from "@/components/alpha/cases/stories";

export type Poster = { who: string; detail: string };

export type CasePosters = {
  stock: string;
  ticker: string;
  month: string;
  session: string;
  posters: Poster[];
  crowd: string;
};

export const casePosters: Record<CaseId, CasePosters> = {
  put: {
    stock: "Opendoor Technologies",
    ticker: "OPEN",
    month: "July 2025",
    session: "The session the warning fired: 18 people in 3 communities",
    posters: [
      {
        who: "The first post",
        detail:
          "A research-style post by a poster whose earlier posts drew about 6× typical engagement, with 14 earlier calls, 7 of which beat the market.",
      },
      {
        who: "A squeeze post",
        detail:
          "From a poster whose posts drew about 10× typical engagement, but only 1 of their 8 earlier calls beat the market. The model counts them as a fade.",
      },
      {
        who: "The peak, 51 people",
        detail:
          "Two fades in the room (1 of 8 and 4 of 16 calls right), and one post from a poster in the top 10% for engagement, at over 200× typical. No champions.",
      },
    ],
    crowd:
      "Half the posts on the flagged session were gains-or-losses posts. The stock had been discussed on 7 of the previous 20 sessions, 4 in a row. The first champion didn't show up until the crowd had already thinned.",
  },
  call: {
    stock: "BigBear.ai",
    ticker: "BBAI",
    month: "February 2025",
    session: "The flagged session: 4 people in 2 communities",
    posters: [
      {
        who: "Two newcomers",
        detail: "Two of the four had no settled posts at all, so the model had no engagement or track record for them.",
      },
      {
        who: "A loud poster",
        detail: "Earlier posts drew about 10× typical engagement. 3 of their 7 earlier calls beat the market.",
      },
      {
        who: "A research poster",
        detail: "Two research-style posts that session, from a poster with about 2× typical engagement and 1 of 4 earlier calls right.",
      },
    ],
    crowd:
      "No champions and no fades. Nobody had talked about the stock on the previous session, but it came up on 5 of the previous 20.",
  },
  exotic: {
    stock: "Nuburu",
    ticker: "BURU",
    month: "October 2025",
    session: "The two-sided session: 7 people in 2 communities",
    posters: [
      {
        who: "A heavy poster",
        detail:
          "183 earlier calls, only 38% of which beat the market, so the model counts them as a fade. Their engagement was close to typical.",
      },
      {
        who: "A high-engagement poster",
        detail: "Earlier posts drew about 19× typical engagement, but only 1 of 3 earlier calls had beaten the market.",
      },
      {
        who: "A first-timer",
        detail: "Three gains-or-losses posts in one session from a poster with no settled history.",
      },
    ],
    crowd:
      "40% of the posts were gains-or-losses posts, and the stock had been discussed on 12 of the previous 20 sessions, 6 in a row. It was a loud, practiced crowd with a fade in it and no champion.",
  },
  failed: {
    stock: "Beyond Meat",
    ticker: "BYND",
    month: "October 2025",
    session: "Six sessions in a row, starting with 2 people",
    posters: [
      {
        who: "Session 2, a champion",
        detail:
          "Five squeeze posts in one session from a poster with 36 earlier calls, 23 of which beat the market, and about 8× typical engagement. The stock more than tripled. The champion was right, and the warning was early.",
      },
      {
        who: "Session 3, two fades",
        detail: "Two posters whose earlier calls mostly missed (9 of 37 and 3 of 9 right) joined the squeeze talk.",
      },
      {
        who: "Session 4, 36 people",
        detail:
          "No champions left in the room, one fade, and 45% of the posts tagged as squeeze posts. This is the session the stock fell 65 points against the market.",
      },
    ],
    crowd:
      "The champion arrived early and was gone before the peak. That pattern is what our new poster measures are built to track.",
  },
};
