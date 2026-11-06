import { casePosters } from "@/components/alpha/cases/posterProfiles";
import type { CaseId } from "@/components/alpha/cases/stories";

export function CasePosters({ id, accent = "var(--color-cyan)" }: { id: CaseId; accent?: string }) {
  const c = casePosters[id];
  return (
    <div className="mt-8 max-w-4xl rounded-3xl border border-white/8 bg-surface p-6 md:p-8">
      <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: accent }}>
        Who was posting
      </p>
      <p className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-bold md:text-3xl">
        {c.stock} ({c.ticker}), {c.month}
      </p>
      <p className="mt-1 text-sm text-muted">{c.session}</p>
      <ul className="mt-6 grid gap-4 md:grid-cols-3">
        {c.posters.map((p) => (
          <li key={p.who} className="rounded-2xl border border-white/8 p-4">
            <p className="font-semibold">{p.who}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{p.detail}</p>
          </li>
        ))}
      </ul>
      <p className="mt-5 text-pretty text-sm leading-relaxed text-foreground">{c.crowd}</p>
      <p className="mt-4 text-xs leading-relaxed text-muted">
        Posters are described by profile, never by account. Engagement compares a poster&apos;s own earlier posts with the
        typical post. A call &ldquo;beat the market&rdquo; when the stock outran the S&amp;P 500 over the next three
        sessions. Champions have 8+ earlier calls with at least 60% beating the market. Fades have 40% or fewer.
      </p>
    </div>
  );
}
