"use client";

/** Pengganti halaman error bawaan Next (bahasa Inggris) di panel admin. */
export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="admin-main">
      <h1>Ada yang gagal</h1>
      <p className="admin-sub">Perubahan terakhir mungkin belum tersimpan. Muat ulang halaman ini, lalu coba lagi. Kalau terus terjadi, cek log project di aaPanel.</p>
      <div className="btn-row">
        <button className="btn primary" type="button" onClick={() => reset()}>Coba lagi</button>
        <a className="btn btn-quiet" href="/admin/">Ke daftar proyek</a>
      </div>
    </main>
  );
}
