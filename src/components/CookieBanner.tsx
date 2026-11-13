"use client";

import { useEffect, useRef, useState } from "react";
import { activeGoogleAnalyticsId } from "@/app/site";
import { OPEN_CONSENT_EVENT, readConsent, writeConsent, type ConsentChoice } from "@/lib/consent";

const buttonClass =
  "inline-flex h-9 shrink-0 items-center justify-center rounded-full px-3 text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan sm:px-5";

export function CookieBanner() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [current, setCurrent] = useState<ConsentChoice | null>(null);

  useEffect(() => {
    function openSettings() {
      setCurrent(readConsent()?.analytics ?? null);
      document.documentElement.dataset.consent = "open";
      requestAnimationFrame(() => headingRef.current?.focus());
    }

    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape" || document.documentElement.dataset.consent !== "open") return;
      const stored = readConsent();
      document.documentElement.dataset.consent = stored?.analytics ?? "unknown";
      setCurrent(null);
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
    setCurrent(null);
  }

  const state = current === "granted" ? "on" : "off";

  return (
    <div
      className="cookie-banner fixed inset-x-0 bottom-0 z-[70] border-t border-white/10 bg-surface/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md"
      role="dialog"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-body"
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-3 sm:gap-4 sm:px-6">
        <h2 id="cookie-title" ref={headingRef} tabIndex={-1} className="sr-only outline-none">
          Cookies
        </h2>
        <p id="cookie-body" className="flex min-w-0 flex-1 items-baseline gap-1.5 text-sm text-muted">
          <span className="truncate">
            {current ? (
              <>
                <span className="sm:hidden">Analytics: {state}.</span>
                <span className="hidden sm:inline">Analytics cookies are {state} for this browser.</span>
              </>
            ) : (
              <>
                <span className="sm:hidden">Analytics cookies?</span>
                <span className="hidden sm:inline">Analytics cookies stay off unless you accept.</span>
                <span className="hidden lg:inline"> Pages are still counted without cookies.</span>
                <span className="hidden xl:inline"> We keep your choice for six months.</span>
              </>
            )}
          </span>
          <a href="/privacy" className="shrink-0 text-accent underline underline-offset-2">
            Privacy
          </a>
        </p>
        <button type="button" className={`${buttonClass} bg-foreground text-background`} onClick={() => choose("denied")}>
          Reject
        </button>
        <button type="button" className={`${buttonClass} bg-accent text-background`} onClick={() => choose("granted")}>
          Accept
        </button>
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
