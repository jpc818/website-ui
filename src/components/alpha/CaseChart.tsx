import { caseSteps } from "@/components/alpha/caseSteps";

// Day ranges for each step in caseSteps, in order. Each phase is drawn as one flat level, because the replay
// reports the warning per phase, not per day.
const phases = [
  { from: 1, to: 1 },
  { from: 2, to: 2 },
  { from: 3, to: 5 },
  { from: 6, to: 7 },
  { from: 8, to: 12 },
];

const DAYS = 12;
const W = 640;
const H = 280;
const PAD = { left: 48, right: 16, top: 24, bottom: 44 };
const plotW = W - PAD.left - PAD.right;
const plotH = H - PAD.top - PAD.bottom;
const x = (day: number) => PAD.left + ((day - 1) / DAYS) * plotW;
const y = (warning: number) => PAD.top + (1 - warning) * plotH;
const ALARM = 0.94; // the "top 3%" line used in the replay

const levels = phases.map((phase, i) => ({
  x0: x(phase.from),
  x1: x(phase.to + 1),
  warning: caseSteps[i].warning,
  label: caseSteps[i].label,
}));

const stepPath = levels
  .map((level, i) => `${i === 0 ? "M" : "L"}${level.x0} ${y(level.warning)} L${level.x1} ${y(level.warning)}`)
  .join(" ");

// phase indexes into `levels`; dy is the offset below the line. Each note may use several lines.
const notes = [
  { phase: 1, lines: ["Day 2 · smoke: 18 people,", "3 communities"], dy: 20, align: "start" as const },
  { phase: 2, lines: ["Peak: 51 people in a day"], dy: 54, align: "start" as const },
  { phase: 3, lines: ["Run gives back", "over a quarter"], dy: 20, align: "middle" as const },
];

export function CaseChart() {
  return (
    <div className="mt-12 rounded-3xl border border-white/8 bg-surface p-6 md:p-9">
      <p className="text-sm font-semibold uppercase tracking-wider text-cyan">The whole story at a glance</p>
      <h3 className="mt-3 max-w-3xl text-balance font-[family-name:var(--font-heading)] text-2xl font-bold leading-tight md:text-3xl">
        The warning fired on day 2. The crowd turned on day 6.
      </h3>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Chart of the model's warning level across the 12 days of the case study. It sits low on day 1, jumps above the top-3% line on day 2, holds through days 3 to 5, falls to a lower level when the run gives back over a quarter on days 6 and 7, and cools through days 8 to 12."
        className="mt-6 block h-auto w-full"
      >
        <rect
          x={x(6)}
          y={PAD.top}
          width={x(8) - x(6)}
          height={plotH}
          fill="rgba(249,115,22,0.12)"
        />
        <text x={(x(6) + x(8)) / 2} y={PAD.top + plotH + 14} textAnchor="middle" fontSize="10" fill="#fb923c" fontWeight="600">
          crowd turns
        </text>

        {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
          <g key={tick}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(tick)} y2={y(tick)} stroke="rgba(255,255,255,0.08)" />
            <text x={PAD.left - 8} y={y(tick) + 3} textAnchor="end" fontSize="10" fill="#b3bac5">
              {tick.toFixed(2)}
            </text>
          </g>
        ))}

        <line
          x1={PAD.left}
          x2={W - PAD.right}
          y1={y(ALARM)}
          y2={y(ALARM)}
          stroke="#f97316"
          strokeDasharray="5 4"
          vectorEffect="non-scaling-stroke"
        />
        <text x={W - PAD.right} y={y(ALARM) - 6} textAnchor="end" fontSize="10" fontWeight="600" fill="#fb923c">
          top 3% of everything scored
        </text>

        <path d={`${stepPath} L${x(DAYS + 1)} ${PAD.top + plotH} L${x(1)} ${PAD.top + plotH} Z`} fill="rgba(34,211,238,0.10)" />
        <path d={stepPath} fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeLinejoin="round" />

        {Array.from({ length: DAYS }, (_, i) => i + 1).map((day) => (
          <text key={day} x={(x(day) + x(day + 1)) / 2} y={H - 8} textAnchor="middle" fontSize="10" fill="#b3bac5">
            {day}
          </text>
        ))}
        <text x={PAD.left} y={H - 24} fontSize="10" fill="#b3bac5">
          Day
        </text>

        {notes.map((note) => {
          const level = levels[note.phase];
          const px = note.align === "start" ? level.x0 + 8 : (level.x0 + level.x1) / 2;
          return (
            <text
              key={note.lines[0]}
              x={px}
              y={y(level.warning) + note.dy}
              textAnchor={note.align}
              fontSize="10.5"
              fontWeight="600"
              fill="#f4f4f5"
            >
              {note.lines.map((line, i) => (
                <tspan key={line} x={px} dy={i === 0 ? 0 : 13}>
                  {line}
                </tspan>
              ))}
            </text>
          );
        })}
      </svg>

      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">
        Warning is the model&apos;s score for how unusual the crowd looked, on the same 0 to 1 scale as the gauge above.
        Each phase is drawn as one level because the replay reports it per phase, not per day. The run itself is
        described rather than plotted, by session rather than by date. One event, not proof.
      </p>
    </div>
  );
}
