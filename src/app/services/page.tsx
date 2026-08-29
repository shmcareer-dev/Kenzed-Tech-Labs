import { services } from "@/content/services";
import { KzBreadcrumb } from "@/components/kz/KzBreadcrumb";
import { KzFaqSection } from "@/components/kz/KzFaq";
import { KzServices } from "@/components/kz/screens/KzServices";
import { JsonLd } from "@/components/ui/JsonLd";
import { pageMetadata, serviceListSchema, webPageSchemaFor } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "AI, ML & Software Development Services | Kenzed Tech Lab",
  description:
    "Explore Kenzed Tech Lab's services: agentic AI, machine learning, LLM fine-tuning, voice AI, 3D web & app development, adaptive UI/UX, and enterprise software. Built for production.",
  path: "/services",
  keywords: [
    "AI and software development services",
    "AI agent development services",
    "machine learning development services",
    "enterprise software development company",
  ],
});

export default function ServicesPage() {
  return (
    <>
      <JsonLd data={webPageSchemaFor("/services")} />
      {/* The eight services as one ItemList. Individually they are eight
          Service nodes a consumer has to infer a relationship between; as a
          list they are a catalogue, which is what makes "what does Kenzed do"
          answerable from structured data alone. */}
      <JsonLd data={serviceListSchema(services)} />
      <KzBreadcrumb
        trail={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
        ]}
      />
      <KzServices />
      <KzFaqSection path="/services" />
    </>
  );
}
