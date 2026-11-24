import Link from "next/link";
import { betaLabel, betaPath } from "@/app/site";
import { forwardLog } from "@/components/alpha/forwardLogCounts";
import { Murmuration } from "@/components/alpha/Murmuration";

const notThis = ["Not just company finances", "Not just mood", "What people actually do"];

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
          We study how online crowds act around stocks, and whether that
          tells you what happens next. Then we show you what worked and what
          didn&apos;t.
        </p>
        <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted md:text-lg">
          We start with the stock market because it&apos;s hard to fool and it
          keeps score every day. If you can predict a crowd there, you can
          probably predict it anywhere. Everything here is free to read, and
          none of it is financial advice.
        </p>

        <div className="mt-10 grid max-w-3xl gap-3 sm:grid-cols-2">
          <article className="flex flex-col rounded-3xl border border-white/15 bg-surface/80 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-cyan">Public research</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted md:text-base">
              The results, how we got them, and a live diary of predictions written down before we knew the
              answer. It&apos;s only a few weeks old, with {forwardLog.bigDrops} hard drops so far, so it&apos;s
              too early to grade.{" "}
              <Link
                href="/research#forward"
                className="font-medium text-foreground underline decoration-white/30 underline-offset-4 hover:decoration-foreground"
              >
                See the diary
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
            <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">A private look</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted md:text-base">
              Some Charles Schwab customers have been invited to try an early version of the same research. If
              that&apos;s you, sign in with the Google account the invite went to.
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
        Each bird copies the birds next to it. A few{" "}
        <span className="text-accent">orange leaders</span> end up steering
        the whole flock. Crowds work the same way. Move your mouse through it.
      </p>
    </section>
  );
}
