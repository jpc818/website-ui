export const siteUrl = "https://jarg.ai";

// Public Google tags. Both are visible in the page source.
// Measurement ID looks like G-XXXXXXXXXX. Search Console can be the meta-tag token, or the DNS value with the google-site-verification= prefix.
export const googleAnalyticsId = "G-4Z7PFQ452F";
export const googleSiteVerification = "google-site-verification=_Pirjt1jLgXnIHAEBDvzrQAogbAotqo9rI6nLktHbno";

const measurementId = /^G-[A-Z0-9]+$/;

export function activeGoogleAnalyticsId() {
  const id = googleAnalyticsId.trim();
  return measurementId.test(id) ? id : "";
}

export function activeGoogleSiteVerification() {
  const token = googleSiteVerification
    .trim()
    .replace(/^google-site-verification=/i, "");
  if (!token || /[\s<>"'=]/.test(token)) return "";
  return token;
}

// Fill these in to show proof of who is behind the work in the About section. Nothing renders while they are null.
export const founder: {
  linkedinUrl: string | null;
  credential: string | null;
  photo: { src: string; alt: string } | null;
} = {
  linkedinUrl: null,
  credential: "Cloud architect · builds agentic AI systems",
  photo: null,
};

export const siteTitle = "jargAI — A research company studying crowd behavior";

export const siteDescription =
  "jargAI is a research company that models how online crowds behave around US stocks and tests what holds up on data the models never saw. It does not manage outside money, sell signals, or give advice.";
