import { t, type Lang } from "@/lib/i18n";

/** Atribusi wajib CC BY-SA 4.0 untuk urutan topik dari coding-interview-university. */
export function Attribution({ lang }: { lang: Lang }) {
  return (
    <>
      {t(lang, "attribution_pre")} <a href="https://github.com/jwasham/coding-interview-university" rel="noopener">coding-interview-university</a> {t(lang, "attribution_by")}{" "}
      <a href="https://creativecommons.org/licenses/by-sa/4.0/" rel="license noopener">CC BY-SA 4.0</a>.
    </>
  );
}
