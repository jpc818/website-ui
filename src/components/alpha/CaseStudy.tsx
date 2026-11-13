"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { CaseChart } from "@/components/alpha/CaseChart";
import { CasePosters } from "@/components/alpha/cases/CasePosters";
import { caseSteps as steps } from "@/components/alpha/caseSteps";

const INK = "#1c1917";
const PAPER = "#f5f5f4";
const CHAR = "#3b3835";
const FIRE = "#f97316";
const FIRE_HOT = "#fbbf24";
const FIRE_DEEP = "#ea580c";

const TAU = Math.PI * 2;
const CX = 200;
const CY = 300;
const SQUASH = 0.62;
// The camera zooms out in two stages. Up to "Days 6-7" it frames the scar and the flame front
// up close. The last frame pulls back about 10x more so the scar reads as a mark on a whole landscape.
const R_WIDE = 520;
const R_FINAL = 3800;
const START_ZOOM = 1.6;
const WIDE_ZOOM = 0.26;
const END_ZOOM = 0.026;
const WIDE_AT = 0.86;
const zoomAt = (p: number) => {
  const mid = START_ZOOM * Math.pow(WIDE_ZOOM / START_ZOOM, WIDE_AT);
  return p <= WIDE_AT
    ? START_ZOOM * Math.pow(WIDE_ZOOM / START_ZOOM, p)
    : mid * Math.pow(END_ZOOM / mid, (p - WIDE_AT) / (1 - WIDE_AT));
};
const radiusAt = (p: number) => {
  const wide = 14 + (R_WIDE - 14) * Math.pow((WIDE_AT - 0.3) / 0.7, 1.1);
  if (p < 0.3) return 14 * (p / 0.3);
  if (p <= WIDE_AT) return 14 + (R_WIDE - 14) * Math.pow((p - 0.3) / 0.7, 1.1);
  return wide + (R_FINAL - wide) * ((p - WIDE_AT) / (1 - WIDE_AT));
};
const RIM = 48;
const FRONT = 48;

const DESKTOP_QUERY = "(min-width: 1024px)";
const subscribeDesktop = (onChange: () => void) => {
  const query = window.matchMedia(DESKTOP_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const r1 = (v: number) => Math.round(v * 10) / 10;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// The forest, the grass and the ridge are generated once, deterministically, so the server
// and the browser draw exactly the same sketch.
const placer = rng(7);
const trees: { x: number; y: number; s: number }[] = [];
for (let gx = -520; gx <= 920; gx += 120) {
  for (let gy = -780; gy <= 1440; gy += 120) {
    const x = r1(gx + (placer() - 0.5) * 90);
    const y = r1(gy + (placer() - 0.5) * 90);
    const size = r1(0.75 + placer() * 0.6);
    const dx = (x - CX) / 150;
    const dy = (y - CY) / (150 * SQUASH);
    if (dx * dx + dy * dy < 1) continue;
    trees.push({ x, y, s: size });
  }
}
trees.sort((a, b) => a.y - b.y);
const candidates = new Set(trees);

// Far-field landmarks, only visible once the camera has pulled way back: a winding river and a lake.
const riverRng = rng(77);
let riverPath = "";
for (let y = -15000, i = 0; y <= 15000; y += 800, i++) {
  const x = r1(5600 + Math.sin(i * 0.55) * 700 + (riverRng() - 0.5) * 260);
  riverPath += `${i ? "L" : "M"}${x} ${y}`;
}

const grass = rng(21);
let grassPath = "";
for (let i = 0; i < 420; i++) {
  const x = r1(-520 + grass() * 1440);
  const y = r1(-780 + grass() * 2220);
  grassPath += `M${x} ${y}l${r1((grass() - 0.5) * 5)} ${r1(-3 - grass() * 5)}`;
}

const ridge = rng(33);
let ridgePath = "M-540 -380";
for (let x = -540; x <= 940; x += 60) ridgePath += `L${x} ${r1(-640 + (ridge() - 0.5) * 90)}`;
ridgePath += "L940 -380Z";

const scarRaw = rng(5);
const rawNoise = Array.from({ length: RIM }, () => scarRaw() - 0.5);
const scarNoise = rawNoise.map((_, i) => ((rawNoise[(i + RIM - 1) % RIM] + rawNoise[i] + rawNoise[(i + 1) % RIM]) / 3) * 0.34);
const cosRim = Array.from({ length: RIM }, (_, i) => Math.cos((i / RIM) * TAU));
const sinRim = Array.from({ length: RIM }, (_, i) => Math.sin((i / RIM) * TAU));

const front = rng(61);
const frontAngle = Array.from({ length: FRONT }, (_, i) => ((i + (front() - 0.5) * 0.7) / FRONT) * TAU);
const frontSize = Array.from({ length: FRONT }, () => 0.75 + front() * 0.5);
const frontRim = frontAngle.map((a) => Math.round((a / TAU) * RIM) % RIM);

const FLAME_OUTER =
  "M0 0 C-26 0 -36 -26 -24 -50 C-17 -64 -10 -72 -12 -96 C4 -84 12 -70 10 -54 C18 -62 24 -72 22 -86 C42 -64 40 -24 24 -6 C16 0 8 0 0 0Z";

const stones = Array.from({ length: 10 }, (_, i) => {
  const a = (i / 10) * TAU + 0.2;
  return { x: r1(Math.cos(a) * 46), y: r1(Math.sin(a) * 13), rx: 8 + (i % 3), ry: 6 + (i % 2) };
});

function FlameShape({ outline = true }: { outline?: boolean }) {
  return (
    <>
      <path d={FLAME_OUTER} fill={FIRE_DEEP} stroke={outline ? INK : "none"} strokeWidth="1.4" strokeLinejoin="round" />
      <path d={FLAME_OUTER} transform="scale(0.72)" fill={FIRE} />
      <path d={FLAME_OUTER} transform="scale(0.44)" fill={FIRE_HOT} />
      {outline && <path d="M-9 -22 Q-14 -38 -6 -54 M7 -26 Q12 -40 6 -58" fill="none" stroke={INK} strokeOpacity="0.55" strokeWidth="1" strokeLinecap="round" />}
    </>
  );
}

function MiniCampfire() {
  return (
    <svg aria-hidden="true" viewBox="0 0 160 170" className="pointer-events-none absolute bottom-3 right-3 h-36 w-32 md:bottom-6 md:right-8 md:h-52 md:w-48">
      {[0, 1, 2].map((k) => (
        <circle key={k} cx={78 + k * 4} cy="60" r="6" fill="none" stroke="#a8a29e" strokeWidth="1.2" opacity="0">
          <animate attributeName="cy" values="64;12" dur="3.2s" begin={`${-k * 1.05}s`} repeatCount="indefinite" />
          <animate attributeName="r" values="5;17" dur="3.2s" begin={`${-k * 1.05}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.8;0" keyTimes="0;0.25;1" dur="3.2s" begin={`${-k * 1.05}s`} repeatCount="indefinite" />
        </circle>
      ))}
      <g transform="translate(82 140)">
        <g className="fire-tongue">
          <FlameShape />
        </g>
      </g>
      <g stroke="#e7e5e4" strokeWidth="1.4" strokeLinecap="round" fill="#292524">
        <rect x="42" y="138" width="80" height="11" rx="5.5" transform="rotate(-8 82 144)" />
        <rect x="42" y="138" width="80" height="11" rx="5.5" transform="rotate(9 82 144)" />
      </g>
    </svg>
  );
}

export function CaseStudy({ standalone = false }: { standalone?: boolean }) {
  const Title = standalone ? "h1" : "h2";
  const [active, setActive] = useState(0);
  const desktop = useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => true,
  );
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const ids = {
    hatch: `${uid}-hatch`,
    ash: `${uid}-ash`,
    haze: `${uid}-haze`,
    pine: `${uid}-pine`,
    burnt: `${uid}-burnt`,
    flame: `${uid}-flame`,
    forest: `${uid}-forest`,
  };

  const sectionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const worldRef = useRef<SVGGElement>(null);
  const scarRef = useRef<SVGPathElement>(null);
  const scarHatchRef = useRef<SVGPathElement>(null);
  const hazeRef = useRef<SVGEllipseElement>(null);
  const flamesRef = useRef<SVGGElement>(null);
  const smokeRef = useRef<SVGGElement>(null);
  const campRef = useRef<SVGGElement>(null);
  const farRef = useRef<SVGGElement>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    const world = worldRef.current;
    const scar = scarRef.current;
    const scarHatch = scarHatchRef.current;
    const haze = hazeRef.current;
    const flames = flamesRef.current;
    const smoke = smokeRef.current;
    const camp = campRef.current;
    const far = farRef.current;
    const svg = svgRef.current;
    if (!list || !world || !scar || !scarHatch || !haze || !flames || !smoke || !camp || !far || !svg) return;

    const nearEls = Array.from(svg.querySelectorAll<SVGGElement>("[data-near]"));

    const flameEls = Array.from(flames.querySelectorAll<SVGGElement>("[data-flame]"));
    const treeEls = Array.from(svg.querySelectorAll<SVGGElement>("[data-candidate]")).map((group) => {
      const index = Number(group.dataset.candidate);
      return { x: trees[index].x, y: trees[index].y, alive: group.children[0], dead: group.children[1], burnt: false };
    });

    let frame = 0;
    const update = () => {
      frame = 0;
      const first = list.querySelector<HTMLElement>("li[data-step='0'] > div");
      const last = list.querySelector<HTMLElement>("li[data-step='4'] > div");
      if (!first || !last) return;
      const firstTop = first.getBoundingClientRect().top;
      const span = last.getBoundingClientRect().top - firstTop;
      const p = span > 0 ? clamp01((window.innerHeight * 0.82 - firstTop) / span) : 0;

      const zoom = zoomAt(p);
      const radius = radiusAt(p);
      const near = smooth(0.08, 0.2, zoom).toFixed(2);
      nearEls.forEach((el) => el.setAttribute("opacity", near));
      far.setAttribute("opacity", (1 - smooth(0.08, 0.2, zoom)).toFixed(2));
      world.setAttribute("transform", `translate(200 235) scale(${zoom.toFixed(4)}) translate(${-CX} ${-CY})`);

      let d = "";
      for (let i = 0; i < RIM; i++) {
        const rr = radius * (1 + scarNoise[i]);
        d += `${i ? "L" : "M"}${(CX + rr * cosRim[i]).toFixed(1)} ${(CY + SQUASH * rr * sinRim[i]).toFixed(1)}`;
      }
      d += "Z";
      scar.setAttribute("d", d);
      scarHatch.setAttribute("d", d);

      for (const tree of treeEls) {
        const inside = radius > 1 && ((tree.x - CX) / radius) ** 2 + ((tree.y - CY) / (radius * SQUASH)) ** 2 < 1;
        if (inside !== tree.burnt) {
          tree.burnt = inside;
          tree.alive.setAttribute("visibility", inside ? "hidden" : "visible");
          tree.dead.setAttribute("visibility", inside ? "visible" : "hidden");
        }
      }

      const intensity = 1 - 0.7 * smooth(0.78, 1, p);
      const visible = smooth(25, 90, radius);
      flames.setAttribute("opacity", visible.toFixed(2));
      if (visible > 0.01) {
        const base = 0.55 * Math.pow(zoom, -0.8) * intensity;
        for (let i = 0; i < FRONT; i++) {
          const rr = radius * (1 + scarNoise[frontRim[i]]);
          const x = CX + rr * Math.cos(frontAngle[i]);
          const y = CY + SQUASH * rr * Math.sin(frontAngle[i]);
          flameEls[i].setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(base * frontSize[i]).toFixed(3)})`);
        }
      }

      const smokeScale = Math.min(6, Math.max(1, 0.8 / zoom));
      smoke.setAttribute("transform", `translate(${CX} ${CY - 8}) scale(${smokeScale.toFixed(3)})`);
      smoke.setAttribute("opacity", ((0.3 + 0.7 * smooth(0.04, 0.26, p)) * (1 - 0.5 * smooth(0.8, 1, p))).toFixed(2));
      camp.setAttribute("transform", `scale(${(0.38 + 0.62 * smooth(0, 0.28, p)).toFixed(3)})`);

      haze.setAttribute("cy", (CY - radius * 0.5).toFixed(1));
      haze.setAttribute("rx", (radius * 1.05 + 1).toFixed(1));
      haze.setAttribute("ry", (radius * 0.8 + 1).toFixed(1));
      haze.setAttribute("opacity", Math.min(0.55, radius / 500).toFixed(2));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

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
      id="case"
      aria-labelledby="smoke-title"
      className={standalone ? "pt-28 md:pt-36" : "border-t border-white/8 pt-20 md:pt-28"}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        {standalone && (
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
            <a href="/case-studies" className="underline-offset-4 hover:text-foreground hover:underline">
              Case studies
            </a>
            <span aria-hidden="true"> / </span>
            <span>Put</span>
          </nav>
        )}
        <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-surface p-7 pb-44 md:p-12 md:pr-64">
          <MiniCampfire />
          <p className="relative text-sm font-semibold uppercase tracking-wider text-cyan">The downside strategy</p>
          <Title
            id="smoke-title"
            className="relative mt-3 max-w-3xl text-balance font-[family-name:var(--font-heading)] text-[clamp(2rem,6vw,3.75rem)] font-bold leading-[1.1] tracking-tight"
          >
            Where there&apos;s smoke,{" "}
            <span className="bg-gradient-to-t from-orange-600 via-orange-500 to-amber-300 bg-clip-text text-transparent">there&apos;s fire.</span>
          </Title>
          <p className="relative mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted md:text-xl">
            Everyone watches the fire. We watch the smoke. When a crowd&apos;s excitement starts outrunning everything
            underneath it, the rush for the exits can follow. Our downside warning is an attempt to see that moment coming.
          </p>
        </div>

        <p className="mt-16 text-sm font-semibold uppercase tracking-wider text-cyan md:mt-20">
          Case study 1 of 4 · Put · Wildfire
        </p>
        <h3 className="mt-3 max-w-3xl text-balance font-[family-name:var(--font-heading)] text-[clamp(1.875rem,5vw,3.25rem)] font-bold leading-[1.1] tracking-tight">
          The campfire that became a wildfire.
        </h3>
        <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted md:text-xl">
          A real event from our research, replayed day by day: Opendoor (OPEN) in July 2025. The model was trained only
          on earlier years and had never seen this period. Posters are described by profile, never by account.
        </p>
        <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-foreground md:text-lg">
          Read it as an illustration, not evidence. It&apos;s one hand-picked event, told with hindsight. It shows what
          the signal looked like, not how often it&apos;s right. How often: of the top-3% drop warnings on a held-out
          stretch, <span className="font-mono tabular-nums">63%</span> were followed by a 10-point drop, <span className="font-mono tabular-nums">37%</span> were not, and <span className="font-mono tabular-nums">21%</span> were followed by a rise of 10 points or
          more. <a href="/case-studies/failed" className="font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent">
            See one that failed
          </a>
          . Not a trade we made: live trading began in October 2026.
        </p>
        <CasePosters id="put" />

        <div className="relative mt-10 lg:grid lg:grid-cols-[1.5fr_1fr] lg:gap-12">
          <div className="sticky top-16 z-0 -mx-5 h-[calc(100svh-4rem)] sm:-mx-6 lg:top-[max(6rem,calc(50vh-19rem))] lg:mx-0 lg:h-[min(calc(100vh-8rem),38rem)]">
            <div
              aria-hidden="true"
              className="relative flex h-full flex-col overflow-hidden border-y border-white/8 px-3 py-4 sm:px-6 lg:rounded-3xl lg:border lg:p-6"
              style={{ background: `radial-gradient(ellipse at 50% 45%, #fafaf9 0%, ${PAPER} 55%, #e7e5e4 100%)` }}
            >
              <div className="relative flex items-center justify-between px-2 lg:px-0">
                <p className="font-mono text-sm text-black/60">Case study</p>
                <p className="text-sm font-semibold uppercase tracking-wider text-black">{steps[active].label}</p>
              </div>
              <div className="relative mt-3 grid grid-cols-5 gap-1.5 px-2 lg:order-last lg:px-0">
                {steps.map((step, i) => (
                  <span
                    key={step.label}
                    className={`h-1 rounded-full transition-colors duration-500 ${i <= active ? "bg-black" : "bg-black/15"}`}
                  />
                ))}
              </div>
              <div className="relative mt-3 min-h-0 flex-1">
                <svg
                  ref={svgRef}
                  width="400"
                  height="520"
                  viewBox="0 0 400 520"
                  preserveAspectRatio="xMidYMid slice"
                  className="sketch absolute inset-0 block h-full w-full"
                >
                  <defs>
                    <pattern id={ids.hatch} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
                      <line x1="0" y1="0" x2="0" y2="6" stroke={INK} strokeOpacity="0.5" strokeWidth="1.1" />
                    </pattern>
                    <pattern id={ids.ash} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
                      <line x1="0" y1="0" x2="0" y2="5" stroke="#d6d3d1" strokeOpacity="0.4" strokeWidth="1" />
                    </pattern>
                    <pattern id={ids.forest} width="150" height="150" patternUnits="userSpaceOnUse">
                      <path d="M20 46 L38 6 L56 46Z M86 70 L108 18 L130 70Z M30 128 L52 76 L74 128Z M104 140 L122 100 L140 140Z" fill={INK} fillOpacity="0.55" />
                    </pattern>
                    <radialGradient id={ids.haze} cx="0.5" cy="0.5" r="0.5">
                      <stop offset="0" stopColor="#78716c" stopOpacity="0.55" />
                      <stop offset="1" stopColor="#78716c" stopOpacity="0" />
                    </radialGradient>
                    <g id={ids.pine}>
                      <path d="M0 0 L0 -16" stroke={INK} strokeWidth="1.6" />
                      <path
                        d="M-24 -16 L-7 -46 L-15 -46 L-2 -74 L-9 -74 L0 -104 L9 -74 L2 -74 L15 -46 L7 -46 L24 -16 Z"
                        fill={PAPER}
                        stroke={INK}
                        strokeWidth="1.3"
                        strokeLinejoin="round"
                      />
                      <path d="M0 -104 L9 -74 L2 -74 L15 -46 L7 -46 L24 -16 L0 -16 Z" fill={`url(#${ids.hatch})`} />
                    </g>
                    <g id={ids.burnt}>
                      <path d="M-4 0 L-2.5 -70 L2.5 -70 L4 0 Z" fill={PAPER} stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
                      <path d="M0 0 L4 0 L2.5 -70 L0 -70 Z" fill={INK} fillOpacity="0.7" />
                      <path
                        d="M-2.5 -70 L-12 -92 M2 -66 L13 -88 M-2 -46 L-17 -62 M2 -34 L15 -50 M-1 -80 L-4 -100"
                        fill="none"
                        stroke={INK}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </g>
                    <g id={ids.flame}>
                      <FlameShape />
                    </g>
                  </defs>

                  <g ref={worldRef} transform={`translate(200 235) scale(${START_ZOOM}) translate(${-CX} ${-CY})`}>
                    <g ref={farRef} opacity="0">
                      <rect x="-16000" y="-16000" width="32000" height="32000" fill={`url(#${ids.forest})`} />
                      <ellipse cx="-5600" cy="-3000" rx="1500" ry="850" fill="#d6d3d1" stroke={INK} strokeWidth="1.4" />
                      <ellipse cx="-5900" cy="-3150" rx="800" ry="380" fill="#e7e5e4" />
                      <path d={riverPath} fill="none" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
                      <path d={riverPath} fill="none" stroke={PAPER} strokeWidth="3" strokeLinejoin="round" />
                    </g>
                    <g data-near="">
                      <path d={ridgePath} fill={PAPER} stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
                      <path d={ridgePath} fill={`url(#${ids.hatch})`} fillOpacity="0.5" />
                      <path d={grassPath} fill="none" stroke={INK} strokeOpacity="0.45" strokeWidth="1" strokeLinecap="round" />
                    </g>

                    <path ref={scarRef} d="" fill={CHAR} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
                    <path ref={scarHatchRef} d="" fill={`url(#${ids.ash})`} />

                    <g data-near="">
                      {trees.map((tree, i) => {
                        const transform = `translate(${tree.x} ${tree.y}) scale(${tree.s})`;
                        if (!candidates.has(tree)) return <use key={i} href={`#${ids.pine}`} transform={transform} />;
                        return (
                          <g key={i} data-candidate={i}>
                            <use href={`#${ids.pine}`} transform={transform} />
                            <use href={`#${ids.burnt}`} transform={transform} visibility="hidden" />
                          </g>
                        );
                      })}
                    </g>

                    <ellipse ref={hazeRef} cx={CX} cy={CY} rx="1" ry="1" fill={`url(#${ids.haze})`} opacity="0" />

                    <g transform={`translate(${CX} ${CY})`}>
                      <ellipse cx="0" cy="4" rx="64" ry="15" fill={INK} fillOpacity="0.14" />
                      <g transform="translate(-100 2)">
                        <path d="M-34 0 L2 -58 L38 0 Z" fill={PAPER} stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
                        <path d="M2 -58 L38 0 L10 0 Z" fill={`url(#${ids.hatch})`} />
                        <path d="M2 -58 L-8 0 L16 0 Z" fill={INK} fillOpacity="0.85" />
                        <path d="M-34 0 L-48 7 M38 0 L52 7 M2 -58 L2 -66" fill="none" stroke={INK} strokeWidth="1.2" strokeLinecap="round" />
                      </g>
                      {stones
                        .filter((s) => s.y <= 0)
                        .map((s, i) => (
                          <g key={i} transform={`translate(${s.x} ${s.y})`}>
                            <ellipse rx={s.rx} ry={s.ry} fill={PAPER} stroke={INK} strokeWidth="1.3" />
                            <ellipse rx={s.rx} ry={s.ry} fill={`url(#${ids.hatch})`} fillOpacity="0.6" />
                          </g>
                        ))}
                      <g transform="rotate(-8)">
                        <rect x="-38" y="-10" width="76" height="12" rx="6" fill={PAPER} stroke={INK} strokeWidth="1.3" />
                        <rect x="-38" y="-10" width="76" height="12" rx="6" fill={`url(#${ids.hatch})`} fillOpacity="0.55" />
                        <path d="M-26 -6 q10 -2 20 0 M6 -4 q10 2 20 0" fill="none" stroke={INK} strokeWidth="1" />
                      </g>
                      <g transform="rotate(10)">
                        <rect x="-38" y="-10" width="76" height="12" rx="6" fill={PAPER} stroke={INK} strokeWidth="1.3" />
                        <rect x="-38" y="-10" width="76" height="12" rx="6" fill={`url(#${ids.hatch})`} fillOpacity="0.55" />
                        <path d="M-24 -4 q10 2 20 0 M8 -7 q10 -2 20 0" fill="none" stroke={INK} strokeWidth="1" />
                      </g>
                      <g ref={campRef} transform="scale(0.38)">
                        <g className="fire-tongue" style={{ animationDuration: "1.7s" }}>
                          <use href={`#${ids.flame}`} />
                        </g>
                        <g transform="translate(-20 0)">
                          <g className="fire-tongue" style={{ animationDuration: "1.3s", animationDelay: "-0.4s" }}>
                            <use href={`#${ids.flame}`} transform="scale(0.6)" />
                          </g>
                        </g>
                        <g transform="translate(22 0)">
                          <g className="fire-tongue" style={{ animationDuration: "1.5s", animationDelay: "-0.9s" }}>
                            <use href={`#${ids.flame}`} transform="scale(0.5)" />
                          </g>
                        </g>
                      </g>
                      {[-18, -9, 0, 9, 18, 6, -6, 13].map((x, i) => (
                        <circle key={i} cx={x} cy="-30" r={i % 2 ? 1.6 : 2.2} fill={FIRE_HOT} className="camp-ember" style={{ animationDuration: `${2 + (i % 3) * 0.5}s`, animationDelay: `${-i * 0.37}s` }} />
                      ))}
                      {stones
                        .filter((s) => s.y > 0)
                        .map((s, i) => (
                          <g key={i} transform={`translate(${s.x} ${s.y})`}>
                            <ellipse rx={s.rx} ry={s.ry} fill={PAPER} stroke={INK} strokeWidth="1.3" />
                            <ellipse rx={s.rx} ry={s.ry} fill={`url(#${ids.hatch})`} fillOpacity="0.6" />
                          </g>
                        ))}
                    </g>

                    <g ref={flamesRef} opacity="0">
                      {Array.from({ length: FRONT }, (_, i) => (
                        <g key={i} data-flame={i}>
                          <g className="fire-tongue" style={{ animationDuration: `${1.1 + (i % 5) * 0.15}s`, animationDelay: `${-i * 0.23}s` }}>
                            <use href={`#${ids.flame}`} />
                          </g>
                        </g>
                      ))}
                    </g>

                    <g ref={smokeRef} opacity="0" transform={`translate(${CX} ${CY - 8})`}>
                      {[0, 1, 2, 3, 4, 5].map((k) => {
                        const drift = k % 2 ? 14 : -14;
                        const t = `${-k * 0.6}s`;
                        return (
                          <circle key={k} cx="0" cy="-70" r="8" fill={PAPER} fillOpacity="0.85" stroke={INK} strokeOpacity="0.8" strokeWidth="1.3" opacity="0">
                            <animate attributeName="cy" values="-60;-230" dur="3.6s" begin={t} repeatCount="indefinite" />
                            <animate attributeName="cx" values={`0;${drift}`} dur="3.6s" begin={t} repeatCount="indefinite" />
                            <animate attributeName="r" values="8;46" dur="3.6s" begin={t} repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0;0.9;0" keyTimes="0;0.25;1" dur="3.6s" begin={t} repeatCount="indefinite" />
                          </circle>
                        );
                      })}
                    </g>
                  </g>
                </svg>

                <p className="absolute left-0 top-0 max-w-[calc(100%-5rem)] rounded-full border border-black/20 bg-black px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg sm:text-sm">
                  {steps[active].caption}
                </p>
                <div className="absolute right-0 top-0 flex h-36 w-16 flex-col items-center rounded-2xl bg-white/80 px-2 py-2 lg:h-48">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-black/70">Warning</p>
                  <div className="relative mt-1.5 w-3 flex-1">
                    <div className="absolute inset-0 overflow-hidden rounded-full border border-black/40 bg-white">
                      <div
                        className="absolute inset-x-0 bottom-0 bg-black transition-[height] duration-700 ease-out"
                        style={{ height: `${steps[active].warning * 100}%` }}
                      />
                    </div>
                    <div className="pointer-events-none absolute -left-1 -right-1 top-[6%] border-t border-dashed border-orange-600" />
                    <span className="pointer-events-none absolute right-full top-[6%] mr-1.5 -translate-y-1/2 whitespace-nowrap text-[9px] font-semibold text-orange-700">
                      top 3%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ol ref={listRef} className="relative z-10 -mt-[calc(100svh-4rem)] pb-[75svh] lg:mt-0 lg:pb-[35vh]">
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
                  <p className="font-mono text-sm text-accent">{String(i + 1).padStart(2, "0")} · {step.label}</p>
                  <h3 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-bold leading-tight md:text-3xl">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-muted md:text-lg">{step.body}</p>
                  {i === steps.length - 1 && (
                    <a href="/research#rigor" className="mt-4 inline-block text-sm font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent">
                      How we test every result →
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="pb-20 md:pb-28">
          <CaseChart />
        </div>
      </div>
    </section>
  );
}
