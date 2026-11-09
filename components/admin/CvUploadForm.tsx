"use client";
import { ActionForm } from "./ActionForm";
import { FileInput } from "./FileInput";
import { uploadCv } from "@/app/actions/media";

export function CvUploadForm() {
  return (
    <ActionForm action={uploadCv} className="form">
      <div className="field">
        <label htmlFor="cv-label">Nama CV</label>
        <input id="cv-label" name="label" required maxLength={80} placeholder="CV Farhan 2026" autoComplete="off" enterKeyHint="next" />
        <p className="hint">Dipakai sebagai nama file saat diunduh.</p>
      </div>
      <fieldset className="field choice-field">
        <legend className="label">Bahasa</legend>
        <div className="choice-row">
          <label className="choice"><input type="radio" name="lang" value="id" defaultChecked /><span>Indonesia</span></label>
          <label className="choice"><input type="radio" name="lang" value="en" /><span>Inggris</span></label>
          <label className="choice"><input type="radio" name="lang" value="both" /><span>Dua bahasa</span></label>
        </div>
      </fieldset>
      <FileInput maxBytes={10 * 1024 * 1024} tooBig="PDF lebih dari 10 MB. Kecilkan dulu sebelum diunggah." label="File PDF" accept="application/pdf,.pdf" hint="PDF saja, maksimal 10 MB." />
      <div><button className="btn primary" type="submit">Unggah CV</button></div>
    </ActionForm>
  );
}
