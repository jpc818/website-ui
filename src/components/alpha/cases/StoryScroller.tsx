"use client";

import { useEffect, useRef, useState } from "react";
import { BarometerArt } from "@/components/alpha/cases/BarometerArt";
import { GoldRushArt } from "@/components/alpha/cases/GoldRushArt";
import { stories, type StoryStep } from "@/components/alpha/cases/stories";
import { WolfArt } from "@/components/alpha/cases/WolfArt";

const arts = { call: GoldRushArt, exotic: BarometerArt, failed: WolfArt };

export type StoryTheme = { panel: string; accent: string; chipBg: string; chipText: string };

export function StoryScroller({ id, theme }: { id: keyof typeof stories; theme: StoryTheme }) {
  const steps: StoryStep[] = stories[id].steps;
  const Art = arts[id];
  const [active, setActive] = useState(0);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.step));
        }
      },
      { rootMargin: "-55% 0px -35% 0px" },
    );
    itemRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const step = steps[active];
  return (
    <div className="relative mt-12 lg:grid lg:grid-cols-[1.4fr_1fr] lg:gap-12">
      <div className="sticky top-16 z-0 -mx-5 h-[52svh] sm:-mx-6 lg:top-[max(6rem,calc(50vh-18rem))] lg:mx-0 lg:h-[min(calc(100vh-8rem),36rem)]">
        <div
          aria-hidden="true"
          className="relative h-full overflow-hidden border-y border-white/8 lg:rounded-3xl lg:border"
          style={{ background: theme.panel }}
        >
          <Art step={active} steps={steps} />
          <div className="absolute inset-x-3 top-3 flex flex-wrap items-start justify-between gap-2 sm:inset-x-4 sm:top-4">
            <p className="rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-lg sm:text-sm" style={{ background: theme.chipBg, color: theme.chipText }}>
              {step.caption}
            </p>
            <div className="flex flex-col items-end gap-1.5">
              {step.scores.map((score) => (
                <p key={score.name} className="rounded-full bg-black/70 px-3 py-1 text-[11px] font-semibold text-white sm:text-xs">
                  {score.name}: <span style={{ color: theme.accent }}>{score.rank}</span>
                </p>
              ))}
              {step.next && (
                <p className="rounded-full bg-black/70 px-3 py-1 text-[11px] font-semibold text-white sm:text-xs">
                  Next 3 sessions: <span style={{ color: theme.accent }}>{step.next}</span>
                </p>
              )}
            </div>
          </div>
          <div className="absolute inset-x-4 bottom-3 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
            {steps.map((s, i) => (
              <span
                key={s.label}
                className="h-1 rounded-full transition-colors duration-500"
                style={{ background: i <= active ? theme.accent : "rgba(255,255,255,0.18)" }}
              />
            ))}
          </div>
        </div>
      </div>

      <ol className="relative z-10 pb-[30svh] lg:pb-[30vh]">
        {steps.map((s, i) => (
          <li
            key={s.label}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            data-step={i}
            className="flex min-h-[80svh] items-end pb-[6svh] lg:min-h-[80vh] lg:items-center lg:pb-0"
          >
            <div
              className={`rounded-3xl border p-6 shadow-[0_20px_60px_rgba(0,0,0,0.55)] transition-colors duration-500 md:p-7 lg:shadow-none ${
                i === active ? "bg-surface/95" : "border-white/8 bg-surface/90 lg:bg-surface/60"
              }`}
              style={i === active ? { borderColor: theme.accent } : undefined}
            >
              <p className="font-mono text-sm" style={{ color: theme.accent }}>
                {String(i + 1).padStart(2, "0")} · {s.label}
              </p>
              <h3 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-bold leading-tight md:text-3xl">{s.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-muted md:text-lg">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
