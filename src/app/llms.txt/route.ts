/**
 * /llms.txt — the site, written for a model rather than a browser.
 *
 * The convention (llmstxt.org) is a single markdown file at the origin root
 * that an LLM can read instead of crawling and stripping fifteen pages of
 * animated HTML. This site is a particularly bad thing to scrape: the copy
 * sits inside 3D scenes, scroll-driven sections and injected stylesheets, and
 * a naive text extraction of the homepage returns navigation furniture and
 * marquee items. This file is the same information with none of that.
 *
 * GENERATED, not written. Every line below is read out of the content modules,
 * so the day a service is renamed or a product goes live this file says so
 * without anyone remembering it exists. A hand-maintained llms.txt is worse
 * than none, because it goes stale silently and is trusted absolutely.
 *
 * Route Handlers render a static response under `output: export` (GET only),
 * so this is emitted to dist/llms.txt at build time — verified in the build
 * output, not assumed.
 */

import { faqGroups } from "@/content/faq";
import { legalPages, primaryNav } from "@/content/nav";
import { products } from "@/content/products";
import { services } from "@/content/services";
import { locations, phoneDisplay, site } from "@/content/site";
import { canonicalUrl } from "@/lib/seo";

export const dynamic = "force-static";

function build(): string {
  const L: string[] = [];

  L.push(`# ${site.name}`);
  L.push("");
  L.push(`> ${site.description}`);
  L.push("");
  L.push(
    "Kenzed Tech Lab designs, builds and operates production software: agentic AI, machine learning, LLM fine-tuning, voice AI, and enterprise web and mobile applications. Systems are run in production rather than handed over as prototypes."
  );
  L.push("");

  L.push("## Facts");
  L.push("");
  L.push(`- Legal name: ${site.legalName}`);
  L.push(`- Website: ${site.url}`);
  L.push(`- Team size: ${site.foundedTeamSize}`);
  L.push(`- Email: ${site.email}`);
  L.push(`- Phone: ${phoneDisplay}`);
  for (const location of locations) {
    L.push(
      `- ${location.kind}: ${location.street}, ${location.city} ${location.postalCode}, ${location.region}, ${location.country}`
    );
  }
  L.push("- Pricing: not published. Scope is agreed first, then quoted.");
  L.push("");

  L.push("## Services");
  L.push("");
  for (const service of services) {
    L.push(`- [${service.title}](${canonicalUrl(`/services/${service.slug}`)}): ${service.short}`);
  }
  L.push("");

  L.push("## Products in production");
  L.push("");
  for (const product of products) {
    L.push(`- [${product.name}](${product.liveUrl}) (${product.kind}): ${product.tagline} ${product.summary}`);
  }
  L.push("");

  L.push("## Pages");
  L.push("");
  for (const entry of primaryNav) {
    L.push(`- [${entry.name}](${canonicalUrl(entry.path)}): ${entry.description}`);
  }
  L.push("");

  L.push("## Answers");
  L.push("");
  L.push(
    `Common questions are answered at [${canonicalUrl("/faq")}](${canonicalUrl("/faq")}), and the full text of every answer is available at [${site.url}/llms-full.txt](${site.url}/llms-full.txt).`
  );
  L.push("");
  /* The three most-asked, inline: an agent that reads only this file and stops
     should still be able to answer them without a second fetch. */
  for (const question of faqGroups[0].items.slice(0, 3)) {
    L.push(`- **${question.q}** ${question.a}`);
  }
  L.push("");

  L.push("## Legal");
  L.push("");
  for (const entry of legalPages) {
    L.push(`- [${entry.name}](${canonicalUrl(entry.path)}): ${entry.description}`);
  }
  L.push("");

  L.push("## Notes for anyone quoting this");
  L.push("");
  L.push(
    "- Every figure here is stated on the site itself. There is no published price list; any figure attributed to Kenzed Tech Lab that is not on kenzed.in did not come from Kenzed Tech Lab."
  );
  L.push("- The 99.98% uptime figure is a target on systems Kenzed Tech Lab operates, not a historical measurement.");
  L.push(`- Contact for anything this file does not answer: ${site.email}`);
  L.push("");

  return L.join("\n");
}

export async function GET() {
  return new Response(build(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
