export const CONSENT_COOKIE = "jarg_consent";
export const CONSENT_VERSION = 1;
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;
export const OPEN_CONSENT_EVENT = "jarg:open-consent";

export type ConsentChoice = "granted" | "denied";

export type StoredConsent = {
  v: number;
  analytics: ConsentChoice;
  ts: number;
};

type Gtag = (...args: unknown[]) => void;

function callGtag(...args: unknown[]) {
  const gtag = (window as Window & { gtag?: Gtag }).gtag;
  if (typeof gtag === "function") gtag(...args);
}

export function readConsent(): StoredConsent | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`));
  if (!match?.[1]) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(match[1])) as Partial<StoredConsent>;
    const fresh =
      parsed.v === CONSENT_VERSION &&
      (parsed.analytics === "granted" || parsed.analytics === "denied") &&
      typeof parsed.ts === "number" &&
      Date.now() - parsed.ts < CONSENT_MAX_AGE_SECONDS * 1000;
    if (!fresh || !parsed.analytics || typeof parsed.ts !== "number") return null;
    return { v: CONSENT_VERSION, analytics: parsed.analytics, ts: parsed.ts };
  } catch {
    return null;
  }
}

function expireCookie(name: string, domain?: string) {
  const domainPart = domain ? `; Domain=${domain}` : "";
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax${domainPart}`;
}

export function clearAnalyticsCookies() {
  const names = document.cookie
    .split(";")
    .map((part) => part.trim().split("=")[0])
    .filter((name) => name === "_ga" || name === "_gid" || name.startsWith("_ga_") || name.startsWith("_gat"));
  const host = location.hostname;
  const domains = host === "localhost" || host.endsWith(".localhost") ? [undefined] : [undefined, host, `.${host}`];
  for (const name of names) {
    for (const domain of domains) expireCookie(name, domain);
  }
}

export function writeConsent(analytics: ConsentChoice) {
  const value = encodeURIComponent(
    JSON.stringify({ v: CONSENT_VERSION, analytics, ts: Date.now() } satisfies StoredConsent),
  );
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${value}; Path=/; Max-Age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
  document.documentElement.dataset.consent = analytics;
  callGtag("consent", "update", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: analytics,
  });
  if (analytics === "denied") clearAnalyticsCookies();
}

// Runs before the Google tag loads. Consent defaults to denied, so analytics cookies are not stored until a person accepts.
export function consentBootstrap(gaId: string, debug: boolean): string {
  const config = debug
    ? "{ debug_mode: true, allow_google_signals: false, allow_ad_personalization_signals: false }"
    : "{ allow_google_signals: false, allow_ad_personalization_signals: false }";
  return `
window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
window.gtag = gtag;
(function () {
  var analytics = "denied";
  var state = "unknown";
  try {
    var match = document.cookie.match(/(?:^|; )${CONSENT_COOKIE}=([^;]*)/);
    if (match) {
      var parsed = JSON.parse(decodeURIComponent(match[1]));
      var fresh = parsed && parsed.v === ${CONSENT_VERSION} && typeof parsed.ts === "number" && (Date.now() - parsed.ts) < ${CONSENT_MAX_AGE_SECONDS * 1000};
      if (fresh && (parsed.analytics === "granted" || parsed.analytics === "denied")) {
        analytics = parsed.analytics;
        state = parsed.analytics;
      }
    }
  } catch (e) {}
  document.documentElement.dataset.consent = state;
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: analytics,
    functionality_storage: "denied",
    personalization_storage: "denied",
    security_storage: "granted"
  });
  gtag("set", "ads_data_redaction", true);
  gtag("js", new Date());
  gtag("config", "${gaId}", ${config});
})();
`.trim();
}
