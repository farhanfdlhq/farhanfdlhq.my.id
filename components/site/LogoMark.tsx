/** Logo final: huruf f dengan titik merah (brand/logo-mark.svg). Warna huruf mengikuti teks. */
export function LogoMark({ size = 22, className = "logo" }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <path d="M40 86V42a20 20 0 0 1 20-20h6" fill="none" stroke="currentColor" strokeWidth="11" strokeLinecap="round" />
      <path d="M27 50h30" fill="none" stroke="currentColor" strokeWidth="11" strokeLinecap="round" />
      <rect x="62" y="72" width="15" height="15" rx="3" fill="#FF4D3D" />
    </svg>
  );
}
