import { KzLegal } from "@/components/kz/screens/KzLegal";
import { JsonLd } from "@/components/ui/JsonLd";
import { termsDoc } from "@/content/legal";
import { breadcrumbSchema, legalPageSchema, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: termsDoc.metaTitle,
  description: termsDoc.metaDescription,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <JsonLd data={legalPageSchema(termsDoc)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: termsDoc.title, path: "/terms" },
        ])}
      />
      <KzLegal doc={termsDoc} />
    </>
  );
}
