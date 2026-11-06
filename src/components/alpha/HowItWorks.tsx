"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { howSteps as steps } from "@/components/alpha/howSteps";

const CYAN = "#22d3ee";
const AMBER = "#f59e0b";
const INDIGO = "#818cf8";
const RED = "#f87171";
const MUTED = "#b3bac5";
const INK = "#f4f4f5";

const WIDE_HEIGHT = 300;
const TALL_HEIGHT = 575;

type Sy = (y: number) => number;
const flat: Sy = (y) => y;
const stretched: Sy = (y) => Math.round((25 + y * 1.75) * 10) / 10;

type SceneProps = { on: boolean; tall: boolean; sy: Sy };

const delay = (seconds: number): CSSProperties => ({ transitionDelay: `${seconds}s` });

const DESKTOP_QUERY = "(min-width: 1024px)";
const subscribeDesktop = (onChange: () => void) => {
  const query = window.matchMedia(DESKTOP_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

function Scene({ on, children }: { on: boolean; children: ReactNode }) {
  return (
    <g className="story-scene" data-on={on}>
      {children}
    </g>
  );
}

function Chip({ x, y, text, color = MUTED, anchor = "middle" }: { x: number; y: number; text: string; color?: string; anchor?: "start" | "middle" | "end" }) {
  const width = text.length * 6.4 + 18;
  const left = anchor === "middle" ? x - width / 2 : anchor === "end" ? x - width : x;
  return (
    <g>
      <rect x={left} y={y - 11} width={width} height={20} rx={10} fill="#11151c" stroke={color} strokeOpacity={0.5} />
      <text x={left + width / 2} y={y + 3} textAnchor="middle" fontSize="11" fontWeight="600" fill={color}>
        {text}
      </text>
    </g>
  );
}

const sources = ["Forums", "Social", "Video", "News", "Reviews"];

function CollectScene({ on, sy }: SceneProps) {
  const hubY = sy(150);
  return (
    <Scene on={on}>
      {sources.map((name, s) => {
        const cy = sy(46 + s * 52);
        const path = `M104,${cy} C200,${cy} 205,${hubY} 262,${hubY}`;
        return (
          <g key={name}>
            <rect x="16" y={cy - 16} width="88" height="32" rx="9" fill="#11151c" stroke="rgba(255,255,255,0.18)" />
            <text x="60" y={cy + 4} textAnchor="middle" fontSize="12" fontWeight="600" fill={INK}>
              {name}
            </text>
            <path d={path} fill="none" stroke="rgba(255,255,255,0.12)" strokeDasharray="3 5" />
            {[0, 1, 2].map((k) => (
              <rect key={k} x="-3.5" y="-4.5" width="7" height="9" rx="1.5" fill={INK} opacity="0.9">
                <animateMotion dur="2.6s" begin={`${-(k * 0.87 + s * 0.41)}s`} repeatCount="indefinite" path={path} />
              </rect>
            ))}
          </g>
        );
      })}
      <circle cx="306" cy={hubY} r="42" fill="none" stroke={CYAN} strokeOpacity="0.5">
        <animate attributeName="r" values="42;60" dur="2s" repeatCount="indefinite" />
        <animate attributeName="stroke-opacity" values="0.5;0" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="306" cy={hubY} r="42" fill="#0b1a20" stroke={CYAN} strokeWidth="1.5" />
      <text x="306" y={hubY - 4} textAnchor="middle" fontSize="12" fontWeight="700" fill={CYAN}>
        Collectors
      </text>
      <text x="306" y={hubY + 12} textAnchor="middle" fontSize="10" fill={MUTED}>
        APIs + methods
      </text>
    </Scene>
  );
}

const lanes = [
  { y: 60, color: CYAN, label: "Human", count: 5, end: 372 },
  { y: 150, color: INDIGO, label: "Good bot", count: 3, end: 372 },
  { y: 240, color: RED, label: "Bad bot", count: 3, end: 330 },
];

function FilterScene({ on, sy }: SceneProps) {
  const mid = sy(150);
  const gateTop = sy(108);
  const gateBottom = sy(192);
  const scan = `${gateTop + 6};${gateBottom - 6};${gateTop + 6}`;
  return (
    <Scene on={on}>
      {lanes.map((lane) => {
        const ly = sy(lane.y);
        const path = `M8,${mid} L188,${mid} C248,${mid} 248,${ly} 308,${ly} L${lane.end},${ly}`;
        return (
          <g key={lane.label}>
            <path d={path} fill="none" stroke={lane.color} strokeOpacity="0.18" strokeWidth="1.5" />
            {Array.from({ length: lane.count }, (_, k) => (
              <circle key={k} r="4.5" fill={MUTED}>
                <animateMotion dur="3s" begin={`${-(k * (3 / lane.count) + lane.y / 100)}s`} repeatCount="indefinite" path={path} />
                <animate attributeName="fill" values={`${MUTED};${lane.color}`} keyTimes="0;0.5" calcMode="discrete" dur="3s" begin={`${-(k * (3 / lane.count) + lane.y / 100)}s`} repeatCount="indefinite" />
                {lane.color === RED && (
                  <animate attributeName="opacity" values="1;1;0" keyTimes="0;0.86;1" dur="3s" begin={`${-(k * (3 / lane.count) + lane.y / 100)}s`} repeatCount="indefinite" />
                )}
              </circle>
            ))}
            <Chip x={316} y={ly - 20} text={lane.label} color={lane.color} anchor="start" />
          </g>
        );
      })}
      <g transform={`translate(346 ${sy(240)})`} stroke={RED} strokeWidth="2.5" strokeLinecap="round">
        <line x1="-7" y1="-7" x2="7" y2="7" />
        <line x1="7" y1="-7" x2="-7" y2="7" />
      </g>
      <rect x="174" y={gateTop} width="28" height={gateBottom - gateTop} rx="8" fill="#0b1a20" stroke={CYAN} strokeWidth="1.5" />
      <line x1="178" x2="198" stroke={CYAN} strokeWidth="2">
        <animate attributeName="y1" values={scan} dur="1.6s" repeatCount="indefinite" />
        <animate attributeName="y2" values={scan} dur="1.6s" repeatCount="indefinite" />
      </line>
      <Chip x={188} y={gateTop - 16} text="Bot check" color={CYAN} />
    </Scene>
  );
}

function Warehouse({ sy }: { sy: Sy }) {
  const top = sy(140);
  const bottom = sy(250);
  const rowGap = (bottom - top - 30) / 5;
  return (
    <g>
      <path d={`M110,${top} L110,${bottom} A90,18 0 0 0 290,${bottom} L290,${top}`} fill="#0e141b" stroke={CYAN} strokeOpacity="0.55" strokeWidth="1.5" />
      <ellipse cx="200" cy={top} rx="90" ry="18" fill="#152029" stroke={CYAN} strokeOpacity="0.8" strokeWidth="1.5" />
      {[0, 1, 2, 3, 4].map((r) => {
        const y = Math.round(top + 32 + r * rowGap);
        return (
          <line key={r} x1="128" x2="272" y1={y} y2={y} stroke={CYAN} strokeWidth="5" strokeLinecap="round" opacity="0.15">
            <animate attributeName="opacity" values="0.12;0.85;0.12" dur="2.5s" begin={`${r * 0.5}s`} repeatCount="indefinite" />
          </line>
        );
      })}
      <text x="200" y={bottom + 40} textAnchor="middle" fontSize="12" fontWeight="700" fill={INK}>
        Data warehouse
      </text>
    </g>
  );
}

const drops = [
  { x: 150, color: CYAN },
  { x: 176, color: INDIGO },
  { x: 200, color: CYAN },
  { x: 224, color: CYAN },
  { x: 250, color: INDIGO },
  { x: 188, color: CYAN },
];
const tags = [
  { x: 70, y: 46, text: "who" },
  { x: 150, y: 26, text: "when" },
  { x: 250, y: 26, text: "how fast" },
  { x: 330, y: 46, text: "human?" },
];

function StoreScene({ on, sy }: SceneProps) {
  const fall = `M0,${sy(50)} L0,${sy(138)}`;
  return (
    <Scene on={on}>
      {tags.map((tag, i) => (
        <g key={tag.text} className="story-pop" style={delay(0.15 + i * 0.12)}>
          <Chip x={tag.x} y={sy(tag.y)} text={tag.text} color={AMBER} />
        </g>
      ))}
      {drops.map((drop, i) => (
        <circle key={i} cx={drop.x} cy="0" r="5" fill={drop.color}>
          <animateMotion dur="1.8s" begin={`${-i * 0.3}s`} repeatCount="indefinite" path={fall} />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.8;1" dur="1.8s" begin={`${-i * 0.3}s`} repeatCount="indefinite" />
        </circle>
      ))}
      <Warehouse sy={sy} />
    </Scene>
  );
}

const streams = [
  { from: [58, 52], c1: [100, 80], c2: [90, 170], to: [112, 180], color: AMBER, label: "Telemetry", x: 58, y: 40 },
  { from: [58, 262], c1: [90, 262], c2: [96, 226], to: [112, 222], color: INK, label: "Offline data", x: 62, y: 276 },
  { from: [340, 52], c1: [300, 80], c2: [310, 170], to: [288, 180], color: CYAN, label: "Other sources", x: 340, y: 40 },
];

function EnrichScene({ on, sy }: SceneProps) {
  return (
    <Scene on={on}>
      {streams.map((stream, i) => {
        const [p0, p1, p2, p3] = [stream.from, stream.c1, stream.c2, stream.to].map(([x, y]) => `${x},${sy(y)}`);
        return (
          <g key={stream.label}>
            <path d={`M${p0} C${p1} ${p2} ${p3}`} fill="none" stroke={stream.color} strokeWidth="3" strokeLinecap="round" strokeDasharray="6 9" opacity="0.9">
              <animate attributeName="stroke-dashoffset" from="30" to="0" dur="0.9s" repeatCount="indefinite" />
            </path>
            <g className="story-pop" style={delay(0.1 + i * 0.15)}>
              <Chip x={stream.x} y={sy(stream.y)} text={stream.label} color={stream.color} />
            </g>
          </g>
        );
      })}
      <Warehouse sy={sy} />
    </Scene>
  );
}

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
const noise = (i: number) => {
  const v = Math.sin(i * 12.9898) * 43758.5453;
  return Math.round((v - Math.floor(v)) * 1000) / 1000;
};
const curveY = (x: number) => 250 - 200 * sigmoid((x - 210) / 26);
const regressionPoints = Array.from({ length: 30 }, (_, i) => {
  const x = 48 + i * 11;
  const acted = noise(i) < sigmoid((x - 210) / 26);
  return { x, y: Math.round((acted ? 50 : 246) + (noise(i + 99) - 0.5) * 18), acted };
});

function ModelScene({ on, sy }: SceneProps) {
  const curve = Array.from({ length: 68 }, (_, i) => {
    const x = 40 + i * 5;
    return `${i === 0 ? "M" : "L"}${x},${sy(curveY(x)).toFixed(1)}`;
  }).join(" ");
  return (
    <Scene on={on}>
      <line x1="40" y1={sy(262)} x2="376" y2={sy(262)} stroke="rgba(255,255,255,0.25)" />
      <line x1="40" y1={sy(30)} x2="40" y2={sy(262)} stroke="rgba(255,255,255,0.25)" />
      <text x="34" y={sy(54)} textAnchor="end" fontSize="10" fill={AMBER}>acted</text>
      <text x="34" y={sy(250)} textAnchor="end" fontSize="10" fill={MUTED}>didn&apos;t</text>
      <text x="376" y={sy(262) + 18} textAnchor="end" fontSize="10" fill={MUTED}>pattern strength →</text>
      {regressionPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={sy(p.y)} r="4.5" fill={p.acted ? AMBER : MUTED} fillOpacity={p.acted ? 0.95 : 0.55} className="story-pop" style={delay(i * 0.03)} />
      ))}
      <path d={curve} pathLength={1} fill="none" stroke={CYAN} strokeWidth="3" strokeLinecap="round" className="story-draw" style={{ ...delay(0.7), transitionDuration: "1.6s" }} />
      <text x="374" y={sy(24)} textAnchor="end" fontSize="13" fontWeight="700" fill={CYAN} fontFamily="ui-monospace, monospace" className="story-pop" style={delay(1.6)}>
        P(act) = σ(β₀ + β·x)
      </text>
    </Scene>
  );
}

const ranking = [0.92, 0.86, 0.79, 0.61, 0.48, 0.33, 0.21];
const CUTOFF = 0.75;
const scoreLayouts = {
  wide: { barTop: 34, barGap: 30, barScale: 160, cutoffBottom: 250, roc: { x: 236, y: 68, size: 140 } },
  tall: { barTop: 50, barGap: 36, barScale: 260, cutoffBottom: 300, roc: { x: 100, y: 370, size: 180 } },
};

function ScoreScene({ on, tall }: SceneProps) {
  const { barTop, barGap, barScale, cutoffBottom, roc } = tall ? scoreLayouts.tall : scoreLayouts.wide;
  const cutoffX = 34 + CUTOFF * barScale;
  const rocPath = Array.from({ length: 41 }, (_, i) => {
    const fpr = i / 40;
    const x = roc.x + fpr * roc.size;
    const y = roc.y + roc.size - Math.pow(fpr, 0.35) * roc.size;
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const right = roc.x + roc.size;
  const bottom = roc.y + roc.size;
  return (
    <Scene on={on}>
      <text x="34" y={barTop - 20} fontSize="10" fontWeight="600" fill={MUTED} letterSpacing="0.06em">
        ILLUSTRATIVE EXAMPLE, NOT REAL RESULTS
      </text>
      {ranking.map((p, i) => {
        const flagged = p >= CUTOFF;
        const y = barTop + i * barGap;
        return (
          <g key={i}>
            <rect x="34" y={y} width={p * barScale} height="18" rx="4" fill={flagged ? AMBER : "rgba(179,186,197,0.35)"} className="story-grow" style={delay(0.1 + i * 0.08)} />
            <text x={40 + p * barScale} y={y + 13} fontSize="11" fontWeight="600" fill={flagged ? AMBER : MUTED} className="story-pop" style={delay(0.5 + i * 0.08)}>
              {p.toFixed(2)}
            </text>
          </g>
        );
      })}
      <line x1={cutoffX} x2={cutoffX} y1={barTop - 8} y2={cutoffBottom} stroke={AMBER} strokeDasharray="4 4" />
      <text x={cutoffX} y={cutoffBottom + 18} textAnchor="middle" fontSize="10" fontWeight="600" fill={AMBER}>
        flag cutoff
      </text>

      <rect x={roc.x} y={roc.y} width={roc.size} height={roc.size} fill="none" stroke="rgba(255,255,255,0.2)" />
      <line x1={roc.x} y1={bottom} x2={right} y2={roc.y} stroke="rgba(179,186,197,0.5)" strokeDasharray="3 4" />
      <path d={`${rocPath} L${right},${bottom} Z`} fill={CYAN} fillOpacity="0.16" className="story-pop" style={delay(1.4)} />
      <path d={rocPath} pathLength={1} fill="none" stroke={CYAN} strokeWidth="2.5" className="story-draw" style={{ ...delay(0.6), transitionDuration: "1.2s" }} />
      <text x={roc.x + roc.size * 0.67} y={roc.y + roc.size * 0.87} textAnchor="middle" fontSize="15" fontWeight="800" fill={CYAN} className="story-pop" style={delay(1.6)}>
        AUC
      </text>
      <text x={roc.x + roc.size / 2} y={roc.y - 12} textAnchor="middle" fontSize="10" fill={MUTED}>ranking quality</text>
      {(() => {
        const lx = roc.x + roc.size * 0.81;
        const ly = roc.y + roc.size * 0.39;
        return (
          <text x={lx} y={ly} fontSize="9" fill={MUTED} transform={`rotate(-45 ${lx} ${ly})`}>coin flip</text>
        );
      })()}
    </Scene>
  );
}

const PAIN_Y = 192;
const decayY = (x: number) => 72 + 10 * Math.sin(x / 16) + Math.pow(Math.max(0, x - 170), 1.7) * 0.034;
const crossX = (() => {
  for (let x = 40; x < 376; x++) if (decayY(x) >= PAIN_Y) return x;
  return 360;
})();

function ActScene({ on, sy }: SceneProps) {
  const painY = sy(PAIN_Y);
  const decayPath = Array.from({ length: Math.floor((crossX - 40) / 3) + 2 }, (_, i) => {
    const x = Math.min(crossX, 40 + i * 3);
    return `${i === 0 ? "M" : "L"}${x},${sy(decayY(x)).toFixed(1)}`;
  }).join(" ");
  const livePath = Array.from({ length: 113 }, (_, i) => {
    const x = 40 + i * 3;
    return `${i === 0 ? "M" : "L"}${x},${sy(118 + 12 * Math.sin(x / 22 + 1)).toFixed(1)}`;
  }).join(" ");
  return (
    <Scene on={on}>
      <line x1="40" y1={sy(262)} x2="376" y2={sy(262)} stroke="rgba(255,255,255,0.25)" />
      <line x1="40" y1={sy(30)} x2="40" y2={sy(262)} stroke="rgba(255,255,255,0.25)" />
      <text x="44" y={sy(30) - 6} fontSize="10" fill={MUTED}>signal strength</text>
      <text x="376" y={sy(30) - 6} textAnchor="end" fontSize="9" fontWeight="600" fill={MUTED} letterSpacing="0.06em">
        ILLUSTRATIVE, NOT REAL
      </text>
      <text x="376" y={sy(262) + 18} textAnchor="end" fontSize="10" fill={MUTED}>time →</text>
      <line x1="40" x2="376" y1={painY} y2={painY} stroke={RED} strokeWidth="1.5" strokeDasharray="6 5" />
      <text x="374" y={painY + 16} textAnchor="end" fontSize="11" fontWeight="700" fill={RED}>
        pain threshold
      </text>
      <path d={livePath} pathLength={1} fill="none" stroke={CYAN} strokeWidth="2.5" className="story-draw" style={{ ...delay(0.2), transitionDuration: "2s" }} />
      <text x="374" y={sy(100)} textAnchor="end" fontSize="11" fontWeight="600" fill={CYAN} className="story-pop" style={delay(2)}>
        still live
      </text>
      <path d={decayPath} pathLength={1} fill="none" stroke={AMBER} strokeWidth="3" strokeLinecap="round" className="story-draw" style={{ ...delay(0.4), transitionDuration: "2s" }} />
      <g className="story-pop" style={delay(2.3)}>
        <circle cx={crossX} cy={painY} r="7" fill="none" stroke={RED} strokeWidth="2">
          <animate attributeName="r" values="7;26" dur="1.2s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="1;0" dur="1.2s" repeatCount="indefinite" />
        </circle>
        <circle cx={crossX} cy={painY} r="6" fill={RED} />
        <Chip x={crossX - 12} y={painY + 40} text="early exit flagged" color={RED} anchor="end" />
      </g>
    </Scene>
  );
}

const scenes = [CollectScene, FilterScene, StoreScene, EnrichScene, ModelScene, ScoreScene, ActScene];

export function HowItWorks() {
  const [active, setActive] = useState(0);
  const desktop = useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => true,
  );
  const tall = !desktop;
  const sy = tall ? stretched : flat;
  const viewHeight = tall ? TALL_HEIGHT : WIDE_HEIGHT;
  const sectionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const targets = desktop ? stepRefs.current : cardRefs.current;
    const stepObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.step));
        }
      },
      { rootMargin: desktop ? "-55% 0px -35% 0px" : "-78% 0px -15% 0px" },
    );
    targets.forEach((el) => el && stepObserver.observe(el));
    return () => stepObserver.disconnect();
  }, [desktop]);

  useEffect(() => {
    const svg = svgRef.current;
    const section = sectionRef.current;
    if (!svg || !section) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const playObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !reduceMotion) svg.unpauseAnimations();
      else svg.pauseAnimations();
    });
    playObserver.observe(section);
    if (reduceMotion) svg.pauseAnimations();
    return () => playObserver.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="how"
      aria-labelledby="how-title"
      className="border-t border-white/8 pt-20 md:pt-28"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-cyan">How it works</p>
        <h2
          id="how-title"
          className="mt-3 max-w-3xl text-balance font-[family-name:var(--font-heading)] text-[clamp(1.875rem,5vw,3.25rem)] font-bold leading-[1.1] tracking-tight"
        >
          From a stray post to a scored, flagged call.
        </h2>
        <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted md:text-xl">
          Seven steps, start to finish. Scroll through them.
        </p>
        <nav aria-label="More on how it works" className="mt-5 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted">Then:</span>
          {[
            { href: "/case-studies", label: "Case studies" },
            { href: "#math", label: "The math" },
            { href: "#game", label: "The game" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full border border-white/15 px-3.5 py-1.5 font-medium text-foreground transition-colors hover:bg-surface"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="relative mt-10 lg:grid lg:grid-cols-[1.5fr_1fr] lg:gap-12">
          <div className="sticky top-16 z-0 -mx-5 h-[calc(100svh-4rem)] sm:-mx-6 lg:top-[max(6rem,calc(50vh-19rem))] lg:mx-0 lg:h-[min(calc(100vh-8rem),38rem)]">
            <div
              aria-hidden="true"
              className="flex h-full flex-col border-y border-white/8 bg-surface px-3 py-4 sm:px-6 lg:rounded-3xl lg:border lg:p-6"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse at 50% 55%, rgba(34,211,238,0.10), transparent 65%), radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
                backgroundSize: "100% 100%, 22px 22px",
              }}
            >
              <div className="flex items-center justify-between px-2 lg:px-0">
                <p className="font-mono text-sm text-accent">
                  {String(active + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
                </p>
                <p className="text-sm font-semibold uppercase tracking-wider text-foreground">
                  {steps[active].label}
                </p>
              </div>
              <div className="mt-3 grid grid-cols-7 gap-1.5 px-2 lg:order-last lg:px-0">
                {steps.map((step, i) => (
                  <span
                    key={step.label}
                    className={`h-1 rounded-full transition-colors duration-500 ${i <= active ? "bg-accent" : "bg-white/10"}`}
                  />
                ))}
              </div>
              <div className="mt-3 min-h-0 flex-1">
                <svg ref={svgRef} width="400" height={viewHeight} viewBox={`0 0 400 ${viewHeight}`} className="block h-full w-full">
                  {scenes.map((SceneComponent, i) => (
                    <SceneComponent key={i} on={i === active} tall={tall} sy={sy} />
                  ))}
                </svg>
              </div>
            </div>
          </div>

          <ol className="relative z-10 -mt-[calc(100svh-4rem)] pb-[40svh] lg:mt-0 lg:pb-[35vh]">
            {steps.map((step, i) => (
              <li
                key={step.label}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
                data-step={i}
                className="flex min-h-[150svh] items-end pb-[6svh] lg:min-h-[85vh] lg:items-center lg:pb-0"
              >
                <div
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  data-step={i}
                  className={`rounded-3xl border p-6 shadow-[0_20px_60px_rgba(0,0,0,0.55)] transition-colors duration-500 md:p-7 lg:shadow-none ${
                    i === active ? "border-accent/40 bg-surface/95" : "border-white/8 bg-surface/90 lg:bg-surface/60"
                  }`}
                >
                  <p className="font-mono text-sm text-accent">
                    {String(i + 1).padStart(2, "0")} · {step.label}
                  </p>
                  <h3 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-bold leading-tight md:text-3xl">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-muted md:text-lg">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
