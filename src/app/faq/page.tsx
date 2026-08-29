import { KzBreadcrumb } from "@/components/kz/KzBreadcrumb";
import { KzFaq } from "@/components/kz/KzFaq";
import { KzPageHero } from "@/components/kz/primitives";
import { JsonLd } from "@/components/ui/JsonLd";
import { allFaqItems, faqGroups } from "@/content/faq";
import { canonicalUrl, faqSchema, pageMetadata, webPageSchemaFor } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "FAQ | Kenzed Tech Lab — Services, Pricing, Process & Support",
  description:
    "Direct answers about Kenzed Tech Lab: what we build, what it costs, how projects run, where systems are hosted, the products we license, and how to get started.",
  path: "/faq",
  keywords: [
    "Kenzed Tech Lab FAQ",
    "AI development company questions",
    "AI agent development cost",
    "custom software company Durgapur",
  ],
});

export default function FaqPage() {
  return (
    <>
      <JsonLd data={webPageSchemaFor("/faq")} />
      <KzBreadcrumb
        trail={[
          { name: "Home", path: "/" },
          { name: "FAQ", path: "/faq" },
        ]}
      />
      {/* ONE FAQPage for the whole hub, covering every question on it. The
          per-group blocks below therefore pass schema={false} — two blocks
          both claiming to be the page's FAQ is invalid, and the usual outcome
          is that a crawler uses neither. */}
      <JsonLd data={faqSchema(allFaqItems)} />

      <KzPageHero
        eyebrow="FAQ"
        title="Questions, answered directly"
        lead="Everything asked often enough to be worth writing down — what we build, what it costs, how a project runs, and who keeps it running afterwards."
        visual="terminal"
      />

      <section style={{ padding: "0 0 clamp(70px, 10vw, 120px)", background: "var(--bg)" }}>
        <div className="kz-wrap">
          {faqGroups.map((group, index) => (
            <div
              key={group.path}
              id={group.path === "/" ? "general" : group.path.slice(1)}
              style={{ marginTop: index === 0 ? 0 : "clamp(44px, 6vw, 72px)", scrollMarginTop: "96px" }}
            >
              <KzFaq
                items={group.items}
                title={group.label}
                eyebrow={group.blurb}
                index={String(index + 1).padStart(2, "0")}
                schema={false}
                hubLink={false}
                id={`faq-${group.path === "/" ? "general" : group.path.slice(1)}`}
              />
              {/* Every group points back at the page it summarises. This is the
                  internal linking that makes a hub worth having rather than a
                  dead end that outranks the pages it is meant to feed. */}
              <a
                href={canonicalUrl(group.path).replace(/^https?:\/\/[^/]+/, "")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  marginTop: 18,
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.68rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--acc)",
                  textDecoration: "none",
                }}
              >
                Go to {group.label} <span aria-hidden="true">→</span>
              </a>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
