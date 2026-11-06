import type { ReactNode } from "react";
import { SectionHeading } from "@/components/alpha/SectionHeading";

const WAVE_DELAY = 0.6;

type CascadeNode = { x: number; y: number; depth: number; parent?: number };

const cascadeNodes: CascadeNode[] = (() => {
  const nodes: CascadeNode[] = [{ x: 24, y: 90, depth: 0 }];
  const xs = [24, 100, 176, 252];
  const spread = [0, 50, 18, 8];
  let frontier = [0];
  for (let depth = 1; depth < xs.length; depth++) {
    const next: number[] = [];
    for (const parentIndex of frontier) {
      const parent = nodes[parentIndex];
      const offsets = depth === 1 ? [-1, 0, 1] : [-1, 1];
      for (const o of offsets) {
        nodes.push({ x: xs[depth], y: parent.y + o * spread[depth], depth, parent: parentIndex });
        next.push(nodes.length - 1);
      }
    }
    frontier = next;
  }
  return nodes;
})();

const bystanders = [
  [60, 20], [62, 160], [138, 10], [140, 170], [214, 40], [212, 140], [266, 90], [86, 128], [150, 94],
];

const cascadeDepths = [0, 1, 2, 3];

function Cascade() {
  return (
    <svg width="280" height="180" viewBox="0 0 280 180" role="img" aria-label="Animation of one person acting, then a few copying, then a whole crowd following" className="block h-full max-h-full w-full">
      {bystanders.map(([x, y]) => (
        <circle key={`b${x}-${y}`} cx={x} cy={y} r="3.5" fill="rgba(179,186,197,0.35)" />
      ))}
      {cascadeDepths.map((depth) => (
        <g
          key={depth}
          className="cascade-wave"
          style={{ animationDelay: `${depth * WAVE_DELAY}s` }}
        >
          {cascadeNodes.map((node, i) => {
            if (node.depth !== depth || node.parent === undefined) return null;
            const parent = cascadeNodes[node.parent];
            return (
              <line
                key={i}
                x1={parent.x}
                y1={parent.y}
                x2={node.x}
                y2={node.y}
                stroke="#22d3ee"
                strokeWidth="1.2"
              />
            );
          })}
          {cascadeNodes.map((node, i) =>
            node.depth === depth ? (
              <circle
                key={i}
                cx={node.x}
                cy={node.y}
                r={depth === 0 ? 8 : 5}
                fill={depth === 0 ? "#f59e0b" : "#22d3ee"}
              />
            ) : null,
          )}
        </g>
      ))}
      <text x="24" y="114" textAnchor="middle" fontSize="10" fill="#f59e0b" fontWeight="600">
        first
      </text>
    </svg>
  );
}

const TILE = 300;
const LAG = 30;
const wave = (x: number) =>
  0.55 * Math.sin((2 * Math.PI * 2 * x) / TILE) +
  0.3 * Math.sin((2 * Math.PI * 5 * x) / TILE + 1) +
  0.15 * Math.sin((2 * Math.PI * 9 * x) / TILE + 2);

const LEADER_Y = 42;
const FOLLOWER_Y = 104;
const AMP = 20;

const seriesPath = (base: number, shift: number) =>
  Array.from({ length: (2 * TILE) / 2 + 1 }, (_, i) => {
    const x = i * 2;
    return `${i === 0 ? "M" : "L"}${x},${(base - AMP * wave(x - shift)).toFixed(2)}`;
  }).join(" ");

const peakX = (() => {
  let best = 0;
  for (let x = 0; x < TILE; x++) if (wave(x) > wave(best)) best = x;
  return best;
})();

function LeadLag() {
  const leaderPeak = LEADER_Y - AMP * wave(peakX);
  const followerPeak = FOLLOWER_Y - AMP * wave(peakX);
  return (
    <svg width="300" height="150" viewBox="0 0 300 150" role="img" aria-label="Animation of two activity lines where the second repeats the first after a brief delay" className="block h-full max-h-full w-full">
      <defs>
        <clipPath id="leadlag-clip">
          <rect x="0" y="0" width={TILE} height="150" />
        </clipPath>
      </defs>
      <g clipPath="url(#leadlag-clip)">
        <g className="leadlag-track">
          <path d={seriesPath(LEADER_Y, 0)} fill="none" stroke="#f59e0b" strokeWidth="2" />
          <path d={seriesPath(FOLLOWER_Y, LAG)} fill="none" stroke="#22d3ee" strokeWidth="2" />
          {[0, TILE].map((offset) => {
            const x1 = peakX + offset;
            const x2 = x1 + LAG;
            return (
              <g key={offset}>
                <circle cx={x1} cy={leaderPeak} r="4" fill="#f59e0b" />
                <circle cx={x2} cy={followerPeak} r="4" fill="#22d3ee" />
                <line x1={x1} y1={leaderPeak} x2={x2} y2={followerPeak} stroke="#f4f4f5" strokeWidth="1" strokeDasharray="3 3" />
                <text x={(x1 + x2) / 2 + 8} y={(leaderPeak + followerPeak) / 2} fontSize="12" fill="#f4f4f5" fontWeight="600">
                  Δt
                </text>
              </g>
            );
          })}
        </g>
      </g>
      <rect x="4" y="4" width="56" height="18" rx="9" fill="#11151c" />
      <text x="32" y="17" textAnchor="middle" fontSize="11" fill="#f59e0b" fontWeight="600">
        leader
      </text>
      <rect x="4" y="128" width="64" height="18" rx="9" fill="#11151c" />
      <text x="36" y="141" textAnchor="middle" fontSize="11" fill="#22d3ee" fontWeight="600">
        follower
      </text>
    </svg>
  );
}

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const bump = (h: number, center: number, width: number) =>
  Math.exp(-((h - center) ** 2) / width);
const activity = (day: number, hour: number) => {
  const weekend = day >= 5;
  const level = weekend
    ? 0.6 * bump(hour, 11, 8) + 0.9 * bump(hour, 21.5, 6)
    : 0.7 * bump(hour, 8, 3) + 0.5 * bump(hour, 12.5, 2) + 1.0 * bump(hour, 20.5, 5);
  return Math.min(1, 0.14 + level);
};

function Habits() {
  return (
    <div
      role="img"
      aria-label="Heatmap of activity by weekday and hour, with repeating peaks in the morning, at lunch, and in the evening"
      className="flex w-full flex-col justify-center"
    >
      <div className="flex">
        <div className="grid w-9 shrink-0 grid-rows-7 gap-[2px]">
          {days.map((day) => (
            <span
              key={day}
              className="self-center pr-1 text-[11px] font-medium leading-none text-muted"
            >
              {day}
            </span>
          ))}
        </div>
        <div className="relative grid flex-1 grid-cols-24 gap-[2px]">
          {days.map((day, d) =>
            Array.from({ length: 24 }, (_, h) => (
              <span
                key={`${day}-${h}`}
                className="h-[11px] rounded-[2px] sm:h-3"
                style={{
                  backgroundColor: `rgba(34, 211, 238, ${activity(d, h).toFixed(2)})`,
                }}
              />
            )),
          )}
          <span className="heat-sweep pointer-events-none absolute -inset-y-[2px] left-0 w-[calc((100%+2px)/24)] rounded-[3px] border-[1.5px] border-accent" />
        </div>
      </div>
      <div className="flex pt-1">
        <div className="w-9 shrink-0" />
        <div className="grid flex-1 grid-cols-24 gap-[2px]">
          {Array.from({ length: 24 }, (_, h) => (
            <span key={h} className="text-center text-[10px] leading-none text-muted">
              {h % 6 === 0 ? h : ""}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

const panels: {
  title: string;
  body: string;
  math: string;
  graphic: ReactNode;
}[] = [
  {
    title: "Who moves first",
    body: "One person acts, a few copy, then the crowd piles in. Today we score mention bursts and share-of-attention; full cascade mapping is in research.",
    math: "spread rate · depth · time to tip",
    graphic: <Cascade />,
  },
  {
    title: "Who copies whom",
    body: "When one account's actions keep showing up in everyone else's a little later, that account is a leader. Author track records capture who was early today; account-level lead-lag is in research.",
    math: "cross-correlation at lag Δt",
    graphic: <LeadLag />,
  },
  {
    title: "When they act",
    body: "Behavior runs on routines: same days, same months, same triggers. Weekday and month seasonality are in the live models today.",
    math: "hour × weekday seasonality",
    graphic: <Habits />,
  },
];

export function CrowdMath() {
  return (
    <section
      id="math"
      aria-labelledby="math-title"
      className="border-t border-white/8 py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading
          id="math-title"
          eyebrow="The math"
          title="A crowd is a system. Systems can be modeled."
        >
          People are more predictable than they think. They show up at the same
          times, react to the same triggers, and copy the same people. We turn
          those habits into numbers.
        </SectionHeading>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {panels.map((panel) => (
            <article
              key={panel.title}
              className="flex flex-col rounded-3xl border border-white/8 bg-surface p-6 md:p-7"
            >
              <div className="flex h-48 items-center justify-center rounded-2xl border border-white/5 bg-background/60 p-3">
                {panel.graphic}
              </div>
              <h3 className="mt-6 font-[family-name:var(--font-heading)] text-xl font-bold md:text-2xl">
                {panel.title}
              </h3>
              <p className="mt-2 flex-1 text-base leading-relaxed text-muted">
                {panel.body}
              </p>
              <p className="mt-5 rounded-xl bg-white/[0.04] px-4 py-2.5 font-mono text-sm text-cyan">
                {panel.math}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-4 rounded-3xl border border-accent/30 bg-accent/5 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <p className="max-w-2xl text-lg leading-relaxed">
            <span className="font-semibold text-accent">The output is a probability, never an opinion.</span>{" "}
            How likely is this group to act, and how soon? Then we check it
            against what actually happened.
          </p>
          <p className="shrink-0 font-mono text-base text-foreground">
            P(act&nbsp;|&nbsp;history) ∈ [0,&nbsp;1]
          </p>
        </div>
      </div>
    </section>
  );
}
