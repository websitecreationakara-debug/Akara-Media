import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const SESSION_COOKIE = "akara_session";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function secret(): string {
  return process.env.SESSION_SECRET || "akara-dev-secret";
}

function sign(exp: number): string {
  return createHmac("sha256", secret()).update(`akara:${exp}`).digest("hex");
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot < 0) return false;
  const expStr = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const expected = sign(exp);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function createSession(): Promise<void> {
  const exp = Date.now() + THIRTY_DAYS_MS;
  const store = await cookies();
  store.set(SESSION_COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS_MS / 1000,
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function isLoggedIn(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export async function requireAuth(): Promise<void> {
  if (!(await isLoggedIn())) redirect("/login");
}
