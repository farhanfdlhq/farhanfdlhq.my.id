"use client";
import { useEffect, useId, useState } from "react";

/** Pilih file dengan tombol bertema: menampilkan nama file, ukurannya, dan pratinjau untuk gambar. */
export function FileInput({ name = "file", label, accept, hint, image }: { name?: string; label: string; accept: string; hint?: string; image?: boolean }) {
  const id = useId();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  useEffect(() => {
    if (!image || !file) { setPreview(""); return; }
    const u = URL.createObjectURL(file);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [file, image]);
  const size = file ? (file.size >= 1048576 ? `${(file.size / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`) : "";
  return (
    <div className="field">
      <span className="label" id={`${id}-l`}>{label}</span>
      <div className="file-wrap">
        <input id={id} className="file-native" type="file" name={name} accept={accept} aria-labelledby={`${id}-l ${id}-b`} aria-describedby={hint ? `${id}-h` : undefined}
          onChange={(e) => setFile(e.currentTarget.files?.[0] ?? null)} />
        <label htmlFor={id} className="btn btn-quiet" id={`${id}-b`}>{file ? "Ganti file" : "Pilih file"}</label>
        <span className="file-name" aria-live="polite">{file ? `${file.name} · ${size}` : "Belum ada file dipilih"}</span>
      </div>
      {preview ? <img className="file-preview" src={preview} alt="" /> : null}
      {hint ? <p className="hint" id={`${id}-h`}>{hint}</p> : null}
    </div>
  );
}
