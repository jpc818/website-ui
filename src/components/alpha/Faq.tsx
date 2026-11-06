import { SectionHeading } from "@/components/alpha/SectionHeading";

export const faqs: { question: string; answer: string }[] = [
  {
    question: "What is jargAI?",
    answer:
      "jargAI is a research company that predicts crowd behavior. Instead of modeling what something is worth or how people feel about it, we model what people are likely to do next, based on the patterns in what they have already done.",
  },
  {
    question: "What does jargAI actually make predictions about?",
    answer:
      "Publicly traded US stocks that online investing communities are talking about. We look at how people talk and act around a stock, add price, news, and insider context, and estimate how likely it is to underperform the S&P 500 by 10 percentage points or more over the next three trading sessions (the \"big drop\" call). These are research outputs, not recommendations.",
  },
  {
    question: "Is jargAI a fund?",
    answer:
      "No. jargAI is a research company. It does not take outside money, sell signals, or give advice. Where the research leads next depends on what holds up.",
  },
  {
    question: "How is behavior prediction different from sentiment analysis?",
    answer:
      "Sentiment analysis measures how people feel or what they say. We start with who showed up, when, how coordinated it looks, and who has been right before — then add news, insiders, and price context. In our own test, text mood added nothing measurable, so it isn't what drives the ranking. Outputs are probabilities tested on future data, not headlines.",
  },
  {
    question: "How is it different from fundamental analysis?",
    answer:
      "Fundamental analysis asks what something is worth. That information is slow, public, and already known to everyone looking. jargAI asks a different question: what will the crowd do next, and who will move first?",
  },
  {
    question: "Where does jargAI's data come from?",
    answer:
      "Scheduled collection from public archives and APIs: crowd posts, news volume and tone, insider filings, and market context. Coordination and bot-like bursts are scored as risk signals, not deleted. Everything lands in jargAI's own warehouse. We haven't published the full source list yet. Platform terms, licensing, and privacy are fair questions, and you can ask them at contact@jarg.ai.",
  },
  {
    question: "How does jargAI decide what to flag, and when to let go?",
    answer:
      "Regression models assign every candidate a probability; AUC measures how well that ranking separates what happened from what didn't on data the model never trained on. Only the top of the ranking is flagged, with a separate filter for downside risk. Each call has a planned horizon. Dynamic re-score exits are in research.",
  },
  {
    question: "What kinds of patterns does jargAI model?",
    answer:
      "In production today: mention bursts and share-of-attention, author track records (who was early), coordination and bot-like activity, weekday and month seasonality, plus news, insiders, and price context. In research: full cascades, account-level lead-lag, and cross-platform spread timing.",
  },
  {
    question: "What does the output look like?",
    answer:
      "Every output is a probability, never an opinion: how likely a group is to act, and how soon. Each prediction is checked against what actually happened.",
  },
  {
    question: "Is there a live track record?",
    answer:
      "A forward log started on 15 October 2026. It counts only calls recorded before the outcome: 49 so far, 34 resolved, and 2 big drops. That is too few drops to publish a ranking score, so the page shows the count and not a score. Scores filled in after the fact are excluded.",
  },
  {
    question: "How do you know the predictions are real and not luck?",
    answer:
      "Models are only ever tested on data from after the period they learned from, with a locked holdout period that is never used for training. Every data source has to beat a simple baseline, confidence ranges resample whole days, and results that turn out to be noise are reported as misses. Our first published miss and hit are on the research page (jarg.ai/research): text mood added nothing measurable; crowd signals improved the big-drop ranking over price and market data alone, and added nothing measurable in the walk-forward test on top of price plus news and insider filings. The same page lists the data, folds and limits.",
  },
  {
    question: "What does game theory have to do with it?",
    answer:
      "A crowd works like a Keynesian beauty contest: winning is about anticipating what everyone else will do. jargAI separates the early (worth following), the echo (late and loud, worth ignoring), and coordinated rings (worth discounting). Models are retrained on a schedule after tests — not continuous auto-retrain yet.",
  },
  {
    question: "Does the prediction demo on this site collect my data?",
    answer:
      "No. The “Try to be unpredictable” demo runs entirely in your browser. Your moves are never sent anywhere.",
  },
  {
    question: "How do I get in touch?",
    answer:
      "Email contact@jarg.ai. We're open to conversations with funds and trading firms, data providers, and people who want to work on this. Fuller results and methods are shared privately.",
  },
];

export function Faq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="border-t border-white/8 py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading id="faq-title" eyebrow="FAQ" title="Questions, answered plainly." />
        <div className="mt-10 divide-y divide-white/8 rounded-3xl border border-white/8 bg-surface">
          {faqs.map((faq) => (
            <details key={faq.question} className="group px-6 md:px-8">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {faq.question}
                <span
                  aria-hidden="true"
                  className="shrink-0 text-2xl leading-none text-accent transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="pb-6 text-base leading-relaxed text-muted">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
