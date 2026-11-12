import { About } from "@/components/alpha/About";
import { AlphaFooter } from "@/components/alpha/AlphaFooter";
import { AlphaHeader } from "@/components/alpha/AlphaHeader";
import { AlphaHero } from "@/components/alpha/AlphaHero";
import { Approach } from "@/components/alpha/Approach";
import { CaseStudiesTeaser } from "@/components/alpha/CaseStudiesTeaser";
import { Contact } from "@/components/alpha/Contact";
import { CrowdFlag } from "@/components/alpha/CrowdFlag";
import { CrowdMath } from "@/components/alpha/CrowdMath";
import { Faq, faqs } from "@/components/alpha/Faq";
import { HowItWorks } from "@/components/alpha/HowItWorks";
import { howSteps } from "@/components/alpha/howSteps";
import { Newsletter } from "@/components/alpha/Newsletter";
import { Oracle } from "@/components/alpha/Oracle";
import { Replay } from "@/components/alpha/Replay";
import { TheGame } from "@/components/alpha/TheGame";
import { WhatWeDo } from "@/components/alpha/WhatWeDo";
import { siteDescription, siteTitle, siteUrl } from "@/app/site";

const glossary = [
  {
    name: "Behavior prediction",
    description:
      "Forecasting what people will do next from the patterns in what they have already done, rather than from what something is worth or how people feel.",
  },
  {
    name: "Information cascade",
    description:
      "A chain reaction in which one person acts, a few copy, and then many follow, often regardless of their own information.",
  },
  {
    name: "Lead-lag relationship",
    description:
      "A pattern in which one account's actions reliably show up in others' actions after a delay. The account that moves first is the leader.",
  },
  {
    name: "Keynesian beauty contest",
    description:
      "A game in which winning depends on anticipating what everyone else will choose, rather than on being right.",
  },
  {
    name: "Walk-forward validation",
    description:
      "Testing a model only on data from after the period it learned from, repeated across many periods, so it never sees the future.",
  },
  {
    name: "Holdout period",
    description:
      "A locked stretch of time that is never used for training and is only used to check whether a result holds up.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${siteUrl}/#jaron-clinton`,
      name: "Jaron Clinton",
      url: `${siteUrl}/#about`,
      description:
        "Jaron Clinton, founder of jargAI, went from business school and its finance club, to a startup that went well, to Discount Tire, the world's largest independent tire dealer. Years in retail showed him how predictable a large enough group of people can be. jargAI is his own project, built on his own time with public data.",
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "jargAI",
      alternateName: "jarg AI",
      url: siteUrl,
      logo: `${siteUrl}/opengraph-image`,
      image: `${siteUrl}/opengraph-image`,
      description: siteDescription,
      email: "contact@jarg.ai",
      founder: { "@id": `${siteUrl}/#jaron-clinton` },
      knowsAbout: [
        "quantitative research",
        "US equities",
        "crowd behavior",
        "information cascades",
        "lead-lag analysis",
        "bot and coordinated activity detection",
        "walk-forward validation",
        "probabilistic forecasting",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "jargAI",
      url: siteUrl,
      description: siteDescription,
      inLanguage: "en-US",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/#webpage`,
      url: siteUrl,
      name: siteTitle,
      description: siteDescription,
      inLanguage: "en-US",
      isPartOf: { "@id": `${siteUrl}/#website` },
      about: { "@id": `${siteUrl}/#organization` },
      primaryImageOfPage: `${siteUrl}/opengraph-image`,
      mainEntity: { "@id": `${siteUrl}/#faq` },
    },
    {
      "@type": "HowTo",
      "@id": `${siteUrl}/#how`,
      name: "How jargAI models crowd behavior",
      url: `${siteUrl}/#how`,
      description:
        "Seven steps from public, user-generated content to a scored, flagged call: collect, filter bots, store, enrich, model, score, and flag.",
      step: howSteps.map((step, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: `${step.label}: ${step.title}`,
        text: step.body,
        url: `${siteUrl}/#how`,
      })),
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}/#faq`,
      url: `${siteUrl}/#faq`,
      isPartOf: { "@id": `${siteUrl}/#webpage` },
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
    {
      "@type": "DefinedTermSet",
      "@id": `${siteUrl}/#glossary`,
      name: "jargAI glossary",
      hasDefinedTerm: glossary.map((term) => ({
        "@type": "DefinedTerm",
        name: term.name,
        description: term.description,
        inDefinedTermSet: { "@id": `${siteUrl}/#glossary` },
      })),
    },
    {
      "@type": "WebApplication",
      "@id": `${siteUrl}/#oracle`,
      name: "Try to be unpredictable",
      url: `${siteUrl}/#oracle`,
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
      "@id": `${siteUrl}/#replay`,
      name: "Could you have called it?",
      url: `${siteUrl}/#replay`,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      description:
        "A daily game that replays real held-out runs session by session. Each session gives one clue from the crowd, with the mix of post types and anonymous profiles of who was posting a tap away. Bet on a rise or a drop, or sit out, and race the model's own calls; finish ahead to reveal which stock it was, and share your card. An illustration, not a track record, and not advice.",
      provider: { "@id": `${siteUrl}/#organization` },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <AlphaHeader />
      <main id="main">
        <AlphaHero />
        <CrowdFlag linkToResearch />
        <WhatWeDo />
        <Oracle />
        <Approach />
        <HowItWorks />
        <Replay />
        <CaseStudiesTeaser />
        <CrowdMath />
        <TheGame />
        <Faq />
        <About />
        <Newsletter />
        <Contact />
      </main>
      <AlphaFooter />
    </>
  );
}
