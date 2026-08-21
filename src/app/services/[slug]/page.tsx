import { notFound } from "next/navigation";

import { KzServiceDetail } from "@/components/kz/screens/KzServiceDetail";
import { JsonLd } from "@/components/ui/JsonLd";
import { getService, services } from "@/content/services";
import { breadcrumbSchema, pageMetadata, serviceSchema } from "@/lib/seo";

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
      <JsonLd
        data={serviceSchema({
          name: service.title,
          description: service.seo.description,
          path: `/services/${service.slug}`,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: service.title, path: `/services/${service.slug}` },
        ])}
      />
      <KzServiceDetail service={service} related={related} />
    </>
  );
}
