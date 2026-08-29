import type { Metadata } from "next";
import Link from "next/link";

/**
 * The export shipped TWO robots tags: Next adds `noindex` for the not-found
 * route, and the root layout's `index, follow` landed alongside it. Two
 * conflicting directives on one page is ambiguous — the restrictive one
 * usually wins, but "usually" is not a thing to rely on for the only page on
 * the site that must never be indexed. Declaring it here replaces the
 * inherited value rather than adding to it.
 */
export const metadata: Metadata = {
  title: "Page not found | Kenzed Tech Lab",
  robots: { index: false, follow: true },
};


export default function NotFound() {
  return (
    <div className="kz-wrap flex min-h-[70vh] flex-col items-center justify-center py-32 text-center">
      <p className="kz-grad-text font-[family-name:var(--font-display)] text-[5rem] leading-none font-bold">
        404
      </p>
      <h1 className="mt-4 text-[1.8rem] font-bold">This page doesn&apos;t exist</h1>
      <p className="mt-3 max-w-[46ch] text-mut">
        The link may be out of date. Try our services, or get in touch and we&apos;ll point you the
        right way.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3.5">
        <Link href="/" className="kz-btn kz-btn-primary">
          Back to home
        </Link>
        <Link href="/services" className="kz-btn kz-btn-ghost">
          Browse services
        </Link>
      </div>
    </div>
  );
}
