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
import { LabTeaser } from "@/components/alpha/LabTeaser";
import { MovedAnchors } from "@/components/alpha/MovedAnchors";
import { Newsletter } from "@/components/alpha/Newsletter";
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
      <MovedAnchors />
      <AlphaHeader />
      <main id="main">
        <AlphaHero />
        <CrowdFlag linkToResearch />
        <WhatWeDo />
        <Approach />
        <HowItWorks />
        <CaseStudiesTeaser />
        <CrowdMath />
        <LabTeaser />
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
