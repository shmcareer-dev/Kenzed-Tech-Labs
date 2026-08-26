import { KzLegal } from "@/components/kz/screens/KzLegal";
import { JsonLd } from "@/components/ui/JsonLd";
import { privacyDoc } from "@/content/legal";
import { breadcrumbSchema, legalPageSchema, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: privacyDoc.metaTitle,
  description: privacyDoc.metaDescription,
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <JsonLd data={legalPageSchema(privacyDoc)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: privacyDoc.title, path: "/privacy" },
        ])}
      />
      <KzLegal doc={privacyDoc} />
    </>
  );
}
