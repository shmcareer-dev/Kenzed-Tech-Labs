/**
 * Emits a Schema.org JSON-LD block. Server-rendered so crawlers always see it.
 *
 * Accepts null so a lookup that finds nothing renders nothing rather than
 * forcing every call site to guard. An absent block is the correct outcome
 * there — a JSON-LD script containing `null` is worse than no script, because
 * a consumer parses it, gets nothing, and may distrust the rest of the page.
 */
export function JsonLd({ data }: { data: object | null | undefined }) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
