import { KzBreadcrumb } from "@/components/kz/KzBreadcrumb";
import { KzLegal } from "@/components/kz/screens/KzLegal";
import { JsonLd } from "@/components/ui/JsonLd";
import { privacyDoc } from "@/content/legal";
import { legalPageSchema, pageMetadata, webPageSchemaFor } from "@/lib/seo";

export const metadata = pageMetadata({
  title: privacyDoc.metaTitle,
  description: privacyDoc.metaDescription,
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <JsonLd data={webPageSchemaFor("/privacy")} />
      <JsonLd data={legalPageSchema(privacyDoc)} />
      <KzBreadcrumb
        trail={[
          { name: "Home", path: "/" },
          { name: privacyDoc.title, path: "/privacy" },
        ]}
      />
      <KzLegal doc={privacyDoc} />
    </>
  );
}
