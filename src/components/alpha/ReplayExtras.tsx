"use client";

import { useId, useState } from "react";
import type { CaseId } from "@/components/alpha/cases/stories";
import type { Context, Position, ReplaySession } from "@/components/alpha/replayRuns";
import { ODDS_BY_SETUP, ODDS_BY_ZONE, type Mood, type Odds, type Story } from "@/components/alpha/replayStory";

export function Wobble({ id }: { id: string }) {
  return (
    <filter id={id} x="-5%" y="-20%" width="110%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" />
      <feDisplacementMap in="SourceGraphic" scale="3" />
    </filter>
  );
}

export function peopleIn(session: ReplaySession) {
  const match = /^(\d+) (people|person)/.exec(session.crowd);
  return match ? Number(match[1]) : 0;
}

const MAX_FIGURES = 40;

// One doodled figure per person posting, so a frenzy looks like one.
export function CrowdDoodle({ people }: { people: number }) {
  if (people === 0) {
    return (
      <div className="mt-3 flex items-center gap-3 text-stone-700">
        <svg viewBox="0 0 120 40" aria-hidden="true" className="h-10 w-28">
          <path d="M8 24 h100 M14 24 v12 M102 24 v12 M8 18 h100" fill="none" stroke="#a8a29e" strokeWidth="3" strokeLinecap="round" />
          <circle cx="96" cy="33" r="5" fill="none" stroke="#d6d3d1" strokeWidth="1.5" strokeDasharray="3 2" />
        </svg>
        <span className="font-pencil text-xl">An empty bench.</span>
      </div>
    );
  }
  const shown = Math.min(people, MAX_FIGURES);
  return (
    <div className="mt-3" aria-hidden="true">
      <div className="flex flex-wrap items-end gap-x-0.5 gap-y-1">
        {Array.from({ length: shown }, (_, i) => {
          const pose = (i * 37) % 7;
          const tilt = ((i * 53) % 11) - 5;
          const arms = pose < 2 ? "M3 9 L8 13 L13 9" : pose < 4 ? "M2 15 L8 12 L14 15" : "M3 4 L8 12 L13 4";
          return (
            <svg
              key={i}
              viewBox="0 0 16 28"
              className="fade-up h-7 w-4"
              style={{ animationDelay: `${Math.min(i, 30) * 25}ms`, rotate: `${tilt}deg` }}
            >
              <circle cx="8" cy="5" r="3.6" fill={pose === 6 ? "#fcd34d" : "#fafaf9"} stroke="#1c1917" strokeWidth="1.6" />
              <path d={`M8 9 L8 19 M8 19 L4 27 M8 19 L12 27 ${arms}`} fill="none" stroke="#1c1917" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          );
        })}
        {people > shown && <span className="ml-1 font-pencil text-xl font-bold text-stone-700">+{people - shown} more</span>}
      </div>
    </div>
  );
}

// The 20 sessions before this one: price shape and chatter. Today's open stays a question mark until the gap
// clue is open, so the chart never gives a paid clue away.
export function StoryChart({ story, showOpen }: { story: Story; showOpen: boolean }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const W = 320;
  const prices = story.price.slice(0, 20);
  const open = story.price[20];
  const scale = showOpen ? [...prices, open] : prices;
  const lo = Math.min(...scale);
  const hi = Math.max(...scale);
  const span = hi - lo || 1;
  const x = (i: number) => 12 + i * ((W - 40) / 20);
  const y = (p: number) => 72 - ((p - lo) / span) * 60;
  const line = prices.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p).toFixed(1)}`).join(" ");
  const most = Math.max(1, ...story.chatter);
  const quiet = story.chatter.every((n) => n === 0);

  return (
    <figure className="pencil-box-alt bg-white/70 p-3">
      <figcaption className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-700">The story so far</span>
        <span className="text-[11px] text-stone-700">last 20 sessions</span>
      </figcaption>
      <svg
        viewBox={`0 0 ${W} 128`}
        role="img"
        aria-label={`Price over the last 20 sessions and posts each session, peaking at ${most} posts.`}
        className="mt-1 h-auto w-full"
      >
        <defs>
          <Wobble id={`s${id}`} />
        </defs>
        <g filter={`url(#s${id})`}>
          <path d={line} pathLength={1} className="pencil-draw" fill="none" stroke="#1c1917" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        {showOpen ? (
          <>
            <path d={`M${x(19)} ${y(prices[19])} L${x(20)} ${y(open)}`} stroke="#1c1917" strokeWidth="2" strokeDasharray="3 4" fill="none" />
            <circle cx={x(20)} cy={y(open)} r="5" fill={open >= prices[19] ? "#34d399" : "#fb7185"} stroke="#1c1917" strokeWidth="2" />
          </>
        ) : (
          <text x={x(20)} y={y(prices[19]) + 6} textAnchor="middle" fontSize="18" fontWeight="700" fill="#a8a29e" className="font-pencil">
            ?
          </text>
        )}
        <line x1="8" x2={W - 8} y1="86" y2="86" stroke="#d6d3d1" strokeWidth="1" />
        {story.chatter.map((n, i) => {
          const h = n === 0 ? 0 : Math.max(3, (n / most) * 34);
          return (
            <rect
              key={i}
              x={x(i) - 4}
              y={122 - h}
              width="8"
              height={h}
              rx="1.5"
              fill={i === 20 ? "#f59e0b" : "#a8a29e"}
              stroke={n ? "#1c1917" : "none"}
              strokeWidth="1"
            />
          );
        })}
        <line x1="8" x2={W - 8} y1="122" y2="122" stroke="#78716c" strokeWidth="1.5" />
      </svg>
      <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-stone-600">
        <span>line: price, shape only</span>
        <span>bars: posts each session{quiet ? " (none at all)" : ""}</span>
        <span>
          <span className="font-semibold text-amber-600">amber</span>: today
        </span>
        {!showOpen && <span>? today&apos;s open: buy the gap to see it</span>}
      </p>
    </figure>
  );
}

const zoneOf = (busier: number) => (busier < 50 ? 0 : busier < 90 ? 1 : busier < 99 ? 2 : 3);
const zoneWords = ["this quiet", "this ordinary", "this busy", "in a frenzy like this"];
const runUpBucket = (runUp: number) => (runUp < -20 ? 0 : runUp < 20 ? 1 : runUp < 100 ? 2 : 3);
const MIN_CELL = 40;

// Base rates from every session the research scored. The run-up sharpens them only once that clue is open.
export function HistorySays({ context, withRunUp }: { context: Context; withRunUp: boolean }) {
  const zone = zoneOf(context.busier);
  const cell = ODDS_BY_SETUP[zone][runUpBucket(context.runUp)];
  const sharp = withRunUp && cell.n >= MIN_CELL;
  const odds: Odds = sharp ? cell : ODDS_BY_ZONE[zone];
  const typical =
    odds.median < 0
      ? `lagged it by ${Math.abs(odds.median)} ${Math.abs(odds.median) === 1 ? "point" : "points"}`
      : odds.median > 0
        ? `beat it by ${odds.median} ${odds.median === 1 ? "point" : "points"}`
        : "roughly matched it";

  return (
    <div className="pencil-box bg-cyan-50/80 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-cyan-800">History says</p>
      <div className="mt-1 flex items-center gap-3">
        <p className="font-pencil text-5xl font-bold leading-none text-cyan-800">{odds.beat}%</p>
        <p className="text-sm leading-snug text-stone-700">
          of {odds.n.toLocaleString("en-US")} sessions {zoneWords[zone]}
          {sharp ? ", with a run-up like this one," : ""} beat the market over the next three.
        </p>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-stone-600">
        The typical one {typical}
        {odds.swing >= 5 ? `, but ${odds.swing}% swung 50 points or more either way` : ""}.
        {!sharp && !withRunUp && " The run-up clue sharpens this."}
      </p>
    </div>
  );
}

export function moodFace(mood: Mood) {
  return {
    value: `${mood.bull}% bulls`,
    detail: `${mood.bear}% bears · ${mood.news === 0 ? "no news" : `${mood.news} news ${mood.news === 1 ? "story" : "stories"}`}`,
    tone: mood.bull - mood.bear >= 30 ? "text-emerald-700" : mood.bear >= mood.bull ? "text-rose-600" : "text-amber-600",
  };
}

// Same-length tickers from the same era, so the tiles alone don't settle it.
const decoys: Record<CaseId, string[]> = {
  put: ["HOOD", "LCID", "PLTR", "RKLB", "SOFI"],
  call: ["IONQ", "QBTS", "QUBT", "RGTI", "SOUN"],
  exotic: ["DPRO", "KULR", "LUNR", "RCAT", "UAVS"],
  failed: ["GPRO", "NKLA", "SPCE", "TLRY", "WKHS"],
};
const REVEAL_ORDER = [2, 0, 3, 1, 4, 5];
export const DETECTIVE_POINTS = 100;

export type Guess = { pick: string; at: number };

export function guessPoints(guess: Guess | null, ticker: string, sessions: number) {
  return guess && guess.pick === ticker ? (sessions - guess.at) * DETECTIVE_POINTS : 0;
}

// Name the stock: every winning bet turns a letter over. One guess per run, worth more the earlier it lands.
export function GuessStrip({
  runId,
  ticker,
  wins,
  index,
  sessions,
  guess,
  canGuess,
  onGuess,
}: {
  runId: CaseId;
  ticker: string;
  wins: number;
  index: number;
  sessions: number;
  guess: Guess | null;
  canGuess: boolean;
  onGuess: (pick: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const right = guess?.pick === ticker;
  const order = REVEAL_ORDER.filter((i) => i < ticker.length);
  const shown = new Set(right ? order : order.slice(0, Math.min(wins, ticker.length - 1)));
  const options = [ticker, ...decoys[runId]].sort();
  const worth = (sessions - index) * DETECTIVE_POINTS;

  return (
    <div className="pencil-box-alt bg-violet-50/80 p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-800">Name the stock</p>
          <ol className="mt-1 flex gap-1.5" aria-label={`Ticker, ${shown.size} of ${ticker.length} letters showing`}>
            {[...ticker].map((letter, i) => (
              <li
                key={i}
                className={`${i % 2 ? "pencil-box" : "pencil-box-alt"} flex h-10 w-9 items-center justify-center font-pencil text-3xl font-bold ${
                  shown.has(i) ? "fade-up bg-white text-violet-800" : "bg-violet-100 text-violet-300"
                }`}
              >
                {shown.has(i) ? letter : "?"}
              </li>
            ))}
          </ol>
        </div>
        {guess ? (
          <p className={`font-pencil text-2xl font-bold leading-tight ${right ? "text-emerald-700" : "text-rose-600"}`}>
            {right
              ? `Got it! +${guessPoints(guess, ticker, sessions)} detective points`
              : `Not ${guess.pick}. No more guesses this run.`}
          </p>
        ) : canGuess ? (
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="pencil-box sticker min-h-11 bg-violet-200 px-4 text-sm font-bold"
          >
            {open ? "Not yet" : `Guess now · worth ${worth}`}
          </button>
        ) : null}
      </div>
      {!guess && canGuess && open && (
        <div className="fade-up mt-3">
          <p className="text-xs text-stone-600">One guess per run. Pick the ticker:</p>
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setOpen(false);
                  onGuess(option);
                }}
                className="pencil-box sticker min-h-11 bg-white font-pencil text-2xl font-bold"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
      {!guess && (
        <p className="mt-2 text-xs text-stone-600">
          Each winning bet turns a letter over. Guess right now for {worth} detective points; they drop by{" "}
          {DETECTIVE_POINTS} every session you wait.
        </p>
      )}
    </div>
  );
}

export type Split = { rise: number; drop: number; out: number };

export function PlayersSplit({ split, mine }: { split: Split | null; mine: Position }) {
  const total = split ? split.rise + split.drop + split.out : 0;
  if (!split || total === 0) {
    return (
      <p className="mt-3 text-sm text-stone-600">
        Nobody else has finished today&apos;s run yet, so there&apos;s no crowd of players to compare with here.
      </p>
    );
  }
  const share = (n: number) => Math.round((n / total) * 100);
  const parts: { key: Position; label: string; n: number; fill: string }[] = [
    { key: "rise", label: "▲ Rise", n: split.rise, fill: "bg-emerald-300" },
    { key: "out", label: "Sat out", n: split.out, fill: "bg-stone-200" },
    { key: "drop", label: "▼ Drop", n: split.drop, fill: "bg-rose-300" },
  ];
  const top = parts.reduce((a, b) => (b.n > a.n ? b : a));
  const mineShare = share(parts.find((p) => p.key === mine)?.n ?? 0);

  return (
    <div className="mt-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-700">
        What today&apos;s other players did here · {total.toLocaleString("en-US")}
      </p>
      <div aria-hidden="true" className="pencil-box mt-1 flex h-6 overflow-hidden">
        {parts.map((p) =>
          p.n ? (
            <span key={p.key} className={`${p.fill} flex items-center justify-center text-[11px] font-bold`} style={{ width: `${share(p.n)}%` }}>
              {share(p.n) >= 12 ? `${share(p.n)}%` : ""}
            </span>
          ) : null,
        )}
      </div>
      <p className="mt-1 text-sm text-stone-700">
        {parts
          .filter((p) => p.n > 0)
          .map((p) => `${p.label} ${share(p.n)}%`)
          .join(" · ")}
        .{" "}
        <strong className="text-stone-900">
          {mine === top.key ? "You went with the crowd." : mineShare <= 20 ? "You went against the crowd." : "You split from the most popular call."}
        </strong>
      </p>
    </div>
  );
}

export type Stamp = { id: string; label: string; emoji: string; tone: string };

export function Stamps({ stamps }: { stamps: Stamp[] }) {
  if (stamps.length === 0) {
    return <p className="mt-2 text-sm text-stone-600">No stamps this time. Beat the model, dodge its misses or name the stock to earn some.</p>;
  }
  return (
    <ul className="mt-3 flex flex-wrap gap-3">
      {stamps.map((stamp, i) => (
        <li
          key={stamp.id}
          className={`stamp-in rounded-lg border-[3px] bg-white/85 px-3 py-1 text-center font-pencil text-xl font-bold leading-tight ${stamp.tone}`}
          style={{ animationDelay: `${0.3 + i * 0.18}s`, rotate: `${((i * 7) % 9) - 4}deg` }}
        >
          <span aria-hidden="true">{stamp.emoji} </span>
          {stamp.label}
        </li>
      ))}
    </ul>
  );
}
