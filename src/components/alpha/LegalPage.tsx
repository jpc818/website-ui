import Link from "next/link";
import type { ReactNode } from "react";
import { AlphaFooter } from "@/components/alpha/AlphaFooter";
import { Logo } from "@/components/Logo";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <>
      <header className="border-b border-white/8">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5 sm:px-6">
          <Link href="/" className="text-xl" aria-label="jargAI home">
            <Logo />
          </Link>
          <Link href="/" className="text-sm font-medium text-muted hover:text-foreground">
            ← Back to jargAI
          </Link>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-6 md:py-20">
        <h1 className="font-[family-name:var(--font-heading)] text-[clamp(2rem,6vw,3rem)] font-bold leading-[1.1] tracking-tight">
          {title}
        </h1>
        <p className="mt-3 font-mono text-sm text-muted">Last updated {updated}</p>
        <div className="mt-10 space-y-6 text-base leading-relaxed text-muted md:text-lg [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 [&_h2]:pt-4 [&_h2]:font-[family-name:var(--font-heading)] [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground md:[&_h2]:text-2xl [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_ul]:space-y-2">
          {children}
        </div>
      </main>
      <AlphaFooter />
    </>
  );
}
