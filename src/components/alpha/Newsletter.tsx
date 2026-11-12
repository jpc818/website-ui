"use client";

import { useState, type FormEvent } from "react";
import { track } from "@/components/analytics";

type Status = "idle" | "sending" | "joined" | "error";

export function Newsletter() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), website: form.get("website") }),
      });
      const result = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "Something went wrong. Please try again.");
      }
      setStatus("joined");
      track("newsletter_subscribe");
    } catch (caught) {
      setStatus("error");
      setError(caught instanceof Error && caught.message ? caught.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <section
      id="notes"
      aria-labelledby="notes-title"
      className="border-t border-white/8 py-14 md:py-20"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 sm:px-6 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan">Not ready to get in touch?</p>
          <h2
            id="notes-title"
            className="mt-3 text-balance font-[family-name:var(--font-heading)] text-[clamp(1.5rem,4vw,2.25rem)] font-bold leading-[1.15] tracking-tight"
          >
            Get the research notes.
          </h2>
          <p className="mt-3 max-w-md text-base leading-relaxed text-muted md:text-lg">
            New results, hits and misses alike, as we publish them. No pitch, and you can leave any time.
          </p>
        </div>

        <div>
          {status === "joined" ? (
            <div role="status" className="rounded-2xl border border-cyan/40 bg-cyan/10 px-6 py-5">
              <p className="text-lg font-semibold text-cyan">You&apos;re subscribed.</p>
              <p className="mt-1 text-base text-muted">Thanks. We&apos;ll write when there&apos;s something worth reading.</p>
            </div>
          ) : (
            <form
              action="/api/newsletter"
              method="post"
              onSubmit={onSubmit}
              className="relative flex flex-col gap-3 sm:flex-row"
            >
              <label htmlFor="notes-email" className="sr-only">
                Email address
              </label>
              <input
                id="notes-email"
                name="email"
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                placeholder="you@company.com"
                aria-invalid={status === "error" || undefined}
                aria-describedby={status === "error" ? "notes-email-error" : undefined}
                className="h-12 min-w-0 flex-1 rounded-full border border-white/20 bg-background px-5 text-base placeholder:text-muted/70 focus:border-accent/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-invalid:border-red-400"
              />
              <input
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute -left-[9999px] h-px w-px opacity-0"
              />
              <button
                type="submit"
                disabled={status === "sending"}
                className="h-12 rounded-full border border-white/25 px-7 text-base font-semibold transition-colors hover:bg-white/5 disabled:opacity-60"
              >
                {status === "sending" ? "Sending…" : "Send me the notes"}
              </button>
            </form>
          )}
          <p id="notes-email-error" role="alert" className="mt-3 min-h-5 text-sm text-red-400">
            {status === "error" ? error : ""}
          </p>
          {status !== "joined" && (
            <p className="text-sm leading-relaxed text-muted">
              We&apos;ll only use your email for this. See our{" "}
              <a href="/privacy" className="underline underline-offset-2 hover:text-foreground">
                Privacy Policy
              </a>
              .
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
