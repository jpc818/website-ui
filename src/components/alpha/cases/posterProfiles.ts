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
    session: "The day the warning went off: 18 people in 3 forums",
    posters: [
      {
        who: "The first post",
        detail:
          "A research-style post by a poster whose earlier posts drew about 6× the usual attention, with 14 earlier calls, 7 of which beat the market.",
      },
      {
        who: "A squeeze post",
        detail:
          "From a poster whose posts drew about 10× the usual attention, but only 1 of their 8 earlier calls beat the market. The model counts them as usually wrong.",
      },
      {
        who: "The peak, 51 people",
        detail:
          "Two usually-wrong posters (1 of 8 and 4 of 16 calls right), and one post from a poster who gets over 200× the usual attention. No proven pickers.",
      },
    ],
    crowd:
      "Half the posts that day were people showing off gains or losses. The stock had come up on 7 of the previous 20 trading days, 4 in a row. The first proven picker didn't show up until the crowd had already thinned.",
  },
  call: {
    stock: "BigBear.ai",
    ticker: "BBAI",
    month: "February 2025",
    session: "The flagged day: 4 people in 2 forums",
    posters: [
      {
        who: "Two newcomers",
        detail: "Two of the four had no older posts to judge, so the model knew nothing about their attention or track record.",
      },
      {
        who: "A loud poster",
        detail: "Earlier posts drew about 10× the usual attention. 3 of their 7 earlier calls beat the market.",
      },
      {
        who: "A research poster",
        detail: "Two research-style posts that day, from a poster with about 2× the usual attention and 1 of 4 earlier calls right.",
      },
    ],
    crowd:
      "No proven pickers and no usually-wrong posters. Nobody had talked about the stock the day before, but it came up on 5 of the previous 20 trading days.",
  },
  exotic: {
    stock: "Nuburu",
    ticker: "BURU",
    month: "October 2025",
    session: "The day both scores were high: 7 people in 2 forums",
    posters: [
      {
        who: "A heavy poster",
        detail:
          "183 earlier calls, only 38% of which beat the market, so the model counts them as usually wrong. Their posts got about the usual attention.",
      },
      {
        who: "A popular poster",
        detail: "Earlier posts drew about 19× the usual attention, but only 1 of 3 earlier calls had beaten the market.",
      },
      {
        who: "A first-timer",
        detail: "Three posts showing off gains or losses in one day, from a poster with no history to judge.",
      },
    ],
    crowd:
      "40% of the posts were people showing off gains or losses, and the stock had come up on 12 of the previous 20 trading days, 6 in a row. A loud, experienced crowd, with one usually-wrong poster and no proven picker.",
  },
  failed: {
    stock: "Beyond Meat",
    ticker: "BYND",
    month: "October 2025",
    session: "Six trading days in a row, starting with 2 people",
    posters: [
      {
        who: "Day 2, a proven picker",
        detail:
          "Five squeeze posts in one day from a poster with 36 earlier calls, 23 of which beat the market, and about 8× the usual attention. The stock more than tripled. The proven picker was right, and the warning was early.",
      },
      {
        who: "Day 3, two usually-wrong posters",
        detail: "Two posters whose earlier calls mostly missed (9 of 37 and 3 of 9 right) joined the squeeze talk.",
      },
      {
        who: "Day 4, 36 people",
        detail:
          "No proven pickers left, one usually-wrong poster, and 45% of the posts tagged as squeeze posts. This is the day the stock started falling 65% behind the market.",
      },
    ],
    crowd:
      "The proven picker arrived early and was gone before the peak. That's the kind of pattern our newer poster measures are built to catch.",
  },
};
