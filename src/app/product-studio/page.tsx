import { KzBreadcrumb } from "@/components/kz/KzBreadcrumb";
import { KzFaqSection } from "@/components/kz/KzFaq";
import { KzProductStudio } from "@/components/kz/screens/KzProductStudio";
import { JsonLd } from "@/components/ui/JsonLd";
import { products } from "@/content/products";
import { pageMetadata, productCatalogSchema, webPageSchemaFor } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Product Studio | Live Software We Built & Run | Kenzed Tech Lab",
  description:
    "Six systems in production today — Kenzed LMS, Kenzed ERP, Kenzed CRM, CareerKing, and two voice-enabled college platforms. Real screenshots of the live sites, and a quote scoped to your institution.",
  path: "/product-studio",
  keywords: [
    "college ERP software India",
    "learning management system for colleges",
    "voice assistant website for colleges Durgapur",
    "CRM for colleges and businesses",
  ],
});

export default function ProductStudioPage() {
  return (
    <>
      <JsonLd data={webPageSchemaFor("/product-studio")} />
      <KzBreadcrumb
        trail={[
          { name: "Home", path: "/" },
          { name: "Product Studio", path: "/product-studio" },
        ]}
      />
      {/* Each product is a real, reachable application; an ItemList of
          SoftwareApplication is how a search engine reads that. */}
      <JsonLd data={productCatalogSchema(products)} />
      <KzProductStudio />
      <KzFaqSection path="/product-studio" />
    </>
  );
}
