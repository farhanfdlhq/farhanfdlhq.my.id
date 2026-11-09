import "@/app/admin.css";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { LoginForm } from "@/components/admin/LoginForm";
import { LogoMark } from "@/components/site/LogoMark";

export const metadata: Metadata = { title: "Masuk", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await currentUser()) redirect("/admin/");
  const next = (await searchParams).next ?? "";
  return (
    <main className="admin login">
      <div className="login-card">
        <a href="/" aria-label="Kembali ke beranda" className="login-mark"><LogoMark size={44} /></a>
        <h1>Masuk</h1>
        <p className="admin-sub">Panel admin farhanfdlhq.my.id</p>
        <LoginForm next={next} />
      </div>
    </main>
  );
}
