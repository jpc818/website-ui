import type { StoryStep } from "@/components/alpha/cases/stories";

const BRASS = "#d4a65a";
const BRASS_DEEP = "#8a6a32";
const FACE = "#efe6d2";
const INK = "#1f2937";
const STORM = "#5eead4";

// Needle angle in degrees from straight up: + is toward FAIR, - toward STORMY.
const needle = [62, -18, -48, -10, -78, -84, -84];
// How heavy the weather looks, 0 to 1, per step.
const weather = [0, 0.45, 0.8, 0.15, 1, 1, 0.6];

// 53 storms with both scores in the top 3%. 44 moved 10+ points either way: 12 up, 32 down. 9 fizzled.
const record = Array.from({ length: 53 }, (_, i) => ({
  x: 64 + (i % 11) * 25,
  y: 178 + Math.floor(i / 11) * 25,
  kind: i < 32 ? "down" : i < 44 ? "up" : "calm",
}));

function polar(cx: number, cy: number, r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

export function BarometerArt({ step, steps }: { step: number; steps: StoryStep[] }) {
  const angle = needle[Math.min(step, needle.length - 1)];
  const heavy = weather[Math.min(step, weather.length - 1)];
  const flagged = step === 4 || step === 5;
  const landfall = step === 5;
  const ledger = step === 6;
  const unsettled = step >= 1 && step <= 4;
  const fade = "transition-opacity duration-700";
  const ticks = Array.from({ length: 25 }, (_, i) => -96 + i * 8);
  const cx = 180;
  const cy = 196;
  const tip = polar(cx, cy, 86, angle);
  const tail = polar(cx, cy, -22, angle);
  return (
    <svg viewBox="0 0 400 420" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 block h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="bm-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1220" />
          <stop offset="1" stopColor="#1e293b" />
        </linearGradient>
        <radialGradient id="bm-face" cx="0.45" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#fffaf0" />
          <stop offset="1" stopColor={FACE} />
        </radialGradient>
      </defs>
      <rect width="400" height="420" fill="url(#bm-sky)" />

      <g className={fade} opacity={0.2 + heavy * 0.8}>
        {[
          { x: 60, y: 54, s: 1.1 },
          { x: 170, y: 36, s: 1.4 },
          { x: 300, y: 60, s: 1.2 },
          { x: 360, y: 30, s: 0.9 },
        ].map((c, i) => (
          <g key={i} transform={`translate(${c.x} ${c.y}) scale(${c.s})`} className="cloud-drift" style={{ animationDelay: `${-i * 1.7}s` }}>
            <ellipse cx="0" cy="0" rx="44" ry="18" fill="#334155" />
            <ellipse cx="-20" cy="-10" rx="22" ry="16" fill="#3f4d63" />
            <ellipse cx="16" cy="-14" rx="26" ry="18" fill="#475569" />
          </g>
        ))}
      </g>

      <g className={fade} opacity={heavy > 0.7 ? 0.7 : 0}>
        {Array.from({ length: 26 }, (_, i) => (
          <line
            key={i}
            className="rain-fall"
            x1={(i * 37) % 400}
            y1={70 + ((i * 53) % 60)}
            x2={(i * 37) % 400 - 8}
            y2={92 + ((i * 53) % 60)}
            stroke="#93c5fd"
            strokeWidth="1.4"
            style={{ animationDelay: `${-(i % 7) * 0.13}s` }}
          />
        ))}
      </g>
      <path
        className={`${fade} ${flagged ? "lightning-flash" : ""}`}
        opacity={flagged ? 1 : 0}
        d="M372 70 L354 112 L368 112 L350 150"
        fill="none"
        stroke="#fde047"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      <g transform="translate(350 296)">
        <path d="M0 40 L0 -10" stroke={BRASS} strokeWidth="3" />
        <g
          className={unsettled ? "vane-swing" : ""}
          style={{ transformBox: "fill-box", transformOrigin: "center", transform: landfall ? "rotate(90deg)" : undefined, transition: "transform 900ms ease" }}
        >
          <path d="M-24 -10 L24 -10" stroke={BRASS} strokeWidth="3" />
          <path d="M24 -16 L34 -10 L24 -4Z" fill={BRASS} />
          <path d="M-34 -18 L-24 -10 L-34 -2Z" fill={BRASS} />
        </g>
        <text x="0" y="56" textAnchor="middle" fontSize="9" fontWeight="700" fill="#94a3b8" letterSpacing="1.5">
          WIND
        </text>
      </g>

      <g>
        <circle cx={cx} cy={cy} r="128" fill={BRASS_DEEP} />
        <circle cx={cx} cy={cy} r="120" fill={BRASS} />
        <circle cx={cx} cy={cy} r="108" fill="url(#bm-face)" stroke={BRASS_DEEP} strokeWidth="2" />
        {ticks.map((t) => {
          const a = polar(cx, cy, 98, t);
          const b = polar(cx, cy, t % 24 === 0 ? 84 : 90, t);
          return <line key={t} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={INK} strokeWidth={t % 24 === 0 ? 2 : 1} />;
        })}
        {[
          { t: "STORMY", d: -72 },
          { t: "RAIN", d: -36 },
          { t: "CHANGE", d: 0 },
          { t: "FAIR", d: 40 },
          { t: "DRY", d: 76 },
        ].map((l) => {
          const p = polar(cx, cy, 66, l.d);
          return (
            <text key={l.t} x={p.x} y={p.y + 3} textAnchor="middle" fontSize="9.5" fontWeight="700" fill={INK} letterSpacing="1">
              {l.t}
            </text>
          );
        })}
        <line
          x1={tail.x}
          y1={tail.y}
          x2={tip.x}
          y2={tip.y}
          stroke="#7f1d1d"
          strokeWidth="3.5"
          strokeLinecap="round"
          style={{ transition: "all 900ms cubic-bezier(.3,1.4,.5,1)" }}
        />
        <circle cx={cx} cy={cy} r="7" fill={BRASS_DEEP} stroke={INK} strokeWidth="1.5" />
        <text x={cx} y={cy + 42} textAnchor="middle" fontSize="9" fontWeight="700" fill={BRASS_DEEP} letterSpacing="2">
          PRESSURE
        </text>
        <text x={cx} y={cy + 56} textAnchor="middle" fontSize="8.5" fill={INK} opacity="0.7">
          no arrow for direction
        </text>
      </g>

      <g className={fade} opacity={steps[step].people > 0 && !ledger ? 1 : 0} transform="translate(24 342)">
        <text fontSize="10" fontWeight="700" fill="#94a3b8" letterSpacing="1.5">
          PEOPLE
        </text>
        <text y="24" fontSize="22" fontWeight="800" fill={STORM}>
          {steps[step].people}
        </text>
      </g>

      <g className={fade} opacity={ledger ? 1 : 0}>
        <rect x="40" y="136" width="320" height="196" rx="14" fill="#0b1220" fillOpacity="0.92" stroke="#334155" />
        <text x="200" y="162" textAnchor="middle" fontSize="12" fontWeight="700" fill="#cbd5e1" letterSpacing="1.5">
          53 TWO-SIDED FLAGS
        </text>
        {record.map((r, i) => (
          <circle key={i} cx={r.x} cy={r.y} r="8.5" fill={r.kind === "down" ? "#f87171" : r.kind === "up" ? STORM : "#475569"} />
        ))}
        <text x="200" y="318" textAnchor="middle" fontSize="11" fill="#cbd5e1">
          fell 10+: 32 · rose 10+: 12 · fizzled: 9
        </text>
      </g>
    </svg>
  );
}
