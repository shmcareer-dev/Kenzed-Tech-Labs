import { KzBreadcrumb } from "@/components/kz/KzBreadcrumb";
import { KzLegal } from "@/components/kz/screens/KzLegal";
import { JsonLd } from "@/components/ui/JsonLd";
import { refundDoc } from "@/content/legal";
import { legalPageSchema, pageMetadata, webPageSchemaFor } from "@/lib/seo";

export const metadata = pageMetadata({
  title: refundDoc.metaTitle,
  description: refundDoc.metaDescription,
  path: "/refund",
});

export default function RefundPage() {
  return (
    <>
      <JsonLd data={webPageSchemaFor("/refund")} />
      <JsonLd data={legalPageSchema(refundDoc)} />
      <KzBreadcrumb
        trail={[
          { name: "Home", path: "/" },
          { name: refundDoc.title, path: "/refund" },
        ]}
      />
      <KzLegal doc={refundDoc} />
    </>
  );
}
