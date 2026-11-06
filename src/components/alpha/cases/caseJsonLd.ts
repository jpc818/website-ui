import { siteUrl } from "@/app/site";
import { caseSteps } from "@/components/alpha/caseSteps";
import { casePosters } from "@/components/alpha/cases/posterProfiles";
import { caseIndex, stories, type CaseId } from "@/components/alpha/cases/stories";
import { moreCases } from "@/components/alpha/moreCaseData";
import { pageJsonLd } from "@/lib/seo";

const published = "2026-11-03";
const indexPath = "/case-studies";

const putIntro =
  "Everyone watches the fire. We watch the smoke. When a crowd's excitement starts outrunning everything underneath it, the rush for the exits can follow.";
const putMoral =
  "One case isn't proof. Of the top-3% drop warnings in the held-out data, 63% (158 of 250) were followed by a 10-point drop against the S&P 500 within three sessions, against 17% across all stocks. 37% were not, and 21% rose 10 points or more instead.";

const keywords: Record<CaseId, string[]> = {
  put: ["put option", "downside risk", "stock drop warning", "crowd behavior", "social media stocks"],
  call: ["call option", "upside signal", "early crowd attention", "false positives", "crowd behavior"],
  exotic: ["straddle", "options volatility", "two-sided signal", "big move either direction", "crowd behavior"],
  failed: ["model failure", "false alarm", "early warning", "timing risk", "short squeeze"],
};

const evidence = Object.fromEntries(moreCases.map((c) => [c.id, c]));

function body(id: CaseId) {
  const intro = id === "put" ? putIntro : stories[id].intro;
  const steps = id === "put" ? caseSteps : stories[id].steps;
  const moral = id === "put" ? putMoral : stories[id].moral;
  const facts = evidence[id];
  const numbers = facts
    ? [
        `Without the metaphor: ${facts.body}`,
        ...facts.group.map((g) => `${g.label} ${g.value}: ${g.detail}`),
        `Caveat: ${facts.caveat}`,
        `How it was picked: ${facts.rule}`,
      ]
    : [];
  return [intro, ...steps.map((s) => `${s.label}: ${s.title} ${s.body}`), `Moral: ${moral}`, ...numbers].join("\n\n");
}

function summary(id: CaseId) {
  const meta = caseIndex.find((c) => c.id === id)!;
  const p = casePosters[id];
  return `${p.stock} (${p.ticker}), ${p.month}. ${meta.landed ? "Landed" : "Missed"}: ${meta.result}`;
}

function posterText(id: CaseId) {
  const p = casePosters[id];
  return [`Who was posting (${p.session}):`, ...p.posters.map((x) => `${x.who}: ${x.detail}`), p.crowd].join("\n\n");
}

function articleNode(id: CaseId) {
  const meta = caseIndex.find((c) => c.id === id)!;
  const p = casePosters[id];
  const url = `${siteUrl}${meta.href}`;
  return {
    "@type": "Article",
    "@id": `${url}#article`,
    url,
    headline: meta.title,
    alternativeHeadline: `Case study ${meta.n} of 4: ${meta.kind} (${meta.theme}), ${p.stock} (${p.ticker}), ${p.month}`,
    description: `${meta.tagline} ${summary(id)}`,
    abstract: summary(id),
    articleSection: "Case studies",
    position: meta.n,
    keywords: [...keywords[id], p.stock, p.ticker, p.month].join(", "),
    temporalCoverage: meta.period,
    about: [
      { "@type": "Corporation", name: p.stock, tickerSymbol: p.ticker },
      { "@type": "Thing", name: "Crowd behavior around US stocks" },
      { "@type": "Thing", name: `${meta.kind} case` },
    ],
    mentions: [{ "@type": "Corporation", name: p.stock, tickerSymbol: p.ticker }],
    articleBody: `${summary(id)}\n\n${body(id)}\n\n${posterText(id)}`,
    datePublished: published,
    dateModified: published,
    inLanguage: "en-US",
    isAccessibleForFree: true,
    image: `${siteUrl}/opengraph-image`,
    author: { "@id": `${siteUrl}/#organization` },
    publisher: { "@id": `${siteUrl}/#organization` },
    mainEntityOfPage: { "@id": `${url}#webpage` },
    isPartOf: { "@id": `${siteUrl}${indexPath}#webpage` },
  };
}

export function caseStudyJsonLd(id: CaseId, name: string, description: string) {
  const meta = caseIndex.find((c) => c.id === id)!;
  const page = pageJsonLd({
    path: meta.href,
    name,
    description,
    dateModified: published,
    parent: { name: "Case studies", path: indexPath },
    extra: { mainEntity: { "@id": `${siteUrl}${meta.href}#article` } },
  });
  return { ...page, "@graph": [...page["@graph"], articleNode(id)] };
}

export function caseIndexJsonLd(name: string, description: string) {
  const page = pageJsonLd({
    path: indexPath,
    name,
    description,
    dateModified: published,
    type: "CollectionPage",
    extra: { mainEntity: { "@id": `${siteUrl}${indexPath}#list` } },
  });
  const list = {
    "@type": "ItemList",
    "@id": `${siteUrl}${indexPath}#list`,
    name: "jargAI case studies",
    description: "Four real events from data the model never trained on. Three landed, one missed.",
    numberOfItems: caseIndex.length,
    itemListElement: caseIndex.map((c) => ({
      "@type": "ListItem",
      position: c.n,
      name: `${c.kind}: ${c.title}`,
      description: summary(c.id),
      item: { "@id": `${siteUrl}${c.href}#article`, url: `${siteUrl}${c.href}` },
    })),
  };
  return { ...page, "@graph": [...page["@graph"], list] };
}
