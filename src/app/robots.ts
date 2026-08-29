import type { MetadataRoute } from "next";

import { site } from "@/content/site";

export const dynamic = "force-static";

/**
 * robots.txt.
 *
 * The wildcard rule already allows everything, so naming the AI crawlers
 * changes nothing technically. It is here because the DEFAULT for several of
 * them is the part people get wrong: Google-Extended and Applebot-Extended are
 * opt-OUT controls that have nothing to do with ranking, and a site that
 * blocks them keeps its Search listing while removing itself from AI Overviews
 * and Siri answers. Stating them explicitly means a future edit to this file
 * has to make that trade on purpose rather than by copying a blocklist off a
 * blog post.
 *
 * The split by agent is deliberate:
 *
 *  - Answer engines that CITE a source (Perplexity, ChatGPT's browser, Claude's
 *    fetcher, Gemini) are the whole point of the llms.txt work. Blocking them
 *    removes the citation, not the competition.
 *  - Training-corpus crawlers (GPTBot, ClaudeBot, CCBot, Meta) are a genuine
 *    business decision rather than a technical one. They are allowed here
 *    because this is a marketing site whose entire purpose is to be found and
 *    quoted, and because the same content is public HTML either way. If that
 *    calculus changes, this is the one place to change it.
 *
 * robots.txt is a request, not a control. Anything that must not be public
 * belongs behind auth, not behind a Disallow line.
 */

const AI_AGENTS = [
  // Answer engines and assistant fetchers — these cite back.
  "PerplexityBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-User",
  "Claude-SearchBot",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
  "DuckAssistBot",
  // Corpus crawlers.
  "GPTBot",
  "ClaudeBot",
  "anthropic-ai",
  "CCBot",
  "meta-externalagent",
  "Amazonbot",
  "Bytespider",
  "cohere-ai",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Neither exists as a route; both are listed so that adding one later
        // does not quietly publish it.
        disallow: ["/admin", "/api"],
      },
      ...AI_AGENTS.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: new URL("/sitemap.xml", site.url).toString(),
    host: site.url,
  };
}
