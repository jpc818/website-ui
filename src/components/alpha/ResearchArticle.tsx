import Link from "next/link";
import type { ReactNode } from "react";
import { AlphaFooter } from "@/components/alpha/AlphaFooter";
import { AlphaHeader } from "@/components/alpha/AlphaHeader";

export function ResearchArticle({
  eyebrow,
  title,
  published,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  published: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <AlphaHeader />
      <main id="main">
        <article aria-labelledby="article-title" className="pt-32 pb-20 md:pt-40 md:pb-28">
          <div className="mx-auto max-w-3xl px-5 sm:px-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-cyan">
              <Link href="/research#notes" className="hover:text-foreground">
                Research
              </Link>{" "}
              · {eyebrow}
            </p>
            <h1
              id="article-title"
              className="mt-3 text-balance font-[family-name:var(--font-heading)] text-[clamp(2.25rem,6vw,3.5rem)] font-extrabold leading-[1.1] tracking-tight"
            >
              {title}
            </h1>
            <p className="mt-4 font-mono text-sm text-muted">Published {published}</p>
            <p className="mt-6 text-pretty text-lg leading-relaxed text-muted md:text-xl">{intro}</p>
            <div className="mt-10 space-y-6 text-base leading-relaxed text-muted md:text-lg [&_a]:font-semibold [&_a]:text-accent [&_a]:underline [&_a]:decoration-accent/40 [&_a]:underline-offset-4 [&_a:hover]:decoration-accent [&_h2]:pt-6 [&_h2]:font-[family-name:var(--font-heading)] [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-foreground md:[&_h2]:text-3xl [&_ol>li]:ml-5 [&_ol>li]:list-decimal [&_ol>li]:pl-1 [&_ol]:space-y-3 [&_strong]:text-foreground [&_ul>li]:ml-5 [&_ul>li]:list-disc [&_ul>li]:pl-1 [&_ul]:space-y-3">
              {children}
            </div>
          </div>
        </article>
      </main>
      <AlphaFooter />
    </>
  );
}
