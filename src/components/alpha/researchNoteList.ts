// Standalone research pages under /research. The research index and the sitemap both read this list.
export const researchNotes = [
  {
    path: "/research/publication-test",
    eyebrow: "Pre-registration",
    title: "Does publishing a warning change what the stock does?",
    summary:
      "A randomized test, fixed in advance: half of our top drop calls go public the same morning, half only after the outcome is known. It hasn't started yet.",
    published: "24 November 2026",
    isoDate: "2026-11-24",
  },
  {
    path: "/research/what-didnt-work",
    eyebrow: "Null results",
    title: "What didn't work: four ways of measuring the crowd that added nothing",
    summary:
      "We tried four better measures of the crowd on top of price, news and insider trades. None of them helped, and an early herding result turned out to be an artefact.",
    published: "24 November 2026",
    isoDate: "2026-11-24",
  },
] as const;
