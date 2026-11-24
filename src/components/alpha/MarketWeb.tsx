"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { SectionHeading } from "@/components/alpha/SectionHeading";

type NodeId = "smallcap" | "wsb" | "volume" | "up" | "down" | "offering" | "short";
type Place = "above" | "below" | "left" | "right";
type Align = "start" | "middle" | "end";
type Spot = { x: number; y: number; place: Place; align?: Align };
type Layout = "narrow" | "wide";
type WebNode = {
  id: NodeId;
  name: string;
  narrow: Spot;
  wide: Spot;
  input: [string, string, string];
  context: [string, string];
  output: [string, string, string];
  sentence: string;
};

const nodes: WebNode[] = [
  {
    id: "smallcap",
    name: "Small-cap",
    narrow: { x: 50, y: 14, place: "above" },
    wide: { x: 16, y: 24, place: "above" },
    input: ["distinct authors", "their recent pace", "a volume spike"],
    context: ["pennystocks and shortsqueeze", "known before 9:30"],
    output: ["WSB", "volume", "up shock"],
    sentence:
      "Authors on the small-cap subs before the open raise wallstreetbets, next-session volume, and the up-shock rate. The down-shock rate stays put.",
  },
  {
    id: "wsb",
    name: "WSB",
    narrow: { x: 26, y: 32, place: "below" },
    wide: { x: 16, y: 50, place: "left" },
    input: ["authors on WSB", "small-cap posts first", "an up shock"],
    context: ["whether the small subs led", "known before 9:30"],
    output: ["small-cap posts", "volume", "up shock"],
    sentence:
      "Wallstreetbets and the small-cap subs raise each other. The next session comes in with higher volume and a higher up-shock rate.",
  },
  {
    id: "volume",
    name: "Volume",
    narrow: { x: 50, y: 52, place: "above" },
    wide: { x: 42, y: 50, place: "left" },
    input: ["shares versus the prior 20 sessions", "a prior shock", "crowd posts"],
    context: ["at least twice the trailing pace", "no direction of its own"],
    output: ["up shock", "down shock", "volume stays hot"],
    sentence:
      "A volume spike raises the chance of a shock the next session, in either direction, and keeps volume hot. Direction comes from another string.",
  },
  {
    id: "up",
    name: "Up shock",
    narrow: { x: 26, y: 70, place: "below" },
    wide: { x: 68, y: 30, place: "above" },
    input: ["return versus SPY", "the name's own 20-day volatility", "a prior down shock"],
    context: ["two standard deviations", "often a reversal"],
    output: ["down shock", "volume", "WSB"],
    sentence:
      "A large up move versus SPY keeps volume elevated and can tip into a down shock. It also shows up on wallstreetbets.",
  },
  {
    id: "down",
    name: "Down shock",
    narrow: { x: 74, y: 70, place: "below" },
    wide: { x: 68, y: 70, place: "below" },
    input: ["return versus SPY", "the name's own 20-day volatility", "a volume spike"],
    context: ["two standard deviations down", "the lead is the reversal"],
    output: ["up shock", "volume", "several sessions"],
    sentence:
      "A down shock raises the chance of an up shock over the following sessions, with volume still elevated.",
  },
  {
    id: "offering",
    name: "Offering",
    narrow: { x: 74, y: 32, place: "below" },
    wide: { x: 16, y: 76, place: "left" },
    input: ["SEC offering filing", "filing date", "known before the open"],
    context: ["dilution is public", "part of the footprint group"],
    output: ["down shock", "small-cap posts", "volume"],
    sentence:
      "An offering filing raises the next session's down-shock rate, and it shows up in the small-cap subs. The footprint group held out of sample. This filing has not been separated from the short print.",
  },
  {
    id: "short",
    name: "Short print",
    narrow: { x: 50, y: 88, place: "above" },
    wide: { x: 88, y: 50, place: "right" },
    input: ["off-exchange short share", "versus its own 20 days", "file out around 18:00 ET"],
    context: ["tradable at the next open", "same group as offerings"],
    output: ["down shock", "one session", "the next print stays quiet"],
    sentence:
      "A hot short print sits in the group that raises the next session's down-shock rate. It does not raise the next short print. Which print inside the group is the trigger is still one test away.",
  },
];

const byId = Object.fromEntries(nodes.map((node) => [node.id, node])) as Record<NodeId, WebNode>;

const edges: [NodeId, NodeId][] = [
  ["smallcap", "wsb"],
  ["smallcap", "volume"],
  ["smallcap", "up"],
  ["smallcap", "offering"],
  ["wsb", "up"],
  ["volume", "up"],
  ["volume", "down"],
  ["volume", "offering"],
  ["down", "up"],
  ["offering", "down"],
  ["short", "down"],
];

const neighborsOf = (id: NodeId) =>
  edges.flatMap(([a, b]) => (a === id ? [b] : b === id ? [a] : []));

const PHI = (1 + Math.sqrt(5)) / 2;
const round = (n: number) => Math.round(n * 1000) / 1000;

// Shortest-path depth from the selected unit — each click ripples activation outward.
const depthsFrom = (start: NodeId): Partial<Record<NodeId, number>> => {
  const depth: Partial<Record<NodeId, number>> = { [start]: 0 };
  const queue: NodeId[] = [start];
  for (let i = 0; i < queue.length; i++) {
    const u = queue[i];
    for (const v of neighborsOf(u)) {
      if (depth[v] === undefined) {
        depth[v] = depth[u]! + 1;
        queue.push(v);
      }
    }
  }
  return depth;
};

const placeClass: Record<Place, string> = {
  above: "bottom-1/2 mb-3.5",
  below: "top-1/2 mt-3.5",
  left: "right-1/2 mr-4 top-1/2 -translate-y-1/2",
  right: "left-1/2 ml-4 top-1/2 -translate-y-1/2",
};

const alignClass: Record<Align, string> = {
  start: "left-1/2 -ml-2",
  middle: "left-1/2 -translate-x-1/2",
  end: "right-1/2 -mr-2",
};

const labelSpot = ({ place, align = "middle" }: Spot) =>
  place === "above" || place === "below" ? `${placeClass[place]} ${alignClass[align]}` : placeClass[place];

const pct = (n: number) => `${n}%`;
// Center of slot i when n equal slots share a side.
const slot = (i: number, n: number) => `${((2 * i + 1) / (2 * n)) * 100}%`;

const LAYER_BOUNDS = {
  wide: [4, 29, 29, 55, 55, 80, 80, 96] as const,
  narrow: [6, 22, 22, 40, 40, 60, 60, 78, 78, 94] as const,
};

const WEB_VIEW = 100;

const synapsePath = (layout: Layout, from: Spot, to: Spot) => {
  const bend = 0.38;
  if (layout === "wide") {
    const dx = (to.x - from.x) * bend;
    const c1x = from.x + dx;
    const c2x = to.x - dx;
    return `M ${from.x} ${from.y} C ${c1x} ${from.y}, ${c2x} ${to.y}, ${to.x} ${to.y}`;
  }
  const dy = (to.y - from.y) * bend;
  const c1y = from.y + dy;
  const c2y = to.y - dy;
  return `M ${from.x} ${from.y} C ${from.x} ${c1y}, ${to.x} ${c2y}, ${to.x} ${to.y}`;
};

function NetBackdrop({ layout }: { layout: Layout }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const bounds = LAYER_BOUNDS[layout];
  const bands = [];
  for (let i = 0; i + 1 < bounds.length; i += 2) {
    const a = bounds[i];
    const b = bounds[i + 1];
    bands.push(
      layout === "wide" ? (
        <rect key={a} x={a} y={5} width={b - a} height={90} className="web-layer-band" />
      ) : (
        <rect key={a} x={5} y={a} width={90} height={b - a} className="web-layer-band" />
      ),
    );
  }
  const guides =
    layout === "wide"
      ? [29, 55, 80].map((x) => <line key={x} x1={x} y1={5} x2={x} y2={95} className="web-layer" />)
      : [22, 40, 60, 78].map((y) => <line key={y} x1={5} y1={y} x2={95} y2={y} className="web-layer" />);
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${WEB_VIEW} ${WEB_VIEW}`}
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        <pattern id={`${id}-dots`} width="2.2" height="2.2" patternUnits="userSpaceOnUse">
          <circle cx="0.2" cy="0.2" r="0.2" fill="white" fillOpacity="0.07" />
        </pattern>
      </defs>
      <rect width={WEB_VIEW} height={WEB_VIEW} fill={`url(#${id}-dots)`} />
      {bands}
      {guides}
    </svg>
  );
}

const edgeStrength = (da: number, db: number) =>
  round(PHI ** -(Math.min(da, db) + Math.abs(da - db) * 0.55));

const probStreams = (strength: number, hops: number) =>
  Math.min(4, 1 + (hops <= 1 ? 2 : 1) + Math.round(strength * 2.2));

function WebStrings({
  layout,
  selected,
  drawn,
  depth,
}: {
  layout: Layout;
  selected: NodeId | null;
  drawn: number;
  depth: Partial<Record<NodeId, number>>;
}) {
  return (
    <>
      {edges.map(([a, b], i) => {
        const fromA = byId[a][layout];
        const toB = byId[b][layout];
        const d = synapsePath(layout, fromA, toB);

        if (!selected) {
          return <path key={`${a}-${b}`} d={d} pathLength={1} className="web-synapse web-synapse-dormant" />;
        }

        const da = depth[a];
        const db = depth[b];
        if (da === undefined || db === undefined) {
          return <path key={`${a}-${b}`} d={d} pathLength={1} className="web-synapse web-synapse-dormant" />;
        }

        const hops = Math.abs(da - db);
        const hub = a === selected || b === selected;
        const shallow = Math.min(da, db);
        const strength = edgeStrength(da, db);
        const streams = probStreams(strength, hops);
        const toward =
          da > db ? [byId[b][layout], byId[a][layout]] : [byId[a][layout], byId[b][layout]];
        const flow = synapsePath(layout, toward[0], toward[1]);

        return (
          <g key={`${a}-${b}`}>
            <path
              d={d}
              pathLength={1}
              className="web-synapse web-synapse-live"
              style={{ strokeOpacity: round(0.1 + strength * 0.42) }}
            />
            {hub && (
              <g key={drawn}>
                <path
                  d={flow}
                  pathLength={1}
                  fill="none"
                  className={drawn ? "web-draw" : undefined}
                  stroke="var(--accent)"
                  strokeOpacity={0.22}
                  strokeWidth={8}
                  strokeLinecap="round"
                />
                <path
                  d={flow}
                  pathLength={1}
                  fill="none"
                  className={drawn ? "web-draw" : undefined}
                  stroke="var(--accent)"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
              </g>
            )}
            {Array.from({ length: streams }, (_, k) => {
              const fade = round(strength * (1 - k * 0.22));
              const delay = round(0.06 + shallow * 0.16 + k * 0.11 + (i % 5) * 0.03);
              const tone = hub && k === 0 ? "var(--accent)" : "var(--cyan)";
              return (
                <path
                  key={`${drawn}-${k}`}
                  d={flow}
                  pathLength={1}
                  fill="none"
                  className={k === 0 ? "web-surge" : "web-prob"}
                  style={{
                    animationDelay: `${delay}s`,
                    stroke: tone,
                    strokeOpacity: fade,
                    strokeWidth: k === 0 ? 2.5 : 1.5,
                  }}
                />
              );
            })}
          </g>
        );
      })}
    </>
  );
}

const ENGINE = {
  in: { start: 0, step: 0.09 },
  synapseIn: { start: 0.3, step: 0.028 },
  context: { start: 0.5, step: 0.11 },
  synapseOut: { start: 0.76, step: 0.03 },
  out: { start: 0.96, step: 0.09 },
} as const;

function NetGap({
  from,
  to,
  phase,
  nodeId,
  drawn,
}: {
  from: number;
  to: number;
  phase: "in" | "out";
  nodeId: NodeId;
  drawn: number;
}) {
  const syn = phase === "in" ? ENGINE.synapseIn : ENGINE.synapseOut;
  const pairs = Array.from({ length: from * to }, (_, k) => [Math.floor(k / to), k % to] as const);
  const strings = (layout: Layout) =>
    pairs.map(([i, j], k) => {
      const line =
        layout === "wide"
          ? { x1: "0%", y1: slot(i, from), x2: "100%", y2: slot(j, to) }
          : { x1: slot(i, from), y1: "0%", x2: slot(j, to), y2: "100%" };
      const surgeAt = syn.start + k * syn.step;
      const pulse: CSSProperties = {
        animationDuration: `${round(PHI ** 2)}s`,
        animationDelay: `${round(surgeAt + ((k * (PHI - 1)) % 1))}s`,
      };
      return (
        <g key={`${nodeId}-${drawn}-${phase}-${k}`}>
          <line {...line} pathLength={1} className="web-synapse" />
          <line
            {...line}
            pathLength={1}
            className="web-surge"
            style={{ animationDelay: `${round(surgeAt)}s` }}
            stroke="var(--cyan)"
            strokeWidth={4}
            strokeOpacity={0.55}
          />
          <line
            {...line}
            pathLength={1}
            className="web-surge"
            style={{ animationDelay: `${round(surgeAt)}s` }}
            stroke="#e0fbff"
            strokeWidth={1.5}
          />
          <line
            {...line}
            pathLength={1}
            className="web-pulse"
            style={pulse}
            stroke="var(--cyan)"
            strokeOpacity={0.25}
            strokeWidth={5}
            strokeLinecap="round"
          />
        </g>
      );
    });

  return (
    <div aria-hidden="true" className="flex h-[55px] shrink-0 flex-row sm:h-auto sm:w-[34px] sm:flex-col md:w-[89px]">
      <span className="w-6 shrink-0 sm:h-7 sm:w-auto" />
      <div className="relative flex-1">
        <svg className="absolute inset-0 h-full w-full overflow-visible">
          <g className="sm:hidden">{strings("narrow")}</g>
          <g className="hidden sm:inline">{strings("wide")}</g>
        </svg>
      </div>
    </div>
  );
}

type Kind = "in" | "context" | "out";

const itemClass: Record<Kind, string> = {
  in: "flex-col-reverse sm:flex-row-reverse sm:text-right",
  context: "flex-col sm:flex-row",
  out: "flex-col sm:flex-row sm:text-left",
};

function Neuron({ kind, igniteAt }: { kind: Kind; igniteAt: number }) {
  return (
    <span
      aria-hidden="true"
      style={{ animationDelay: `${round(igniteAt)}s` }}
      className={`web-neuron web-ignite ${kind === "context" ? "web-neuron-context" : ""}`}
    />
  );
}

function NetLayer({
  title,
  kind,
  items,
  drawn,
}: {
  title: string;
  kind: Kind;
  items: readonly string[];
  drawn: number;
}) {
  const timing = kind === "in" ? ENGINE.in : kind === "context" ? ENGINE.context : ENGINE.out;
  return (
    <div className={`flex flex-row sm:flex-col ${kind === "context" ? "sm:flex-[1.618]" : "sm:flex-1"}`}>
      <p
        className={`flex w-6 shrink-0 rotate-180 items-center justify-center text-xs font-semibold uppercase tracking-wider text-muted [writing-mode:vertical-rl] sm:h-7 sm:w-auto sm:rotate-0 sm:items-start sm:[writing-mode:horizontal-tb] sm:text-sm ${
          kind === "in" ? "sm:justify-end" : kind === "context" ? "sm:justify-center" : "sm:justify-start"
        }`}
      >
        {title}
      </p>
      <ul className="flex flex-1 flex-row sm:flex-col">
        {items.map((item, i) => {
          const igniteAt = timing.start + i * timing.step;
          return (
            <li
              key={`${item}-${drawn}`}
              className={`flex min-w-0 flex-1 items-center gap-2 px-1 text-center sm:gap-3 sm:px-0 ${itemClass[kind]}`}
            >
              <Neuron kind={kind} igniteAt={igniteAt} />
              <span
                style={{ animationDelay: `${round(igniteAt + 0.04)}s` }}
                className="web-readout web-readout-glow min-w-0 flex-1 text-xs leading-snug [overflow-wrap:anywhere] sm:text-sm"
              >
                {item}
              </span>
              {kind === "context" && <Neuron kind={kind} igniteAt={igniteAt + 0.05} />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function MarketWeb() {
  const [state, setState] = useState<{ selected: NodeId | null; drawn: number }>({ selected: null, drawn: 0 });
  const [live, setLive] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setLive(entry.isIntersecting), { rootMargin: "120px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const select = (id: NodeId) => setState((prev) => ({ selected: id, drawn: prev.drawn + 1 }));

  const { selected, drawn } = state;
  const lit = selected !== null;
  const node = selected ? byId[selected] : null;
  const depth = selected ? depthsFrom(selected) : {};
  const spotVars = (n: WebNode) =>
    ({
      "--xn": pct(n.narrow.x),
      "--yn": pct(n.narrow.y),
      "--xw": pct(n.wide.x),
      "--yw": pct(n.wide.y),
    }) as CSSProperties;
  const atSelected =
    "web-glide pointer-events-none absolute top-[var(--yn)] left-[var(--xn)] -translate-x-1/2 -translate-y-1/2 transition-[left,top] duration-[618ms] ease-out sm:top-[var(--yw)] sm:left-[var(--xw)]";

  return (
    <section
      ref={sectionRef}
      id="web"
      aria-labelledby="web-title"
      data-live={live}
      className="scroll-mt-16 border-t border-white/8 py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading id="web-title" eyebrow="The web" title="A lead-lag web.">
          An illustration of a discrete-time Hawkes fit across crowd posts, price shocks, and filings, estimated on
          sessions through 2024 and checked on sessions after. An event known before the 9:30 ET open changes what the
          next session includes.
        </SectionHeading>

        <div
          data-web-lit={lit}
          className="relative mt-[34px] overflow-hidden rounded-[21px] border border-white/8 bg-surface p-[21px] sm:p-[34px]"
        >
          <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_42%,transparent_88%)]">
            <div className="h-full sm:hidden">
              <NetBackdrop layout="narrow" />
            </div>
            <div className="hidden h-full sm:block">
              <NetBackdrop layout="wide" />
            </div>
          </div>
          <div className="relative mx-auto aspect-[10/14] w-full max-h-[min(72vh,520px)] sm:aspect-[1.618/1] sm:max-h-none">
              {node && (
                <div
                  aria-hidden="true"
                  style={spotVars(node)}
                  className={`${atSelected} glow-orb h-[160px] w-[160px] rounded-full sm:h-[320px] sm:w-[320px]`}
                />
              )}
              <svg
                viewBox={`0 0 ${WEB_VIEW} ${WEB_VIEW}`}
                preserveAspectRatio="none"
                aria-hidden="true"
                className="absolute inset-0 h-full w-full overflow-visible"
              >
                <g className="sm:hidden">
                  <WebStrings layout="narrow" selected={selected} drawn={drawn} depth={depth} />
                </g>
                <g className="hidden sm:inline">
                  <WebStrings layout="wide" selected={selected} drawn={drawn} depth={depth} />
                </g>
              </svg>

              <div role="group" aria-label="Nodes in the lead-lag web">
                {nodes.map((n) => {
                  const isSelected = lit && n.id === selected;
                  const d = depth[n.id];
                  const activated = lit && d !== undefined && d > 0;
                  const tone = !lit
                    ? "text-muted/70"
                    : isSelected
                      ? "text-accent"
                      : activated
                        ? "text-foreground"
                        : "text-muted";
                  const reach = lit && d !== undefined && !isSelected ? round(PHI ** -d) : 0;
                  const label = `pointer-events-none absolute max-w-[42vw] truncate rounded-md bg-background/90 px-1.5 py-0.5 text-[11px] font-semibold leading-tight backdrop-blur-sm sm:max-w-none sm:whitespace-nowrap sm:text-sm ${tone}`;
                  return (
                    <button
                      key={n.id}
                      type="button"
                      aria-pressed={lit ? isSelected : undefined}
                      aria-label={`${n.name}, strings to ${neighborsOf(n.id)
                        .map((id) => byId[id].name)
                        .join(", ")}`}
                      onPointerEnter={(event) => {
                        if (event.pointerType === "mouse") select(n.id);
                      }}
                      onClick={() => select(n.id)}
                      style={spotVars(n)}
                      className={`absolute top-[var(--yn)] left-[var(--xn)] flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 touch-manipulation items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-cyan sm:top-[var(--yw)] sm:left-[var(--xw)] sm:h-11 sm:w-11 ${
                        isSelected ? "z-20" : "z-10"
                      }`}
                    >
                      <span
                        key={activated || isSelected ? drawn : undefined}
                        style={
                          activated
                            ? ({
                                animationDelay: `${0.18 + (d ?? 0) * 0.14}s`,
                                opacity: round(0.35 + reach * 0.55),
                              } as CSSProperties)
                            : undefined
                        }
                        className={`relative flex h-[21px] w-[21px] items-center justify-center ${
                          activated ? "web-echo" : ""
                        } ${!lit ? "opacity-40" : ""}`}
                      >
                        {isSelected && (
                          <span
                            aria-hidden="true"
                            className="web-ping absolute inset-0 rounded-full border border-accent/50 bg-accent/15"
                          />
                        )}
                        <span
                          className={`block rounded-full transition-all duration-300 ${
                            isSelected
                              ? "h-[21px] w-[21px] bg-accent shadow-[0_0_14px_5px_rgba(245,158,11,0.85)]"
                              : activated
                                ? "h-[13px] w-[13px] bg-cyan shadow-[0_0_10px_3px_rgba(34,211,238,0.55)]"
                                : "h-[13px] w-[13px] bg-white/18"
                          }`}
                        />
                      </span>
                      <span className={`${label} ${labelSpot(n.narrow)} sm:hidden`}>{n.name}</span>
                      <span className={`${label} ${labelSpot(n.wide)} hidden sm:block`}>{n.name}</span>
                    </button>
                  );
                })}
              </div>
          </div>
          <p className="relative mt-[21px] text-sm text-muted">
            <span className="sm:hidden">
              {lit
                ? "Many strings can light at once—each fade is a possible path, not a forecast."
                : "Tap a neuron—the net wakes up and many possible strings light together."}
            </span>
            <span className="hidden sm:inline">
              {lit
                ? "Many strings can light at once—each fade is a possible path through the web, not a forecast."
                : "Pick a neuron—the net is dark until one lights up; then many possible strings run together."}
            </span>
          </p>
        </div>

        <div className="relative mt-[21px] overflow-hidden rounded-[21px] border border-white/8 bg-surface p-[21px] md:p-[34px]">
          <div className="pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_90%)]">
            <div className="h-full sm:hidden">
              <NetBackdrop layout="narrow" />
            </div>
            <div className="hidden h-full sm:block">
              <NetBackdrop layout="wide" />
            </div>
          </div>
          {node ? (
            <>
              <h3 className="relative font-[family-name:var(--font-heading)] text-xl font-bold tracking-tight md:text-2xl">
                Context engine: <span className="text-accent">{node.name}</span>
              </h3>
              <div
                key={`engine-${selected}-${drawn}`}
                className="relative mt-[21px] flex flex-col sm:min-h-[233px] sm:flex-row"
              >
                <NetLayer title="In" kind="in" items={node.input} drawn={drawn} />
                <NetGap from={3} to={2} phase="in" nodeId={selected!} drawn={drawn} />
                <NetLayer title="Context" kind="context" items={node.context} drawn={drawn} />
                <NetGap from={2} to={3} phase="out" nodeId={selected!} drawn={drawn} />
                <NetLayer title="Out" kind="out" items={node.output} drawn={drawn} />
              </div>
              <p
                aria-live="polite"
                className="relative mt-[21px] max-w-3xl text-pretty text-base leading-relaxed md:text-lg"
              >
                {node.sentence}
              </p>
            </>
          ) : (
            <p className="relative mt-[21px] max-w-3xl text-pretty text-base leading-relaxed text-muted md:text-lg">
              Context engine waits in the dark. Choose a neuron above to read its strings—not a forecast, just the
              fitted lead-lags from that node.
            </p>
          )}
        </div>

        <p className="mt-[21px] max-w-3xl text-sm leading-relaxed text-muted">
          Not a track record, not a trading signal, and not advice. The context engine is a reading of the selected
          node, not a trained neural network. The evidence is on the{" "}
          <a
            href="/research"
            className="text-foreground underline decoration-white/30 underline-offset-4 hover:decoration-foreground"
          >
            research page
          </a>
          .
        </p>
      </div>
    </section>
  );
}
