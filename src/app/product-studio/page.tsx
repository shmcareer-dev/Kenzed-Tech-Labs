import { KzProductStudio } from "@/components/kz/screens/KzProductStudio";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Product Studio | AI Products & Pricing | Kenzed Tech Lab",
  description:
    "Explore Kenzed Tech Lab's ready-to-deploy AI products — agent platforms, document retrieval, voice agents, vision inspection, back-office automation, and private language models — with indicative pricing tiers and a quote scoped to your project.",
  path: "/product-studio",
  keywords: [
    "AI product pricing India",
    "agentic AI platform for enterprises",
    "voice AI and machine learning products Durgapur Kolkata",
  ],
});

export default function ProductStudioPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Product Studio", path: "/product-studio" },
        ])}
      />
      <KzProductStudio />
    </>
  );
}
