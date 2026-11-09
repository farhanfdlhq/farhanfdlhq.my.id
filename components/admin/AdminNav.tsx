import { logout } from "@/app/actions/auth";
import { LogoMark } from "@/components/site/LogoMark";

const LINKS = [["/admin/", "Proyek"], ["/admin/profil/", "Profil"], ["/admin/riwayat/", "Riwayat"], ["/admin/cv/", "CV"]] as const;

export function AdminNav({ current }: { current?: string }) {
  return (
    <header className="admin-head">
      <a className="mark" href="/admin/" aria-label="Admin farhanfdlhq"><LogoMark /><span className="wm">admin<span>.</span></span></a>
      <nav className="admin-nav" aria-label="Menu admin">
        {LINKS.map(([href, label]) => <a key={href} href={href} aria-current={current === href ? "page" : undefined}>{label}</a>)}
        <a href="/" target="_blank" rel="noopener">Lihat situs ↗</a>
        <form action={logout}><button className="linklike" type="submit">Keluar</button></form>
      </nav>
    </header>
  );
}
