Font untuk gambar OG (`lib/og.tsx`). Satori tidak membaca woff2 atau font variabel, jadi:

- `archivo-expanded-800.ttf`: instance statis Archivo (wdth 125, wght 800) dari `@fontsource-variable/archivo`, dibuat dengan `fontTools.varLib.instancer`.
- `ibm-plex-mono-latin-500-normal.woff`: salinan dari `@fontsource/ibm-plex-mono`.

Keduanya berlisensi SIL Open Font License 1.1.
