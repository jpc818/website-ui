import type { Metadata } from "next";
import Link from "next/link";
import { ResearchArticle } from "@/components/alpha/ResearchArticle";
import { researchNotes } from "@/components/alpha/researchNoteList";
import { JsonLd, pageJsonLd, pageMetadata } from "@/lib/seo";

const note = researchNotes[1];
const path = note.path;
const title = "What didn't work";
const description =
  "Four ways of measuring the online crowd that added nothing to jargAI's drop predictions on top of price, market, news and insider-filing data, including a herding result that turned out to be an artefact.";

export const metadata: Metadata = pageMetadata({ title, description, path });

const rows = [
  {
    idea: "Self-exciting posting model (Hawkes), first version",
    walkForward: "+0.000",
    holdout: "+0.001 (−0.000 to +0.003)",
  },
  {
    idea: "Hawkes, corrected for cross-posting and daily cycles",
    walkForward: "+0.001 (−0.000 to +0.003)",
    holdout: "+0.000 (−0.001 to +0.002)",
  },
  {
    idea: "Who is posting: account history, track record, post type (added to the full model with crowd volume)",
    walkForward: "+0.002 (+0.000 to +0.003)",
    holdout: "+0.000 (−0.001 to +0.002)",
  },
  {
    idea: "Similar past stock-days by attention and price shape",
    walkForward: "+0.001 (−0.001 to +0.002)",
    holdout: "+0.000 (−0.001 to +0.002)",
  },
];

export default function WhatDidntWork() {
  return (
    <>
      <JsonLd
        data={pageJsonLd({
          path,
          name: note.title,
          description,
          dateModified: note.isoDate,
          parent: { name: "Research", path: "/research" },
          extra: { datePublished: note.isoDate },
        })}
      />
      <ResearchArticle
        eyebrow={note.eyebrow}
        title={note.title}
        published={note.published}
        intro={
          <>
            We predict which stocks discussed online will fall at least 10% relative to the S&amp;P 500 over the next
            three trading sessions. Most of that prediction comes from price and volatility. The obvious next question is
            whether a better measure of the crowd adds anything on top. We tried four, and none did. We&apos;re
            publishing the failures because a result only means something if you can also see what was tried and
            didn&apos;t work.
          </>
        }
      >
        <h2>How we tested</h2>
        <ul>
          <li>
            <span className="font-mono tabular-nums">25,247</span> stock-days across{" "}
            <span className="font-mono tabular-nums">444</span> US stocks, January 2021 to October 2026.
          </li>
          <li>
            Every idea was added to the same model and tested two ways: five walk-forward folds, and a holdout where we
            trained through 2024 and tested on January 2025 to October 2026.
          </li>
          <li>
            Uncertainty ranges come from resampling whole trading days, since stocks on the same day move together.
          </li>
          <li>
            The comparison point is a model using price, market, news and insider-filing data, which ranks big drops
            with an AUC of <span className="font-mono tabular-nums">0.797</span> on the holdout. AUC is the chance a
            real drop is ranked above a non-drop.
          </li>
        </ul>

        <div className="rounded-3xl border border-white/8 bg-surface p-6 md:p-8">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] border-separate border-spacing-0 text-left">
              <caption className="sr-only">
                Change in AUC from each crowd measure, in walk-forward testing and on the holdout, with ranges
              </caption>
              <thead>
                <tr className="text-sm text-muted">
                  <th scope="col" className="pb-3 pr-4 font-semibold">Idea</th>
                  <th scope="col" className="pb-3 pr-4 text-right font-semibold">Walk-forward change in AUC</th>
                  <th scope="col" className="pb-3 text-right font-semibold">Holdout change in AUC</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.idea}>
                    <th
                      scope="row"
                      className="border-t border-white/8 py-3 pr-4 text-sm font-semibold leading-relaxed text-foreground"
                    >
                      {row.idea}
                    </th>
                    <td className="border-t border-white/8 py-3 pr-4 text-right align-top font-mono text-sm whitespace-nowrap tabular-nums text-foreground">
                      {row.walkForward}
                    </td>
                    <td className="border-t border-white/8 py-3 text-right align-top font-mono text-sm whitespace-nowrap tabular-nums text-foreground">
                      {row.holdout}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p>
          For comparison, going from price alone to price plus news and insiders adds about{" "}
          <span className="font-mono tabular-nums">+0.012</span> in walk-forward testing.
        </p>

        <h2>The herding result was an artefact</h2>
        <p>
          A popular idea is that attention on a stock &ldquo;feeds itself&rdquo;: each post triggers more. A Hawkes
          process measures this with a branching ratio, the share of posts set off by earlier posts. Our first version
          seemed promising. Stocks with the highest branching ratio dropped{" "}
          <span className="font-mono tabular-nums">29%</span> of the time on the holdout, against{" "}
          <span className="font-mono tabular-nums">13%</span> for the lowest.
        </p>
        <p>Two things were wrong with it:</p>
        <ol>
          <li>
            <strong>Cross-posting.</strong> The same author posting one write-up to several forums within minutes looks
            like a burst of herding. Counting each author once per ticker per six hours removed most of it.
          </li>
          <li>
            <strong>Daily rhythm.</strong> Forums are about 24 times busier at their peak hour of the week than at their
            quietest. A model with a constant background rate reads that rhythm as self-excitation.
          </li>
        </ol>
        <p>
          After both fixes, the typical stock&apos;s branching ratio is about zero, and even the top tenth reach only{" "}
          <span className="font-mono tabular-nums">0.14</span>. Within groups of stocks with similar volatility, the
          branching ratio shows no consistent link to drops. The original 13%-versus-29% gap was mostly volatility.
        </p>

        <h2>One pattern worth watching, not claiming</h2>
        <p>
          Several crowd measures improve prediction of big <strong>rises</strong> on the 2025–2026 holdout, by about{" "}
          <span className="font-mono tabular-nums">+0.006</span> AUC (for example{" "}
          <span className="font-mono tabular-nums">+0.003</span> to{" "}
          <span className="font-mono tabular-nums">+0.010</span> for the corrected Hawkes features). None of them shows
          it in walk-forward testing. We have looked at that holdout many times, so it can&apos;t settle the question. We
          are treating it as a prediction to check on calls made from now on.
        </p>

        <h2>What we&apos;re doing instead</h2>
        <p>
          We&apos;re running a{" "}
          <Link href={researchNotes[0].path}>randomized test of whether publishing a drop call changes what the stock does</Link>
          . Half of eligible calls go up the same morning, and half after their outcome is known. The design, outcomes
          and sample size were fixed in advance and are timestamped by hash. Results come when 900 calls have resolved,
          whichever way they go.
        </p>
      </ResearchArticle>
    </>
  );
}
