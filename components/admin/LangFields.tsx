/** Satu isian dua bahasa: ID dan EN berdampingan di layar lebar, bertumpuk di HP. */
export function LangFields({ name, label, hint, values, multiline, rows = 4, required }: {
  name: string; label: string; hint?: string; values: { id?: string; en?: string }; multiline?: boolean; rows?: number; required?: boolean;
}) {
  const field = (lang: "id" | "en") => {
    const id = `${name}_${lang}`;
    const props = { id, name: id, defaultValue: values[lang] ?? "", required: required && lang === "id", "aria-describedby": hint ? `${name}-hint` : undefined };
    return (
      <div className="field" key={lang}>
        <label htmlFor={id}>{label} <span className="lang-tag">{lang === "id" ? "ID" : "EN"}</span>{lang === "en" ? <span className="opt"> (opsional, kosong berarti memakai teks ID)</span> : null}</label>
        {multiline ? <textarea {...props} rows={rows} /> : <input {...props} type="text" enterKeyHint="next" />}
      </div>
    );
  };
  return (
    <div className="lang-pair">
      {field("id")}
      {field("en")}
      {hint ? <p className="hint" id={`${name}-hint`}>{hint}</p> : null}
    </div>
  );
}
