"use client";

import { activeGoogleAnalyticsId } from "@/app/site";

type Gtag = (...args: unknown[]) => void;

export function track(eventName: string) {
  if (!activeGoogleAnalyticsId()) return;
  const gtag = (window as Window & { gtag?: Gtag }).gtag;
  if (typeof gtag !== "function") return;
  gtag("event", eventName);
}

export function ContactMailLink({ className }: { className: string }) {
  return (
    <a href="mailto:contact@jarg.ai" className={className} onClick={() => track("contact_email")}>
      contact@jarg.ai
    </a>
  );
}
