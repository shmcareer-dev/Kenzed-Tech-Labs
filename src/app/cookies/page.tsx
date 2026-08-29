import { KzBreadcrumb } from "@/components/kz/KzBreadcrumb";
import { KzLegal } from "@/components/kz/screens/KzLegal";
import { JsonLd } from "@/components/ui/JsonLd";
import { cookiesDoc } from "@/content/legal";
import { legalPageSchema, pageMetadata, webPageSchemaFor } from "@/lib/seo";

export const metadata = pageMetadata({
  title: cookiesDoc.metaTitle,
  description: cookiesDoc.metaDescription,
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <>
      <JsonLd data={webPageSchemaFor("/cookies")} />
      <JsonLd data={legalPageSchema(cookiesDoc)} />
      <KzBreadcrumb
        trail={[
          { name: "Home", path: "/" },
          { name: cookiesDoc.title, path: "/cookies" },
        ]}
      />
      <KzLegal doc={cookiesDoc} />
    </>
  );
}
