import type { StoryStep } from "@/components/alpha/cases/stories";

const GOLD = "#fbbf24";
const GOLD_DEEP = "#b45309";
const DUSK = "#2a1d14";
const RIDGE = "#3d2a1c";
const SAND = "#c8a97e";
const INK = "#120c08";

// Four claim stakes along the creek, one per person on the flagged session.
const stakes = [
  { x: 64, y: 286 },
  { x: 142, y: 318 },
  { x: 262, y: 300 },
  { x: 336, y: 330 },
];

// 250 top-3% flags drawn as 50 nuggets of 5. 64 struck gold, so 13 of 50 are gold.
const ledger = Array.from({ length: 50 }, (_, i) => ({ x: 70 + (i % 10) * 27, y: 176 + Math.floor(i / 10) * 27, gold: i < 13 }));

export function GoldRushArt({ step, steps }: { step: number; steps: StoryStep[] }) {
  const s = steps[step];
  const fleck = step === 1;
  const claims = step >= 3;
  const assay = step === 4;
  const tally = step === 5;
  const fade = "transition-opacity duration-700";
  return (
    <svg viewBox="0 0 400 420" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 block h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="gr-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a2c17" />
          <stop offset="0.55" stopColor="#7c3f17" />
          <stop offset="1" stopColor={DUSK} />
        </linearGradient>
        <radialGradient id="gr-glint" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff7d1" />
          <stop offset="0.35" stopColor={GOLD} />
          <stop offset="1" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="420" fill="url(#gr-sky)" />
      <circle cx="300" cy="150" r="46" fill="#f59e0b" opacity="0.55" />
      <circle cx="300" cy="150" r="30" fill="#fcd34d" opacity="0.8" />
      <path d="M0 210 L48 150 L92 186 L150 118 L206 176 L250 140 L300 190 L352 132 L400 172 L400 420 L0 420Z" fill={RIDGE} />
      <path d="M0 240 L60 204 L120 228 L196 196 L262 230 L330 206 L400 232 L400 420 L0 420Z" fill={DUSK} />

      <path
        d="M-10 372 C60 340 110 384 180 360 S300 330 410 362 L410 420 L-10 420Z"
        fill="#1e3a44"
      />
      <path
        className="creek-shimmer"
        d="M-10 372 C60 340 110 384 180 360 S300 330 410 362"
        fill="none"
        stroke="#7dd3fc"
        strokeOpacity="0.5"
        strokeWidth="2"
        strokeDasharray="6 14"
      />

      {stakes.map((p, i) => (
        <g key={i} className={fade} opacity={claims && i < s.people ? 1 : 0} transform={`translate(${p.x} ${p.y})`}>
          <path d="M0 0 L0 -46" stroke={SAND} strokeWidth="3" strokeLinecap="round" />
          <path d="M0 -46 L26 -38 L0 -30Z" fill={GOLD} stroke={INK} strokeWidth="1" />
          <ellipse cx="0" cy="2" rx="9" ry="3" fill={INK} opacity="0.5" />
        </g>
      ))}

      <g transform="translate(196 318)">
        <ellipse cx="0" cy="8" rx="58" ry="14" fill={INK} opacity="0.45" />
        <ellipse cx="0" cy="0" rx="54" ry="16" fill="#57534e" stroke={INK} strokeWidth="2" />
        <ellipse cx="0" cy="-2" rx="42" ry="10" fill="#78716c" />
        <circle className={fade} cx="6" cy="-3" r="18" fill="url(#gr-glint)" opacity={fleck || assay ? 1 : 0} />
        <circle className={`${fade} glint-pulse`} cx="6" cy="-3" r="3.5" fill="#fff7d1" opacity={fleck || assay ? 1 : 0} />
      </g>

      <g className={fade} opacity={assay ? 1 : 0}>
        <rect x="128" y="96" width="144" height="60" rx="10" fill={INK} fillOpacity="0.8" stroke={GOLD} strokeWidth="1.5" />
        <text x="200" y="118" textAnchor="middle" fontSize="11" fontWeight="700" fill={SAND} letterSpacing="2">
          ASSAY OFFICE
        </text>
        <text x="200" y="146" textAnchor="middle" fontSize="24" fontWeight="800" fill={GOLD}>
          +17 pts
        </text>
      </g>

      <g className={fade} opacity={tally ? 1 : 0}>
        <rect x="40" y="134" width="320" height="196" rx="14" fill={INK} fillOpacity="0.88" stroke={GOLD_DEEP} />
        <text x="200" y="160" textAnchor="middle" fontSize="12" fontWeight="700" fill={SAND} letterSpacing="1.5">
          250 STAKED CLAIMS · EACH = 5
        </text>
        {ledger.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r="8.5" fill={n.gold ? GOLD : "#57534e"} stroke={n.gold ? "#fde68a" : "#44403c"} />
        ))}
        <text x="200" y="320" textAnchor="middle" fontSize="11" fill={SAND}>
          gold: 64 · pyrite: 186
        </text>
      </g>
    </svg>
  );
}
