import type { Metadata } from "next";
import { siteUrl } from "@/app/site";
import { About } from "@/components/alpha/About";
import { AlphaFooter } from "@/components/alpha/AlphaFooter";
import { AlphaHeader } from "@/components/alpha/AlphaHeader";
import { Contact } from "@/components/alpha/Contact";
import { JsonLd, pageJsonLd, pageMetadata } from "@/lib/seo";

const path = "/about";
const title = "About";
const description =
  "Jaron Clinton, founder of jargAI: business school and its finance club, a startup that went well, then Discount Tire. jargAI is his own project, built on his own time with public data.";

export const metadata: Metadata = pageMetadata({ title, description, path });

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={pageJsonLd({
          path,
          name: title,
          description,
          type: "AboutPage",
          extra: { mainEntity: { "@id": `${siteUrl}/#jaron-clinton` } },
        })}
      />
      <AlphaHeader />
      <main id="main">
        <About />
        <Contact />
      </main>
      <AlphaFooter />
    </>
  );
}
