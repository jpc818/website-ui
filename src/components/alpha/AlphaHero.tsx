import Link from "next/link";
import { betaLabel, betaPath } from "@/app/site";
import { Murmuration } from "@/components/alpha/Murmuration";

const notThis = ["Not fundamentals alone", "Not mood alone", "Behavior + context"];

export function AlphaHero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative min-h-[100svh] overflow-hidden pt-28 pb-16"
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
          className="mt-6 max-w-4xl text-balance font-[family-name:var(--font-heading)] text-[clamp(2.5rem,7.5vw,5rem)] font-extrabold leading-[1.1] tracking-[-0.02em] text-foreground"
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

        <div className="mt-10 grid max-w-3xl gap-3 sm:grid-cols-2">
          <article className="flex flex-col rounded-3xl border border-white/15 bg-surface/80 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-cyan">Public research</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted md:text-base">
              Open to everyone: the method, the results, and the forward log of calls recorded before the
              outcome. The log lists what is still open, what has resolved, and that a ranking score is withheld.{" "}
              <Link
                href="/research#forward"
                className="font-medium text-foreground underline decoration-white/30 underline-offset-4 hover:decoration-foreground"
              >
                Resolution tracker
              </Link>
            </p>
            <Link
              href="/research"
              className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Read the research
            </Link>
          </article>
          <article className="flex flex-col rounded-3xl border border-white/15 bg-surface/80 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">Schwab beta</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted md:text-base">
              The product is a private beta for invited Charles Schwab customers. Sign in with the Google
              account the invite was sent to.
            </p>
            <Link
              href={betaPath}
              className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full border border-white/20 px-6 text-sm font-medium transition-colors hover:bg-white/5"
            >
              {betaLabel}
            </Link>
          </article>
        </div>

        <ul className="mt-8 flex flex-wrap gap-2 sm:gap-3">
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

      <p className="mx-auto mt-8 w-full max-w-6xl px-5 text-sm leading-relaxed text-muted sm:px-6 xl:pointer-events-none xl:absolute xl:right-8 xl:bottom-6 xl:mt-0 xl:w-auto xl:max-w-xs xl:px-0 xl:text-right">
        <span className="font-semibold text-foreground">Live simulation.</span>{" "}
        Every bird follows its neighbors. A few{" "}
        <span className="text-accent">amber leaders</span> steer the whole
        flock. Move through it to scatter them.
      </p>
    </section>
  );
}
