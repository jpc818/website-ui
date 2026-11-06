import { ContactMailLink } from "@/components/analytics";

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="border-t border-white/8 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-surface p-7 sm:p-10 md:p-16">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 glow-orb" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 glow-orb-cyan" />
          <div className="relative max-w-xl">
            <h2
              id="contact-title"
              className="text-balance font-[family-name:var(--font-heading)] text-[clamp(1.875rem,5vw,3.25rem)] font-bold leading-[1.1] tracking-tight"
            >
              Talk to us.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              We&apos;re open to conversations with funds and trading firms, data providers, and people who want to
              work on this. Fuller results and methods are shared privately.
            </p>
            <ContactMailLink className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-accent px-8 text-base font-semibold text-background transition-opacity hover:opacity-90" />
          </div>
        </div>
      </div>
    </section>
  );
}
