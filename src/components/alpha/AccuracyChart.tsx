export function AccuracyChart({ hits, label, chance = 0.5 }: { hits: boolean[]; label: string; chance?: number }) {
  const W = 320;
  const H = 120;
  let correct = 0;
  const points = hits.map((hit, i) => {
    if (hit) correct++;
    const x = hits.length === 1 ? W : (i / (hits.length - 1)) * W;
    const y = H - (correct / (i + 1)) * H;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={label}
      className="block h-32 w-full overflow-visible"
    >
      <line x1="0" y1={H * (1 - chance)} x2={W} y2={H * (1 - chance)} stroke="rgba(179,186,197,0.45)" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
      {points.length > 1 && (
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke="#22d3ee"
          strokeWidth="2"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
}
