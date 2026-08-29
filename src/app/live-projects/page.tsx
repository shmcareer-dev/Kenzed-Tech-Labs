import { KzBreadcrumb } from "@/components/kz/KzBreadcrumb";
import { KzFaqSection } from "@/components/kz/KzFaq";
import { KzLiveProjects } from "@/components/kz/screens/KzLiveProjects";
import { JsonLd } from "@/components/ui/JsonLd";
import { pageMetadata, webPageSchemaFor } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Live Projects & AI Training in Durgapur | Kenzed Tech Lab",
  description:
    "Apply for agentic AI, machine learning, LLM, voice AI and full-stack training at Kenzed Tech Lab, Durgapur — every programme ends on a live client project, recorded in our public performer register.",
  path: "/live-projects",
  keywords: [
    "AI training and internship in Durgapur",
    "live project training in West Bengal",
    "machine learning industrial training Durgapur",
  ],
});

export default function LiveProjectsPage() {
  return (
    <>
      <JsonLd data={webPageSchemaFor("/live-projects")} />
      <KzBreadcrumb
        trail={[
          { name: "Home", path: "/" },
          { name: "Live projects & training", path: "/live-projects" },
        ]}
      />
      <KzLiveProjects />
      <KzFaqSection path="/live-projects" />
    </>
  );
}
