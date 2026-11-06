export const howSteps = [
  {
    label: "Collect",
    title: "Scheduled pulls from public sources.",
    body: "Crowd posts, news volume and tone, insider filings, and market context, collected on a schedule from public archives and APIs.",
  },
  {
    label: "Filter",
    title: "Coordination is a signal.",
    body: "We measure bot-like and coordinated posting: duplicate titles, bot-style names, author concentration. We don't delete bots; bursts and farms are inputs to the model. We haven't published how accurate this labelling is.",
  },
  {
    label: "Store",
    title: "Everything gets marked up.",
    body: "Each item is tagged with author, time, source, and subject, then loaded into our warehouse.",
  },
  {
    label: "Enrich",
    title: "Then we add the rest of the picture.",
    body: "Prices, VIX, calendar (weekday, month, options-expiration week), news and insider features — all before the 9:30 ET open, so nothing after the open leaks in.",
  },
  {
    label: "Model",
    title: "Regression finds what comes before action.",
    body: "Gradient-boosted trees and logistic regression on past subject-days. Walk-forward training with a purge gap; a locked holdout stretch is never used for training.",
  },
  {
    label: "Score",
    title: "Probability ranks the candidates.",
    body: "Every candidate gets a probability of beating the baseline in three sessions, and a separate downside score. AUC measures ranking quality on future data. Only the top tier (with a downside filter) is flagged for study.",
  },
  {
    label: "Flag",
    title: "A fixed horizon for every call.",
    body: "Each flagged call has a fixed three-session horizon, and downside and upside paths are tested in parallel. Nothing here is advice. Re-scoring a call early if the crowd signal flips is on the roadmap.",
  },
];
