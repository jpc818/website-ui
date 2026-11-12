import type { Metadata } from "next";
import Link from "next/link";
import { AlphaFooter } from "@/components/alpha/AlphaFooter";
import { AlphaHeader } from "@/components/alpha/AlphaHeader";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <>
      <AlphaHeader />
      <main id="main" className="flex-1">
        <section aria-labelledby="not-found-title" className="pt-32 pb-20 md:pt-40 md:pb-28">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <p className="font-mono text-sm text-accent">404</p>
            <h1
              id="not-found-title"
              className="mt-3 max-w-3xl text-balance font-[family-name:var(--font-heading)] text-[clamp(2.25rem,6vw,4rem)] font-extrabold leading-[1.1] tracking-tight"
            >
              Page not found.
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted md:text-xl">
              Nothing lives at this address. It may have moved, or the link may be mistyped.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href="/"
                className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-8 text-base font-semibold text-background transition-opacity hover:opacity-90"
              >
                Back to the homepage
              </Link>
              <Link
                href="/research"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-8 text-base font-medium transition-colors hover:bg-surface"
              >
                Read the research
              </Link>
            </div>
          </div>
        </section>
      </main>
      <AlphaFooter />
    </>
  );
}
