"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "sending" | "joined" | "error";

export function Access() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          website: form.get("website"),
        }),
      });
      const result = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "Something went wrong. Please try again.");
      }
      setStatus("joined");
    } catch (caught) {
      setStatus("error");
      setError(
        caught instanceof Error && caught.message
          ? caught.message
          : "Something went wrong. Please try again.",
      );
    }
  }

  return (
    <section
      id="access"
      aria-labelledby="access-title"
      className="border-t border-white/8 py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-surface p-7 sm:p-10 md:p-16">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 glow-orb" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 glow-orb-cyan" />
          <div className="relative max-w-xl">
            <h2
              id="access-title"
              className="text-balance font-[family-name:var(--font-heading)] text-[clamp(1.875rem,5vw,3.25rem)] font-bold leading-[1.1] tracking-tight"
            >
              Request early access.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              We&apos;re opening Project α to a small group of analysts and researchers who study how online crowds
              behave. Early partners see what we publish before everyone else and tell us where the work is wrong.
              There&apos;s no date yet: leave your email and we&apos;ll reach out in order, when we have something to
              share.
            </p>

            {status === "joined" ? (
              <div
                role="status"
                className="mt-8 rounded-2xl border border-cyan/40 bg-cyan/10 px-6 py-5"
              >
                <p className="text-lg font-semibold text-cyan">You&apos;re on the list.</p>
                <p className="mt-1 text-base text-muted">
                  Thanks. We&apos;ll be in touch when there&apos;s more to share.
                </p>
              </div>
            ) : (
              <form
                action="/api/waitlist"
                method="post"
                onSubmit={onSubmit}
                className="mt-8 flex flex-col gap-3 sm:flex-row"
              >
                <label htmlFor="access-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="access-email"
                  name="email"
                  type="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  placeholder="you@company.com"
                  className="h-12 min-w-0 flex-1 rounded-full border border-white/20 bg-background px-5 text-base outline-none placeholder:text-muted/70 focus:border-accent/60"
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
                  className="h-12 rounded-full bg-accent px-8 text-base font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {status === "sending" ? "Sending…" : "Request access"}
                </button>
              </form>
            )}

            <p role="alert" className="mt-4 min-h-6 text-sm text-red-400">
              {status === "error" ? error : ""}
            </p>
            {status !== "joined" && (
              <p className="text-sm leading-relaxed text-muted">
                We&apos;ll only use your email to write to you about Project α. No spam. See our{" "}
                <a href="/privacy" className="underline underline-offset-2 hover:text-foreground">
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a href="/terms" className="underline underline-offset-2 hover:text-foreground">
                  Terms
                </a>
                .
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
