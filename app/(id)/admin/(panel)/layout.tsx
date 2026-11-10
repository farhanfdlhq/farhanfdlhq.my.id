import "@/app/admin.css";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { FeedbackProvider } from "@/components/admin/Feedback";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  // Login diperiksa di setiap page.tsx (dengan alamat tujuan), bukan di sini: navigasi RSC bisa melewati layout.
  // Halaman baru di folder ini wajib memanggil requireAdmin sendiri.
  return <div className="admin"><FeedbackProvider>{children}</FeedbackProvider></div>;
}
