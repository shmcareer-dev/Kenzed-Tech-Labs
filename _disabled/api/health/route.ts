import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Liveness probe. Confirms the app is up *and* that it can reach MySQL —
 * handy when the site loads fine but XAMPP's database has stopped.
 */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const leads = await prisma.lead.count();

    return NextResponse.json({ status: "ok", database: "connected", leads });
  } catch (error) {
    console.error("[health] database unreachable:", error);
    return NextResponse.json(
      { status: "degraded", database: "unreachable" },
      { status: 503 },
    );
  }
}
