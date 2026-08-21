import { timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

export const ADMIN_COOKIE = "kenzed_admin";

/** Constant-time comparison so the token can't be guessed by timing the response. */
export function tokenMatches(candidate: string): boolean {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return false;

  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);

  // timingSafeEqual throws on length mismatch, so check that separately.
  return a.length === b.length && timingSafeEqual(a, b);
}

/** True when the current request carries a valid admin cookie. */
export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  const value = store.get(ADMIN_COOKIE)?.value;
  return typeof value === "string" && tokenMatches(value);
}
