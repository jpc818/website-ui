import type { StoryStep } from "@/components/alpha/cases/stories";

const NIGHT = "#0b1020";
const HILL = "#141c33";
const HILL_FAR = "#1c2643";
const MOON = "#e2e8f0";
const LANTERN = "#f97316";
const MISS = "#f87171";
const HIT = "#22d3ee";

// One row per alarm on the tally board, revealed as the story reaches it.
const alarms = [
  { n: 1, move: "+494", hit: false },
  { n: 2, move: "+251", hit: false },
  { n: 3, move: "+23", hit: false },
  { n: 4, move: "−65", hit: true },
];

// Villagers gathered at the foot of the tower: one dot for every two people talking, capped at 18.
const crowdSpots = Array.from({ length: 18 }, (_, i) => ({ x: 110 + (i % 9) * 18 + (Math.floor(i / 9) % 2) * 9, y: 334 + Math.floor(i / 9) * 14 }));

const stars = Array.from({ length: 28 }, (_, i) => ({ x: (i * 97) % 400, y: 12 + ((i * 61) % 150), r: i % 4 === 0 ? 1.4 : 0.8 }));

export function WolfArt({ step, steps }: { step: number; steps: StoryStep[] }) {
  const people = steps[step].people;
  const alarm = step <= 4;
  const wolf = step >= 3;
  const moral = step === 5;
  const shown = Math.min(step + 1, alarms.length);
  const dots = Math.min(18, Math.ceil(people / 2));
  const fade = "transition-opacity duration-700";
  return (
    <svg viewBox="0 0 400 420" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 block h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="wf-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#050814" />
          <stop offset="1" stopColor={NIGHT} />
        </linearGradient>
        <radialGradient id="wf-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={LANTERN} stopOpacity="0.75" />
          <stop offset="1" stopColor={LANTERN} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="wf-moon" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.6" stopColor={MOON} stopOpacity="0.25" />
          <stop offset="1" stopColor={MOON} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="420" fill="url(#wf-sky)" />
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={MOON} opacity="0.7" />
      ))}
      <circle cx="226" cy="70" r="60" fill="url(#wf-moon)" />
      <circle cx="226" cy="70" r="30" fill={MOON} />
      <circle cx="236" cy="62" r="5" fill="#cbd5e1" />
      <circle cx="218" cy="80" r="3.5" fill="#cbd5e1" />

      <path d="M0 236 C70 196 130 214 190 188 S320 170 400 204 L400 420 L0 420Z" fill={HILL_FAR} />

      <g className={fade} opacity={wolf ? 1 : 0} transform="translate(176 192)">
        <path
          d="M0 0 L6 -14 L10 -6 L16 -16 L18 -4 C30 -2 44 2 56 0 C62 -2 68 -8 74 -6 L70 2 C66 6 62 8 58 10 L58 22 L54 22 L52 12 L26 12 L24 22 L20 22 L20 10 C12 8 6 6 0 0Z"
          fill="#05070f"
        />
        <circle cx="10" cy="-3" r="1.6" fill="#facc15" />
      </g>

      <path d="M0 290 C80 256 160 286 240 262 S360 250 400 270 L400 420 L0 420Z" fill={HILL} />

      {[
        { x: 22, y: 304 },
        { x: 64, y: 316 },
        { x: 34, y: 344 },
      ].map((h, i) => (
        <g key={i} transform={`translate(${h.x} ${h.y})`}>
          <path d="M0 0 L16 -14 L32 0 L32 22 L0 22Z" fill="#1f2a4a" stroke="#0a0f1f" />
          <rect x="11" y="6" width="8" height="8" fill={LANTERN} opacity="0.65" />
        </g>
      ))}

      <g transform="translate(318 214)">
        <path d="M-18 150 L-10 20 L10 20 L18 150Z" fill="#2a3557" stroke="#0a0f1f" />
        <path d="M-10 60 L10 90 M10 60 L-10 90 M-12 100 L12 130 M12 100 L-12 130" stroke="#0a0f1f" strokeWidth="2" />
        <rect x="-22" y="10" width="44" height="12" fill="#3b4870" stroke="#0a0f1f" />
        <path d="M-24 10 L0 -14 L24 10Z" fill="#3b4870" stroke="#0a0f1f" />
        <circle className={fade} cx="-14" cy="0" r="40" fill="url(#wf-glow)" opacity={alarm ? 1 : 0} />
        <circle className={`${fade} lantern-flicker`} cx="-14" cy="2" r="4.5" fill={LANTERN} opacity={alarm ? 1 : 0.2} />
        <circle cx="6" cy="-2" r="4" fill="#cbd5e1" />
        <path d="M6 2 L6 10" stroke="#cbd5e1" strokeWidth="3" />
      </g>

      <g className={fade} opacity={alarm ? 1 : 0} transform="translate(214 128)">
        <path d="M0 0 H86 A10 10 0 0 1 96 10 V34 A10 10 0 0 1 86 44 H70 L84 62 L52 44 H10 A10 10 0 0 1 0 34 V10 A10 10 0 0 1 10 0Z" fill={MOON} />
        <text x="48" y="29" textAnchor="middle" fontSize="18" fontWeight="900" fill={NIGHT} letterSpacing="1">
          WOLF!
        </text>
      </g>

      {crowdSpots.map((p, i) => (
        <circle key={i} className={fade} cx={p.x} cy={p.y} r="4.5" fill="#cbd5e1" opacity={i < dots ? 0.9 : 0} />
      ))}
      <text x="110" y="374" fontSize="9" fontWeight="700" fill="#94a3b8" letterSpacing="1.2">
        {people} PEOPLE TALKING
      </text>

      <g transform="translate(18 74)">
        <rect width="152" height={moral ? 108 : 26 + shown * 20} rx="8" fill="#050814" fillOpacity="0.85" stroke="#334155" style={{ transition: "height 500ms ease" }} />
        <text x="12" y="17" fontSize="9" fontWeight="700" fill="#94a3b8" letterSpacing="1.3">
          ALARM · NEXT 3 SESSIONS
        </text>
        {alarms.map((a, i) => (
          <g key={a.n} className={fade} opacity={moral || i < shown ? 1 : 0} transform={`translate(12 ${36 + i * 20})`}>
            <text fontSize="11" fontWeight="600" fill="#cbd5e1">
              #{a.n}
            </text>
            <text x="34" fontSize="12" fontWeight="800" fill={a.hit ? HIT : MISS}>
              {a.move}
            </text>
            <text x="80" fontSize="9.5" fill={a.hit ? HIT : MISS}>
              {a.hit ? "wolf" : "no wolf"}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
