import { KzBreadcrumb } from "@/components/kz/KzBreadcrumb";
import { KzFaqSection } from "@/components/kz/KzFaq";
import { KzTeam } from "@/components/kz/screens/KzTeam";
import { JsonLd } from "@/components/ui/JsonLd";
import { pageMetadata, webPageSchemaFor } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Our Team | Kenzed Tech Lab — AI, Engineering & Design Experts",
  description:
    "A 25-strong multidisciplinary team — AI/ML engineers, UI/UX designers, QA testers, PR, studio & hardware specialists — taking products from concept to production under one roof.",
  path: "/team",
  keywords: ["AI and software engineering team"],
});

export default function TeamPage() {
  return (
    <>
      <JsonLd data={webPageSchemaFor("/team")} />
      <KzBreadcrumb
        trail={[
          { name: "Home", path: "/" },
          { name: "Team", path: "/team" },
        ]}
      />
      <KzTeam />
      <KzFaqSection path="/team" />
    </>
  );
}
