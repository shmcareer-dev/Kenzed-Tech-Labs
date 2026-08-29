import { KzFaqSection } from "@/components/kz/KzFaq";
import { KzAbout } from "@/components/kz/screens/KzAbout";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About Kenzed Tech Lab | AI & Software Company in Durgapur & Kolkata",
  description:
    "Meet Kenzed Tech Lab — a 25-strong agentic AI, ML & software team engineering intelligent, production-grade systems from a 15,000 sq ft facility in Durgapur, with corporate reach in Kolkata.",
  path: "/about",
  keywords: [
    "AI and software development company in Durgapur",
    "software development company in Kolkata",
  ],
});

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
      <KzAbout />
      <KzFaqSection path="/about" />
    </>
  );
}
