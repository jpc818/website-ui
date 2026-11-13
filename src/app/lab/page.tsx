import type { Metadata } from "next";
import { siteUrl } from "@/app/site";
import { AlphaFooter } from "@/components/alpha/AlphaFooter";
import { AlphaHeader } from "@/components/alpha/AlphaHeader";
import { Oracle } from "@/components/alpha/Oracle";
import { Replay } from "@/components/alpha/Replay";
import { JsonLd, pageJsonLd, pageMetadata } from "@/lib/seo";

const path = "/lab";
const title = "Lab";
const description =
  "Two interactive demos from jargAI: try to be unpredictable against a simple model, and replay real held-out runs session by session. Illustrations, not a track record, and not advice.";

export const metadata: Metadata = pageMetadata({ title, description, path });

const demos = [
  {
    "@type": "WebApplication",
    "@id": `${siteUrl}/lab#oracle`,
    name: "Try to be unpredictable",
    url: `${siteUrl}/lab#oracle`,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    isAccessibleForFree: true,
    description:
      "An in-browser game: tap squares on a grid as randomly as you can while a Ghost seals a guess about your next square, based on your earlier taps, and reveals it after you tap. Chance is one in nine. Nothing is sent anywhere.",
    provider: { "@id": `${siteUrl}/#organization` },
  },
  {
    "@type": "WebApplication",
    "@id": `${siteUrl}/lab#replay`,
    name: "Could you have called it?",
    url: `${siteUrl}/lab#replay`,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    isAccessibleForFree: true,
    description:
      "A daily game that replays real held-out runs session by session. Each session gives one clue from the crowd, with the mix of post types and anonymous profiles of who was posting a tap away. Bet on a rise or a drop, or sit out, and race the model's own calls; finish ahead to reveal which stock it was, and share your card. An illustration, not a track record, and not advice.",
    provider: { "@id": `${siteUrl}/#organization` },
  },
];

const base = pageJsonLd({ path, name: title, description, type: "CollectionPage" });
const jsonLd = { ...base, "@graph": [...base["@graph"], ...demos] };

export default function Lab() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <AlphaHeader />
      <main id="main">
        <section aria-labelledby="lab-title" className="pt-28 pb-4 md:pt-36">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-cyan">Lab</p>
            <h1
              id="lab-title"
              className="mt-3 max-w-3xl text-balance font-[family-name:var(--font-heading)] text-[clamp(2.25rem,6vw,4rem)] font-extrabold leading-[1.05] tracking-tight"
            >
              Two small experiments in predictability.
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted md:text-xl">
              Interactive demos of ideas behind the research. They are illustrations, not a track record, and nothing
              here is advice. The evidence itself is on the{" "}
              <a
                href="/research"
                className="text-foreground underline decoration-white/30 underline-offset-4 hover:decoration-foreground"
              >
                research page
              </a>
              .
            </p>
          </div>
        </section>
        <Oracle />
        <Replay />
      </main>
      <AlphaFooter />
    </>
  );
}
