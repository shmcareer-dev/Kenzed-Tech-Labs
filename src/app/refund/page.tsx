import { KzLegal } from "@/components/kz/screens/KzLegal";
import { JsonLd } from "@/components/ui/JsonLd";
import { refundDoc } from "@/content/legal";
import { breadcrumbSchema, legalPageSchema, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: refundDoc.metaTitle,
  description: refundDoc.metaDescription,
  path: "/refund",
});

export default function RefundPage() {
  return (
    <>
      <JsonLd data={legalPageSchema(refundDoc)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: refundDoc.title, path: "/refund" },
        ])}
      />
      <KzLegal doc={refundDoc} />
    </>
  );
}
