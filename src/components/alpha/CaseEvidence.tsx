import {
  dropBaseRate,
  dropDeciles,
  moreCases,
  type MoreCase,
  type SingleCase,
  type StreakCase,
} from "@/components/alpha/moreCaseData";

const SCALE = 40; // the move bar runs from -40 to +40 points

function StreakChart({ item }: { item: StreakCase }) {
  const W = 240;
  const H = 84;
  const gap = 8;
  const n = item.streak.length;
  const barW = (W - gap * (n - 1)) / n;
  const max = Math.max(...item.streak.map((s) => s.people));
  const label = `Six sessions in a row. People talking, drop-warning rank and the move over the next three sessions: ${item.streak
    .map((s) => `${s.people} people, ${s.rank}, ${s.moveLabel} points`)
    .join("; ")}.`;
  return (
    <svg viewBox={`0 0 ${W} ${H + 64}`} role="img" aria-label={label} className="mt-4 block h-auto w-full">
      <line x1="0" x2={W} y1={H} y2={H} stroke="rgba(255,255,255,0.15)" />
      {item.streak.map((s, i) => {
        const x = i * (barW + gap);
        const cx = x + barW / 2;
        const h = Math.max(4, (s.people / max) * (H - 18));
        const right = s.move < 0;
        return (
          <g key={i}>
            <rect x={x} y={H - h} width={barW} height={h} rx="3" fill="#f97316" fillOpacity={s.rank === "top 6%" ? 0.45 : 1} />
            <text x={cx} y={H - h - 5} textAnchor="middle" fontSize="11" fontWeight="600" fill="#fb923c">
              {s.people}
            </text>
            <text x={cx} y={H + 13} textAnchor="middle" fontSize="8.5" fill="#b3bac5">
              {s.rank}
            </text>
            <path
              d={right ? `M${cx - 5} ${H + 22} L${cx + 5} ${H + 22} L${cx} ${H + 30} Z` : `M${cx - 5} ${H + 30} L${cx + 5} ${H + 30} L${cx} ${H + 22} Z`}
              fill={right ? "#22d3ee" : "#f87171"}
            />
            <text x={cx} y={H + 44} textAnchor="middle" fontSize="11" fontWeight="700" fill={right ? "#22d3ee" : "#f87171"}>
              {s.moveLabel}
            </text>
          </g>
        );
      })}
      <text x="0" y={H + 60} fontSize="10" fill="#b3bac5">
        people · warning rank · next 3 sessions
      </text>
    </svg>
  );
}

function CrowdBars({ item }: { item: SingleCase }) {
  const max = Math.max(...item.people, 1);
  const last = item.people.length - 1;
  const W = 240;
  const H = 96;
  const gap = 8;
  const barW = (W - gap * (item.people.length - 1)) / item.people.length;
  const label = `People talking about the stock in each of the last ${item.people.length} sessions: ${item.people.join(", ")}. The ${item.flag.toLowerCase()} came on the last session, with ${item.people[last]} people in ${item.communities} communities.`;
  return (
    <svg viewBox={`0 0 ${W} ${H + 22}`} role="img" aria-label={label} className="mt-4 block h-auto w-full">
      <line x1="0" x2={W} y1={H} y2={H} stroke="rgba(255,255,255,0.15)" />
      {item.people.map((count, i) => {
        const h = count === 0 ? 1.5 : Math.max(4, (count / max) * (H - 18));
        const x = i * (barW + gap);
        const flagged = i === last;
        return (
          <g key={i}>
            <rect
              x={x}
              y={H - h}
              width={barW}
              height={h}
              rx="3"
              fill={flagged ? "#f97316" : "rgba(255,255,255,0.28)"}
            />
            {count > 0 && (
              <text x={x + barW / 2} y={H - h - 5} textAnchor="middle" fontSize="11" fontWeight="600" fill={flagged ? "#fb923c" : "#b3bac5"}>
                {count}
              </text>
            )}
          </g>
        );
      })}
      <text x={last * (barW + gap) + barW / 2} y={H + 16} textAnchor="middle" fontSize="10" fontWeight="600" fill="#fb923c">
        flagged
      </text>
      <text x="0" y={H + 16} fontSize="10" fill="#b3bac5">
        people per session
      </text>
    </svg>
  );
}

function MoveBar({ item }: { item: SingleCase }) {
  const clamped = Math.max(-SCALE, Math.min(SCALE, item.move));
  const half = (Math.abs(clamped) / SCALE) * 50;
  const up = clamped >= 0;
  const off = Math.abs(item.move) > SCALE;
  const landed = item.outcome === "landed";
  return (
    <div className="mt-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">3 sessions later, vs the S&amp;P 500</p>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            landed ? "bg-cyan/15 text-cyan" : "bg-red-500/15 text-red-400"
          }`}
        >
          {landed ? "Landed" : "Missed"}
        </span>
      </div>
      <p className="mt-1 font-[family-name:var(--font-heading)] text-3xl font-bold leading-tight">{item.moveLabel}</p>
      <div
        role="img"
        aria-label={`${item.moveLabel} against the S&P 500 over three sessions, drawn on a scale of minus 40 to plus 40 points${off ? "; this one is off the scale" : ""}.`}
        className="relative mt-3 h-3 rounded-full bg-white/8"
      >
        <div className="absolute inset-y-0 left-1/2 w-px bg-white/40" />
        <div className="absolute inset-y-0 w-px border-l border-dashed border-orange-500/70" style={{ left: "75%" }} />
        <div className="absolute inset-y-0 w-px border-l border-dashed border-orange-500/70" style={{ left: "25%" }} />
        <div
          className={`absolute inset-y-0 ${landed ? "bg-cyan" : "bg-red-400"} ${up ? "rounded-r-full" : "rounded-l-full"}`}
          style={up ? { left: "50%", width: `${half}%` } : { right: "50%", width: `${half}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] font-semibold text-muted">
        <span>−40</span>
        <span>−10</span>
        <span>0</span>
        <span>+10</span>
        <span>{off ? "+40 and beyond" : "+40"}</span>
      </div>
    </div>
  );
}

// The data half of a case page: the event drawn plainly, beside how that kind of flag does overall.
export function CaseEvidence({ id }: { id: string }) {
  const item = moreCases.find((c) => c.id === id);
  if (!item) return null;
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border border-white/8 bg-surface p-6 md:p-7">
        <p className="text-xs font-semibold uppercase tracking-wider text-cyan">What happened</p>
        <p className="mt-2 text-base leading-relaxed text-muted">{item.body}</p>
        <EventChart item={item} />
      </div>
      <div className="rounded-3xl border border-white/8 bg-surface p-6 md:p-7">
        <GroupStats item={item} />
      </div>
    </div>
  );
}

function EventChart({ item }: { item: MoreCase }) {
  return "streak" in item ? (
        <>
          <StreakChart item={item} />
          <div className="mt-4 flex items-baseline justify-between gap-3">
            <p className="font-[family-name:var(--font-heading)] text-xl font-bold leading-tight">{item.verdict}</p>
            <span className="shrink-0 rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-semibold text-red-400">Missed first</span>
          </div>
        </>
      ) : (
        <>
          <CrowdBars item={item} />
          <MoveBar item={item} />
        </>
      );
}

function GroupStats({ item }: { item: MoreCase }) {
  return (
    <>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-cyan">{item.groupTitle}</p>
        <ul className="mt-3 space-y-3">
          {item.group.map((stat) => (
            <li key={stat.value} className="flex gap-3">
              <span className="w-14 shrink-0 font-[family-name:var(--font-heading)] text-2xl font-bold leading-none tabular-nums">
                {stat.label}
              </span>
              <span className="text-sm leading-relaxed text-muted">
                <span className="font-semibold text-foreground">{stat.value}</span> · {stat.detail}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-foreground">{item.caveat}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        <span className="font-semibold">How we picked it:</span> {item.rule}
      </p>
    </>
  );
}

export function DropDeciles() {
  const W = 640;
  const H = 260;
  const PAD = { left: 44, right: 16, top: 28, bottom: 40 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const TOP = 0.6;
  const y = (rate: number) => PAD.top + (1 - rate / TOP) * plotH;
  const slot = plotW / dropDeciles.length;
  const barW = slot * 0.68;
  const rates = dropDeciles.map((d) => d.drops / d.n);
  const top = dropDeciles[dropDeciles.length - 1];
  const bottom = dropDeciles[0];
  return (
    <div className="mt-12 rounded-3xl border border-white/8 bg-surface p-6 md:p-9">
      <p className="text-sm font-semibold uppercase tracking-wider text-cyan">Every warning, not just four</p>
      <h3 className="mt-3 max-w-3xl text-balance font-[family-name:var(--font-heading)] text-2xl font-bold leading-tight md:text-3xl">
        Highest-scored tenth: half dropped. Lowest-scored tenth: one in a hundred.
      </h3>
      <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted">
        All 8,333 stock-days from the held-out stretch, ranked by the drop warning and cut into ten equal groups. Of
        the {top.n} highest-scored, {top.drops} were followed by a drop of 10 points or more. Of the {bottom.n}{" "}
        lowest-scored, {bottom.drops} were.
      </p>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Share of stock-days followed by a 10-point drop, by tenth of the drop-warning score, lowest first: ${rates
          .map((r) => `${Math.round(r * 100)}%`)
          .join(", ")}. The average across everything is ${Math.round(dropBaseRate * 100)}%.`}
        className="mt-6 block h-auto w-full"
      >
        {[0, 0.2, 0.4, 0.6].map((tick) => (
          <g key={tick}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(tick)} y2={y(tick)} stroke="rgba(255,255,255,0.08)" />
            <text x={PAD.left - 8} y={y(tick) + 3} textAnchor="end" fontSize="10" fill="#b3bac5">
              {tick * 100}%
            </text>
          </g>
        ))}
        {rates.map((rate, i) => {
          const x = PAD.left + i * slot + (slot - barW) / 2;
          const last = i === rates.length - 1;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y(rate)}
                width={barW}
                height={PAD.top + plotH - y(rate)}
                rx="3"
                fill={last ? "#f97316" : "#22d3ee"}
                fillOpacity={last ? 1 : 0.35 + 0.5 * (i / rates.length)}
              />
              <text x={x + barW / 2} y={y(rate) - 6} textAnchor="middle" fontSize="10.5" fontWeight="600" fill={last ? "#fb923c" : "#f4f4f5"}>
                {Math.round(rate * 100)}%
              </text>
              <text x={x + barW / 2} y={H - 22} textAnchor="middle" fontSize="10" fill="#b3bac5">
                {i + 1}
              </text>
            </g>
          );
        })}
        <line
          x1={PAD.left}
          x2={W - PAD.right}
          y1={y(dropBaseRate)}
          y2={y(dropBaseRate)}
          stroke="#f4f4f5"
          strokeOpacity="0.6"
          strokeDasharray="5 4"
        />
        <text x={PAD.left + 6} y={y(dropBaseRate) - 6} fontSize="10" fontWeight="600" fill="#f4f4f5" fillOpacity="0.8">
          average: {Math.round(dropBaseRate * 100)}%
        </text>
        <text x={PAD.left} y={H - 6} fontSize="10" fill="#b3bac5">
          Lowest warning score
        </text>
        <text x={W - PAD.right} y={H - 6} textAnchor="end" fontSize="10" fill="#b3bac5">
          Highest warning score
        </text>
      </svg>

      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">
        Most of this ranking comes from price and volatility, not the crowd: a model on price and market data alone
        ranks nearly as well, and crowd signals add a small, measured lift on top.{" "}
        <a href="/research" className="font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent">
          See how much
        </a>
        . The model was trained only on data through 2024, and these are replays, not trades.
      </p>
    </div>
  );
}
