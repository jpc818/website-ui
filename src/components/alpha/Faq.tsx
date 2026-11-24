import { forwardLog } from "@/components/alpha/forwardLogCounts";
import { SectionHeading } from "@/components/alpha/SectionHeading";

export const faqs: { question: string; answer: string }[] = [
  {
    question: "What is jargAI?",
    answer:
      "A small research company that tries to predict what crowds will do next. We don't guess what a company is worth or how people feel. We look at what people have actually done, and what usually comes after.",
  },
  {
    question: "What does jargAI make predictions about?",
    answer:
      "US stocks that people are talking about on investing forums. For each one, we estimate the chance it falls at least 10% behind the overall market (the S&P 500) in the next three trading days. These are research results, not recommendations.",
  },
  {
    question: "Is jargAI a fund?",
    answer:
      "No. We don't manage anyone's money, and nothing here is advice. The research is free to read on this site. A small group of invited Charles Schwab customers can also try an early version of it.",
  },
  {
    question: "Isn't this just reading the mood of the internet?",
    answer:
      "No. Mood is how people feel. We look at what they do: who shows up, when, whether they've been right before, and whether they seem to be working together. We actually tested mood, and it didn't help at all.",
  },
  {
    question: "Why not just look at the company's finances?",
    answer:
      "Finances tell you what a company is worth, but everyone else can see them too. We ask a different question: what will the crowd do next, and who will move first?",
  },
  {
    question: "Where does the data come from?",
    answer:
      "Forum posts come from a public archive of investing communities. We haven't named it yet. News comes from GDELT, a free public news database. Insider trades come from official government filings (the SEC). Prices come from Yahoo Finance and Schwab. We only publish totals, never anyone's posts. Questions about this: contact@jarg.ai.",
  },
  {
    question: "How does the model decide what to predict?",
    answer:
      "It gives every stock a score each day. A high score means it's more likely to drop. We write down the top scores, wait three trading days, and check. To grade the model, we ask: when one stock dropped and another didn't, how often did the dropper get the higher score? Ours gets it right about 80% of the time. A coin flip gets 50%.",
  },
  {
    question: "What patterns does it look for?",
    answer:
      "Sudden bursts of attention, who has been early and right before, signs of bots or groups working together, day-of-week and month habits, plus the news, insider trades, and the stock price. We're still working on tracking exactly who copies whom.",
  },
  {
    question: "Do you have a live track record?",
    answer:
      `We started one on ${forwardLog.started}: a diary of predictions written down before we knew the answer. As of ${forwardLog.asOf} it has ${forwardLog.recorded} predictions, ${forwardLog.resolved} of them finished, with ${forwardLog.bigDrops} hard drops. That's far too few to grade, so we're not giving it a score yet. Anything added after the fact doesn't count.`,
  },
  {
    question: "How do you know it isn't just luck?",
    answer:
      "We only test the model on dates it never saw while learning. Every new kind of data has to beat a simpler version of the model. And we publish what didn't work. For example, the mood of posts didn't help at all. Online chatter helped a little over price alone, but almost nothing once news and insider trades were added. The research page has the details.",
  },
  {
    question: "What does game theory have to do with it?",
    answer:
      "In a crowd, winning means guessing what others will do next. So we sort people into three kinds: the early ones (worth following), the echo that shows up late (worth ignoring), and groups working together to hype something (worth distrusting).",
  },
  {
    question: "Does the game on this site collect my data?",
    answer:
      "No. The “Try to be unpredictable” game runs entirely in your browser. Your taps are never sent anywhere.",
  },
  {
    question: "How do I get in touch?",
    answer:
      "Email contact@jarg.ai. We're happy to talk with investment firms, data providers, and anyone who wants to work on this.",
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
        <SectionHeading id="faq-title" eyebrow="FAQ" title="Common questions." />
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
