import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap flex min-h-[70vh] flex-col items-center justify-center py-32 text-center">
      <p className="grad-text font-[family-name:var(--font-display)] text-[5rem] leading-none font-bold">
        404
      </p>
      <h1 className="mt-4 text-[1.8rem] font-bold">This page doesn&apos;t exist</h1>
      <p className="mt-3 max-w-[46ch] text-mut">
        The link may be out of date. Try our services, or get in touch and we&apos;ll point you the
        right way.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3.5">
        <Link href="/" className="btn btn-primary">
          Back to home
        </Link>
        <Link href="/services" className="btn btn-ghost">
          Browse services
        </Link>
      </div>
    </div>
  );
}
