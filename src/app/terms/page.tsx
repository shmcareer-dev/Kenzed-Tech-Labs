import { KzBreadcrumb } from "@/components/kz/KzBreadcrumb";
import { KzLegal } from "@/components/kz/screens/KzLegal";
import { JsonLd } from "@/components/ui/JsonLd";
import { termsDoc } from "@/content/legal";
import { legalPageSchema, pageMetadata, webPageSchemaFor } from "@/lib/seo";

export const metadata = pageMetadata({
  title: termsDoc.metaTitle,
  description: termsDoc.metaDescription,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <JsonLd data={webPageSchemaFor("/terms")} />
      <JsonLd data={legalPageSchema(termsDoc)} />
      <KzBreadcrumb
        trail={[
          { name: "Home", path: "/" },
          { name: termsDoc.title, path: "/terms" },
        ]}
      />
      <KzLegal doc={termsDoc} />
    </>
  );
}
