/** Akun admin. Situs ini hanya punya satu peran: admin. */
import { getDb } from "./db";
import { hashPassword, verifyPassword } from "./passwords";

export type User = { id: number; email: string; name: string };
export const MIN_PASSWORD = 10;

export async function createUser(input: { email: string; name: string; password: string }): Promise<User> {
  if (input.password.length < MIN_PASSWORD) throw new Error(`Password minimal ${MIN_PASSWORD} karakter.`);
  const email = input.email.trim().toLowerCase();
  const info = getDb().prepare("INSERT INTO users (email, name, password_hash, created_at) VALUES (?, ?, ?, ?)")
    .run(email, input.name.trim(), await hashPassword(input.password), Date.now());
  return { id: Number(info.lastInsertRowid), email, name: input.name.trim() };
}

export async function setPassword(userId: number, password: string): Promise<void> {
  if (password.length < MIN_PASSWORD) throw new Error(`Password minimal ${MIN_PASSWORD} karakter.`);
  const db = getDb();
  const hash = await hashPassword(password);
  const row = db.prepare("SELECT email FROM users WHERE id = ?").get(userId) as { email: string } | undefined;
  // Ganti password biasanya karena curiga bocor: semua sesi lama dikeluarkan dan kunci percobaan login dibuka
  db.transaction(() => {
    db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hash, userId);
    db.prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
    if (row) db.prepare("DELETE FROM login_attempts WHERE key = ?").run(`akun:${row.email}`);
  })();
}

export async function authenticate(email: string, password: string): Promise<User | null> {
  const row = getDb().prepare("SELECT id, email, name, password_hash FROM users WHERE email = ?").get(email.trim().toLowerCase()) as
    (User & { password_hash: string }) | undefined;
  // Tetap menghitung hash walau email tidak ada, supaya lama respons tidak membocorkan email yang terdaftar
  const ok = await verifyPassword(password, row?.password_hash ?? "scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA==$AA==");
  return row && ok ? { id: row.id, email: row.email, name: row.name } : null;
}

export function listUsers(): User[] {
  return getDb().prepare("SELECT id, email, name FROM users ORDER BY id").all() as User[];
}
