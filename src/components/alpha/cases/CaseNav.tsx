import Link from "next/link";
import { casePosters } from "@/components/alpha/cases/posterProfiles";
import { caseIndex, type CaseId } from "@/components/alpha/cases/stories";

// Class names are written out in full so Tailwind can find them at build time.
const tone: Record<CaseId, { ring: string; text: string; glow: string }> = {
  put: { ring: "hover:border-orange-500/60", text: "text-orange-400", glow: "from-orange-500/15" },
  call: { ring: "hover:border-amber-300/60", text: "text-amber-300", glow: "from-amber-400/15" },
  exotic: { ring: "hover:border-teal-300/60", text: "text-teal-300", glow: "from-teal-400/15" },
  failed: { ring: "hover:border-indigo-300/60", text: "text-indigo-300", glow: "from-indigo-400/15" },
};

export function CaseNav({ current, heading = "h3" }: { current?: CaseId; heading?: "h2" | "h3" }) {
  const Heading = heading;
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {caseIndex.map((c) => {
        const t = tone[c.id];
        const here = c.id === current;
        return (
          <li key={c.id}>
            <Link
              href={c.href}
              aria-current={here ? "page" : undefined}
              className={`group flex h-full flex-col rounded-3xl border bg-gradient-to-b to-transparent p-6 transition-colors ${t.glow} ${
                here ? "border-white/30" : `border-white/8 ${t.ring}`
              }`}
            >
              <p className={`font-mono text-sm ${t.text}`}>
                {c.n} · {c.kind} · {c.theme}
              </p>
              <Heading className="mt-2 text-balance font-[family-name:var(--font-heading)] text-xl font-bold leading-tight">{c.title}</Heading>
              <p className="mt-2 text-sm leading-relaxed text-muted">{c.tagline}</p>
              <div className="mt-4 flex-1 border-t border-white/8 pt-4">
                <p className="text-sm font-semibold">
                  {casePosters[c.id].stock} ({casePosters[c.id].ticker}) · {casePosters[c.id].month}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-foreground">
                  <span
                    className={`mr-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                      c.landed ? "bg-emerald-400/15 text-emerald-300" : "bg-rose-400/15 text-rose-300"
                    }`}
                  >
                    {c.landed ? "Landed" : "Missed"}
                  </span>
                  {c.result}
                </p>
              </div>
              <p className={`mt-4 text-sm font-semibold ${t.text}`}>{here ? "You're reading this one" : "Read the case →"}</p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
