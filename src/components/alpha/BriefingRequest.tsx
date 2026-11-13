"use client";

import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { track } from "@/components/analytics";
import { BRIEFING_FIRM_MAX, BRIEFING_NAME_MAX, briefingRoles, type BriefingRole } from "@/components/alpha/briefing";

type Status = "idle" | "sending" | "sent" | "error";

const inputClass =
  "h-12 w-full rounded-xl border border-white/20 bg-background px-4 text-base placeholder:text-muted/70 focus:border-accent/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function BriefingRequest({ className, children }: { className: string; children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [role, setRole] = useState<BriefingRole | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const waitlist = role === "individual";

  const close = () => dialogRef.current?.close();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: form.get("role"),
          name: form.get("name"),
          email: form.get("email"),
          firm: form.get("firm") ?? "",
          website: form.get("website"),
        }),
      });
      const result = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "Something went wrong. Please try again.");
      }
      setStatus("sent");
      track(waitlist ? "beta_waitlist" : "briefing_request");
    } catch (caught) {
      setStatus("error");
      setError(caught instanceof Error && caught.message ? caught.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => {
          if (status === "sent") setStatus("idle");
          dialogRef.current?.showModal();
        }}
      >
        {children}
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={`${id}-title`}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="m-auto max-h-[calc(100svh-2rem)] w-[min(34rem,calc(100%-2rem))] overflow-y-auto rounded-3xl border border-white/10 bg-surface text-foreground shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <h2
              id={`${id}-title`}
              className="font-[family-name:var(--font-heading)] text-2xl font-bold leading-tight tracking-tight"
            >
              {waitlist ? "Join the beta waitlist" : "Request the research briefing"}
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="-mr-2 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-white/5 hover:text-foreground"
            >
              <svg viewBox="0 0 20 20" aria-hidden="true" className="h-5 w-5 stroke-current" fill="none" strokeWidth="1.8" strokeLinecap="round">
                <path d="M5 5l10 10M15 5L5 15" />
              </svg>
            </button>
          </div>

          {status === "sent" ? (
            <div role="status" className="mt-6 rounded-2xl border border-cyan/40 bg-cyan/10 px-5 py-4">
              <p className="text-lg font-semibold text-cyan">{waitlist ? "You're on the waitlist." : "Request received."}</p>
              <p className="mt-1 text-base leading-relaxed text-muted">
                {waitlist
                  ? "We'll email you when eligibility opens."
                  : "Thanks. We'll follow up by email."}
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="relative mt-5 space-y-5">
              <fieldset>
                <legend className="text-sm font-semibold text-foreground">Which describes you?</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {briefingRoles.map((option) => (
                    <label
                      key={option.id}
                      className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-white/15 bg-background px-4 py-2.5 text-base transition-colors hover:border-white/30 has-[:checked]:border-accent/70 has-[:checked]:bg-accent/10 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent"
                    >
                      <input
                        type="radio"
                        name="role"
                        value={option.id}
                        required
                        checked={role === option.id}
                        onChange={() => setRole(option.id)}
                        className="h-4 w-4 shrink-0 accent-[var(--accent)]"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              {waitlist && (
                <p className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-base leading-relaxed text-foreground">
                  The platform is a private beta for invited Charles Schwab clients. Join the waitlist and we&apos;ll tell
                  you when eligibility opens.
                </p>
              )}

              <div>
                <label htmlFor={`${id}-name`} className="text-sm font-semibold">
                  Name
                </label>
                <input
                  id={`${id}-name`}
                  name="name"
                  type="text"
                  required
                  maxLength={BRIEFING_NAME_MAX}
                  autoComplete="name"
                  className={`mt-1.5 ${inputClass}`}
                />
              </div>
              <div>
                <label htmlFor={`${id}-email`} className="text-sm font-semibold">
                  Email
                </label>
                <input
                  id={`${id}-email`}
                  name="email"
                  type="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  placeholder="you@company.com"
                  className={`mt-1.5 ${inputClass}`}
                />
              </div>
              {!waitlist && (
                <div>
                  <label htmlFor={`${id}-firm`} className="text-sm font-semibold">
                    Firm <span className="font-normal text-muted">(optional)</span>
                  </label>
                  <input
                    id={`${id}-firm`}
                    name="firm"
                    type="text"
                    maxLength={BRIEFING_FIRM_MAX}
                    autoComplete="organization"
                    className={`mt-1.5 ${inputClass}`}
                  />
                </div>
              )}
              <input
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute -left-[9999px] h-px w-px opacity-0"
              />

              <div>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-accent px-8 text-base font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {status === "sending" ? "Sending…" : waitlist ? "Join the waitlist" : "Request the briefing"}
                </button>
                <p role="alert" className="mt-3 min-h-5 text-sm text-red-400">
                  {status === "error" ? (
                    <>
                      {error} You can also write to{" "}
                      <a href="mailto:contact@jarg.ai" className="underline underline-offset-2">
                        contact@jarg.ai
                      </a>
                      .
                    </>
                  ) : (
                    ""
                  )}
                </p>
                <p className="text-sm leading-relaxed text-muted">
                  We&apos;ll only use these details to reply. See our{" "}
                  <a href="/privacy" className="underline underline-offset-2 hover:text-foreground">
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
