import { notFound } from "next/navigation";

/** Alamat yang tidak cocok dengan halaman mana pun memakai halaman 404 situs, bukan 404 bawaan Next. */
export default function CatchAll() { notFound(); }
