export const howSteps = [
  {
    label: "Collect",
    title: "Gather public posts.",
    body: "Every day we pull in public posts from investing forums, along with news coverage, insider trading reports, and market prices.",
  },
  {
    label: "Filter",
    title: "Spot the fakes.",
    body: "Some posts come from bots or groups working together to hype a stock. We don't throw them out. We flag them, because fake hype is itself a clue. We haven't yet measured how accurate this flagging is.",
  },
  {
    label: "Store",
    title: "Label everything.",
    body: "Each post gets tagged with who wrote it, when, where, and which stock it's about.",
  },
  {
    label: "Enrich",
    title: "Add the rest of the picture.",
    body: "We add the stock price, how nervous the market is, the day of the week, the news, and insider trades. We only use what was known before the market opened, so the model can't cheat by seeing the future.",
  },
  {
    label: "Model",
    title: "Learn from the past.",
    body: "The model studies years of past days to learn what tends to come before a stock drops or jumps. We always test it on later dates it never studied.",
  },
  {
    label: "Score",
    title: "Rate every stock.",
    body: "Each stock gets a score: how likely it is to drop hard, or rise, over the next three trading days. Only the highest scores are kept.",
  },
  {
    label: "Log",
    title: "Write it down, then wait.",
    body: "We record the prediction before we know the answer. Three trading days later, we check whether it was right.",
  },
];
