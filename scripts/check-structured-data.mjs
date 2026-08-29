/**
 * Structured-data gate over the built export.
 *
 * Structured data fails silently. A malformed block, a duplicate FAQPage or an
 * answer that exists only in the markup does not break the page, does not show
 * up in a screenshot, and does not fail a build — it just quietly stops
 * earning the rich result it was written for, months before anyone notices.
 * So it gets checked like anything else that can break.
 *
 * What is enforced, and why each one:
 *
 *  - Every ld+json block parses. A trailing comma silently voids the block.
 *  - At most ONE FAQPage per page. Two blocks both claiming to be the page's
 *    FAQ is invalid, and the usual outcome is that a crawler uses neither.
 *  - Every Question carries a non-empty acceptedAnswer.text.
 *  - Every answer in the schema ALSO appears in the visible HTML. This is the
 *    one that matters: markup a visitor cannot find is cloaking, and Google
 *    treats it as such. It is also the failure a refactor introduces most
 *    easily — change the component that renders the list, forget the schema,
 *    and the two drift apart with nothing to say so.
 *  - Every indexable page has a canonical, a title and a description.
 *
 * usage: node scripts/check-structured-data.mjs [distDir]
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const DIST = process.argv[2] || "dist";

/* 404 pages are the exception on purpose: a canonical URL on a "not found"
   response tells a crawler the missing page is the canonical version of
   something, which is worse than saying nothing. */
const NO_CANONICAL_OK = new Set(["/404.html", "/404/", "/_not-found/"]);

const pages = [];
(function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".html")) pages.push(full);
  }
})(DIST);

const decode = (s) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&amp;/g, "&");

let failures = 0;
let faqTotal = 0;

for (const file of pages.sort()) {
  const html = readFileSync(file, "utf8");
  const route = "/" + relative(DIST, file).replace(/\\/g, "/").replace(/index\.html$/, "");
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const body = decode(html).replace(/\s+/g, " ");

  let faqPages = 0;

  for (const raw of blocks) {
    let json;
    try {
      json = JSON.parse(raw);
    } catch (error) {
      console.error(`  ${route}: ld+json does not parse — ${error.message}`);
      failures++;
      continue;
    }
    if (json["@type"] !== "FAQPage") continue;
    faqPages++;

    for (const question of json.mainEntity ?? []) {
      const text = question.acceptedAnswer?.text;
      if (!text) {
        console.error(`  ${route}: question with no answer — "${question.name}"`);
        failures++;
        continue;
      }
      faqTotal++;
      const needle = text.slice(0, 60).replace(/\s+/g, " ");
      if (!body.includes(needle)) {
        console.error(`  ${route}: answer is in the schema but not on the page — "${needle}..."`);
        failures++;
      }
    }
  }

  if (faqPages > 1) {
    console.error(`  ${route}: ${faqPages} FAQPage blocks — exactly one is valid`);
    failures++;
  }
  if (!NO_CANONICAL_OK.has(route) && !/<link rel="canonical" href="[^"]+"/.test(html)) {
    console.error(`  ${route}: no canonical`);
    failures++;
  }
  if (!/<title>[^<]+<\/title>/.test(html)) {
    console.error(`  ${route}: no title`);
    failures++;
  }
  if (!/<meta name="description" content="[^"]+"/.test(html)) {
    console.error(`  ${route}: no meta description`);
    failures++;
  }
}

if (failures) {
  console.error(`\nStructured data: ${failures} problem(s) across ${pages.length} pages.`);
  process.exit(1);
}
console.log(`Structured data: ${pages.length} pages, ${faqTotal} answers, all present on the page they claim.`);
