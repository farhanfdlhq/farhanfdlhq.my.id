/** Data awal dari CV Farhan (Oktober 2026) dan mockup v9.4. Aman dijalankan berulang: baris yang sudah ada dilewati. */
import { getDb } from "@/lib/db";

type Bi = [id: string, en: string];

const PROJECTS: {
  slug: string; title: string; summary: Bi; role: Bi; period: Bi; context?: Bi; approach?: Bi;
  stack: string; year: number | null; live_url: string; repo_url: string; image: string;
}[] = [
  {
    slug: "agendain",
    title: "Agendain",
    summary: ["Website travel agency dan panel admin untuk mengelola trip, booking, dan invoice.", "A travel agency website with an admin panel for trips, bookings, and invoices."],
    role: ["Full-Stack Developer (remote)", "Full-Stack Developer (remote)"],
    period: ["Mei 2026 – sekarang", "May 2026 – present"],
    context: [
      "Saya membangun website dan panel admin ini sendirian: merancang database, menulis kode, dan merilisnya ke server.",
      "I built this website and its admin panel on my own: designed the database, wrote the code, and shipped it to the server.",
    ],
    approach: [
      [
        "CMS dwibahasa. 7 halaman publik dalam bahasa Indonesia dan Inggris, dengan modul open trip, private trip, destinasi, dan blog yang dikelola admin.",
        "Booking tanpa overbooking. Validasi kuota dan penguncian data saat pemesanan. Invoice dan itinerary PDF dibagikan ke pelanggan lewat tautan bertoken.",
        "Hak akses. RBAC dengan role custom dan audit log. Menutup 7 temuan audit keamanan, termasuk eskalasi role dan pencabutan sesi login.",
        "SEO dan performa. Sitemap gambar, RSS, dan JSON-LD. Layout shift dihilangkan dan tampilan awal di HP dipercepat.",
        "Deploy. VPS dengan reverse proxy dan CDN, plus skrip deploy yang tidak menyentuh data production.",
      ].join("\n"),
      [
        "Bilingual CMS. 7 public pages in Indonesian and English, with open trip, private trip, destination, and blog modules managed by admins.",
        "Booking without overbooking. Quota checks and row locking at checkout. Invoices and itinerary PDFs reach customers through token links.",
        "Access control. RBAC with custom roles and an audit log. Closed 7 security audit findings, including role escalation and session revocation.",
        "SEO and performance. Image sitemap, RSS, and JSON-LD. Removed layout shift and sped up first paint on phones.",
        "Deployment. A VPS behind a reverse proxy and CDN, with a deploy script that never touches production data.",
      ].join("\n"),
    ],
    stack: "Next.js, TypeScript, Prisma, MySQL, Tailwind, Nginx, Cloudflare",
    year: 2026,
    live_url: "https://agendain.com",
    repo_url: "",
    image: "agendain",
  },
  {
    slug: "qiran",
    title: "qiran.my.id",
    summary: ["Blog keluarga dengan editor sendiri dan pembuat PDF A4 dua kolom untuk tugas sekolah dan lomba.", "A family blog with its own editor and an A4 two-column PDF maker for school assignments and competitions."],
    role: ["Dikerjakan sendiri", "Solo project"],
    period: ["2026", "2026"],
    stack: "Next.js, SQLite, Chromium",
    year: 2026,
    live_url: "https://qiran.my.id",
    repo_url: "https://github.com/farhanfdlhq/qiran-blog",
    image: "qiran",
  },
  {
    slug: "bynana",
    title: "bynana.my.id",
    summary: ["Halaman link affiliate: pengikut mencari produk lewat nomor yang disebut di video.", "An affiliate link page: followers find products by the number mentioned in each video."],
    role: ["Dikerjakan sendiri", "Solo project"],
    period: ["2026", "2026"],
    stack: "SvelteKit, SQLite",
    year: 2026,
    live_url: "https://bynana.my.id",
    repo_url: "https://github.com/farhanfdlhq/bynana",
    image: "bynana",
  },
  {
    slug: "elenmor",
    title: "Elenmor (Andiamo)",
    summary: ["Antarmuka dan frontend e-commerce jastip lintas negara untuk mengelola batch pesanan internasional.", "Interface and frontend for a cross-border personal shopping store that manages international order batches."],
    role: ["UI/UX & Frontend", "UI/UX & Frontend"],
    period: ["", ""],
    stack: "React, TypeScript, Vite, Tailwind",
    year: null,
    live_url: "https://elenmor.id",
    repo_url: "",
    image: "elenmor",
  },
];

const EXPERIENCES: { role: Bi; org: string; period: Bi }[] = [
  { role: ["Full-Stack Developer (remote)", "Full-Stack Developer (remote)"], org: "agendain.com", period: ["Mei 2026 – sekarang", "May 2026 – present"] },
  { role: ["Software Engineer, LMS e-Learning", "Software Engineer, e-Learning LMS"], org: "BPKP Pusdiklat Bogor", period: ["Jul – Agu 2026", "Jul – Aug 2026"] },
  { role: ["Freelance Software Engineer", "Freelance Software Engineer"], org: "", period: ["Agu 2023 – sekarang", "Aug 2023 – present"] },
  { role: ["Software Engineer Intern", "Software Engineer Intern"], org: "PT Teknologi Cipta Aplikasi Nusantara (TECANUSA)", period: ["Feb – Jun 2025", "Feb – Jun 2025"] },
  { role: ["Jr. Software Engineer", "Jr. Software Engineer"], org: "BPKP Pusdiklat Bogor", period: ["Mei – Jul 2024", "May – Jul 2024"] },
  { role: ["Barista", "Barista"], org: "Headbar", period: ["2020 – 2023", "2020 – 2023"] },
];

const EDUCATION: { school: string; degree: Bi; detail: Bi; year_end: number }[] = [
  {
    school: "Universitas Binaniaga Indonesia, Bogor",
    degree: ["S1 Sistem Informasi (S.Kom)", "Bachelor of Information Systems (S.Kom)"],
    detail: ["IPK 3,69. Skripsi: K-Means untuk segmentasi peserta pelatihan di lingkungan pemerintah.", "GPA 3.69. Thesis: K-Means clustering to segment participants of government training programs."],
    year_end: 2026,
  },
  {
    school: "SMK Nusa Widya Mandiri, Bogor",
    degree: ["Teknik Komputer dan Jaringan (TKJ)", "Computer and Network Engineering (TKJ)"],
    detail: ["", ""],
    year_end: 2020,
  },
];

const CERTIFICATIONS: { name: string; issuer: string }[] = [
  { name: "CCNA: Introduction to Networks", issuer: "Cisco" },
  { name: "UI/UX & Full-Stack Development", issuer: "BuildWithAngga" },
  { name: "Python & Data Structure", issuer: "CodingStudio" },
];

const SKILLS: { group: Bi; items: string }[] = [
  { group: ["Backend", "Backend"], items: "Laravel, PHP, Go, REST API, MySQL" },
  { group: ["Frontend", "Frontend"], items: "React, Next.js, TypeScript, Tailwind" },
  { group: ["Mobile & lainnya", "Mobile & more"], items: "Flutter, React Native, UI/UX prototyping, Nginx" },
];

const SETTINGS: Record<string, string> = {
  name: "Farhan Achmad Fadhillah",
  role: "UI/UX | Software Engineer",
  city: "Bogor",
  email: "fadilahfarhan80@gmail.com",
  github_url: "https://github.com/farhanfdlhq",
  linkedin_url: "",
  hero_line_id: "Scroll untuk membongkar komputer di meja ini: setiap komponennya membuka satu bagian dari pekerjaan saya.",
  hero_line_en: "Scroll to take apart the computer on this desk: each component opens one part of my work.",
  about_id: "Saya software engineer di Bogor, lulusan Sistem Informasi tahun 2026. Sejak 2023 saya mengerjakan proyek freelance: sistem billing ISP, e-commerce jastip lintas negara, LMS untuk BPKP, dan website travel agency Agendain. Sehari-hari saya memakai Laravel dan React/Next.js, dan saya juga merancang tampilannya di Figma sebelum menulis kode.",
  about_en: "I'm a software engineer in Bogor, Indonesia, with a 2026 degree in Information Systems. Since 2023 I've taken freelance projects: an ISP billing system, a cross-border personal shopping store, an LMS for BPKP, and the Agendain travel agency site. I work mostly in Laravel and React/Next.js, and I design the screens in Figma before I write the code.",
  seo_title_id: "Farhan Achmad Fadhillah · UI/UX | Software Engineer",
  seo_title_en: "Farhan Achmad Fadhillah · UI/UX | Software Engineer",
  seo_desc_id: "Portofolio Farhan Achmad Fadhillah, software engineer di Bogor: proyek web, CV, dan kontak.",
  seo_desc_en: "Portfolio of Farhan Achmad Fadhillah, a software engineer in Bogor, Indonesia: web projects, CV, and contact.",
};

/** Mengisi data awal. Gambar hero proyek diharapkan ada di /uploads/seed/<nama>.webp (disalin oleh scripts/seed.ts). */
export function seed(): void {
  const db = getDb();
  const now = Date.now();
  db.transaction(() => {
    const insP = db.prepare(`INSERT OR IGNORE INTO projects
      (slug, title, summary_id, summary_en, role_id, role_en, period_id, period_en, context_id, context_en, approach_id, approach_en,
       stack, year, live_url, repo_url, hero_image, featured, status, sort, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'published', ?, ?, ?)`);
    PROJECTS.forEach((p, i) => insP.run(p.slug, p.title, ...p.summary, ...p.role, ...p.period, ...(p.context ?? ["", ""]), ...(p.approach ?? ["", ""]),
      p.stack, p.year, p.live_url, p.repo_url, `/uploads/seed/${p.image}.webp`, i, now, now));

    const has = (sql: string, ...args: unknown[]) => !!db.prepare(sql).get(...args);
    EXPERIENCES.forEach((e, i) => {
      if (!has("SELECT 1 FROM experiences WHERE role_id = ? AND org = ? AND period_id = ?", e.role[0], e.org, e.period[0]))
        db.prepare("INSERT INTO experiences (role_id, role_en, org, period_id, period_en, sort) VALUES (?, ?, ?, ?, ?, ?)").run(...e.role, e.org, ...e.period, i);
    });
    EDUCATION.forEach((e, i) => {
      if (!has("SELECT 1 FROM education WHERE school = ?", e.school))
        db.prepare("INSERT INTO education (school, degree_id, degree_en, detail_id, detail_en, year_end, sort) VALUES (?, ?, ?, ?, ?, ?, ?)").run(e.school, ...e.degree, ...e.detail, e.year_end, i);
    });
    CERTIFICATIONS.forEach((c, i) => {
      if (!has("SELECT 1 FROM certifications WHERE name = ?", c.name))
        db.prepare("INSERT INTO certifications (name, issuer, sort) VALUES (?, ?, ?)").run(c.name, c.issuer, i);
    });
    SKILLS.forEach((s, i) => {
      if (!has("SELECT 1 FROM skills WHERE group_id = ?", s.group[0]))
        db.prepare("INSERT INTO skills (group_id, group_en, items, sort) VALUES (?, ?, ?, ?)").run(...s.group, s.items, i);
    });
    const insS = db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
    for (const [k, v] of Object.entries(SETTINGS)) insS.run(k, v);
  })();
}
