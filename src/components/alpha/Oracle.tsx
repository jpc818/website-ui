"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { AccuracyChart } from "@/components/alpha/AccuracyChart";
import { GhostGame } from "@/components/alpha/GhostGame";
import { SectionHeading } from "@/components/alpha/SectionHeading";

type Move = 0 | 1;

const MAX_ORDER = 5;
const MIN_FOR_SCORE = 10;
const VERDICT_AT = 50;
const STRIP = 40;
const moveLabel = ["Left", "Right"] as const;
const moveArrow = ["←", "→"] as const;

type State = {
  history: Move[];
  hits: boolean[];
  counts: Record<string, [number, number]>;
  guess: Move;
  last: { move: Move; guess: Move } | null;
};

const initialState: State = { history: [], hits: [], counts: {}, guess: 0, last: null };

function predict(history: Move[], counts: State["counts"]): Move {
  for (let order = Math.min(MAX_ORDER, history.length); order >= 1; order--) {
    const seen = counts[`${order}:${history.slice(-order).join("")}`];
    if (seen && seen[0] !== seen[1]) return seen[0] > seen[1] ? 0 : 1;
  }
  const lastMove = history[history.length - 1];
  return lastMove === undefined ? 0 : ((1 - lastMove) as Move);
}

function reducer(state: State, action: { type: "press"; move: Move } | { type: "reset" }): State {
  if (action.type === "reset") return initialState;
  const { move } = action;
  const counts = { ...state.counts };
  for (let order = 1; order <= Math.min(MAX_ORDER, state.history.length); order++) {
    const key = `${order}:${state.history.slice(-order).join("")}`;
    const seen: [number, number] = counts[key] ? [...counts[key]] : [0, 0];
    seen[move] += 1;
    counts[key] = seen;
  }
  const history = [...state.history, move];
  return {
    history,
    hits: [...state.hits, move === state.guess],
    counts,
    guess: predict(history, counts),
    last: { move, guess: state.guess },
  };
}

type Mode = "ghost" | "tap";

export function Oracle() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [mode, setMode] = useState<Mode>("ghost");
  const modeRef = useRef<Mode>(mode);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useRef(false);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView.current = entry.isIntersecting;
      },
      { threshold: 0.4 },
    );
    observer.observe(section);

    const onKey = (event: KeyboardEvent) => {
      if (!inView.current || modeRef.current !== "tap" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      const key = event.key.toLowerCase();
      const move = key === "arrowleft" || key === "f" ? 0 : key === "arrowright" || key === "j" ? 1 : null;
      if (move === null) return;
      event.preventDefault();
      dispatch({ type: "press", move });
    };
    window.addEventListener("keydown", onKey);
    return () => {
      observer.disconnect();
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const total = state.hits.length;
  const correct = state.hits.filter(Boolean).length;
  const share = total ? correct / total : 0;
  const scored = total >= MIN_FOR_SCORE;
  const recent = state.hits.slice(-STRIP);

  let verdict = "";
  if (total >= VERDICT_AT) {
    verdict =
      share >= 0.55
        ? "You're more predictable than you think."
        : share <= 0.45
          ? "Remarkably hard to read. Keep going and see if it holds."
          : "Right around chance so far. Patterns usually show up the longer you go.";
  }

  return (
    <section
      ref={sectionRef}
      id="oracle"
      aria-labelledby="oracle-title"
      className="border-t border-white/8 py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading id="oracle-title" eyebrow="Try it" title="Try to be unpredictable.">
          {mode === "ghost"
            ? "Tap any square, as randomly as you can. Before every tap, the Ghost seals a guess about which square you'll pick, and shows it only after you've tapped. Pure luck would catch you one time in nine. See how predictable you really are."
            : "Tap left or right, as randomly as you can. Before every tap, a tiny model locks in a guess based on your last few moves. A coin flip would catch you 50% of the time. See where you land."}
        </SectionHeading>

        <div role="group" aria-label="Game mode" className="mt-8 inline-flex rounded-full border border-white/15 bg-surface p-1">
          {(
            [
              ["ghost", "Beat the Ghost"],
              ["tap", "Left or Right"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                mode === value ? "bg-accent text-background" : "text-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "ghost" ? (
          <GhostGame />
        ) : (
        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1.1fr]">
          <div className="flex flex-col rounded-3xl border border-white/8 bg-surface p-6 md:p-8">
            <div className="grid grid-cols-2 gap-3">
              {([0, 1] as Move[]).map((move) => (
                <button
                  key={move}
                  type="button"
                  onClick={() => dispatch({ type: "press", move })}
                  className="flex h-32 touch-manipulation select-none flex-col items-center justify-center gap-1 rounded-2xl border border-white/15 bg-background text-foreground transition-[transform,border-color] active:scale-[0.97] hover:border-cyan/60 sm:h-40"
                >
                  <span aria-hidden="true" className="text-4xl leading-none">
                    {moveArrow[move]}
                  </span>
                  <span className="text-base font-semibold">{moveLabel[move]}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 hidden text-center text-sm text-muted md:block">
              Or use the arrow keys, or F and J.
            </p>

            <div aria-live="polite" className="mt-6 min-h-16 rounded-2xl bg-white/[0.04] px-5 py-4">
              {state.last ? (
                <p className="text-base">
                  You went{" "}
                  <span className="font-semibold">{moveLabel[state.last.move]}</span>. It had
                  guessed{" "}
                  <span className="font-semibold">{moveLabel[state.last.guess]}</span>.{" "}
                  {state.last.move === state.last.guess ? (
                    <span className="font-semibold text-cyan">Called it.</span>
                  ) : (
                    <span className="font-semibold text-muted">You got away.</span>
                  )}
                </p>
              ) : (
                <p className="text-base text-muted">
                  Its first guess is already locked in. Make your move.
                </p>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-1.5" aria-hidden="true">
              {Array.from({ length: STRIP }, (_, i) => {
                const hit = recent[i];
                return (
                  <span
                    key={i}
                    className={`h-2.5 w-2.5 rounded-full ${
                      hit === undefined ? "bg-white/8" : hit ? "bg-cyan" : "bg-white/30"
                    }`}
                  />
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted">
              Last {STRIP} moves: <span className="text-cyan">predicted</span> vs. got away.
            </p>
          </div>

          <div className="flex flex-col rounded-3xl border border-white/8 bg-surface p-6 md:p-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-muted">
                  Moves predicted
                </p>
                <p className="mt-1 font-[family-name:var(--font-heading)] text-6xl font-extrabold tabular-nums md:text-7xl">
                  {scored ? `${Math.round(share * 100)}%` : "—"}
                </p>
              </div>
              <div className="text-right text-sm text-muted">
                <p className="tabular-nums">
                  {correct} of {total}
                </p>
                <p>Chance: 50%</p>
              </div>
            </div>
            <p
              className={`mt-2 min-h-6 ${verdict ? "text-lg font-semibold text-accent" : "text-base text-muted"}`}
            >
              {scored
                ? verdict || `Keep going. ${VERDICT_AT - total} more for a verdict.`
                : `${MIN_FOR_SCORE - total} more ${MIN_FOR_SCORE - total === 1 ? "move" : "moves"} before we show a score.`}
            </p>

            <div className="mt-6 flex-1 rounded-2xl border border-white/5 bg-background/60 p-4">
              <AccuracyChart hits={state.hits} label="Running share of your moves the model predicted, compared with the 50% chance line" />
              <div className="mt-2 flex justify-between text-xs text-muted">
                <span>Your moves over time</span>
                <span>dashed line = coin flip</span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted">
                Runs entirely in your browser. Nothing is sent anywhere.
              </p>
              <button
                type="button"
                onClick={() => dispatch({ type: "reset" })}
                className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium hover:bg-white/5"
              >
                Start over
              </button>
            </div>
          </div>
        </div>
        )}
      </div>
    </section>
  );
}
