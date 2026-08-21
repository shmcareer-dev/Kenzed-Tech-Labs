import Link from "next/link";

import { signOut, updateLeadStatus } from "@/app/admin/leads/actions";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { LeadStatus } from "@/generated/prisma/enums";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
/** Always read fresh — an inbox showing cached leads is worse than useless. */
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Lead inbox | Kenzed Tech Lab",
  robots: { index: false, follow: false },
};

const STATUS_STYLES: Record<string, string> = {
  NEW: "border-accent/40 bg-accent/10 text-accent",
  CONTACTED: "border-accent2/40 bg-accent2/10 text-accent2",
  QUALIFIED: "border-accent3/40 bg-accent3/10 text-accent3",
  ARCHIVED: "border-line2 bg-surface text-dim",
};

export default async function LeadsPage() {
  if (!(await isAdmin())) {
    return (
      <div className="wrap flex min-h-screen items-center justify-center py-32">
        <div className="w-full">
          <h1 className="mb-6 text-center text-[1.6rem] font-bold">Lead inbox</h1>
          <AdminLogin />
        </div>
      </div>
    );
  }

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const newCount = leads.filter((lead) => lead.status === "NEW").length;

  return (
    <div className="wrap pt-[130px] pb-24">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">Internal</span>
          <h1 className="mt-3 text-[2rem] font-bold">Lead inbox</h1>
          <p className="mt-2 text-muted">
            {leads.length} enquir{leads.length === 1 ? "y" : "ies"}
            {newCount > 0 && <> · {newCount} new</>}
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/" className="btn btn-ghost">
            Back to site
          </Link>
          <form action={signOut}>
            <button type="submit" className="btn btn-ghost">
              Sign out
            </button>
          </form>
        </div>
      </header>

      {leads.length === 0 ? (
        <p className="rounded-2xl border border-line bg-surface p-10 text-center text-muted">
          No enquiries yet. Submit the contact form and it will appear here.
        </p>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <article key={lead.id} className="rounded-2xl border border-line bg-surface p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-[1.1rem] font-semibold">
                    {lead.name}
                    {lead.company && <span className="text-muted"> · {lead.company}</span>}
                  </h2>
                  <p className="mt-1 text-[0.9rem] text-muted">
                    <a href={`mailto:${lead.email}`} className="hover:text-accent">
                      {lead.email}
                    </a>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full border px-3 py-1 text-[0.72rem] font-semibold tracking-wide ${
                      STATUS_STYLES[lead.status] ?? STATUS_STYLES.ARCHIVED
                    }`}
                  >
                    {lead.status}
                  </span>
                  <time
                    dateTime={lead.createdAt.toISOString()}
                    className="text-[0.8rem] text-dim"
                  >
                    {lead.createdAt.toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </time>
                </div>
              </div>

              <dl className="mt-4 grid gap-3 text-[0.88rem] sm:grid-cols-3">
                <div>
                  <dt className="text-dim">Service</dt>
                  <dd className="text-muted">{lead.service}</dd>
                </div>
                <div>
                  <dt className="text-dim">Budget</dt>
                  <dd className="text-muted">{lead.budget ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-dim">Submitted from</dt>
                  <dd className="text-muted">{lead.sourcePath ?? "—"}</dd>
                </div>
              </dl>

              <p className="mt-4 rounded-xl border border-line bg-black/20 p-4 text-[0.92rem] whitespace-pre-wrap text-muted">
                {lead.message}
              </p>

              <form action={updateLeadStatus} className="mt-4 flex items-center gap-3">
                <input type="hidden" name="id" value={lead.id} />
                <label htmlFor={`status-${lead.id}`} className="text-[0.82rem] text-dim">
                  Status
                </label>
                <select
                  id={`status-${lead.id}`}
                  name="status"
                  defaultValue={lead.status}
                  className="field-input !w-auto !py-2"
                >
                  {Object.keys(LeadStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <button type="submit" className="btn btn-ghost !py-2">
                  Save
                </button>
              </form>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
