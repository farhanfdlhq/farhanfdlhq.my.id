import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build bisa diarahkan ke folder lain (dipakai scripts/deploy.sh) supaya situs tetap jalan selama build
  distDir: process.env.NEXT_DIST_DIR || ".next",
  trailingSlash: true,
  serverExternalPackages: ["better-sqlite3", "sharp"],
  poweredByHeader: false,
  images: { unoptimized: true },
  experimental: {
    serverActions: { bodySizeLimit: "13mb" },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self'",
              "img-src 'self' data: blob:",
              "connect-src 'self'",
              "frame-ancestors 'none'",
              "form-action 'self'",
              "base-uri 'self'",
              "object-src 'none'",
            ].join("; "),
          },
        ],
      },
      {
        // Runner latihan: dokumen iframe sandbox yang menjalankan kode pengunjung. Aturan ini setelah aturan umum supaya nilainya menang.
        source: "/latihan-runner/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Robots-Tag", value: "noindex" },
          {
            key: "Content-Security-Policy",
            value: "default-src 'none'; script-src 'self' 'unsafe-eval'; worker-src blob: 'self'; connect-src 'none'; frame-ancestors 'self'; base-uri 'none'; form-action 'none'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
