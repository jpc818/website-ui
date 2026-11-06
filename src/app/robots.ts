import type { MetadataRoute } from "next";
import { siteUrl } from "@/app/site";

export const dynamic = "force-static";

// Search and assistant bots fetch a page to answer someone's question, and cite it back.
const searchCrawlers = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Applebot",
  "Bingbot",
  "Amazonbot",
  "DuckAssistBot",
  "MistralAI-User",
  "YouBot",
];

// Training crawlers collect pages for model training and send no one back. robots.txt only asks;
// Cloudflare's AI bot blocking is what enforces it.
const trainingCrawlers = [
  "GPTBot",
  "ClaudeBot",
  "anthropic-ai",
  "CCBot",
  "Google-Extended",
  "Applebot-Extended",
  "meta-externalagent",
  "cohere-ai",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/api/" },
      { userAgent: searchCrawlers, allow: "/", disallow: "/api/" },
      { userAgent: trainingCrawlers, disallow: "/" },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
