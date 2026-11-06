import Link from "next/link";
import { AlphaFooter } from "@/components/alpha/AlphaFooter";
import { AlphaHeader } from "@/components/alpha/AlphaHeader";
import { CaseEvidence } from "@/components/alpha/CaseEvidence";
import { CaseNav } from "@/components/alpha/cases/CaseNav";
import { CasePosters } from "@/components/alpha/cases/CasePosters";
import { StoryScroller, type StoryTheme } from "@/components/alpha/cases/StoryScroller";
import { caseIndex, stories } from "@/components/alpha/cases/stories";

export const themes: Record<keyof typeof stories, StoryTheme & { heroGlow: string }> = {
  call: {
    panel: "linear-gradient(180deg, #4a2c17 0%, #2a1d14 100%)",
    accent: "#fbbf24",
    chipBg: "#fbbf24",
    chipText: "#1c1917",
    heroGlow: "radial-gradient(ellipse at 80% 0%, rgba(251,191,36,0.18), transparent 60%)",
  },
  exotic: {
    panel: "linear-gradient(180deg, #0b1220 0%, #1e293b 100%)",
    accent: "#5eead4",
    chipBg: "#5eead4",
    chipText: "#042f2e",
    heroGlow: "radial-gradient(ellipse at 80% 0%, rgba(94,234,212,0.16), transparent 60%)",
  },
  failed: {
    panel: "linear-gradient(180deg, #050814 0%, #0b1020 100%)",
    accent: "#a5b4fc",
    chipBg: "#e2e8f0",
    chipText: "#0b1020",
    heroGlow: "radial-gradient(ellipse at 80% 0%, rgba(165,180,252,0.16), transparent 60%)",
  },
};

export function CaseStoryPage({ id }: { id: keyof typeof stories }) {
  const meta = caseIndex.find((c) => c.id === id)!;
  const story = stories[id];
  const theme = themes[id];
  return (
    <>
      <AlphaHeader />
      <main>
        <section aria-labelledby="case-title" className="relative pt-28 md:pt-36" style={{ background: theme.heroGlow }}>
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <nav aria-label="Breadcrumb" className="text-sm text-muted">
              <Link href="/case-studies" className="underline-offset-4 hover:text-foreground hover:underline">
                Case studies
              </Link>
              <span aria-hidden="true"> / </span>
              <span>{meta.kind}</span>
            </nav>
            <p className="mt-6 text-sm font-semibold uppercase tracking-wider" style={{ color: theme.accent }}>
              Case study {meta.n} of 4 · {meta.kind} · {meta.theme}
            </p>
            <h1
              id="case-title"
              className="mt-3 max-w-3xl text-balance font-[family-name:var(--font-heading)] text-[clamp(2.25rem,6vw,4rem)] font-extrabold leading-[1.05] tracking-tight"
            >
              {meta.title}
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted md:text-xl">{story.intro}</p>
            <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-foreground">
              A real event from the held-out stretch (January 2025 to October 2026), which the model never saw in
              training. We name the stock and the month. Posters are described by profile, never by account. It&apos;s
              an illustration, not a recommendation, and not a trade we made: live trading began in October 2026.
            </p>
            <CasePosters id={id} accent={theme.accent} />

            <StoryScroller id={id} theme={theme} />
          </div>
        </section>

        <section aria-labelledby="moral-title" className="border-t border-white/8 py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <h2 id="moral-title" className="text-sm font-semibold uppercase tracking-wider" style={{ color: theme.accent }}>
              The moral
            </h2>
            <p className="mt-4 max-w-4xl text-balance font-[family-name:var(--font-heading)] text-[clamp(1.5rem,3.6vw,2.5rem)] font-bold leading-snug">
              {story.moral}
            </p>
          </div>
        </section>

        <section aria-labelledby="numbers-title" className="border-t border-white/8 py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-cyan">The numbers</p>
            <h2
              id="numbers-title"
              className="mt-3 max-w-3xl text-balance font-[family-name:var(--font-heading)] text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-[1.1] tracking-tight"
            >
              The same event, without the metaphor.
            </h2>
            <div className="mt-8">
              <CaseEvidence id={id} />
            </div>
          </div>
        </section>

        <section aria-labelledby="more-title" className="border-t border-white/8 py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <h2 id="more-title" className="font-[family-name:var(--font-heading)] text-2xl font-bold md:text-3xl">
              All four case studies
            </h2>
            <div className="mt-6">
              <CaseNav current={id} />
            </div>
          </div>
        </section>
      </main>
      <AlphaFooter />
    </>
  );
}
