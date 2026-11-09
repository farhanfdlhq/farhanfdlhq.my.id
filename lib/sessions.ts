/** Sesi login: token acak di cookie, hanya hash-nya yang disimpan di database. Ditambah batas percobaan login. */
import { createHash, randomBytes } from "node:crypto";
import { getDb } from "./db";
import type { User } from "./users";

export const SESSION_DAYS = 30;
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60_000;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export function createSession(userId: number): string {
  const token = randomBytes(32).toString("base64url");
  getDb().prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").run(hashToken(token), userId, Date.now() + SESSION_DAYS * 86400_000);
  return token;
}

export function getSessionUser(token: string | undefined | null): User | null {
  if (!token) return null;
  const row = getDb()
    .prepare("SELECT u.id, u.email, u.name, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?")
    .get(hashToken(token)) as (User & { expires_at: number }) | undefined;
  if (!row) return null;
  if (row.expires_at < Date.now()) {
    deleteSession(token);
    return null;
  }
  return { id: row.id, email: row.email, name: row.name };
}

export function deleteSession(token: string) {
  getDb().prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
}

export function tooManyAttempts(key: string, max = MAX_ATTEMPTS): boolean {
  const db = getDb();
  const since = Date.now() - WINDOW_MS;
  db.prepare("DELETE FROM login_attempts WHERE at < ?").run(since);
  const n = (db.prepare("SELECT COUNT(*) AS n FROM login_attempts WHERE key = ? AND at >= ?").get(key, since) as { n: number }).n;
  return n >= max;
}

/**
 * Batas per IP 5, batas per akun 20. Email admin tampil di situs, jadi batas per akun yang sama ketatnya
 * membuat siapa pun bisa mengunci pemilik akun dari IP mana saja.
 */
export const ACCOUNT_MAX_ATTEMPTS = 20;
export function loginLimited(ip: string, email: string): boolean {
  return tooManyAttempts(`login:${ip}`) || tooManyAttempts(`akun:${email}`, ACCOUNT_MAX_ATTEMPTS);
}

export function recordFailure(key: string) {
  getDb().prepare("INSERT INTO login_attempts (key, at) VALUES (?, ?)").run(key, Date.now());
}

export function clearFailures(key: string) {
  getDb().prepare("DELETE FROM login_attempts WHERE key = ?").run(key);
}
