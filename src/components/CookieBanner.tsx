"use client";

import { useEffect, useRef, useState } from "react";
import { activeGoogleAnalyticsId } from "@/app/site";
import { OPEN_CONSENT_EVENT, readConsent, writeConsent, type ConsentChoice } from "@/lib/consent";

const buttonClass =
  "inline-flex h-9 flex-1 items-center justify-center rounded-full px-4 text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan";

export function CookieBanner() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    function openSettings() {
      const stored = readConsent();
      setNotice(
        stored?.analytics === "granted"
          ? "Analytics cookies are on for this browser."
          : stored?.analytics === "denied"
            ? "Analytics cookies are off for this browser."
            : null,
      );
      document.documentElement.dataset.consent = "open";
      requestAnimationFrame(() => headingRef.current?.focus());
    }

    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape" || document.documentElement.dataset.consent !== "open") return;
      const stored = readConsent();
      document.documentElement.dataset.consent = stored?.analytics ?? "unknown";
      setNotice(null);
    }

    window.addEventListener(OPEN_CONSENT_EVENT, openSettings);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(OPEN_CONSENT_EVENT, openSettings);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!activeGoogleAnalyticsId()) return null;

  function choose(choice: ConsentChoice) {
    writeConsent(choice);
    setNotice(null);
  }

  return (
    <div
      className="cookie-banner fixed inset-x-0 bottom-0 z-[70] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-[22rem] sm:p-0"
      role="dialog"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-body"
    >
      <div className="rounded-2xl border border-white/10 bg-surface/95 p-4 shadow-2xl backdrop-blur-md">
        <h2 id="cookie-title" ref={headingRef} tabIndex={-1} className="sr-only outline-none">
          Cookies
        </h2>
        <p id="cookie-body" className="text-xs leading-relaxed text-muted">
          {notice ? `${notice} ` : null}
          Analytics cookies stay off unless you accept. Pages are still counted without cookies. We keep your choice
          for six months.{" "}
          <a href="/privacy" className="text-accent underline underline-offset-2">
            Privacy policy
          </a>
        </p>
        <div className="mt-3 flex gap-2">
          <button type="button" className={`${buttonClass} bg-foreground text-background`} onClick={() => choose("denied")}>
            Reject
          </button>
          <button type="button" className={`${buttonClass} bg-accent text-background`} onClick={() => choose("granted")}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
export function CookieSettings() {
  if (!activeGoogleAnalyticsId()) return null;
  return (
    <button
      type="button"
      className="underline underline-offset-2 hover:text-foreground"
      onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}
    >
      Cookies
    </button>
  );
}
