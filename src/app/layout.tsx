import type { Metadata, Viewport } from "next";
import { Caveat, DM_Sans, Manrope } from "next/font/google";
import Script from "next/script";
import { CookieBanner } from "@/components/CookieBanner";
import {
  activeGoogleAnalyticsId,
  activeGoogleSiteVerification,
  siteDescription,
  siteTitle,
  siteUrl,
} from "@/app/site";
import { consentBootstrap } from "@/lib/consent";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-heading",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-hand",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s · jargAI",
  },
  description: siteDescription,
  applicationName: "jargAI",
  keywords: [
    "jargAI",
    "quantitative research",
    "crowd behavior research",
    "US equities",
    "crowd behavior",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "jargAI",
    title: siteTitle,
    description: siteDescription,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  robots: { index: true, follow: true },
  ...(activeGoogleSiteVerification()
    ? { verification: { google: activeGoogleSiteVerification() } }
    : {}),
};

export const viewport: Viewport = {
  themeColor: "#090b0f",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const gaId = activeGoogleAnalyticsId();
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${manrope.variable} ${caveat.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {gaId ? <CookieBanner /> : null}
        {children}
      </body>
      {gaId ? (
        <>
          <Script
            id="google-consent"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: consentBootstrap(gaId, process.env.NODE_ENV === "development"),
            }}
          />
          <Script id="google-tag" strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
        </>
      ) : null}
    </html>
  );
}
