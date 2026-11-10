/** Helper login untuk Next.js: cookie sesi, wajib login, dan IP. */
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSession, deleteSession, getSessionUser, SESSION_DAYS } from "./sessions";
import { ipFromHeaders } from "./ip";
import type { User } from "./users";

export const SESSION_COOKIE = "fdq_session";

export async function currentUser(): Promise<User | null> {
  const jar = await cookies();
  return getSessionUser(jar.get(SESSION_COOKIE)?.value);
}

/** next: halaman admin yang sedang dibuka, supaya setelah masuk langsung kembali ke sana. */
export async function requireAdmin(next?: string): Promise<User> {
  const user = await currentUser();
  if (!user) redirect(next ? `/admin/masuk/?next=${encodeURIComponent(next)}` : "/admin/masuk/");
  return user;
}

export async function startSession(userId: number) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, createSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) deleteSession(token);
  jar.delete(SESSION_COOKIE);
}

export async function clientIp(): Promise<string> {
  return ipFromHeaders(await headers());
}
