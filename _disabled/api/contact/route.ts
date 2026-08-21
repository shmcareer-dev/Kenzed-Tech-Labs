import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { fieldErrors, leadSchema } from "@/lib/validation";

/** Prisma needs the Node runtime — it does not run on the edge. */
export const runtime = "nodejs";

/**
 * Naive per-IP rate limit.
 *
 * Good enough to stop a single script hammering the form on one server. If you
 * deploy to more than one instance, move this to Redis or your edge provider's
 * rate limiter — in-memory state is per-process.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);

  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }

  recent.push(now);
  hits.set(ip, recent);

  // Opportunistic cleanup so the map cannot grow without bound.
  if (hits.size > 5_000) {
    for (const [key, times] of hits) {
      if (times.every((time) => now - time >= WINDOW_MS)) hits.delete(key);
    }
  }

  return false;
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: Request) {
  if (isRateLimited(clientIp(request))) {
    return NextResponse.json(
      { message: "Too many submissions. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Please check the highlighted fields.", errors: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  // Honeypot filled in — accept silently so the bot does not learn it failed.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const { name, email, company, service, budget, message } = parsed.data;
  const sourcePath =
    typeof (payload as { sourcePath?: unknown }).sourcePath === "string"
      ? (payload as { sourcePath: string }).sourcePath.slice(0, 255)
      : null;

  try {
    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        company: company || null,
        service,
        budget: budget || null,
        message,
        sourcePath,
        userAgent: request.headers.get("user-agent")?.slice(0, 255) ?? null,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
  } catch (error) {
    // Log server-side; never leak database details to the browser.
    console.error("[contact] failed to save lead:", error);
    return NextResponse.json(
      { message: "We couldn't save your enquiry. Please try again or email us directly." },
      { status: 500 },
    );
  }
}
