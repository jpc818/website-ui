// Scoring for the Replay game. The browser and the Worker both import this file, so a score posted to the
// daily scoreboard is recomputed on the server from the player's picks and can't be made up.

import { replayRuns, type Position, type ReplayRun, type ReplaySession } from "./replayRuns";

export const START = 1000;
export const SIZES = { small: 0.1, big: 0.4 } as const;
export type Size = keyof typeof SIZES;
// The model line is a fixed benchmark, so it stakes the same share of what it has left on every flag it takes.
export const MODEL_STAKE = 0.25;

// Extra clues a player can buy before betting. Bits in a mask, in this order.
export const CLUES = ["runUp", "gap", "volume", "room"] as const;
export type Clue = (typeof CLUES)[number];
export const CLUE_COST = 10;
export const clueBit = (clue: Clue) => 1 << CLUES.indexOf(clue);
export const clueCount = (mask: number) => CLUES.filter((clue) => mask & clueBit(clue)).length;

export function cluesOn(session: ReplaySession): Clue[] {
  return CLUES.filter((clue) => (clue === "room" ? session.room !== null : session.context !== null));
}

export type Pick = { position: Position; size: Size; mask: number };

export const direction = (position: Position) => (position === "rise" ? 1 : position === "drop" ? -1 : 0);

// Points are the stock's return minus the market's, so a stake tracks the move one for one.
// A short has no floor: a move of +494 costs nearly five times what it staked.
export const settle = (stake: number, move: number, position: Position) => stake * (move / 100) * direction(position);

export function modelPath(sessions: ReplaySession[]) {
  let bankroll = START;
  return sessions.map((session) => {
    if (session.move !== null && session.flag !== "out" && bankroll > 0) {
      bankroll = Math.max(0, bankroll + settle(bankroll * MODEL_STAKE, session.move, session.flag));
    }
    return bankroll;
  });
}

// One code per session: "-" for a session with nothing to play, "o" to stay out, otherwise the side (r or d)
// followed by the size (s or b). A hex digit for the clues bought follows when any were.
export function encodePick(pick: Pick | null) {
  if (!pick) return "-";
  const clues = pick.mask ? pick.mask.toString(16) : "";
  if (pick.position === "out") return `o${clues}`;
  return `${pick.position[0]}${pick.size[0]}${clues}`;
}

function decodePick(code: string): Pick | null {
  const match = /^(o|[rd][sb])([0-9a-f])?$/.exec(code);
  if (!match) return null;
  const [, move, clues] = match;
  const mask = clues ? parseInt(clues, 16) : 0;
  if (move === "o") return { position: "out", size: "small", mask };
  return { position: move[0] === "r" ? "rise" : "drop", size: move[1] === "s" ? "small" : "big", mask };
}

// The bankroll a list of codes ends on, or null if the codes don't describe a legal playthrough of the run.
// A run ends early only when the bankroll hits zero.
export function scoreRun(run: ReplayRun, codes: string[]) {
  if (codes.length === 0 || codes.length > run.sessions.length) return null;
  let bankroll = START;
  for (let i = 0; i < codes.length; i++) {
    if (bankroll <= 0) return null;
    const session = run.sessions[i];
    if (session.move === null) {
      if (codes[i] !== "-") return null;
      continue;
    }
    const pick = decodePick(codes[i]);
    if (!pick) return null;
    const offered = cluesOn(session).reduce((mask, clue) => mask | clueBit(clue), 0);
    if (pick.mask & ~offered) return null;
    const cost = clueCount(pick.mask) * CLUE_COST;
    if (bankroll - cost <= 0) return null;
    bankroll -= cost;
    bankroll = Math.max(0, bankroll + settle(bankroll * SIZES[pick.size], session.move, pick.position));
  }
  if (codes.length < run.sessions.length && bankroll > 0) return null;
  return bankroll;
}

// Day 1 of the daily run. Players count days on their own calendar; the server allows a day either side.
const FIRST_DAY = Date.UTC(2026, 10, 4);
const DAY_MS = 86_400_000;
// The order the runs come round in, so the same run never lands on two days in a row.
const DAILY_ORDER = [3, 0, 2, 1];

export const dayFromParts = (year: number, month: number, date: number) =>
  Math.max(1, Math.floor((Date.UTC(year, month, date) - FIRST_DAY) / DAY_MS) + 1);

export const localDay = (now = new Date()) => dayFromParts(now.getFullYear(), now.getMonth(), now.getDate());

export const utcDay = (now = new Date()) => dayFromParts(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

export const dailyRunIndex = (day: number) => DAILY_ORDER[(day - 1) % DAILY_ORDER.length] % replayRuns.length;

// Weeks run Monday to Sunday. Day 1 was a Wednesday, so a week can start before day 1.
export const weekStart = (day: number) => day - ((day + 1) % 7);
