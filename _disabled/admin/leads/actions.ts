"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { LeadStatus } from "@/generated/prisma/enums";
import { ADMIN_COOKIE, isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

/**
 * Move a lead through the pipeline. Called from the inbox's status dropdown.
 * Re-checks the admin session because server actions are reachable directly.
 */
export async function updateLeadStatus(formData: FormData) {
  if (!(await isAdmin())) {
    throw new Error("Not authorised");
  }

  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));

  if (!Number.isInteger(id) || !(status in LeadStatus)) {
    throw new Error("Invalid input");
  }

  await prisma.lead.update({
    where: { id },
    data: { status: status as LeadStatus },
  });

  revalidatePath("/admin/leads");
}

/** Clear the admin cookie and drop back to the password gate. */
export async function signOut() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/admin/leads");
}
