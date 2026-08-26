import { KzLegal } from "@/components/kz/screens/KzLegal";
import { JsonLd } from "@/components/ui/JsonLd";
import { cookiesDoc } from "@/content/legal";
import { breadcrumbSchema, legalPageSchema, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: cookiesDoc.metaTitle,
  description: cookiesDoc.metaDescription,
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <>
      <JsonLd data={legalPageSchema(cookiesDoc)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: cookiesDoc.title, path: "/cookies" },
        ])}
      />
      <KzLegal doc={cookiesDoc} />
    </>
  );
}
