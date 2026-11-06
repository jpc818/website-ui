export function Thesis() {
  const beliefs = [
    {
      title: "Wearables are sensors, not accessories",
      body: "Smart glasses carry cameras, mics, IMUs, and GPS — a richer data stack than any phone in a pocket. We build AI that makes that stream useful.",
    },
    {
      title: "The field is where the data gap is",
      body: "Desks have dashboards. Job sites have clipboards. Wearable capture closes that gap without slowing anyone down.",
    },
    {
      title: "Device-agnostic by design",
      body: "Meta, Apple, enterprise AR — the hardware race is just starting. jargAI is the intelligence layer that works across all of it.",
    },
  ];

  return (
    <section id="thesis" className="border-t border-white/8 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <blockquote className="max-w-3xl font-[family-name:var(--font-heading)] text-2xl font-bold leading-snug tracking-tight md:text-4xl">
          &ldquo;We&apos;re bullish on data from wearable tech. The next great
          dataset won&apos;t come from a form — it&apos;ll come from what
          someone saw on site, captured hands-free, in real time.&rdquo;
        </blockquote>
        <p className="mt-6 max-w-2xl text-muted leading-relaxed">
          jargAI is an AI company built around that conviction. We&apos;re not
          making hardware — we&apos;re making the models, pipelines, and APIs
          that turn wearable feeds into data products.
        </p>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {beliefs.map((belief) => (
            <div
              key={belief.title}
              className="rounded-2xl border border-cyan/20 bg-cyan/5 p-8"
            >
              <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-cyan">
                {belief.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {belief.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
