import { beforeEach, describe, expect, it } from "vitest";
import { freshDataDir } from "./helpers/tmpdata";
import { seed } from "@/seed/content";
import { slugify, uniqueSlug } from "@/lib/slug";
import { deleteProjectById, missingEn, moveProject, saveProjectData } from "@/lib/projects-admin";
import { projectBySlug, publishedProjects } from "@/lib/content";

const base = { title: "Billing Hub", summary_id: "Sistem billing ISP.", summary_en: "", status: "draft" };

describe("slug", () => {
  it("membuat slug ASCII dari judul", () => {
    expect(slugify("Elenmor (Andiamo)")).toBe("elenmor-andiamo");
    expect(slugify("  Café   Ünïcode! ")).toBe("cafe-unicode");
    expect(slugify("!!!")).toBe("proyek");
  });
});

describe("admin proyek", () => {
  beforeEach(() => { freshDataDir(); seed(); });

  it("slug yang sudah dipakai diberi akhiran angka", () => {
    expect(uniqueSlug("agendain")).toBe("agendain-2");
    expect(uniqueSlug("baru")).toBe("baru");
  });

  it("judul wajib diisi", () => {
    const r = saveProjectData({ ...base, title: "  " });
    expect(r).toEqual({ ok: false, errors: { title: "Isi judul proyek dulu." } });
  });

  it("link harus diawali http atau https", () => {
    const r = saveProjectData({ ...base, live_url: "javascript:alert(1)" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.live_url).toBe("Isi alamat yang diawali https://.");
  });

  it("tahun di luar akal ditolak", () => {
    const r = saveProjectData({ ...base, year: "20266" });
    expect(r.ok).toBe(false);
  });

  it("menyimpan proyek baru sebagai draf dan menandai isian EN yang kosong", () => {
    const r = saveProjectData(base);
    expect(r.ok).toBe(true);
    const p = projectBySlug("billing-hub", { includeDraft: true })!;
    expect(p.status).toBe("draft");
    expect(projectBySlug("billing-hub")).toBeNull();
    expect(missingEn(p)).toEqual(["summary"]);
  });

  it("mengubah proyek yang sudah ada tanpa mengganti slug-nya", () => {
    const id = projectBySlug("qiran")!.id;
    expect(saveProjectData({ id: String(id), title: "qiran.my.id baru", summary_id: "x", status: "published" }).ok).toBe(true);
    expect(projectBySlug("qiran")?.title).toBe("qiran.my.id baru");
  });

  it("memindahkan urutan dan menghapus proyek", () => {
    const bynana = projectBySlug("bynana")!.id;
    moveProject(bynana, -1);
    expect(publishedProjects().map((p) => p.slug)).toEqual(["agendain", "bynana", "qiran", "elenmor"]);
    deleteProjectById(bynana);
    expect(publishedProjects().map((p) => p.slug)).toEqual(["agendain", "qiran", "elenmor"]);
  });
});
