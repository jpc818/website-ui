const steps = [
  {
    step: "01",
    title: "Put on smart glasses",
    description:
      "Meta Ray-Ban, Apple Vision, or enterprise headsets — we meet crews where the hardware is heading.",
  },
  {
    step: "02",
    title: "Walk the site",
    description:
      "A quick pass through the floor, scaffold, or exterior. Voice commands start and stop capture.",
  },
  {
    step: "03",
    title: "Get structured data",
    description:
      "Measurements, progress %, material counts, and safety observations — synced to your project tools.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-white/8 bg-surface py-24">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-sm font-medium uppercase tracking-widest text-accent">
          How it works
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight md:text-4xl">
          Three steps. Under a minute.
        </h2>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((item, index) => (
            <div key={item.step} className="relative">
              {index < steps.length - 1 && (
                <div className="absolute top-8 left-[calc(100%-1rem)] hidden h-px w-[calc(100%-2rem)] bg-gradient-to-r from-accent/40 to-transparent md:block" />
              )}
              <div className="font-[family-name:var(--font-heading)] text-5xl font-extrabold text-accent/20">
                {item.step}
              </div>
              <h3 className="mt-4 font-[family-name:var(--font-heading)] text-xl font-semibold">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
