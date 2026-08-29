import { KzBreadcrumb } from "@/components/kz/KzBreadcrumb";
import { notFound } from "next/navigation";

import { KzFaq } from "@/components/kz/KzFaq";
import { KzServiceDetail } from "@/components/kz/screens/KzServiceDetail";
import { JsonLd } from "@/components/ui/JsonLd";
import { serviceFaq } from "@/content/faq";
import { getService, services } from "@/content/services";
import { pageMetadata, serviceSchema, webPageSchema } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return pageMetadata({
    title: service.seo.title,
    description: service.seo.description,
    path: `/services/${service.slug}`,
    keywords: [service.seo.keyword],
  });
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();
  const related = services.filter((item) => item.slug !== service.slug).slice(0, 2);

  return (
    <>
      {/* This page's own node in the graph, so the Service and the FAQ below
          both hang off a document that declares what it is and who published
          it, rather than floating unattached on a shared domain. */}
      <JsonLd
        data={webPageSchema({
          title: service.seo.title,
          description: service.seo.description,
          path: `/services/${service.slug}`,
          breadcrumb: true,
        })}
      />
      <JsonLd
        data={serviceSchema({
          name: service.title,
          description: service.seo.description,
          path: `/services/${service.slug}`,
        })}
      />
      <KzBreadcrumb
        trail={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: service.title, path: `/services/${service.slug}` },
        ]}
      />
      <KzServiceDetail service={service} related={related} />

      {/* Generated from the service's own record rather than written out eight
          times: a service that gains a deliverable gains the answer with it,
          and the two cannot drift. These are the questions a search engine
          actually gets asked about a service page — what it includes, what it
          costs, which tools, how to start. */}
      <section
        aria-labelledby="faq"
        style={{
          padding: "clamp(56px, 8vw, 96px) 0 clamp(64px, 9vw, 104px)",
          background: "var(--bg)",
          borderTop: "1px solid var(--line)",
        }}
      >
        <div className="kz-wrap">
          <KzFaq
            items={serviceFaq(service)}
            title={`${service.title} — questions`}
          />
        </div>
      </section>
    </>
  );
}
