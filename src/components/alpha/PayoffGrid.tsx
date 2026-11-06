"use client";

import { useState } from "react";

export const moves = ["Follow", "Ignore", "Discount"] as const;
export type Move = (typeof moves)[number];

export type Player = {
  name: string;
  payoffs: Record<Move, number>;
  // Why each box lands where it does, shown when the box is tapped.
  why: Record<Move, string>;
};

// Class names are written out in full so Tailwind can find them at build time.
const payoffStyle: Record<number, { label: string; title: string; text: string; className: string; ring: string }> = {
  1: { label: "+", title: "Wins", text: "text-cyan", className: "bg-cyan/15 text-cyan hover:bg-cyan/25", ring: "ring-cyan" },
  0: { label: "0", title: "Neutral", text: "text-muted", className: "bg-white/[0.04] text-muted hover:bg-white/10", ring: "ring-white/60" },
  [-1]: { label: "−", title: "Loses", text: "text-red-400", className: "bg-red-500/10 text-red-400 hover:bg-red-500/20", ring: "ring-red-400" },
};

type Pick = { player: number; move: Move } | null;

export function PayoffGrid({ players }: { players: Player[] }) {
  const [pick, setPick] = useState<Pick>(null);

  const selected = pick ? players[pick.player] : null;
  const selectedStyle = selected && pick ? payoffStyle[selected.payoffs[pick.move]] : null;

  return (
    <>
      <table className="w-full table-fixed border-separate border-spacing-1.5 text-center sm:border-spacing-2">
        <caption className="mb-3 text-left text-sm font-semibold uppercase tracking-wider text-muted">
          Stylized payoffs: an illustration, not measured results
        </caption>
        <thead>
          <tr>
            <th scope="col" className="w-[30%]">
              <span className="sr-only">Player</span>
            </th>
            {moves.map((move) => (
              <th key={move} scope="col" className="pb-1 text-sm font-semibold text-foreground">
                {move}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {players.map((player, playerIndex) => (
            <tr key={player.name}>
              <th scope="row" className="pr-1 text-left text-sm font-semibold sm:text-base">
                {player.name}
              </th>
              {moves.map((move) => {
                const style = payoffStyle[player.payoffs[move]];
                const isSelected = pick?.player === playerIndex && pick.move === move;
                return (
                  <td key={move} className="p-0">
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      aria-label={`${player.name}, ${move}: ${style.title}. Show why.`}
                      title={style.title}
                      onClick={() => setPick(isSelected ? null : { player: playerIndex, move })}
                      className={`h-14 w-full cursor-pointer rounded-xl font-[family-name:var(--font-heading)] text-2xl font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 sm:h-16 ${style.className} ${style.ring} ${
                        isSelected ? "ring-2" : ""
                      }`}
                    >
                      <span aria-hidden="true">{style.label}</span>
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div
        aria-live="polite"
        className="mt-3 min-h-[5.5rem] rounded-2xl border border-white/8 bg-background/40 px-4 py-3 text-base leading-relaxed"
      >
        {selected && pick && selectedStyle ? (
          <>
            <p className="text-sm font-semibold text-foreground">
              {selected.name} · {pick.move} ·{" "}
              <span className={selectedStyle.text}>
                {selectedStyle.label} {selectedStyle.title.toLowerCase()}
              </span>
            </p>
            <p className="mt-1 text-muted">{selected.why[pick.move]}</p>
          </>
        ) : (
          <p className="text-muted">Tap any box to see why it lands where it does.</p>
        )}
      </div>
    </>
  );
}
