import { KzBreadcrumb } from "@/components/kz/KzBreadcrumb";
import { KzFaqSection } from "@/components/kz/KzFaq";
import { KzTechnology } from "@/components/kz/screens/KzTechnology";
import { JsonLd } from "@/components/ui/JsonLd";
import { pageMetadata, webPageSchemaFor } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Our Technology Stack | Kenzed Tech Lab — AI, Cloud & Web",
  description:
    "The full Kenzed Tech Lab technology stack — AI/ML frameworks, LLM tooling, cloud & DevOps, modern web & 3D, databases, and languages behind our production systems.",
  path: "/technology",
  keywords: ["AI development technology stack", "machine learning tech stack"],
});

export default function TechnologyPage() {
  return (
    <>
      <JsonLd data={webPageSchemaFor("/technology")} />
      <KzBreadcrumb
        trail={[
          { name: "Home", path: "/" },
          { name: "Technology", path: "/technology" },
        ]}
      />
      <KzTechnology />
      <KzFaqSection path="/technology" />
    </>
  );
}
