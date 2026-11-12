"use client";

import {
  useEffect,
  useId,
  useReducer,
  useRef,
  useState,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { SectionHeading } from "@/components/alpha/SectionHeading";
import {
  replayRuns,
  type Context,
  type Position,
  type Poster,
  type PostTag,
  type ReplaySession,
  type Room,
} from "@/components/alpha/replayRuns";
import {
  CLUE_COST,
  MODEL_STAKE,
  SIZES,
  START,
  clueBit,
  clueCount,
  cluesOn,
  dailyRunIndex,
  direction,
  encodePick,
  localDay,
  modelPath,
  settle,
  type Clue,
  type Size,
} from "@/components/alpha/replayScore";
import { replayStories, type Mood } from "@/components/alpha/replayStory";
import {
  CrowdDoodle,
  GuessStrip,
  HistorySays,
  PlayersSplit,
  Stamps,
  StoryChart,
  Wobble,
  guessPoints,
  moodFace,
  peopleIn,
  type Guess,
  type Split,
  type Stamp,
} from "@/components/alpha/ReplayExtras";
import { track } from "@/components/analytics";

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const signedMoney = (n: number) => `${n < 0 ? "−" : "+"}${money(Math.abs(n))}`;
const SWIPE = 90;

// pnl is the bet alone; after is the bankroll once the bet and any clues bought are paid for.
type Played = { index: number; position: Position; size: Size; mask: number; pnl: number; after: number };
type Mode = "daily" | "practice";

type State = {
  ready: boolean;
  mode: Mode;
  day: number;
  runIndex: number;
  // Counts every deal, so a replay of today's run can be told apart from the first try.
  deal: number;
  index: number;
  bankroll: number;
  played: Played[];
  size: Size;
  // Clues bought this session, as a mask over CLUES.
  bought: number;
  resolved: boolean;
  guess: Guess | null;
  board: Board;
};

type Board =
  | { status: "idle" }
  | { status: "error" }
  | { status: "done"; bankroll: number; players: number; below: number; deal: number | null };

const dealt = (state: State, mode: Mode, runIndex: number): State => ({
  ...state,
  ready: true,
  mode,
  runIndex,
  deal: state.deal + 1,
  index: 0,
  bankroll: START,
  played: [],
  bought: 0,
  resolved: false,
  guess: null,
});

type Action =
  | { type: "init"; day: number; board: Board }
  | { type: "board"; board: Board }
  | { type: "daily" }
  | { type: "practice"; runIndex: number }
  | { type: "restart" }
  | { type: "size"; size: Size }
  | { type: "buy"; clue: Clue }
  | { type: "commit"; position: Position }
  | { type: "guess"; pick: string }
  | { type: "next" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "init":
      return dealt({ ...state, day: action.day, board: action.board }, "daily", dailyRunIndex(action.day));
    case "board":
      return { ...state, board: action.board };
    case "daily":
      return dealt(state, "daily", dailyRunIndex(state.day));
    case "practice":
      return dealt(state, "practice", action.runIndex);
    case "restart":
      return dealt(state, state.mode, state.runIndex);
    case "size":
      return { ...state, size: action.size };
    case "guess": {
      const sessions = replayRuns[state.runIndex].sessions;
      if (state.guess || state.bankroll <= 0 || state.index >= sessions.length) return state;
      return { ...state, guess: { pick: action.pick, at: state.index } };
    }
    case "next": {
      // A quiet session has nothing to resolve, so it advances without a bet.
      const session = replayRuns[state.runIndex].sessions[state.index];
      if (!session || state.bankroll <= 0 || (!state.resolved && session.move !== null)) return state;
      return { ...state, index: state.index + 1, bought: 0, resolved: false };
    }
    case "buy": {
      const session = replayRuns[state.runIndex].sessions[state.index];
      const bit = clueBit(action.clue);
      if (!session || state.resolved || session.move === null || state.bought & bit) return state;
      if (!cluesOn(session).includes(action.clue) || state.bankroll - CLUE_COST <= 0) return state;
      return { ...state, bankroll: state.bankroll - CLUE_COST, bought: state.bought | bit };
    }
    case "commit": {
      const session = replayRuns[state.runIndex].sessions[state.index];
      if (!session || state.resolved || session.move === null || state.bankroll <= 0) return state;
      const pnl = settle(state.bankroll * SIZES[state.size], session.move, action.position);
      const after = Math.max(0, state.bankroll + pnl);
      return {
        ...state,
        bankroll: after,
        played: [
          ...state.played,
          {
            index: state.index,
            position: action.position,
            size: state.size,
            mask: state.bought,
            pnl: after - state.bankroll,
            after,
          },
        ],
        resolved: true,
      };
    }
  }
}

type Cell = "win" | "loss" | "out" | "quiet" | "todo";

const cellEmoji: Record<Exclude<Cell, "todo">, string> = { win: "🟩", loss: "🟥", out: "🟨", quiet: "⬜" };
const cellFill: Record<Cell, string> = {
  win: "bg-emerald-400",
  loss: "bg-rose-400",
  out: "bg-amber-200",
  quiet: "bg-stone-300/70",
  todo: "bg-transparent border-dashed opacity-40",
};
const cellName: Record<Cell, string> = {
  win: "won",
  loss: "lost",
  out: "stayed out",
  quiet: "nothing to play",
  todo: "not played yet",
};

function cellsFor(sessions: ReplaySession[], played: Played[], completed: number): Cell[] {
  return sessions.map((session, i) => {
    if (i >= completed) return "todo";
    if (session.move === null) return "quiet";
    const play = played.find((p) => p.index === i);
    if (!play) return "todo";
    return play.pnl > 0 ? "win" : play.pnl < 0 ? "loss" : "out";
  });
}

function useCountUp(target: number, { from = target, duration = 900, delay = 0 } = {}) {
  const [shown, setShown] = useState(from);
  const current = useRef(from);
  useEffect(() => {
    const start = current.current;
    if (start === target) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const span = reduce ? 0 : duration;
    const t0 = performance.now() + (reduce ? 0 : delay);
    let frame = requestAnimationFrame(function tick(now) {
      const t = span === 0 ? 1 : Math.min(1, Math.max(0, (now - t0) / span));
      const value = start + (target - start) * (1 - (1 - t) ** 3);
      current.current = value;
      setShown(value);
      if (t < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [target, duration, delay]);
  return shown;
}

const tagOrder: PostTag[] = ["squeeze", "gains", "research", "meme"];
const tagNames: Record<PostTag, string> = {
  squeeze: "squeeze",
  gains: "gains-or-losses",
  research: "research",
  meme: "meme",
};
const tagColours: Record<PostTag, string> = {
  squeeze: "bg-amber-400",
  gains: "bg-rose-400",
  research: "bg-cyan-500",
  meme: "bg-violet-400",
};

const headcount = (session: ReplaySession) => (session.move === null ? 0 : parseInt(session.crowd, 10) || 0);
const people = (n: number) => (n === 1 ? "one person is" : `${n} people are`);

// The single clue shown up front. It only uses what was knowable at the open.
function clueFor(sessions: ReplaySession[], i: number) {
  const session = sessions[i];
  if (session.move === null) return "Nobody's talking about it. Nothing to play here.";
  const now = headcount(session);
  const room = session.room;
  let quietBefore = 0;
  while (quietBefore < i && sessions[i - 1 - quietBefore].move === null) quietBefore++;
  const before = i > 0 && quietBefore === 0 ? headcount(sessions[i - 1]) : null;
  const champion = room?.posters.find((p) => p.role === "champion");
  const fade = room?.posters.find((p) => p.role === "fade");

  if (champion) {
    return `A champion showed up: ${champion.hits} of their ${champion.calls} earlier calls beat the market.`;
  }
  if (quietBefore > 0) {
    return `After ${quietBefore === 1 ? "a quiet session" : `${quietBefore} quiet sessions`}, ${people(now)} talking about it.`;
  }
  if (before !== null && now >= before * 3) return `The crowd jumped from ${before} to ${now} since the last session.`;
  if (before !== null && now * 3 <= before) return `The crowd collapsed from ${before} to ${now}.`;
  if (fade) return `A fade is in the room: only ${fade.hits} of their ${fade.calls} earlier calls beat the market.`;
  if (before !== null && now >= before * 2) return `The crowd grew from ${before} to ${now}.`;
  if (before !== null && now * 2 <= before) return `The crowd shrank from ${before} to ${now}.`;
  if (room) {
    const top = tagOrder.reduce((a, b) => (room.mix[b] > room.mix[a] ? b : a));
    const share = room.mix[top];
    if (share >= 40) return `${share === 50 ? "Half" : `${share}%`} of the posts were ${tagNames[top]} posts.`;
    return `It came up on ${room.discussed} of the previous 20 sessions.`;
  }
  return `${now === 1 ? "One person" : `${now} people`} talking. That's all this replay knows about them.`;
}

const times = (n: number) => `${n >= 10 ? Math.round(n) : Number(n.toFixed(1))}×`;

function posterLabel(poster: Poster) {
  if (poster.role === "champion") return { text: "A champion", tone: "text-emerald-700" };
  if (poster.role === "fade") return { text: "A fade", tone: "text-rose-600" };
  if (poster.engagement === null && poster.calls === 0) return { text: "A first-timer", tone: "" };
  if (poster.engagement !== null && poster.engagement >= 10) return { text: "A loud poster", tone: "" };
  return { text: "A poster", tone: "" };
}

function posterDetail(poster: Poster) {
  const kind = poster.tags.length ? `${poster.tags.map((tag) => tagNames[tag]).join(" and ")} ` : "";
  return [
    `${poster.posts} ${kind}post${poster.posts === 1 ? "" : "s"}`,
    poster.engagement === null ? "no earlier engagement on record" : `${times(poster.engagement)} typical engagement`,
    poster.calls === 0 ? "no earlier calls" : `${poster.hits} of ${poster.calls} earlier calls beat the market`,
  ].join(" · ");
}

function TheRoom({ room }: { room: Room }) {
  const tagged = tagOrder.filter((tag) => room.mix[tag] > 0);
  const untagged = Math.max(0, 100 - tagged.reduce((sum, tag) => sum + room.mix[tag], 0));
  const hasRoles = room.posters.some((poster) => poster.role !== null);

  return (
    <div className="fade-up mt-3 space-y-4">
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">What they posted</p>
          <p className="text-sm text-stone-600 tabular-nums">
            {room.posts} {room.posts === 1 ? "post" : "posts"}
          </p>
        </div>
        <div aria-hidden="true" className="pencil-box mt-2 flex h-4 overflow-hidden bg-white/60">
          {tagged.map((tag) => (
            <span key={tag} className={tagColours[tag]} style={{ width: `${room.mix[tag]}%` }} />
          ))}
        </div>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {tagged.map((tag) => (
            <li key={tag} className="flex items-center gap-1.5">
              <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full border border-stone-900 ${tagColours[tag]}`} />
              <span className="font-semibold tabular-nums">{room.mix[tag]}%</span>
              <span className="text-stone-600">{tagNames[tag]}</span>
            </li>
          ))}
          {untagged > 0 && (
            <li className="text-stone-600">
              <span className="tabular-nums">{untagged}%</span> untagged
            </li>
          )}
        </ul>
      </div>

      <p className="text-sm leading-relaxed text-stone-700">
        {room.newcomers > 0 &&
          `${room.newcomers} ${room.newcomers === 1 ? "person had" : "people had"} no track record. `}
        The stock came up on {room.discussed} of the previous 20 sessions.
      </p>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Who stood out</p>
        <ul className="mt-2 space-y-2">
          {room.posters.map((poster, i) => {
            const label = posterLabel(poster);
            return (
              <li key={i} className={`${i % 2 ? "pencil-box-alt" : "pencil-box"} bg-white/60 px-4 py-2.5`}>
                <p className={`font-pencil text-xl font-bold leading-tight ${label.tone}`}>{label.text}</p>
                <p className="text-sm leading-relaxed text-stone-700">{posterDetail(poster)}</p>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-xs leading-relaxed text-stone-600">
          A call is an earlier post about a stock that has since resolved; it counts if that stock beat the S&amp;P 500
          over the next three sessions.
          {hasRoles && " A champion has 8 or more calls with at least 60% right; a fade has 8 or more with 40% or fewer."}
        </p>
      </div>
    </div>
  );
}

const zones = [
  { label: "Quiet", from: 0, to: 50, fill: "bg-stone-200", tone: "text-stone-500" },
  { label: "Typical", from: 50, to: 90, fill: "bg-cyan-100", tone: "text-cyan-700" },
  { label: "Busy", from: 90, to: 99, fill: "bg-amber-200", tone: "text-amber-600" },
  { label: "Frenzy", from: 99, to: 100, fill: "bg-rose-300", tone: "text-rose-600" },
];

const pct = (n: number) => `${Math.abs(n) >= 10 ? Math.round(Math.abs(n)) : Number(Math.abs(n).toFixed(1))}%`;
const signedPct = (n: number) => (Math.abs(n) < 0.05 ? "flat" : `${n < 0 ? "−" : "+"}${pct(n)}`);

// How the crowd compares with every session the research scored, and with this stock's own normal.
function CrowdMeter({ session, context }: { session: ReplaySession; context: Context }) {
  const zoneIndex = Math.max(0, zones.findIndex((zone) => context.busier < zone.to));
  const zone = zones[context.busier >= 100 ? zones.length - 1 : zoneIndex];
  const at = zones.indexOf(zone);
  const position = Math.min(97, Math.max(3, (at + (context.busier - zone.from) / (zone.to - zone.from)) * 25));
  const busier = context.busier >= 99 ? `${Math.min(99.9, context.busier).toFixed(1)}%` : `${Math.round(context.busier)}%`;
  const posts = session.room?.posts ?? context.posts;
  const ratio = posts / context.usualPosts;
  const usual = context.usualPosts < 1 ? "less than one post" : `about ${Math.round(context.usualPosts)} posts`;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-lg font-semibold">{session.crowd}</p>
        <p className={`font-pencil text-3xl font-bold leading-none ${zone.tone}`}>{zone.label}</p>
      </div>
      <div className="relative mt-3">
        <div aria-hidden="true" className="pencil-box flex h-5 overflow-hidden">
          {zones.map((z, i) => (
            <span key={z.label} className={`w-1/4 ${z.fill} ${i ? "border-l-2 border-dashed border-stone-500/40" : ""}`} />
          ))}
        </div>
        <span
          aria-hidden="true"
          className="absolute -top-2 h-9 w-1.5 -translate-x-1/2 rounded-full border-2 border-stone-900 bg-stone-900"
          style={{ left: `${position}%` }}
        />
      </div>
      <div aria-hidden="true" className="mt-1 grid grid-cols-4 text-center text-[11px] text-stone-500">
        {zones.map((z) => (
          <span key={z.label}>{z.label}</span>
        ))}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-stone-700">
        Busier than <strong className="text-stone-900">{busier}</strong> of the 25,247 sessions the research scored. It
        usually gets {usual} a session; this one had {posts}
        {ratio >= 2 ? `, ${Math.round(ratio)}× its normal` : ratio <= 0.5 ? ", well below its normal" : ""}.
      </p>
    </div>
  );
}

const clueNames: Record<Clue, string> = {
  runUp: "Run-up",
  gap: "Opening gap",
  volume: "Volume",
  room: "Who's posting",
  mood: "Mood & news",
};

function clueFace(clue: Clue, session: ReplaySession, context: Context, mood: Mood | null) {
  switch (clue) {
    case "mood":
      return mood ? moodFace(mood) : { value: "n/a", detail: "no mood read", tone: "text-stone-500" };
    case "runUp":
      return {
        value: signedPct(context.runUp),
        detail: `last five sessions · market ${signedPct(context.market)}`,
        tone: context.runUp > 0 ? "text-emerald-700" : "text-rose-600",
      };
    case "gap":
      return {
        value: signedPct(context.gap),
        detail: "opened vs yesterday's close",
        tone: context.gap > 0 ? "text-emerald-700" : "text-rose-600",
      };
    case "volume":
      return {
        value: `${Number(context.volume.toFixed(1))}×`,
        detail: "yesterday's volume vs its recent average",
        tone: context.volume >= 3 ? "text-amber-600" : "text-stone-800",
      };
    case "room":
      return {
        value: `${session.room?.posters.length ?? 0} stood out`,
        detail: "post mix and poster profiles below",
        tone: "text-violet-700",
      };
  }
}

function ClueCards({
  session,
  context,
  mood,
  bought,
  revealed,
  canBuy,
  onBuy,
}: {
  session: ReplaySession;
  context: Context;
  mood: Mood | null;
  bought: number;
  revealed: boolean;
  canBuy: boolean;
  onBuy: (clue: Clue) => void;
}) {
  const clues = cluesOn(session);
  const spent = clueCount(bought) * CLUE_COST;
  const roomOpen = session.room && (revealed || bought & clueBit("room"));

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          {revealed ? "All the clues" : `More clues · ${money(CLUE_COST)} each`}
        </p>
        {spent > 0 && <p className="text-xs text-stone-600">Spent {money(spent)} on clues this session</p>}
      </div>
      <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
        {clues.map((clue, i) => {
          const own = Boolean(bought & clueBit(clue));
          const box = i % 2 ? "pencil-box-alt" : "pencil-box";
          if (own || revealed) {
            const face = clueFace(clue, session, context, mood);
            return (
              <li key={clue} className={`${box} fade-up flex min-h-24 flex-col bg-white/80 p-3`}>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">{clueNames[clue]}</span>
                <span className={`font-pencil text-3xl font-bold leading-tight ${face.tone}`}>{face.value}</span>
                <span className="text-[11px] leading-snug text-stone-600">{face.detail}</span>
                {!own && <span className="mt-auto pt-1 text-[10px] italic text-stone-500">skipped</span>}
              </li>
            );
          }
          return (
            <li key={clue}>
              <button
                type="button"
                disabled={!canBuy}
                onClick={() => onBuy(clue)}
                aria-label={`Buy the ${clueNames[clue].toLowerCase()} clue for ${money(CLUE_COST)}`}
                className={`${box} sticker flex min-h-24 w-full flex-col items-center justify-center gap-0.5 bg-[repeating-linear-gradient(135deg,#e7e5e4_0_6px,#f5f5f4_6px_12px)] p-3 disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <span aria-hidden="true" className="font-pencil text-3xl font-bold leading-none text-stone-400">
                  ?
                </span>
                <span className="text-sm font-bold">{clueNames[clue]}</span>
                <span className="font-pencil text-lg font-bold leading-none text-amber-700">{money(CLUE_COST)}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {!session.room && (
        <p className="mt-2 text-xs text-stone-600">
          Who was posting isn&apos;t in this replay for this session, only the headcount.
        </p>
      )}
      {roomOpen && session.room ? <TheRoom room={session.room} /> : null}
    </div>
  );
}

function SwipeCard({
  enabled,
  onSwipe,
  children,
}: {
  enabled: boolean;
  onSwipe: (position: Position) => void;
  children: ReactNode;
}) {
  const start = useRef<{ x: number; y: number; id: number; dragging: boolean } | null>(null);
  const [dx, setDx] = useState(0);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!enabled || event.pointerType === "mouse") return;
    start.current = { x: event.clientX, y: event.clientY, id: event.pointerId, dragging: false };
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const s = start.current;
    if (!s || s.id !== event.pointerId) return;
    const mx = event.clientX - s.x;
    const my = event.clientY - s.y;
    if (!s.dragging) {
      if (Math.abs(my) > 14 && Math.abs(my) > Math.abs(mx)) {
        start.current = null;
        return;
      }
      if (Math.abs(mx) < 14) return;
      s.dragging = true;
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // The pointer already ended; the drag still works without capture.
      }
    }
    setDx(mx);
  };
  const onPointerEnd = () => {
    const s = start.current;
    start.current = null;
    if (s?.dragging && Math.abs(dx) > SWIPE) onSwipe(dx > 0 ? "rise" : "drop");
    setDx(0);
  };

  const pull = Math.min(1, Math.abs(dx) / SWIPE);
  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      className="pencil-box relative touch-pan-y bg-white/70 p-5 sm:p-6"
      style={{
        transform: dx ? `translateX(${dx}px) rotate(${dx / 30}deg)` : undefined,
        transition: dx ? "none" : "transform 0.25s ease",
      }}
    >
      {children}
      {dx !== 0 && (
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute top-3 rounded-md border-[3px] px-3 font-pencil text-3xl font-bold ${
            dx > 0 ? "left-3 -rotate-12 border-emerald-600 text-emerald-600" : "right-3 rotate-12 border-rose-600 text-rose-600"
          }`}
          style={{ opacity: pull }}
        >
          {dx > 0 ? "RISE" : "DROP"}
        </span>
      )}
    </div>
  );
}

function Reveal({ session, play }: { session: ReplaySession; play: Played }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const move = session.move ?? 0;
  const shown = useCountUp(move, { from: 0, duration: 900 });
  const clamped = Math.max(-160, Math.min(160, move));
  const endY = 64 - (clamped / 160) * 50;
  const tone =
    play.pnl > 0
      ? "border-emerald-600 text-emerald-700"
      : play.pnl < 0
        ? "border-rose-600 text-rose-600"
        : "border-stone-500 text-stone-600";

  return (
    <div className="relative max-w-md">
      <svg viewBox="0 0 320 128" role="img" aria-label={`The stock moved ${move} points against the market`} className="h-auto w-full">
        <defs>
          <Wobble id={`w${id}`} />
        </defs>
        <line x1="10" x2="310" y1="64" y2="64" stroke="#78716c" strokeWidth="1.5" strokeDasharray="5 6" />
        <text x="12" y="80" fontSize="11" fill="#78716c">
          the market
        </text>
        <g filter={`url(#w${id})`}>
          <path
            d={`M12 64 C 110 64, 190 ${(64 + endY) / 2}, 286 ${endY}`}
            pathLength={1}
            className="pencil-draw"
            fill="none"
            stroke="#1c1917"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </g>
        <circle cx="286" cy={endY} r="6" fill={move >= 0 ? "#34d399" : "#fb7185"} stroke="#1c1917" strokeWidth="2" className="fade-up" style={{ animationDelay: "0.8s" }} />
      </svg>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-pencil text-3xl font-bold tabular-nums">
          {shown < 0 ? "−" : "+"}
          {Math.abs(Math.round(shown))} points <span className="text-xl font-semibold text-stone-600">vs the market</span>
        </p>
        <span
          className={`stamp-in rounded-lg border-[3px] bg-white/80 px-3 py-0.5 text-center font-pencil font-bold leading-none ${tone}`}
        >
          <span className="block text-3xl">{play.pnl === 0 ? "Sat out" : signedMoney(play.pnl)}</span>
          <span className="block text-lg">
            {play.pnl > 0 ? "nice call" : play.pnl < 0 ? "ouch" : play.position === "out" ? "no harm done" : "flat"}
          </span>
        </span>
      </div>
    </div>
  );
}

function Squares({ cells, size = "md" }: { cells: Cell[]; size?: "sm" | "md" }) {
  return (
    <ol className={`flex ${size === "sm" ? "gap-1.5" : "gap-2"}`}>
      {cells.map((cell, i) => (
        <li
          key={i}
          title={`Session ${i + 1}: ${cellName[cell]}`}
          className={`${i % 2 ? "pencil-box-alt" : "pencil-box"} ${size === "sm" ? "h-3.5 w-3.5 border-[1.5px]" : "h-9 w-9"} ${cellFill[cell]}`}
        >
          <span className="sr-only">
            Session {i + 1}: {cellName[cell]}
          </span>
        </li>
      ))}
    </ol>
  );
}

function RaceChart({ yours, model, total }: { yours: number[]; model: number[]; total: number }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const W = 300;
  const H = 120;
  const pad = 14;
  const values = [START, ...yours, ...model];
  let lo = Math.min(...values);
  let hi = Math.max(...values);
  if (hi - lo < 400) {
    const mid = (hi + lo) / 2;
    lo = mid - 200;
    hi = mid + 200;
  }
  const x = (i: number) => pad + (i * (W - pad * 2)) / total;
  const y = (v: number) => H - pad - ((v - lo) / (hi - lo)) * (H - pad * 2);
  const line = (series: number[]) => [START, ...series].map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join("");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Your money and the model's money after each session" className="mt-3 h-auto w-full">
      <defs>
        <Wobble id={`c${id}`} />
      </defs>
      {Array.from({ length: total + 1 }, (_, i) => (
        <line key={i} x1={x(i)} x2={x(i)} y1={pad} y2={H - pad} stroke="#0e7490" strokeOpacity="0.12" />
      ))}
      <line x1={pad} x2={W - pad} y1={y(START)} y2={y(START)} stroke="#78716c" strokeWidth="1.2" strokeDasharray="4 5" />
      <g filter={`url(#c${id})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={line(model)} stroke="#0891b2" strokeWidth="3" />
        <path d={line(yours)} stroke="#d97706" strokeWidth="3.5" />
      </g>
      <circle cx={x(model.length)} cy={y(model.at(-1) ?? START)} r="4.5" fill="#22d3ee" stroke="#1c1917" strokeWidth="1.5" />
      <circle cx={x(yours.length)} cy={y(yours.at(-1) ?? START)} r="5" fill="#fbbf24" stroke="#1c1917" strokeWidth="1.5" />
    </svg>
  );
}

function ScribbleBurst() {
  const strokes = [
    { d: "M20 30 q8 -14 18 -4", c: "#f59e0b" },
    { d: "M260 22 q10 8 2 18", c: "#06b6d4" },
    { d: "M40 92 l-14 8", c: "#f43f5e" },
    { d: "M280 86 q6 10 16 6", c: "#8b5cf6" },
    { d: "M150 8 l4 -6 l4 6", c: "#10b981" },
    { d: "M90 14 q-6 -10 4 -12", c: "#f43f5e" },
    { d: "M210 100 q10 4 12 -6", c: "#f59e0b" },
  ];
  return (
    <svg aria-hidden="true" viewBox="0 0 310 110" className="scribble-burst pointer-events-none absolute -top-6 left-0 h-28 w-full">
      {strokes.map((s, i) => (
        <path key={i} d={s.d} pathLength={1} fill="none" stroke={s.c} strokeWidth="4" strokeLinecap="round" style={{ animationDelay: `${i * 0.06}s` }} />
      ))}
    </svg>
  );
}

type SignupStatus = "idle" | "sending" | "joined" | "error";

// Offered after a win, never in the way of one: the breakdown is already on screen by the time this appears.
function NotesOptIn() {
  const [status, setStatus] = useState<SignupStatus>("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), website: form.get("website") }),
      });
      const result = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "Something went wrong. Please try again.");
      }
      setStatus("joined");
      track("replay_subscribe");
    } catch (caught) {
      setStatus("error");
      setError(caught instanceof Error && caught.message ? caught.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "joined") {
    return (
      <div role="status" className="pencil-box mt-5 bg-emerald-100 px-5 py-4">
        <p className="font-pencil text-2xl font-bold text-emerald-800">You&apos;re subscribed.</p>
        <p className="mt-1 text-sm text-stone-700">We&apos;ll write when there&apos;s something worth reading.</p>
      </div>
    );
  }

  return (
    <div className="pencil-box-alt mt-5 bg-white/60 p-5">
      <p className="text-base leading-relaxed">
        We publish results like this one as we get them, hits and misses alike. Want them when they land?
      </p>
      <form action="/api/newsletter" method="post" onSubmit={onSubmit} className="relative mt-3 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="replay-email" className="sr-only">
          Email address
        </label>
        <input
          id="replay-email"
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          placeholder="you@company.com"
          className="pencil-box h-11 min-w-0 flex-1 bg-white px-4 text-base text-stone-900 outline-none placeholder:text-stone-400 focus:bg-amber-50"
        />
        <input
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute -left-[9999px] h-px w-px opacity-0"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="pencil-box sticker h-11 w-full bg-amber-300 px-6 text-sm font-bold disabled:opacity-60 sm:w-auto"
        >
          {status === "sending" ? "Sending…" : "Send me the notes"}
        </button>
      </form>
      <p role="alert" className="mt-2 min-h-5 text-sm text-rose-700">
        {status === "error" ? error : ""}
      </p>
      <p className="text-sm leading-relaxed text-stone-600">
        No pitch, no picks, and you can leave any time. See our{" "}
        <a href="/privacy" className="underline underline-offset-2 hover:text-stone-900">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}

const boardKey = (day: number) => `jarg-replay-day-${day}`;

type Week = { best: number | null; players: number };

function WeekBest({ week }: { week: Week | null }) {
  if (!week) return null;
  return (
    <p className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-y-2 border-dashed border-stone-300 py-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">This week&apos;s high score</span>
      {week.best === null ? (
        <span className="font-pencil text-2xl font-bold text-stone-700">Nobody yet. Finish today&apos;s run to set it.</span>
      ) : (
        <>
          <span className="font-pencil text-3xl font-bold leading-none text-emerald-700">{money(week.best)}</span>
          <span className="text-sm text-stone-600">
            out of {week.players.toLocaleString("en-US")} {week.players === 1 ? "run" : "runs"} · resets Monday
          </span>
        </>
      )}
    </p>
  );
}

function DailyBoard({
  board,
  week,
  firstTry,
  onRetry,
}: {
  board: Board;
  week: Week | null;
  firstTry: boolean;
  onRetry: () => void;
}) {
  if (board.status === "idle") {
    return <p className="font-pencil text-2xl text-stone-600">Counting today&apos;s players…</p>;
  }
  if (board.status === "error") {
    return (
      <p className="text-base text-stone-700">
        Couldn&apos;t reach today&apos;s scoreboard.{" "}
        <button type="button" onClick={onRetry} className="font-semibold underline underline-offset-4">
          Try again
        </button>
      </p>
    );
  }
  const others = board.players - 1;
  const beat = others > 0 ? Math.round((board.below / others) * 100) : null;
  return (
    <>
      {!firstTry && (
        <p className="text-sm text-stone-600">Only your first try at today&apos;s run counts. It ended on {money(board.bankroll)}.</p>
      )}
      {beat === null ? (
        <p className="font-pencil text-3xl font-bold leading-tight">You&apos;re the first to finish today&apos;s run.</p>
      ) : (
        <p className="font-pencil text-3xl font-bold leading-tight">
          You beat <span className="marker">{beat}%</span> of today&apos;s {others.toLocaleString("en-US")} other{" "}
          {others === 1 ? "player" : "players"}.
        </p>
      )}
      {week?.best != null &&
        (board.bankroll >= week.best ? (
          <p className="mt-2 font-pencil text-2xl font-bold text-emerald-700">
            That&apos;s <span className="marker">this week&apos;s high score</span> so far.
          </p>
        ) : (
          <p className="mt-2 text-base text-stone-700">
            This week&apos;s high score is <strong className="text-stone-900">{money(week.best)}</strong>.
          </p>
        ))}
      <p className="mt-1 text-sm text-stone-600">Everyone gets the same run today. A new one is dealt tomorrow.</p>
    </>
  );
}

const initialState: State = {
  ready: false,
  mode: "daily",
  day: 1,
  runIndex: 0,
  deal: 0,
  index: 0,
  bankroll: START,
  played: [],
  size: "small",
  bought: 0,
  resolved: false,
  guess: null,
  board: { status: "idle" },
};

function savedBoard(day: number): Board {
  try {
    const saved = localStorage.getItem(boardKey(day));
    if (saved) return { status: "done", deal: null, ...JSON.parse(saved) };
  } catch {
    // Private mode or a mangled entry: treat today as unplayed.
  }
  return { status: "idle" };
}

export function Replay() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [shareNote, setShareNote] = useState("");
  const sending = useRef(false);
  const board = state.board;
  const setBoard = (next: Board) => dispatch({ type: "board", board: next });
  const [week, setWeek] = useState<Week | null>(null);
  const [splits, setSplits] = useState<(Split | null)[] | null>(null);

  // Dealt after hydration: today's run depends on the player's own calendar.
  useEffect(() => {
    const day = localDay();
    dispatch({ type: "init", day, board: savedBoard(day) });
    fetch(`/api/replay?day=${day}`)
      .then(
        (response) =>
          response.json() as Promise<{
            ok?: boolean;
            weekBest: number | null;
            weekPlayers: number;
            splits?: (Split | null)[];
          }>,
      )
      .then((result) => {
        if (!result.ok) return;
        setWeek({ best: result.weekBest, players: result.weekPlayers });
        setSplits(result.splits ?? null);
      })
      .catch(() => {
        // The high score is a nicety; the game plays the same without it.
      });
  }, []);

  const run = replayRuns[state.runIndex];
  const sessions = run.sessions;
  const busted = state.bankroll <= 0;
  const finished = state.index >= sessions.length;
  const over = state.ready && (finished || (busted && state.resolved));
  const session = sessions[Math.min(state.index, sessions.length - 1)];
  const completed = finished ? sessions.length : state.index + (state.resolved ? 1 : 0);
  const playFor = (i: number) => state.played.find((p) => p.index === i);
  const last = state.played.at(-1);

  const modelLine = modelPath(sessions);
  const modelNow = completed > 0 ? modelLine[completed - 1] : START;
  const modelEnd = modelLine[modelLine.length - 1];
  const yours: number[] = [];
  for (let i = 0, bankroll = START; i < completed; i++) {
    bankroll = playFor(i)?.after ?? bankroll;
    yours.push(bankroll);
  }
  const cells = cellsFor(sessions, state.played, completed);
  const codes = sessions.slice(0, completed).map((s, i) => {
    const play = playFor(i);
    return s.move === null ? "-" : encodePick(play ? { position: play.position, size: play.size, mask: play.mask } : null);
  });
  const codeKey = codes.join(",");

  const canBet = state.ready && !over && !state.resolved && session.move !== null && !busted;
  const won = !busted && state.bankroll > START;
  const story = replayStories[state.runIndex][Math.min(state.index, sessions.length - 1)];
  // Every clue is shown once a session resolves, so the free context can use them too.
  const seen = state.resolved ? ~0 : state.bought;
  const cluesBought = state.played.reduce((sum, play) => sum + clueCount(play.mask), 0);
  const wins = state.played.filter((play) => play.pnl > 0).length;
  const detective = guessPoints(state.guess, run.reveal.ticker, sessions.length);

  const stamps: Stamp[] = [];
  if (over) {
    const bets = state.played.filter((play) => play.position !== "out");
    let low = START;
    for (const value of yours) low = Math.min(low, value);
    const modelMissed = (i: number) => {
      const s = sessions[i];
      return s.move !== null && s.flag !== "out" && direction(s.flag) * s.move < 0;
    };
    if (state.bankroll > modelEnd) stamps.push({ id: "model", label: "Beat the model", emoji: "🤖", tone: "border-cyan-700 text-cyan-800" });
    if (state.played.some((play) => modelMissed(play.index) && play.pnl >= 0))
      stamps.push({ id: "dodge", label: "Dodged its miss", emoji: "🛡️", tone: "border-emerald-700 text-emerald-800" });
    if (state.played.some((play) => play.size === "big" && play.pnl > 0 && Math.abs(sessions[play.index].move ?? 0) >= 50))
      stamps.push({ id: "big", label: "Big game hunter", emoji: "🐘", tone: "border-amber-700 text-amber-800" });
    if (bets.length >= 3 && bets.every((play) => play.pnl >= 0))
      stamps.push({ id: "clean", label: "Clean sheet", emoji: "🧼", tone: "border-sky-700 text-sky-800" });
    if (detective > 0) stamps.push({ id: "named", label: "Named it", emoji: "🕵️", tone: "border-violet-700 text-violet-800" });
    if (cluesBought === 0 && won)
      stamps.push({ id: "bare", label: "No clues needed", emoji: "✋", tone: "border-stone-700 text-stone-800" });
    if (low <= START * 0.6 && won) stamps.push({ id: "comeback", label: "Comeback", emoji: "🧟", tone: "border-rose-700 text-rose-700" });
  }

  // A clue is paid for on the spot; a bet's result waits for the reveal to draw.
  const youShown = useCountUp(state.bankroll, { delay: state.resolved ? 700 : 0, duration: state.resolved ? 900 : 350 });
  const modelShown = useCountUp(over ? modelEnd : modelNow, { delay: 700 });

  const submit = () => {
    if (sending.current) return;
    sending.current = true;
    const day = state.day;
    const deal = state.deal;
    fetch("/api/replay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day, picks: codeKey.split(",") }),
    })
      .then(
        (response) =>
          response.json() as Promise<{
            ok?: boolean;
            bankroll: number;
            players: number;
            below: number;
            weekBest: number | null;
            weekPlayers: number;
          }>,
      )
      .then((result) => {
        if (!result.ok) throw new Error("rejected");
        setWeek({ best: result.weekBest, players: result.weekPlayers });
        const entry = { bankroll: result.bankroll, players: result.players, below: result.below };
        try {
          localStorage.setItem(boardKey(day), JSON.stringify(entry));
        } catch {
          // Without storage a refresh lets them post again; the server still scores the picks honestly.
        }
        setBoard({ status: "done", deal, ...entry });
        track("replay_daily_finish");
      })
      .catch(() => setBoard({ status: "error" }))
      .finally(() => {
        sending.current = false;
      });
  };

  useEffect(() => {
    if (over && state.mode === "daily" && board.status === "idle") submit();
    // submit reads the same values listed here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [over, state.mode, board.status, codeKey]);

  const commit = (position: Position) => {
    if (!canBet || session.move === null) return;
    const pnl = settle(state.bankroll * SIZES[state.size], session.move, position);
    if (pnl !== 0 && typeof navigator.vibrate === "function") navigator.vibrate(pnl > 0 ? 30 : [60, 40, 60]);
    dispatch({ type: "commit", position });
  };

  const practiceAnother = () => {
    const others = replayRuns.map((_, i) => i).filter((i) => i !== state.runIndex);
    dispatch({ type: "practice", runIndex: others[Math.floor(Math.random() * others.length)] });
  };

  const label = state.mode === "daily" ? `Replay #${state.day}` : "Replay (practice)";
  const shareText = [
    `jargAI ${label}`,
    cells
      .filter((cell): cell is Exclude<Cell, "todo"> => cell !== "todo")
      .map((cell) => cellEmoji[cell])
      .join(""),
    `Me ${money(state.bankroll)} · Model ${money(modelEnd)}`,
    cluesBought ? `🔎 ${cluesBought} ${cluesBought === 1 ? "clue" : "clues"} bought` : "🔎 no clues bought",
    ...(detective > 0 ? [`🕵️ named the stock in session ${(state.guess?.at ?? 0) + 1} (+${detective})`] : []),
    ...(stamps.length ? [stamps.map((stamp) => stamp.emoji).join("") + ` ${stamps.length} ${stamps.length === 1 ? "stamp" : "stamps"}`] : []),
    "jarg.ai/#replay",
  ].join("\n");

  const share = async () => {
    setShareNote("");
    try {
      if (typeof navigator.share === "function" && window.matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
        setShareNote("Copied. Paste it anywhere.");
      }
      track("replay_share");
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setShareNote("Couldn't copy it. Select the card text above instead.");
      }
    }
  };

  const lead = youShown - modelShown;
  const leadText =
    Math.abs(lead) < 1 ? "Neck and neck." : lead > 0 ? `You lead by ${money(lead)}.` : `The model leads by ${money(-lead)}.`;

  const verdict = busted
    ? "Wiped out."
    : state.bankroll > START
      ? "You finished ahead!"
      : state.bankroll === START
        ? "Dead level."
        : "Behind, but still standing.";

  return (
    <section id="replay" aria-labelledby="replay-title" className="scroll-mt-16 border-t border-white/8 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading id="replay-title" eyebrow="The replay" title="Could you have called it?">
          Real runs from the held-out stretch the model was scored on, replayed one session at a time. Each session you
          see the crowd, the story so far and what history says about setups like it, plus one clue free, never the
          ticker. Buy more clues if you think they&apos;re worth it, then bet on a rise, a drop, or sit it out, and race
          the model&apos;s own calls to the finish. Winning bets turn the ticker&apos;s letters over: name the stock early
          for detective points. Everyone gets the same run each day, you see how other players called it, and the
          week&apos;s best finish goes up as the high score.
        </SectionHeading>

        <div className="paper relative mt-10 rounded-md p-4 shadow-[0_30px_80px_rgba(0,0,0,0.5)] sm:p-6 md:p-8">
          <span aria-hidden="true" className="tape absolute -top-3 left-8 h-6 w-24 -rotate-6" />
          <span aria-hidden="true" className="tape absolute -top-3 right-10 h-6 w-20 rotate-3" />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div role="group" aria-label="Which run to play" className="flex flex-wrap gap-2">
              <button
                type="button"
                aria-pressed={state.mode === "daily"}
                onClick={() => dispatch({ type: "daily" })}
                className={`pencil-box min-h-11 px-4 text-sm font-bold ${state.mode === "daily" ? "bg-amber-300" : "bg-white/50 hover:bg-white"}`}
              >
                Today&apos;s run{state.ready ? ` · #${state.day}` : ""}
              </button>
              <button
                type="button"
                aria-pressed={state.mode === "practice"}
                onClick={practiceAnother}
                className={`pencil-box-alt min-h-11 px-4 text-sm font-bold ${state.mode === "practice" ? "bg-cyan-200" : "bg-white/50 hover:bg-white"}`}
              >
                {state.mode === "practice" ? "Deal another practice run" : "Practice"}
              </button>
            </div>
            <p className="font-pencil text-2xl font-bold lg:hidden">
              <span className="text-amber-600">You {money(youShown)}</span>
              <span className="text-stone-400"> · </span>
              <span className="text-cyan-700">Model {money(modelShown)}</span>
            </p>
          </div>
          {state.mode === "daily" && <WeekBest week={week} />}

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:gap-8">
            <div className="min-w-0">
              {!state.ready ? (
                <p className="font-pencil text-3xl text-stone-500">Dealing today&apos;s run…</p>
              ) : over ? (
                <div key={`over-${state.deal}`} className="fade-up relative">
                  {won && <ScribbleBurst />}
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">{label} · run over</p>
                  <p
                    className={`mt-1 font-pencil text-5xl font-bold leading-none sm:text-6xl ${
                      busted ? "text-rose-600" : won ? "text-emerald-700" : ""
                    }`}
                  >
                    {verdict}
                  </p>
                  <p className="mt-3 text-base leading-relaxed text-stone-700">
                    You ended on <strong className="text-stone-900">{money(state.bankroll)}</strong>. Betting{" "}
                    {Math.round(MODEL_STAKE * 100)}% on every flag it raised, the model ended on{" "}
                    <strong className="text-stone-900">{money(modelEnd)}</strong>
                    {modelEnd === 0 ? ", wiped out by its own calls" : ""}.{" "}
                    {state.bankroll > modelEnd ? "You beat it." : state.bankroll < modelEnd ? "It beat you." : "A tie."}
                  </p>

                  {/* A bust cuts the run short, so the session that did it still has to explain itself. */}
                  {busted && last && (
                    <p className="mt-4 border-l-4 border-rose-400 pl-4 text-base leading-relaxed text-stone-700">
                      {sessions[last.index].outcome}
                    </p>
                  )}

                  {state.mode === "daily" && (
                    <div className="pencil-box mt-5 bg-amber-50/80 p-5">
                      <DailyBoard
                        board={board}
                        week={week}
                        firstTry={board.status !== "done" || board.deal === state.deal}
                        onRetry={() => setBoard({ status: "idle" })}
                      />
                    </div>
                  )}

                  <div className="pencil-box mt-5 bg-white/60 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Your stamps</p>
                    <Stamps stamps={stamps} />
                    <p className="mt-3 text-sm text-stone-700">
                      {detective > 0
                        ? `Detective points: ${detective}. You named it in session ${(state.guess?.at ?? 0) + 1}.`
                        : state.guess
                          ? "Your guess at the stock missed, so no detective points this run."
                          : "You never guessed the stock. Next time, take a shot: the earlier you name it, the more it's worth."}
                    </p>
                  </div>

                  <div className="pencil-box-alt mt-5 bg-white/60 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Your card</p>
                    <div className="mt-2">
                      <Squares cells={cells} />
                    </div>
                    <p className="mt-3 whitespace-pre-line font-mono text-xs leading-relaxed text-stone-600">{shareText}</p>
                    <button
                      type="button"
                      onClick={share}
                      className="pencil-box sticker mt-4 min-h-11 bg-cyan-200 px-5 text-sm font-bold"
                    >
                      Share your card
                    </button>
                    <p role="status" className="mt-2 min-h-5 text-sm text-stone-600">
                      {shareNote}
                    </p>
                  </div>

                  {won ? (
                    <div className="pencil-box mt-5 bg-emerald-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">The breakdown</p>
                      <p className="mt-1 font-pencil text-3xl font-bold leading-tight">
                        {run.reveal.stock} ({run.reveal.ticker}), {run.reveal.month}
                      </p>
                      <p className="mt-1 text-base leading-relaxed text-stone-700">{run.reveal.verdict}</p>
                      <p className="mt-3 text-sm leading-relaxed text-stone-600">{run.reveal.moral}</p>
                      <a
                        href={run.reveal.href}
                        className="mt-3 inline-block font-semibold text-emerald-800 underline decoration-emerald-600/40 underline-offset-4 hover:decoration-emerald-600"
                      >
                        Read the full case study →
                      </a>
                    </div>
                  ) : (
                    <p className="mt-5 text-base leading-relaxed text-stone-700">
                      The breakdown stays shut: which stock this was, who was posting, and how the model scored them.
                      Finish a run ahead of where you started and it opens.
                    </p>
                  )}
                  {won && <NotesOptIn />}

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "restart" })}
                      className="pencil-box sticker min-h-11 bg-amber-300 px-5 text-sm font-bold"
                    >
                      Play this run again
                    </button>
                    <button
                      type="button"
                      onClick={practiceAnother}
                      className="pencil-box-alt min-h-11 bg-white/60 px-5 text-sm font-bold hover:bg-white"
                    >
                      Practice another run
                    </button>
                  </div>
                </div>
              ) : (
                <div key={`${state.deal}-${state.index}`} className="fade-up">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-pencil text-4xl font-bold leading-none">{session.label}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-500 tabular-nums">
                        {state.index + 1} of {sessions.length}
                      </span>
                      <Squares cells={cells} size="sm" />
                    </div>
                  </div>
                  <div className="mt-3">
                    {session.context ? (
                      <CrowdMeter session={session} context={session.context} />
                    ) : (
                      <p className="text-lg font-semibold">{session.crowd}</p>
                    )}
                    <CrowdDoodle people={peopleIn(session)} />
                  </div>
                  {state.index === 0 && <p className="mt-2 text-sm leading-relaxed text-stone-600">{run.setup}</p>}

                  <div className={`mt-4 grid gap-3 ${session.context ? "sm:grid-cols-[1.4fr_1fr]" : ""}`}>
                    <StoryChart story={story} showOpen={Boolean(seen & clueBit("gap"))} />
                    {session.context && (
                      <HistorySays context={session.context} withRunUp={Boolean(seen & clueBit("runUp"))} />
                    )}
                  </div>

                  <div className="mt-4">
                    <GuessStrip
                      runId={run.id}
                      ticker={run.reveal.ticker}
                      wins={wins}
                      index={state.index}
                      sessions={sessions.length}
                      guess={state.guess}
                      canGuess={!busted}
                      onGuess={(pick) => {
                        dispatch({ type: "guess", pick });
                        track("replay_guess");
                      }}
                    />
                  </div>

                  <div className="mt-4">
                    <SwipeCard enabled={canBet} onSwipe={commit}>
                      <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">The clue</p>
                      <p className="mt-1 font-pencil text-3xl font-bold leading-tight sm:text-[2rem]">
                        {clueFor(sessions, state.index)}
                      </p>
                    </SwipeCard>
                  </div>

                  {session.context && !state.resolved && (
                    <ClueCards
                      session={session}
                      context={session.context}
                      mood={story.mood}
                      bought={state.bought}
                      revealed={false}
                      canBuy={canBet && state.bankroll - CLUE_COST > 0}
                      onBuy={(clue) => dispatch({ type: "buy", clue })}
                    />
                  )}

                  {state.resolved && last && last.index === state.index ? (
                    <div className="mt-5" aria-live="polite">
                      <Reveal session={session} play={last} />
                      <p className="mt-3 text-base leading-relaxed text-stone-800">{session.outcome}</p>
                      <p className="mt-2 text-sm text-stone-600">
                        {session.dropRank && `Drop score: ${session.dropRank}. `}
                        {session.riseRank && `Rise score: ${session.riseRank}. `}
                        The model{" "}
                        {session.flag === "out" ? "took no direction here" : `was ${session.flag === "drop" ? "short" : "long"}`}.
                      </p>
                      {state.mode === "daily" && splits && (
                        <PlayersSplit split={splits[state.index] ?? null} mine={last.position} />
                      )}
                      {session.context && (
                        <ClueCards
                          session={session}
                          context={session.context}
                          mood={story.mood}
                          bought={last.mask}
                          revealed
                          canBuy={false}
                          onBuy={() => {}}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => dispatch({ type: "next" })}
                        className="pencil-box sticker mt-5 min-h-11 bg-amber-300 px-6 text-base font-bold"
                      >
                        {busted || state.index === sessions.length - 1 ? "See how you did →" : "Next session →"}
                      </button>
                    </div>
                  ) : session.move === null ? (
                    <div className="mt-5">
                      <p className="text-sm leading-relaxed text-stone-600">{session.outcome}</p>
                      <button
                        type="button"
                        onClick={() => dispatch({ type: "next" })}
                        className="pencil-box sticker mt-4 min-h-11 bg-amber-300 px-6 text-base font-bold"
                      >
                        Next session →
                      </button>
                    </div>
                  ) : (
                    <div className="mt-5">
                      <div role="group" aria-label="Bet size" className="flex flex-wrap gap-2">
                        {(Object.keys(SIZES) as Size[]).map((size) => (
                          <button
                            key={size}
                            type="button"
                            aria-pressed={state.size === size}
                            onClick={() => dispatch({ type: "size", size })}
                            className={`${size === "small" ? "pencil-box" : "pencil-box-alt"} min-h-11 px-4 text-sm font-bold tabular-nums ${
                              state.size === size ? "bg-stone-900 text-amber-200" : "bg-white/50 text-stone-700 hover:bg-white"
                            }`}
                          >
                            {size === "small" ? "Small bet" : "Big bet"} · {money(state.bankroll * SIZES[size])}
                          </button>
                        ))}
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
                        <button
                          type="button"
                          onClick={() => commit("drop")}
                          className="pencil-box sticker flex min-h-16 flex-col items-center justify-center bg-rose-200 px-2 py-3"
                        >
                          <span className="whitespace-nowrap font-pencil text-[1.7rem] font-bold leading-none sm:text-3xl">▼ Drop</span>
                          <span className="mt-1 text-[11px] leading-tight text-stone-700 sm:text-xs">falls behind the market</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => commit("out")}
                          className="pencil-box-alt sticker flex min-h-16 flex-col items-center justify-center bg-white/80 px-2 py-3"
                        >
                          <span className="whitespace-nowrap font-pencil text-[1.7rem] font-bold leading-none sm:text-3xl">Sit out</span>
                          <span className="mt-1 text-[11px] leading-tight text-stone-700 sm:text-xs">no bet</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => commit("rise")}
                          className="pencil-box sticker flex min-h-16 flex-col items-center justify-center bg-emerald-200 px-2 py-3"
                        >
                          <span className="whitespace-nowrap font-pencil text-[1.7rem] font-bold leading-none sm:text-3xl">▲ Rise</span>
                          <span className="mt-1 text-[11px] leading-tight text-stone-700 sm:text-xs">beats the market</span>
                        </button>
                      </div>
                      <p className="mt-3 text-xs leading-relaxed text-stone-600">
                        <span className="hidden font-semibold text-stone-800 pointer-coarse:inline">
                          Or swipe the clue: right for a rise, left for a drop.{" "}
                        </span>
                        A drop bet has no floor: if the stock runs, it can cost several times the bet, and the run ends
                        at zero.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <aside aria-label="You against the model" className="pencil-box-alt h-fit bg-white/55 p-5 lg:sticky lg:top-24">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">You</p>
                  <p className="font-pencil text-4xl font-bold leading-tight text-amber-600 tabular-nums sm:text-5xl">
                    {money(youShown)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">The model</p>
                  <p className="font-pencil text-4xl font-bold leading-tight text-cyan-700 tabular-nums sm:text-5xl">
                    {money(modelShown)}
                  </p>
                </div>
              </div>
              <p className="mt-1 text-sm font-semibold">{state.ready ? leadText : " "}</p>
              <RaceChart yours={yours} model={modelLine.slice(0, completed)} total={sessions.length} />
              <div className="mt-1 flex gap-4 text-xs text-stone-600">
                <span className="flex items-center gap-1.5">
                  <span aria-hidden="true" className="h-1 w-5 rounded-full bg-amber-600" /> you
                </span>
                <span className="flex items-center gap-1.5">
                  <span aria-hidden="true" className="h-1 w-5 rounded-full bg-cyan-600" /> the model
                </span>
                <span className="flex items-center gap-1.5">
                  <span aria-hidden="true" className="h-0 w-5 border-t-2 border-dashed border-stone-500" /> {money(START)} start
                </span>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-stone-600">
                The model bets {Math.round(MODEL_STAKE * 100)}% of what it has every time it flags a direction and sits
                out everything else. Its moves show up as each session resolves.
              </p>
            </aside>
          </div>

          <p className="mt-8 border-t-2 border-dashed border-stone-400/60 pt-4 text-xs leading-relaxed text-stone-600">
            Every number comes from one scoring run on data the model never trained on. Points are the stock&apos;s
            return minus the S&amp;P 500&apos;s over the three sessions after the open, so the three-session windows
            overlap and consecutive sessions are not independent calls. The crowd meter and the clues use only what was
            known at the open: price, run-up and volume figures come from the close before each session, and the gap
            compares that session&apos;s open with that close. The story chart ends at that close. History says counts
            every session the research scored, these included. Mood is the share of the session&apos;s posts the
            research read as bullish or bearish, and news counts the stories it tied to that session. A replay of real
            runs is an illustration, not a track record, and nothing here is advice.
          </p>
        </div>
      </div>
    </section>
  );
}
