import { JsonLd } from "@/components/ui/JsonLd";
import { KzFaqSection } from "@/components/kz/KzFaq";
import { KzHome } from "@/components/kz/screens/KzHome";
import { pageMetadata, webPageSchemaFor } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Kenzed Tech Lab | Agentic AI, ML & Custom Software Development",
  description:
    "Kenzed Tech Lab builds enterprise-grade agentic AI, machine learning & custom software — AI agents, LLM fine-tuning, voice AI & adaptive web apps. Durgapur & Kolkata, delivered worldwide.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={webPageSchemaFor("/")} />
      <KzHome />
      <KzFaqSection path="/" />
    </>
  );
}
