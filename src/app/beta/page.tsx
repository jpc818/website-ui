import type { Metadata } from "next";
import Link from "next/link";
import { AlphaFooter } from "@/components/alpha/AlphaFooter";
import { AlphaHeader } from "@/components/alpha/AlphaHeader";
import { productUrl } from "@/app/site";
import { JsonLd, pageJsonLd, pageMetadata } from "@/lib/seo";

const title = "Private beta";
const description =
  "The jargAI product is a private beta for invited Charles Schwab customers. Everyone else can read the research or get in touch.";

export const metadata: Metadata = pageMetadata({ title, description, path: "/beta" });

export default function Beta() {
  return (
    <>
      <JsonLd data={pageJsonLd({ path: "/beta", name: title, description })} />
      <AlphaHeader />
      <main id="main">
        <section aria-labelledby="beta-title" className="pt-32 pb-20 md:pt-40 md:pb-28">
          <div className="mx-auto max-w-4xl px-5 sm:px-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-cyan">Private beta</p>
            <h1
              id="beta-title"
              className="mt-3 max-w-3xl text-balance font-[family-name:var(--font-heading)] text-[clamp(2.25rem,6vw,3.5rem)] font-extrabold leading-[1.1] tracking-tight"
            >
              The product is invite-only for now.
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted md:text-xl">
              It&apos;s open to invited Charles Schwab customers. If that isn&apos;t you, Google sign-in will
              end on a &ldquo;private beta&rdquo; page, so start with the research instead.
            </p>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              <div className="flex flex-col rounded-3xl border border-accent/40 bg-surface p-6 md:p-8">
                <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold md:text-2xl">
                  I&apos;m an invited Schwab customer
                </h2>
                <p className="mt-3 flex-1 text-base leading-relaxed text-muted">
                  Sign in with the Google account your invite was sent to. You&apos;ll leave jarg.ai for the app.
                </p>
                <a
                  href={productUrl}
                  className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-accent px-8 text-base font-semibold text-background transition-opacity hover:opacity-90"
                >
                  Continue to Google sign-in
                </a>
              </div>

              <div className="flex flex-col rounded-3xl border border-white/10 bg-surface p-6 md:p-8">
                <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold md:text-2xl">
                  Everyone else
                </h2>
                <p className="mt-3 flex-1 text-base leading-relaxed text-muted">
                  The research is public: the results, the live record, and what none of it shows yet. To ask about
                  access, write to{" "}
                  <a
                    href="mailto:contact@jarg.ai"
                    className="text-foreground underline decoration-white/30 underline-offset-4 hover:decoration-foreground"
                  >
                    contact@jarg.ai
                  </a>
                  .
                </p>
                <Link
                  href="/research"
                  className="mt-6 inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-8 text-base font-medium transition-colors hover:bg-white/5"
                >
                  Read the research
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <AlphaFooter />
    </>
  );
}
