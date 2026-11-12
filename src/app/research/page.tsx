import type { Metadata } from "next";
import { AlphaFooter } from "@/components/alpha/AlphaFooter";
import { AlphaHeader } from "@/components/alpha/AlphaHeader";
import { Contact } from "@/components/alpha/Contact";
import { CrowdFlag } from "@/components/alpha/CrowdFlag";
import { ForwardLog } from "@/components/alpha/ForwardLog";
import { HeadlineResult } from "@/components/alpha/HeadlineResult";
import { InvestmentTool } from "@/components/alpha/InvestmentTool";
import { MethodNote } from "@/components/alpha/MethodNote";
import { Rigor } from "@/components/alpha/Rigor";
import { JsonLd, pageJsonLd, pageMetadata } from "@/lib/seo";

const title = "Research";
const description =
  "jargAI's evidence in full: backtest ranking scores for three nested models, a forward log of live calls, how the numbers were made, and what they don't show.";

export const metadata: Metadata = pageMetadata({ title, description, path: "/research" });

const contents = [
  { href: "#flag", label: "Squeeze flag" },
  { href: "#headline-result-title", label: "Results" },
  { href: "#forward", label: "Forward log" },
  { href: "#tool", label: "Investment tool" },
  { href: "#rigor", label: "Rigor and limits" },
  { href: "#method", label: "Method" },
];

export default function Research() {
  return (
    <>
      <JsonLd data={pageJsonLd({ path: "/research", name: title, description })} />
      <AlphaHeader />
      <main id="main">
        <section aria-labelledby="research-title" className="pt-32 pb-4 md:pt-40">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-cyan">Research</p>
            <h1
              id="research-title"
              className="mt-3 max-w-3xl text-balance font-[family-name:var(--font-heading)] text-[clamp(2.25rem,6vw,4rem)] font-extrabold leading-[1.1] tracking-tight"
            >
              The evidence, in full.
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted md:text-xl">
              Ranking scores on data the models never trained on, the live record so far, and what none of it shows
              yet. Nothing here is advice or an offer.
            </p>
            <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-2 sm:gap-3">
              {contents.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-white/15 bg-surface px-4 py-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </section>
        <CrowdFlag />
        <HeadlineResult />
        <ForwardLog />
        <InvestmentTool />
        <Rigor />
        <MethodNote />
        <Contact />
      </main>
      <AlphaFooter />
    </>
  );
}
