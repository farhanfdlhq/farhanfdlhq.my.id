"use client";
import dynamic from "next/dynamic";

// three.js hanya dimuat di browser, setelah isi halaman tampil
const DeskScene = dynamic(() => import("./DeskScene"), { ssr: false });

export function SceneLoader() {
  return <DeskScene />;
}
