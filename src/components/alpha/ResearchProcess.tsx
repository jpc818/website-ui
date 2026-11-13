import Link from "next/link";

export function ResearchProcess() {
  return (
    <section aria-labelledby="process-title" className="border-t border-white/8 py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-cyan">Research process</p>
        <h2
          id="process-title"
          className="mt-3 max-w-3xl text-balance font-[family-name:var(--font-heading)] text-[clamp(1.5rem,3.5vw,2.25rem)] font-bold leading-[1.2] tracking-tight"
        >
          Models are tested only on data after their training period. Null results are published.
        </h2>
        <p className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-base">
          <Link
            href="/research#rigor"
            className="font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
          >
            Rigor and limits →
          </Link>
          <Link
            href="/about"
            className="font-semibold text-muted underline decoration-white/30 underline-offset-4 hover:text-foreground"
          >
            Who runs jargAI →
          </Link>
        </p>
      </div>
    </section>
  );
}
