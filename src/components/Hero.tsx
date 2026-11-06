export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
      <div className="pointer-events-none absolute -top-32 right-0 h-[500px] w-[500px] glow-orb" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[400px] w-[400px] glow-orb-cyan" />
      <div className="pointer-events-none absolute inset-0 scan-line" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface px-4 py-1.5 text-sm text-muted">
          <span className="h-2 w-2 rounded-full bg-cyan animate-pulse" />
          Bullish on wearable data
        </div>

        <h1 className="mt-8 max-w-4xl font-[family-name:var(--font-heading)] text-5xl font-extrabold leading-[1.08] tracking-tight md:text-7xl">
          The world&apos;s best data comes from{" "}
          <span className="bg-gradient-to-r from-accent to-cyan bg-clip-text text-transparent">
            what people wear.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
          jargAI builds intelligence layers for wearable tech — starting with
          smart glasses on construction sites, where a foreman can scan an entire
          job in seconds and turn what they see into structured, actionable data.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="#contact"
            className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-8 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            Join the waitlist
          </a>
          <a
            href="#thesis"
            className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-8 text-sm font-medium transition-colors hover:bg-surface"
          >
            Read our thesis
          </a>
        </div>

        <div className="mt-20 grid gap-4 sm:grid-cols-3">
          {[
            { value: "Wearables", label: "Our core data platform bet" },
            { value: "< 30s", label: "Full job-site capture" },
            { value: "Field → API", label: "Vision to structured output" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/8 bg-surface/60 p-6 backdrop-blur-sm"
            >
              <div className="font-[family-name:var(--font-heading)] text-2xl font-bold text-accent">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
