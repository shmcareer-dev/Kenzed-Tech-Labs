import { KzFaqSection } from "@/components/kz/KzFaq";
import { KzIndustries } from "@/components/kz/screens/KzIndustries";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Industries We Serve | Kenzed Tech Lab AI Solutions",
  description:
    "Kenzed Tech Lab delivers AI, ML & software solutions across education, enterprise, startups, healthcare, retail, finance, manufacturing, and the public sector.",
  path: "/industries",
  keywords: ["AI solutions by industry"],
});

export default function IndustriesPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Industries", path: "/industries" },
        ])}
      />
      <KzIndustries />
      <KzFaqSection path="/industries" />
    </>
  );
}
