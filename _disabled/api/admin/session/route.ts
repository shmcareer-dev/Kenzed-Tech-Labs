import { NextResponse } from "next/server";

import { ADMIN_COOKIE, tokenMatches } from "@/lib/admin";

export const runtime = "nodejs";

/**
 * Minimal shared-password gate for the lead inbox.
 *
 * This is deliberately simple — one shared secret from ADMIN_TOKEN. If more
 * than a couple of people need access, replace it with real user accounts
 * (NextAuth/Auth.js) rather than handing the password around.
 */
export async function POST(request: Request) {
  const { password } = await request.json().catch(() => ({ password: "" }));

  if (typeof password !== "string" || !tokenMatches(password)) {
    return NextResponse.json({ message: "Incorrect password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set(ADMIN_COOKIE, password, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // one working day
  });

  return response;
}

/** Sign out. */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(ADMIN_COOKIE);
  return response;
}
