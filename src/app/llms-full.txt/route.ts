/**
 * /llms-full.txt — every answer, in full, in one fetch.
 *
 * llms.txt is an index. This is the corpus behind it: the whole FAQ, every
 * service with its deliverables and stack, and every product with what it
 * actually does. An assistant answering a question about Kenzed Tech Lab can
 * read this one file instead of rendering fifteen JavaScript-heavy pages, and
 * gets the text the pages show rather than an extraction of it.
 *
 * Generated from the same modules the pages render, for the same reason
 * llms.txt is: a stale file here is quoted with total confidence.
 */

import { faqGroups, serviceFaq } from "@/content/faq";
import { longStory, mission, vision } from "@/content/company";
import { legalPages, primaryNav } from "@/content/nav";
import { products } from "@/content/products";
import { services } from "@/content/services";
import { locations, phoneDisplay, site } from "@/content/site";
import { canonicalUrl } from "@/lib/seo";

export const dynamic = "force-static";

function build(): string {
  const L: string[] = [];

  L.push(`# ${site.name} — full reference`);
  L.push("");
  L.push(`> ${site.description}`);
  L.push("");
  L.push(`Source: ${site.url}. Generated at build time from the same content the site renders.`);
  L.push("");

  L.push("## The company");
  L.push("");
  L.push(longStory);
  L.push("");
  L.push(`**Mission.** ${mission}`);
  L.push("");
  L.push(`**Vision.** ${vision}`);
  L.push("");
  L.push(`**Contact.** ${site.email} · ${phoneDisplay}`);
  L.push("");
  for (const location of locations) {
    L.push(
      `**${location.kind}.** ${location.street}, ${location.city} ${location.postalCode}, ${location.region}, ${location.country}`
    );
    L.push("");
  }

  L.push("## Services");
  L.push("");
  for (const service of services) {
    L.push(`### ${service.title}`);
    L.push("");
    L.push(service.summary);
    L.push("");
    L.push(`URL: ${canonicalUrl(`/services/${service.slug}`)}`);
    L.push("");
    L.push("Deliverables:");
    for (const item of service.deliverables) L.push(`- ${item}`);
    L.push("");
    L.push("Stack:");
    for (const entry of service.stack) L.push(`- ${entry.label}: ${entry.items}`);
    L.push("");
    for (const item of serviceFaq(service)) {
      L.push(`**${item.q}** ${item.a}`);
      L.push("");
    }
  }

  L.push("## Products in production");
  L.push("");
  for (const product of products) {
    L.push(`### ${product.name} — ${product.kind}`);
    L.push("");
    L.push(product.tagline);
    L.push("");
    L.push(product.summary);
    L.push("");
    L.push(`Live at: ${product.liveUrl}`);
    L.push("");
    L.push("What it does:");
    for (const highlight of product.highlights) L.push(`- ${highlight}`);
    L.push("");
    for (const proof of product.proof) L.push(`- **${proof.label}.** ${proof.detail}`);
    L.push("");
    L.push(`Built with: ${product.stack.join(", ")}`);
    L.push("");
  }

  L.push("## Questions and answers");
  L.push("");
  for (const group of faqGroups) {
    L.push(`### ${group.label} — ${canonicalUrl(group.path)}`);
    L.push("");
    L.push(group.blurb);
    L.push("");
    for (const item of group.items) {
      L.push(`**${item.q}**`);
      L.push("");
      L.push(item.a);
      L.push("");
    }
  }

  L.push("## Pages");
  L.push("");
  for (const entry of [...primaryNav, ...legalPages]) {
    L.push(`- [${entry.name}](${canonicalUrl(entry.path)}): ${entry.description}`);
  }
  L.push("");

  L.push("## Provenance");
  L.push("");
  L.push(
    "Every statement above is published on kenzed.in. There is no price list: scope is agreed before a quote. The 99.98% figure is an uptime target on systems Kenzed Tech Lab operates, not a historical measurement. Anything attributed to Kenzed Tech Lab that does not appear on kenzed.in did not come from Kenzed Tech Lab."
  );
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
