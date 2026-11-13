"use client";

import { useEffect, useReducer, useRef, useState, type KeyboardEvent } from "react";
import { AccuracyChart } from "@/components/alpha/AccuracyChart";
import { drawShareCard } from "@/components/alpha/shareCard";

// Squares are numbered 0..8, left to right, top to bottom. `ms` is the time since the previous tap.
type Round = { cell: number; guess: number; ms: number | null };

const CELLS = 9;
const CHANCE = 1 / CELLS;
const MIN_FOR_METER = 8;
const MIN_FOR_SHARE = 20;
const VERDICT_AT = 30;
const STRIP = 40;
const FLASH_MS = 900;
const DECAY = 0.9;
const HISTORY_CAP = 200;
const SCORING_WINDOW = 60;
const MAX_PAUSE_MS = 10_000;
const COLOUR_ARM_MS = 700;
// `popularity` is the rough share of people naming it as their favourite in large international surveys.
// `ink` is the label colour that stays readable on that swatch.
const colours = [
  { name: "red", fill: "#ef4444", ink: "dark", popularity: 0.12 },
  { name: "yellow", fill: "#facc15", ink: "dark", popularity: 0.05 },
  { name: "blue", fill: "#3b82f6", ink: "dark", popularity: 0.35 },
  { name: "green", fill: "#22c55e", ink: "dark", popularity: 0.15 },
  { name: "white", fill: "#f8fafc", ink: "dark", popularity: 0.04 },
  { name: "orange", fill: "#f97316", ink: "dark", popularity: 0.05 },
  { name: "purple", fill: "#a855f7", ink: "dark", popularity: 0.12 },
  { name: "black", fill: "#0b0d12", ink: "light", popularity: 0.07 },
  { name: "pink", fill: "#ec4899", ink: "dark", popularity: 0.05 },
];

const spots = [
  "top left",
  "top middle",
  "top right",
  "middle left",
  "centre",
  "middle right",
  "bottom left",
  "bottom middle",
  "bottom right",
];

const row = (c: number) => Math.floor(c / 3);
const col = (c: number) => c % 3;
const shiftIndex = (from: number, to: number) => ((row(to) - row(from) + 3) % 3) * 3 + ((col(to) - col(from) + 3) % 3);
const applyShift = (from: number, shift: number) => (((row(from) + Math.floor(shift / 3)) % 3) * 3 + ((col(from) + (shift % 3)) % 3));

type Predictor = (rounds: Round[]) => number | null;

function argmax(counts: number[]): number | null {
  const best = Math.max(...counts);
  if (best === 0) return null;
  const top = counts.flatMap((c, i) => (c === best ? [i] : []));
  return top.length === 1 ? top[0] : null;
}

const frequency: Predictor = (rounds) => {
  const counts = new Array(CELLS).fill(0);
  for (const r of rounds) counts[r.cell] += 1;
  return argmax(counts);
};

const sequence =
  (order: number): Predictor =>
  (rounds) => {
    if (rounds.length <= order) return null;
    const key = (end: number) => rounds.slice(end - order, end).map((r) => r.cell).join(",");
    const context = key(rounds.length);
    const counts = new Array(CELLS).fill(0);
    for (let i = order; i < rounds.length; i++) if (key(i) === context) counts[rounds[i].cell] += 1;
    return argmax(counts);
  };

// The usual hop from one square to the next (a step down, a step right, a jump to the far corner...).
const step: Predictor = (rounds) => {
  if (rounds.length < 2) return null;
  const counts = new Array(CELLS).fill(0);
  for (let i = 1; i < rounds.length; i++) counts[shiftIndex(rounds[i - 1].cell, rounds[i].cell)] += 1;
  const shift = argmax(counts);
  return shift === null ? null : applyShift(rounds[rounds.length - 1].cell, shift);
};

// The hop that tends to follow the previous hop.
const stepAfterStep: Predictor = (rounds) => {
  if (rounds.length < 3) return null;
  const hop = (i: number) => shiftIndex(rounds[i - 1].cell, rounds[i].cell);
  const last = hop(rounds.length - 1);
  const counts = new Array(CELLS).fill(0);
  for (let i = 2; i < rounds.length; i++) if (hop(i - 1) === last) counts[hop(i)] += 1;
  const shift = argmax(counts);
  return shift === null ? null : applyShift(rounds[rounds.length - 1].cell, shift);
};

// What the player does after the Ghost got it right, or got it wrong, from the same square.
const afterResult: Predictor = (rounds) => {
  if (rounds.length < 2) return null;
  const last = rounds[rounds.length - 1];
  const hit = last.cell === last.guess;
  const counts = new Array(CELLS).fill(0);
  for (let i = 1; i < rounds.length; i++) {
    const prev = rounds[i - 1];
    if (prev.cell === last.cell && (prev.cell === prev.guess) === hit) counts[rounds[i].cell] += 1;
  }
  return argmax(counts);
};

const predictors: Predictor[] = [frequency, sequence(1), sequence(2), sequence(3), step, stepAfterStep, afterResult];

// Each habit is replayed on the past only. The one that has been right most recently (older rounds count for less)
// makes the call. Nothing in the call can see the square it is about to be scored on.
function guessNext(all: Round[]): number {
  const rounds = all.slice(-HISTORY_CAP);
  const scores = predictors.map(() => 0);
  for (let t = Math.max(1, rounds.length - SCORING_WINDOW); t < rounds.length; t++) {
    const past = rounds.slice(0, t);
    predictors.forEach((predict, i) => {
      scores[i] = scores[i] * DECAY + (predict(past) === rounds[t].cell ? 1 : 0);
    });
  }
  const order = scores.map((s, i) => [s, i] as const).sort((a, b) => b[0] - a[0]);
  for (const [, i] of order) {
    const guess = predictors[i](rounds);
    if (guess !== null) return guess;
  }
  return 4;
}

const pct = (n: number) => `${Math.round(n * 100)}%`;
const rate = (part: number, whole: number) => (whole ? part / whole : 0);
const caughtShare = (rounds: Round[]) => rate(rounds.filter((r) => r.cell === r.guess).length, rounds.length);

function hopName(shift: number) {
  const down = Math.floor(shift / 3);
  const right = shift % 3;
  return [down === 1 ? "down" : down === 2 ? "up" : "", right === 1 ? "right" : right === 2 ? "left" : ""]
    .filter(Boolean)
    .join(" and ");
}

// Plain-language habits, each measured against what truly random tapping would do. Only notable ones are reported.
function readHabits(rounds: Round[]): string[] {
  const habits: string[] = [];
  const hops = rounds.slice(1).map((r, i) => shiftIndex(rounds[i].cell, r.cell));

  const repeats = rate(hops.filter((h) => h === 0).length, hops.length);
  habits.push(
    `You tapped the same square twice in a row ${pct(repeats)} of the time. Random tapping would do that about ${pct(CHANCE)}${
      repeats < CHANCE / 2 ? ", but repeats don't feel random, so most people avoid them" : ""
    }.`,
  );

  const centre = rate(rounds.filter((r) => r.cell === 4).length, rounds.length);
  const corners = rate(rounds.filter((r) => [0, 2, 6, 8].includes(r.cell)).length, rounds.length);
  const zones = [
    { name: "the centre", share: centre, expected: 1 / 9 },
    { name: "the corners", share: corners, expected: 4 / 9 },
    { name: "the edge squares", share: 1 - centre - corners, expected: 4 / 9 },
  ];
  const zone = zones.sort((a, b) => Math.abs(b.share - b.expected) - Math.abs(a.share - a.expected))[0];
  if (Math.abs(zone.share - zone.expected) >= 0.08) {
    habits.push(
      `You ${zone.share > zone.expected ? "lean towards" : "steer clear of"} ${zone.name}: ${pct(zone.share)} of your taps, against ${pct(zone.expected)} by chance.`,
    );
  }

  const hopCounts = new Array(CELLS).fill(0);
  for (const h of hops) if (h !== 0) hopCounts[h] += 1;
  const favourite = hopCounts.indexOf(Math.max(...hopCounts));
  const favouriteShare = rate(hopCounts[favourite], hops.length);
  if (favouriteShare >= 0.2) {
    habits.push(
      `Your go-to move is one square ${hopName(favourite)} (wrapping round the edges): ${pct(favouriteShare)} of your moves, against ${pct(CHANCE)} by chance.`,
    );
  }

  const nextAfter = (caught: boolean) => rounds.slice(1).filter((_, i) => (rounds[i].cell === rounds[i].guess) === caught);
  const afterCatch = nextAfter(true);
  const afterEscape = nextAfter(false);
  const [c, e] = [caughtShare(afterCatch), caughtShare(afterEscape)];
  if (afterCatch.length >= 5 && afterEscape.length >= 5 && Math.abs(c - e) >= 0.1) {
    habits.push(
      c > e
        ? `Getting caught rattles you. Right after the Ghost calls a tap, it calls the next one ${pct(c)} of the time, against ${pct(e)} after you get away.`
        : `You regroup after getting caught. The Ghost calls only ${pct(c)} of your taps right after a catch, against ${pct(e)} after you get away.`,
    );
  }

  const timed = rounds.filter((r) => r.ms !== null);
  if (timed.length >= 20) {
    const times = timed.map((r) => r.ms ?? 0).sort((a, b) => a - b);
    const median = times[Math.floor(times.length / 2)];
    const slow = caughtShare(timed.filter((r) => (r.ms ?? 0) > median));
    const fast = caughtShare(timed.filter((r) => (r.ms ?? 0) <= median));
    if (Math.abs(slow - fast) >= 0.1) {
      habits.push(
        slow > fast
          ? `Thinking harder doesn't help. The Ghost called ${pct(slow)} of your slower taps, against ${pct(fast)} of your quick ones.`
          : `You're harder to read when you slow down. The Ghost called ${pct(slow)} of your slower taps, against ${pct(fast)} of your quick ones.`,
      );
    }
  }

  return habits;
}

type Signal = "crowd" | "contrarian" | "habit";
type ColourRound = { guess: number; why: Record<Signal, number>; pick: number | null };

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const normalise = (xs: number[]) => {
  const sum = xs.reduce((a, b) => a + b, 0);
  return xs.map((x) => x / sum);
};

// Three opinions about which colour square gets picked, mixed by how much the grid game says each one applies.
//   crowd:      how popular each colour is.
//   contrarian: the reverse, for players who spent the grid game dodging the obvious (repeats, the centre).
//   habit:      the squares this player drifts to, plus the square the Ghost would have guessed next.
function sealColour(rounds: Round[], nextGuess: number): ColourRound {
  const repeats = rate(rounds.slice(1).filter((r, i) => r.cell === rounds[i].cell).length, rounds.length - 1);
  const centre = rate(rounds.filter((r) => r.cell === 4).length, rounds.length);
  const contrarian = (clamp01(1 - repeats / CHANCE) + clamp01(1 - centre / CHANCE)) / 2;
  const readable = clamp01((caughtShare(rounds) - CHANCE) / (0.4 - CHANCE));

  const crowd = colours.map((c) => c.popularity);
  const rare = normalise(crowd.map((p) => 1 / p));
  const heat = normalise(Array.from({ length: CELLS }, (_, i) => rounds.filter((r) => r.cell === i).length + 0.01));
  const habit = heat.map((h, i) => (h + (i === nextGuess ? 1 : 0)) / 2);

  const weights: Record<Signal, number> = { crowd: 0, contrarian: 0, habit: 0.6 * readable };
  weights.contrarian = (1 - weights.habit) * 0.8 * contrarian;
  weights.crowd = 1 - weights.habit - weights.contrarian;
  const views: Record<Signal, number[]> = { crowd, contrarian: rare, habit };

  const scores = Array.from({ length: CELLS }, (_, i) =>
    (Object.keys(views) as Signal[]).reduce((s, k) => s + weights[k] * views[k][i], 0),
  );
  const guess = scores.indexOf(Math.max(...scores));
  const why = { crowd: 0, contrarian: 0, habit: 0 };
  for (const k of Object.keys(views) as Signal[]) why[k] = (weights[k] * views[k][guess]) / scores[guess];
  return { guess, why, pick: null };
}

const signals: { key: Signal; label: string }[] = [
  { key: "crowd", label: "How popular it is" },
  { key: "contrarian", label: "Your contrarian streak" },
  { key: "habit", label: "Your favourite squares" },
];

function signalStory({ guess, why }: ColourRound) {
  const { name, popularity } = colours[guess];
  const top = signals.reduce((a, b) => (why[b.key] > why[a.key] ? b : a)).key;
  if (top === "crowd") return `Mostly the crowd: about ${pct(popularity)} of people name ${name} as their favourite colour in large surveys.`;
  if (top === "contrarian")
    return `You spent the grid game avoiding the obvious, barely repeating a square or touching the centre, so it expected you to dodge the popular colours too. Only about ${pct(popularity)} of people pick ${name}.`;
  return `Mostly your habits: it never guessed a colour, it guessed the square your taps kept pointing to, the ${spots[guess]}, and ${name} happened to be sitting there.`;
}

type State = {
  rounds: Round[];
  hits: boolean[];
  guess: number;
  streak: number;
  bestStreak: number;
  phase: "sealed" | "reveal";
  round: number; // changes with every tap so the reveal timer restarts
  last: { cell: number; guess: number } | null;
  colour: ColourRound | null;
  colourOffered: boolean;
};

const initialState: State = {
  rounds: [],
  hits: [],
  guess: 4,
  streak: 0,
  bestStreak: 0,
  phase: "sealed",
  round: 0,
  last: null,
  colour: null,
  colourOffered: false,
};

type Action =
  | { type: "tap"; cell: number; ms: number | null }
  | { type: "next" }
  | { type: "reset" }
  | { type: "colourRound" }
  | { type: "backToGrid" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "reset":
      return { ...initialState, round: state.round + 1 };
    case "next":
      if (state.phase !== "reveal") return state;
      // The final round opens by itself the first time the player reaches it.
      if (state.hits.length >= VERDICT_AT && !state.colourOffered) {
        return { ...state, phase: "sealed", colourOffered: true, colour: sealColour(state.rounds, state.guess) };
      }
      return { ...state, phase: "sealed" };
    case "colourRound":
      // Sealed before the colours are shown.
      return { ...state, phase: "sealed", colourOffered: true, colour: sealColour(state.rounds, state.guess) };
    case "backToGrid":
      return { ...state, colour: null };
    case "tap": {
      if (state.colour) {
        return state.colour.pick === null ? { ...state, colour: { ...state.colour, pick: action.cell } } : state;
      }
      // The guess for this round was fixed (and hidden) before the tap. It is only shown afterwards.
      const hit = action.cell === state.guess;
      const rounds = [...state.rounds, { cell: action.cell, guess: state.guess, ms: action.ms }];
      const streak = hit ? state.streak + 1 : 0;
      return {
        rounds,
        hits: [...state.hits, hit],
        guess: guessNext(rounds),
        streak,
        bestStreak: Math.max(state.bestStreak, streak),
        phase: "reveal",
        round: state.round + 1,
        last: { cell: action.cell, guess: state.guess },
        colour: null,
        colourOffered: state.colourOffered,
      };
    }
  }
}

function GhostIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" className={className}>
      <path d="M12 54 V30 a20 20 0 0 1 40 0 V54 l-6.7 -6 -6.6 6 -6.7 -6 -6.7 6 -6.6 -6 z" fill="currentColor" />
      <circle cx="24.5" cy="30" r="4" fill="#090b0f" />
      <circle cx="39.5" cy="30" r="4" fill="#090b0f" />
    </svg>
  );
}

function sinceLastTap(lastTap: { current: number | null }): number | null {
  const now = performance.now();
  const ms = lastTap.current === null ? null : now - lastTap.current;
  lastTap.current = now;
  return ms !== null && ms <= MAX_PAUSE_MS ? ms : null;
}

export function GhostGame() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [shareNote, setShareNote] = useState("");
  const [sharing, setSharing] = useState(false);
  const lastTapRef = useRef<number | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const colourOpenRef = useRef(false);
  const colourShownAtRef = useRef(0);
  // Taps landing right after the colours appear are leftovers from fast grid tapping, not a choice.
  const colourArmed = () => performance.now() - colourShownAtRef.current > COLOUR_ARM_MS;

  const colourOpen = state.colour !== null;
  useEffect(() => {
    colourOpenRef.current = colourOpen;
    if (!colourOpen) return;
    colourShownAtRef.current = performance.now();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    boardRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  }, [colourOpen]);

  // Only while focus is on the board: screen readers use number keys to jump between headings.
  const onBoardKey = (event: KeyboardEvent) => {
    if (event.metaKey || event.ctrlKey || event.altKey || !/^[1-9]$/.test(event.key)) return;
    event.preventDefault();
    if (colourOpenRef.current && performance.now() - colourShownAtRef.current <= COLOUR_ARM_MS) return;
    dispatch({ type: "tap", cell: Number(event.key) - 1, ms: sinceLastTap(lastTapRef) });
  };

  // After the reveal, seal the next guess again.
  useEffect(() => {
    if (state.phase !== "reveal") return;
    const id = window.setTimeout(() => dispatch({ type: "next" }), FLASH_MS);
    return () => window.clearTimeout(id);
  }, [state.phase, state.round]);

  const total = state.hits.length;
  const called = state.hits.filter(Boolean).length;
  const share = total ? called / total : 0;
  const metered = total >= MIN_FOR_METER;
  const recent = state.hits.slice(-STRIP);
  const taps = Array.from({ length: CELLS }, (_, i) => state.rounds.filter((r) => r.cell === i).length);
  const chancePercent = Math.round(CHANCE * 100);
  const last = state.last;
  const revealing = state.phase === "reveal" && last !== null;
  const hitNow = revealing && last.cell === last.guess;
  const colour = state.colour;
  const colourPicked = colour !== null && colour.pick !== null;
  const habits = total >= VERDICT_AT ? readHabits(state.rounds) : [];

  const tapsLeft = (n: number) => `${n} more ${n === 1 ? "tap" : "taps"}`;
  const progressLabel =
    colour && !colourPicked
      ? "Final round: pick your favourite colour"
      : total < MIN_FOR_METER
        ? `${tapsLeft(MIN_FOR_METER - total)} until your score appears`
        : total < VERDICT_AT
          ? `${tapsLeft(VERDICT_AT - total)} until the final round`
          : !state.colourOffered
            ? "Final round coming up…"
            : "All rounds done. Keep tapping to sharpen the Ghost's read, or replay the colour test.";

  let verdict = "";
  if (total >= VERDICT_AT) {
    verdict =
      share >= 0.25
        ? "You're a creature of habit."
        : share <= 0.15
          ? "Hard to read. Keep going and see if it holds."
          : "Not far above luck so far. Patterns usually show up the longer you go.";
  }

  const shareText = `I was ${Math.round(share * 100)}% predictable. Can you beat the Ghost?`;

  const shareResult = async () => {
    setSharing(true);
    setShareNote("");
    try {
      const blob = await drawShareCard({ percent: Math.round(share * 100), called, total, chancePercent, taps });
      const file = new File([blob], "jargai-ghost.png", { type: "image/png" });
      const url = "https://jarg.ai/lab#oracle";
      const withImage = { files: [file], text: `${shareText} ${url}`, title: "jargAI Ghost" };
      if (typeof navigator.canShare === "function" && navigator.canShare(withImage)) {
        await navigator.share(withImage);
      } else if (typeof navigator.share === "function") {
        await navigator.share({ text: shareText, url });
      } else {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "jargai-ghost.png";
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(link.href), 2000);
        setShareNote("Saved your card as an image.");
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) setShareNote("Couldn't make the card. Try again.");
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1.1fr]">
      <div className="rounded-3xl border border-white/8 bg-surface px-6 py-4 lg:col-span-2">
        <div className="flex items-baseline justify-between gap-4 text-sm">
          <p className="font-semibold">{progressLabel}</p>
          <p className="shrink-0 tabular-nums text-muted">
            {Math.min(total, VERDICT_AT)} / {VERDICT_AT} taps
          </p>
        </div>
        <div
          role="progressbar"
          aria-label="Taps until the final colour round"
          aria-valuemin={0}
          aria-valuemax={VERDICT_AT}
          aria-valuenow={Math.min(total, VERDICT_AT)}
          className="relative mt-2.5 h-2 rounded-full bg-white/10"
        >
          <div
            className={`h-full rounded-full transition-[width] duration-300 ${total >= VERDICT_AT ? "bg-accent" : "bg-cyan"}`}
            style={{ width: `${(Math.min(total, VERDICT_AT) / VERDICT_AT) * 100}%` }}
          />
          <span
            aria-hidden="true"
            className="absolute top-1/2 h-3.5 w-0.5 -translate-y-1/2 rounded-full bg-white/40"
            style={{ left: `${(MIN_FOR_METER / VERDICT_AT) * 100}%` }}
          />
        </div>
        <div className="relative mt-1.5 h-4 text-xs text-muted" aria-hidden="true">
          <span className="absolute -translate-x-1/2" style={{ left: `${(MIN_FOR_METER / VERDICT_AT) * 100}%` }}>
            Score
          </span>
          <span className="absolute right-0">Final round: colours</span>
        </div>
      </div>

      <div className="flex flex-col rounded-3xl border border-white/8 bg-surface p-6 md:p-8">
        <div ref={boardRef} className="mx-auto w-full max-w-sm">
          <div
            role="group"
            aria-label={colour ? "Colour board" : "Ghost board"}
            onKeyDown={onBoardKey}
            className="grid grid-cols-3 gap-2.5 sm:gap-3"
          >
            {colour
              ? colours.map(({ name, fill, ink }, cell) => {
                  const isGhost = colourPicked && colour.guess === cell;
                  const isPick = colourPicked && colour.pick === cell;
                  return (
                    <button
                      key={cell}
                      type="button"
                      disabled={colourPicked}
                      onClick={() => colourArmed() && dispatch({ type: "tap", cell, ms: null })}
                      style={{ backgroundColor: fill }}
                      className={`relative grid aspect-square touch-manipulation select-none place-items-center rounded-2xl border-2 transition-[transform,opacity] active:scale-[0.96] ${
                        isPick ? "border-cyan" : name === "black" ? "border-white/50" : "border-white/15"
                      } ${colourPicked && !isPick && !isGhost ? "opacity-30" : ""}`}
                    >
                      {isGhost && (
                        <GhostIcon className="ghost-mark h-1/2 w-1/2 text-white drop-shadow-[0_0_6px_rgba(0,0,0,0.8)]" />
                      )}
                      <span
                        className={`absolute inset-x-0 bottom-1.5 text-center text-sm font-semibold sm:bottom-2 ${
                          ink === "dark" ? "text-black" : "text-white"
                        }`}
                      >
                        {name}
                      </span>
                    </button>
                  );
                })
              : Array.from({ length: CELLS }, (_, cell) => {
              // Nothing on the board gives the guess away. It only appears here, after you have tapped.
              const isGhost = revealing && last.guess === cell;
              const isTap = revealing && last.cell === cell;
              let tone = "border-white/15 bg-background hover:border-cyan/50";
              if (isTap && hitNow) tone = "border-cyan bg-cyan/25";
              else if (isTap) tone = "border-white/60 bg-white/10";
              else if (isGhost) tone = "border-amber-400/70 bg-amber-400/10";
              return (
                <button
                  key={cell}
                  type="button"
                  aria-label={spots[cell]}
                  onClick={() => dispatch({ type: "tap", cell, ms: sinceLastTap(lastTapRef) })}
                  className={`relative grid aspect-square touch-manipulation select-none place-items-center rounded-2xl border transition-[transform,border-color,background-color] active:scale-[0.96] ${tone}`}
                >
                  {isGhost && (
                    <GhostIcon
                      key={state.round}
                      className={`ghost-mark h-1/2 w-1/2 ${hitNow ? "text-cyan" : "text-amber-400/80"}`}
                    />
                  )}
                  {isTap && !hitNow && (
                    <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
                      <span className="h-4 w-4 rounded-full bg-white" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2.5 text-sm text-muted">
          <GhostIcon className={`h-6 w-6 ${revealing && !colour ? "text-white/25" : "text-cyan/80"}`} />
          <span>
            {colour
              ? colourPicked
                ? "Colour test done."
                : "The Ghost has sealed a colour. Pick the one you like most."
              : revealing
                ? "Sealing its next guess…"
                : "The Ghost has sealed its guess. It stays hidden until you tap."}
          </span>
        </div>
        <p className="mt-2 hidden text-center text-xs text-muted md:block">
          Tab onto the board, then press 1 to 9 if you like.
        </p>

        <div aria-live="polite" className="mt-5 min-h-16 rounded-2xl bg-white/[0.04] px-5 py-4 text-base">
          {colour ? (
            colour.pick === null ? (
              <p className="text-muted">Final round: forget the game and just pick your favourite colour. Its guess is already sealed.</p>
            ) : (
              <>
                <p>
                  {colour.pick === colour.guess ? (
                    <>
                      <span className="font-semibold text-cyan">The Ghost called it.</span> It sealed {colours[colour.guess].name} before
                      you saw the colours.
                    </>
                  ) : (
                    <>
                      <span className="font-semibold">You got away.</span> You picked {colours[colour.pick].name}. It had sealed{" "}
                      {colours[colour.guess].name}.
                    </>
                  )}
                </p>
                <p className="mt-2 text-sm text-muted">{signalStory(colour)}</p>
                <div className="mt-3 space-y-1.5" role="list" aria-label="What went into the Ghost's colour guess">
                  {signals.map(({ key, label }) => (
                    <div key={key} role="listitem" className="grid grid-cols-[9rem_1fr_2.5rem] items-center gap-2 text-xs text-muted">
                      <span>{label}</span>
                      <span className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <span className="block h-full rounded-full bg-cyan" style={{ width: pct(colour.why[key]) }} />
                      </span>
                      <span className="text-right tabular-nums">{pct(colour.why[key])}</span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => dispatch({ type: "backToGrid" })}
                  className="mt-3 rounded-full border border-white/20 px-4 py-2 text-sm font-medium hover:bg-white/5"
                >
                  Back to the grid
                </button>
              </>
            )
          ) : revealing ? (
            hitNow ? (
              <p>
                <span className="font-semibold text-cyan">The Ghost called it.</span> It had sealed the {spots[last.guess]}{" "}
                before you tapped it.
              </p>
            ) : (
              <p>
                <span className="font-semibold">You got away.</span> You tapped the {spots[last.cell]}. It had sealed the{" "}
                {spots[last.guess]}.
              </p>
            )
          ) : last ? (
            <p className="text-muted">Sealed again. Your move.</p>
          ) : (
            <p className="text-muted">Tap any square, as randomly as you can. The Ghost has already made its guess.</p>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-1.5" aria-hidden="true">
          {Array.from({ length: STRIP }, (_, i) => {
            const result = recent[i];
            return (
              <span
                key={i}
                className={`h-2.5 w-2.5 rounded-full ${result === undefined ? "bg-white/8" : result ? "bg-cyan" : "bg-white/30"}`}
              />
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted">
          Last {STRIP} rounds: <span className="text-cyan">called</span> vs. got away.
        </p>
      </div>

      <div className="flex flex-col rounded-3xl border border-white/8 bg-surface p-6 md:p-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-muted">You&apos;re this predictable</p>
            <p className="mt-1 font-[family-name:var(--font-heading)] text-6xl font-extrabold tabular-nums md:text-7xl">
              {metered ? pct(share) : "—"}
            </p>
          </div>
          <div className="text-right text-sm text-muted">
            <p className="tabular-nums">
              {called} of {total}
            </p>
            <p>Pure luck: {chancePercent}%</p>
          </div>
        </div>
        <p className={`mt-2 min-h-6 ${verdict ? "text-lg font-semibold text-accent" : "text-base text-muted"}`}>
          {metered
            ? verdict || `Keep going. ${VERDICT_AT - total} more rounds for a verdict.`
            : `${MIN_FOR_METER - total} more ${MIN_FOR_METER - total === 1 ? "tap" : "taps"} before the meter starts.`}
        </p>
        {total >= VERDICT_AT && (
          <p className="mt-2 text-base leading-relaxed text-foreground">
            If one person is this predictable, imagine a crowd.{" "}
            <a
              href="#approach"
              className="font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
            >
              That&apos;s what we model →
            </a>
          </p>
        )}
        {habits.length > 0 && (
          <div className="mt-4 rounded-2xl border border-white/5 bg-background/60 p-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted">What gave you away</p>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed">
              {habits.map((habit) => (
                <li key={habit} className="flex gap-2">
                  <GhostIcon className="mt-0.5 h-4 w-4 shrink-0 text-cyan/70" />
                  <span>{habit}</span>
                </li>
              ))}
            </ul>
            {!colour && (
              <button
                type="button"
                onClick={() => dispatch({ type: "colourRound" })}
                className="mt-4 rounded-full border border-cyan/50 px-4 py-2 text-sm font-semibold text-cyan hover:bg-cyan/10"
              >
                {state.colourOffered ? "Replay the colour test" : "Final round: the colour test"}
              </button>
            )}
          </div>
        )}

        <div className="mt-6 grid grid-cols-[auto_1fr] items-center gap-5">
          <div className="grid w-28 grid-cols-3 gap-1" role="img" aria-label="Where you have tapped so far, darker cyan meaning more often">
            {taps.map((count, i) => (
              <span
                key={i}
                className="aspect-square rounded-md border border-white/10 bg-background"
                style={{ backgroundColor: count ? `rgba(34, 211, 238, ${0.2 + 0.7 * (count / Math.max(...taps))})` : undefined }}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-2xl border border-white/5 bg-background/60 px-2 py-3">
              <p className="font-[family-name:var(--font-heading)] text-2xl font-bold tabular-nums">{state.streak}</p>
              <p className="mt-1 text-xs text-muted">Ghost streak</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-background/60 px-2 py-3">
              <p className="font-[family-name:var(--font-heading)] text-2xl font-bold tabular-nums">{state.bestStreak}</p>
              <p className="mt-1 text-xs text-muted">Best streak</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex-1 rounded-2xl border border-white/5 bg-background/60 p-4">
          <AccuracyChart
            hits={state.hits}
            chance={CHANCE}
            label="Running share of your taps the Ghost called, compared with the one-in-nine chance line"
          />
          <div className="mt-2 flex justify-between text-xs text-muted">
            <span>Your taps over time</span>
            <span>dashed line = pure luck</span>
          </div>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-muted">
          Before every tap the Ghost locks in a guess from your earlier taps: your favourite squares, the hops you
          tend to make, how you react after it hits or misses, and whichever habit has been working lately. Pure luck
          would call one tap in nine.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={total < MIN_FOR_SHARE || sharing}
            onClick={shareResult}
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {sharing ? "Making your card…" : "Share my result"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShareNote("");
              lastTapRef.current = null;
              dispatch({ type: "reset" });
            }}
            className="rounded-full border border-white/20 px-4 py-2.5 text-sm font-medium hover:bg-white/5"
          >
            Start over
          </button>
          <p className="text-sm text-muted" aria-live="polite">
            {shareNote ||
              (total < MIN_FOR_SHARE
                ? `Share unlocks after ${MIN_FOR_SHARE} taps.`
                : "Runs entirely in your browser. Nothing is sent anywhere.")}
          </p>
        </div>
      </div>
    </div>
  );
}
