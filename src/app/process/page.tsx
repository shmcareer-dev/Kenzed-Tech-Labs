import { KzFaqSection } from "@/components/kz/KzFaq";
import { KzProcess } from "@/components/kz/screens/KzProcess";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Our Process | How Kenzed Tech Lab Delivers AI Projects",
  description:
    "From discovery to deployment and beyond — Kenzed Tech Lab's agile, production-first process for delivering reliable AI, ML & software solutions.",
  path: "/process",
  keywords: ["AI software development process"],
});

export default function ProcessPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Process", path: "/process" },
        ])}
      />
      <KzProcess />
      <KzFaqSection path="/process" />
    </>
  );
}
