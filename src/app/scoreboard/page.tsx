import type { Metadata } from "next";
import Link from "next/link";
import { AlphaFooter } from "@/components/alpha/AlphaFooter";
import { AlphaHeader } from "@/components/alpha/AlphaHeader";
import { Scoreboard } from "@/components/alpha/Scoreboard";
import { JsonLd, pageJsonLd, pageMetadata } from "@/lib/seo";

const path = "/scoreboard";
const title = "Scoreboard";
const description =
  "Every top-tier drop call from jargAI's publication test. About half appear the same morning they're made, the rest after their three trading days close, chosen at random.";

export const metadata: Metadata = pageMetadata({ title, description, path });

export default function ScoreboardPage() {
  return (
    <>
      <JsonLd data={pageJsonLd({ path, name: title, description, parent: { name: "Research", path: "/research" } })} />
      <AlphaHeader />
      <main id="main">
        <section aria-labelledby="scoreboard-title" className="pt-32 pb-20 md:pt-40 md:pb-28">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-cyan">Scoreboard</p>
            <h1
              id="scoreboard-title"
              className="mt-3 max-w-3xl text-balance font-[family-name:var(--font-heading)] text-[clamp(2.25rem,6vw,3.5rem)] font-extrabold leading-[1.1] tracking-tight"
            >
              Every drop call from the publication test.
            </h1>
            <div className="mt-5 max-w-2xl space-y-4 text-pretty text-lg leading-relaxed text-muted">
              <p>
                This is every top-tier drop call from our{" "}
                <Link
                  href="/research/publication-test"
                  className="font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
                >
                  publication test
                </Link>
                . A coin flip decides when each one appears: about half show up here the same morning they&apos;re
                made, and the rest only after their three trading days have closed.
              </p>
              <p>
                A drop call says a stock is likely to fall at least 10% behind the S&amp;P 500 over the next three
                trading days. The outcome is the stock&apos;s move minus the S&amp;P 500&apos;s, from the entry
                day&apos;s open to the close three trading days later.
              </p>
              <p className="text-base">
                We don&apos;t show how same-morning calls compare with after-outcome calls, because the pre-registration
                rules out looking at that comparison until 900 calls have finished.
              </p>
            </div>

            <div className="mt-10">
              <Scoreboard />
            </div>

            <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted">
              This is research, not investment advice or an offer to buy or sell anything. None of these calls is a
              recommendation.
            </p>
          </div>
        </section>
      </main>
      <AlphaFooter />
    </>
  );
}
