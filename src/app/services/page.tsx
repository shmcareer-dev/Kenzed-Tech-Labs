import { KzFaqSection } from "@/components/kz/KzFaq";
import { KzServices } from "@/components/kz/screens/KzServices";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

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
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
        ])}
      />
      <KzServices />
      <KzFaqSection path="/services" />
    </>
  );
}
