import type { Metadata } from "next";
import Link from "next/link";
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
  "jargAI's evidence in plain English: how often the model spots hard drops, a simple pattern in forum posts, a live diary of predictions, practice portfolios, and what we can't claim.";

export const metadata: Metadata = pageMetadata({ title, description, path: "/research" });

const contents = [
  { href: "#headline-result-title", label: "The main result" },
  { href: "#flag", label: "Squeeze tags" },
  { href: "#forward", label: "Live diary" },
  { href: "#tool", label: "Does it make money?" },
  { href: "#rigor", label: "What we can't claim" },
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
              First, how often the model spots a stock about to drop. Then a simple pattern in forum posts, our live
              diary of predictions, and a test of whether any of it makes money. Nothing here is advice.
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
        <HeadlineResult />
        <CrowdFlag />
        <ForwardLog />
        <InvestmentTool />
        <section aria-label="Lead-lag web" className="border-t border-white/8 py-10 md:py-12">
          <p className="mx-auto max-w-6xl px-5 text-lg leading-relaxed text-muted sm:px-6">
            Want to see how posts, price jumps and news can ripple into the next day? There&apos;s an interactive
            picture of it (an illustration, not evidence) in the{" "}
            <Link
              href="/lab#web"
              className="font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
            >
              lab →
            </Link>
          </p>
        </section>
        <Rigor />
        <MethodNote />
        <Contact />
      </main>
      <AlphaFooter />
    </>
  );
}
