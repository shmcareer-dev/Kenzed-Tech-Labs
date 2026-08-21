import { KzInfrastructure } from "@/components/kz/screens/KzInfrastructure";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Infrastructure & Facilities | Kenzed Tech Lab, Durgapur",
  description:
    "Kenzed Tech Lab operates a 15,000 sq ft facility with on-site staff accommodation, canteen, in-house GPU compute, full hardware & software stacks, and 24×7 uninterrupted power.",
  path: "/infrastructure",
  keywords: ["AI development facility and infrastructure", "on-premise sovereign AI India"],
});

export default function InfrastructurePage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Infrastructure", path: "/infrastructure" },
        ])}
      />
      <KzInfrastructure />
    </>
  );
}
