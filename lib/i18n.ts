/** Teks tetap antarmuka dalam dua bahasa. Teks yang bisa diubah pemilik ada di database, bukan di sini. */
import type { Lang } from "./lang";
export type { Lang } from "./lang";

const id = {
  nav_projects: "Proyek",
  nav_about: "Tentang",
  nav_contact: "Kontak",
  lang_group: "Bahasa",
  see_projects: "Lihat proyek",
  download_cv: "Unduh CV (PDF)",
  email: "Email",
  projects: "Proyek",
  all_projects: "Semua proyek",
  about: "Tentang",
  experience: "Pengalaman",
  education: "Pendidikan",
  certifications: "Sertifikasi",
  skills: "Keahlian",
  contact: "Kontak",
  contact_lead: "Paling cepat lewat email.",
  copy: "Salin",
  copied: "Tersalin",
  k_role: "Peran",
  k_when: "Waktu",
  k_stack: "Stack",
  k_status: "Status",
  live: "Live",
  repo: "repo",
  back: "← Semua proyek",
  prev: "Sebelumnya",
  next: "Berikutnya",
  filter_all: "Semua",
  filter_label: "Saring per teknologi",
  no_projects: "Belum ada proyek dengan teknologi ini.",
  context: "Konteks",
  problem: "Masalah",
  approach: "Yang saya kerjakan",
  result: "Hasil",
  gallery: "Tangkapan layar",
  peek_on: "Sembunyikan isi untuk melihat animasi",
  peek_off: "Tampilkan isi",
  peek_hint: "Scroll untuk membongkar. Ketuk ikon mata untuk kembali.",
  not_found_title: "Halaman tidak ditemukan",
  not_found_text: "Alamat ini tidak ada atau proyeknya belum diterbitkan.",
  home: "Beranda",
  footer_copy: "©",
};

export type UiKey = keyof typeof id;

const en: Record<UiKey, string> = {
  nav_projects: "Projects",
  nav_about: "About",
  nav_contact: "Contact",
  lang_group: "Language",
  see_projects: "See projects",
  download_cv: "Download CV (PDF)",
  email: "Email",
  projects: "Projects",
  all_projects: "All projects",
  about: "About",
  experience: "Experience",
  education: "Education",
  certifications: "Certifications",
  skills: "Skills",
  contact: "Contact",
  contact_lead: "Email is the fastest way to reach me.",
  copy: "Copy",
  copied: "Copied",
  k_role: "Role",
  k_when: "When",
  k_stack: "Stack",
  k_status: "Status",
  live: "Live",
  repo: "repo",
  back: "← All projects",
  prev: "Previous",
  next: "Next",
  filter_all: "All",
  filter_label: "Filter by technology",
  no_projects: "No projects with this technology yet.",
  context: "Context",
  problem: "Problem",
  approach: "What I built",
  result: "Result",
  gallery: "Screenshots",
  peek_on: "Hide content to watch the animation",
  peek_off: "Show content",
  peek_hint: "Scroll to take it apart. Tap the eye icon to come back.",
  not_found_title: "Page not found",
  not_found_text: "This address doesn't exist, or the project isn't published yet.",
  home: "Home",
  footer_copy: "©",
};

export const UI: Record<Lang, Record<UiKey, string>> = { id, en };

export function t(lang: Lang, key: UiKey): string {
  return UI[lang][key];
}

/** Ambil kolom dua bahasa. EN yang kosong atau berisi spasi saja kembali ke ID, dan ditandai fallback. */
export function pick(row: object, field: string, lang: Lang): { text: string; fallback: boolean } {
  const r = row as Record<string, unknown>;
  const idText = String(r[`${field}_id`] ?? "");
  if (lang === "id") return { text: idText, fallback: false };
  const enText = String(r[`${field}_en`] ?? "");
  return enText.trim() ? { text: enText, fallback: false } : { text: idText, fallback: true };
}
