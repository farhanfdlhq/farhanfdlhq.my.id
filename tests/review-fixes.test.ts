import { beforeEach, describe, expect, it } from "vitest";
import { freshDataDir } from "./helpers/tmpdata";
import { getDb } from "@/lib/db";
import { createSession, getSessionUser, recordFailure, tooManyAttempts, loginLimited } from "@/lib/sessions";
import { createUser, setPassword } from "@/lib/users";
import { storeCv, makePrimaryCv } from "@/lib/cv";
import { publicCv } from "@/lib/content";

beforeEach(() => { freshDataDir(); });
const pw = () => Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);

describe("batas login", () => {
  it("lima kegagalan dari IP lain tidak mengunci akun pemilik", () => {
    for (let i = 0; i < 5; i++) recordFailure("akun:farhan@contoh.id");
    expect(loginLimited("9.9.9.9", "farhan@contoh.id")).toBe(false);
    for (let i = 0; i < 15; i++) recordFailure("akun:farhan@contoh.id");
    expect(loginLimited("9.9.9.9", "farhan@contoh.id")).toBe(true);
  });

  it("per IP tetap lima", () => {
    for (let i = 0; i < 5; i++) recordFailure("login:1.2.3.4");
    expect(loginLimited("1.2.3.4", "siapa@contoh.id")).toBe(true);
  });
});

describe("ganti password", () => {
  it("mengeluarkan semua sesi lama dan membuka kunci akun", async () => {
    const u = await createUser({ email: "farhan@contoh.id", name: "Farhan", password: pw() });
    const token = createSession(u.id);
    for (let i = 0; i < 20; i++) recordFailure("akun:farhan@contoh.id");
    await setPassword(u.id, pw());
    expect(getSessionUser(token)).toBeNull();
    expect(tooManyAttempts("akun:farhan@contoh.id")).toBe(false);
  });
});

describe("CV publik", () => {
  it("hanya CV utama yang bisa diunduh publik", async () => {
    const pdf = Buffer.from("%PDF-1.4\n%%EOF\n");
    const a = await storeCv(pdf, "CV lama", "id");
    const b = await storeCv(pdf, "CV baru", "id");
    expect(publicCv(a)?.id).toBe(a);
    expect(publicCv(b)).toBeNull();
    makePrimaryCv(b);
    expect(publicCv(a)).toBeNull();
    expect(publicCv(b)?.id).toBe(b);
    expect(getDb().prepare("SELECT COUNT(*) n FROM cvs").get()).toEqual({ n: 2 });
  });
});
