import { KzFaqSection } from "@/components/kz/KzFaq";
import { KzContact } from "@/components/kz/screens/KzContact";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact Kenzed Tech Lab | AI & Software Company, Durgapur & Kolkata",
  description:
    "Talk to Kenzed Tech Lab about your AI, ML, or software project. Development HQ in Durgapur, corporate presence in Kolkata — delivering to clients worldwide.",
  path: "/contact",
  keywords: ["contact AI development company Durgapur Kolkata"],
});

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <KzContact />
      <KzFaqSection path="/contact" />
    </>
  );
}
