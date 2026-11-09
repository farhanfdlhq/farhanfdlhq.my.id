import { randomBytes } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import { freshDataDir } from "./helpers/tmpdata";
import { getDb } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/passwords";
import { createSession, getSessionUser, tooManyAttempts, recordFailure } from "@/lib/sessions";
import { ipFromHeaders } from "@/lib/ip";
import { createUser, authenticate } from "@/lib/users";

const pw = () => randomBytes(12).toString("hex");
const hdr = (o: Record<string, string>) => ({ get: (k: string) => o[k.toLowerCase()] ?? null });

describe("password", () => {
  it("cocok untuk password yang sama dan tidak cocok untuk yang lain", async () => {
    const p = pw();
    const h = await hashPassword(p);
    expect(await verifyPassword(p, h)).toBe(true);
    expect(await verifyPassword(pw(), h)).toBe(false);
  });
});

describe("sesi dan batas percobaan", () => {
  beforeEach(() => { freshDataDir(); });

  it("terkunci setelah 5 kegagalan dalam 15 menit, belum setelah 4", () => {
    for (let i = 0; i < 4; i++) recordFailure("login:1.1.1.1");
    expect(tooManyAttempts("login:1.1.1.1")).toBe(false);
    recordFailure("login:1.1.1.1");
    expect(tooManyAttempts("login:1.1.1.1")).toBe(true);
  });

  it("kegagalan lebih dari 15 menit lalu tidak dihitung", () => {
    for (let i = 0; i < 5; i++) recordFailure("login:2.2.2.2");
    getDb().prepare("UPDATE login_attempts SET at = at - ?").run(16 * 60_000);
    expect(tooManyAttempts("login:2.2.2.2")).toBe(false);
  });

  it("sesi yang sudah lewat masa berlakunya tidak berlaku", async () => {
    const u = await createUser({ email: "admin@contoh.id", name: "Admin", password: pw() });
    const token = createSession(u.id);
    expect(getSessionUser(token)?.email).toBe("admin@contoh.id");
    getDb().prepare("UPDATE sessions SET expires_at = ?").run(Date.now() - 1000);
    expect(getSessionUser(token)).toBeNull();
  });

  it("login hanya berhasil dengan password yang benar", async () => {
    const p = pw();
    await createUser({ email: "farhan@contoh.id", name: "Farhan", password: p });
    expect(await authenticate("FARHAN@contoh.id", p)).not.toBeNull();
    expect(await authenticate("farhan@contoh.id", pw())).toBeNull();
  });

  it("password di bawah 10 karakter ditolak", async () => {
    await expect(createUser({ email: "a@b.id", name: "A", password: "pendek" })).rejects.toThrow("minimal 10 karakter");
  });
});

describe("IP pengunjung", () => {
  it("memakai CF-Connecting-IP, bukan X-Forwarded-For yang bisa dipalsukan", () => {
    expect(ipFromHeaders(hdr({ "cf-connecting-ip": "1.1.1.1", "x-forwarded-for": "9.9.9.9" }))).toBe("1.1.1.1");
  });

  it("X-Real-IP dari Nginx sendiri didahulukan dari header Cloudflare yang dikirim langsung", () => {
    expect(ipFromHeaders(hdr({ "x-real-ip": "3.3.3.3", "cf-connecting-ip": "6.6.6.6" }))).toBe("3.3.3.3");
  });
});
