export function CTA() {
  return (
    <section id="contact" className="border-t border-white/8 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-surface p-12 md:p-16">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 glow-orb" />
          <div className="relative max-w-xl">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight md:text-4xl">
              Help us build the wearable data layer.
            </h2>
            <p className="mt-4 leading-relaxed text-muted">
              We&apos;re partnering with construction teams and wearable
              hardware companies to shape jargAI. If you&apos;re bullish on this
              too, we want to hear from you.
            </p>
            <form className="mt-8 flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="you@company.com"
                className="h-12 flex-1 rounded-full border border-white/15 bg-background px-5 text-sm outline-none placeholder:text-muted focus:border-accent/50"
              />
              <button
                type="submit"
                className="h-12 rounded-full bg-accent px-8 text-sm font-semibold text-background transition-opacity hover:opacity-90"
              >
                Join waitlist
              </button>
            </form>
            <p className="mt-4 text-xs text-muted">
              Early access for pilot partners and investors.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
