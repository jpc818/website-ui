import { productUrl } from "@/app/site";
import { Murmuration } from "@/components/alpha/Murmuration";

const notThis = ["Not fundamentals alone", "Not mood alone", "Behavior + context"];

export function AlphaHero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative flex min-h-[100svh] items-center overflow-hidden pt-28 pb-20"
    >
      <Murmuration />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      <div className="pointer-events-none absolute -top-40 right-[-10%] h-[600px] w-[600px] glow-orb" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_25%_50%,rgba(9,11,15,0.85),rgba(9,11,15,0.35)_55%,transparent_80%)]" />

      <div className="relative mx-auto w-full max-w-6xl px-5 sm:px-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-surface px-4 py-2 text-sm font-medium text-foreground">
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          Independent research · US equities
        </div>

        <h1
          id="hero-title"
          className="mt-8 max-w-4xl text-balance font-[family-name:var(--font-heading)] text-[clamp(2.5rem,7.5vw,5rem)] font-extrabold leading-[1.1] tracking-[-0.02em] text-foreground"
        >
          A research company studying{" "}
          <span className="text-accent">crowd behavior.</span>
        </h1>

        <p className="mt-7 max-w-2xl text-pretty font-[family-name:var(--font-heading)] text-xl font-semibold leading-snug text-foreground md:text-2xl">
          We model how online crowds behave around US stocks, test it on data
          the models never saw, and report what holds up.
        </p>
        <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted md:text-lg">
          Markets come first because they&apos;re the hardest place to be
          right, and they keep score. If crowd behavior is predictable there,
          it&apos;s predictable almost anywhere. We don&apos;t manage outside
          money, sell signals, or give advice.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <a
            href={productUrl}
            className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-8 text-base font-semibold text-background transition-opacity hover:opacity-90"
          >
            Try the product
          </a>
          <a
            href="#what"
            className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 bg-background/80 px-8 text-base font-medium transition-colors hover:bg-surface"
          >
            What we do
          </a>
          <a
            href="#oracle"
            className="px-2 text-base font-medium text-muted underline decoration-white/30 underline-offset-4 transition-colors hover:text-foreground"
          >
            Or try the Ghost game
          </a>
        </div>
        <p className="mt-3 text-sm text-muted">
          Private beta, open to invited Charles Schwab customers. Sign in with Google.
        </p>

        <ul className="mt-12 flex flex-wrap gap-2 sm:gap-3">
          {notThis.map((item, i) => {
            const last = i === notThis.length - 1;
            return (
              <li
                key={item}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                  last
                    ? "border-cyan/50 bg-cyan/10 text-cyan"
                    : "border-white/15 bg-surface/80 text-muted line-through decoration-white/40"
                }`}
              >
                {item}
              </li>
            );
          })}
        </ul>
      </div>

      <p className="pointer-events-none absolute bottom-6 right-5 max-w-[16rem] text-right text-xs leading-relaxed text-muted sm:right-6 sm:max-w-xs sm:text-sm">
        <span className="font-semibold text-foreground">Live simulation.</span>{" "}
        Every bird follows its neighbors. A few{" "}
        <span className="text-accent">amber leaders</span> steer the whole
        flock. Move through it to scatter them.
      </p>
    </section>
  );
}
