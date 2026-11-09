import { beforeEach, describe, expect, it } from "vitest";
import { freshDataDir } from "./helpers/tmpdata";
import { seed } from "@/seed/content";
import { deleteListItem, listRows, reorderList, saveListData, saveProfileData } from "@/lib/profile-admin";
import { certifications, experiences, profile, skills } from "@/lib/content";

const good = { name: "Farhan Achmad Fadhillah", role: "Software Engineer", city: "Bogor", email: "a@b.id", github_url: "https://github.com/farhanfdlhq", linkedin_url: "" };

describe("profil", () => {
  beforeEach(() => { freshDataDir(); seed(); });

  it("menolak email yang salah dan LinkedIn tanpa https", () => {
    const r = saveProfileData({ ...good, email: "bukan-email", linkedin_url: "linkedin.com/in/farhan" });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.email).toBe("Format email belum benar.");
      expect(r.errors.linkedin_url).toBe("Isi alamat yang diawali https://.");
    }
  });

  it("nama wajib diisi dan nilai yang benar tersimpan", () => {
    const bad = saveProfileData({ ...good, name: " " });
    expect(bad).toEqual({ ok: false, errors: { name: "Isi nama dulu." } });
    expect(saveProfileData({ ...good, about_en: "Hi.", phone: "0812" })).toEqual({ ok: true });
    expect(profile("id").role).toBe("Software Engineer");
    expect(profile("en").about).toBe("Hi.");
  });
});

describe("daftar riwayat", () => {
  beforeEach(() => { freshDataDir(); seed(); });

  it("urutan pengalaman mengikuti reorderList", () => {
    const ids = experiences("id").map((e) => e.id);
    for (let i = ids.length; i < 3; i++) saveListData("experience", { role_id: `Peran ${i}` });
    const [a, b, c] = experiences("id").map((e) => e.id);
    reorderList("experience", [c, a, b]);
    expect(experiences("id").map((e) => e.id).slice(0, 3)).toEqual([c, a, b]);
  });

  it("menambah, mengubah, dan menghapus item; isian wajib diperiksa", () => {
    expect(saveListData("certification", { name: "" })).toEqual({ ok: false, errors: { name: "Isi nama sertifikasi dulu." } });
    const r = saveListData("certification", { name: "AWS Cloud Practitioner", issuer: "AWS" });
    expect(r.ok).toBe(true);
    const id = r.ok ? r.id! : 0;
    saveListData("certification", { id: String(id), name: "AWS CCP", issuer: "Amazon" });
    expect(certifications().find((c) => c.id === id)).toMatchObject({ name: "AWS CCP", issuer: "Amazon" });
    deleteListItem("certification", id);
    expect(certifications().some((c) => c.id === id)).toBe(false);
    expect(saveListData("skill", { group_id: "Frontend", items: "React, Next.js" }).ok).toBe(true);
    expect(skills("en").at(-1)).toMatchObject({ group: "Frontend", items: "React, Next.js" });
    expect(saveListData("education", { school: "Universitas", year_end: "20x6" })).toEqual({ ok: false, errors: { year_end: "Isi tahun empat angka, misalnya 2026." } });
    expect(listRows("education").length).toBeGreaterThan(0);
  });
});
