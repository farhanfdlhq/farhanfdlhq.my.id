"use server";
import { redirect } from "next/navigation";
import { clientIp, endSession, startSession } from "@/lib/auth";
import { clearFailures, loginLimited, recordFailure } from "@/lib/sessions";
import { authenticate } from "@/lib/users";

export type LoginState = { message?: string };

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  // Dibatasi per IP dan per akun: kalau IP berhasil dipalsukan, batas per akun tetap mencegah tebak-tebakan password
  const ip = await clientIp();
  const keys = [`login:${ip}`, `akun:${email}`];
  if (loginLimited(ip, email)) return { message: "Terlalu banyak percobaan. Coba lagi dalam 15 menit." };
  // Dicatat sebelum password dicek, supaya banyak permintaan serentak tidak lolos semua dari pemeriksaan batas
  keys.forEach(recordFailure);
  const user = await authenticate(email, String(form.get("password") ?? ""));
  if (!user) return { message: "Email atau password salah." };
  keys.forEach(clearFailures);
  await startSession(user.id);
  const next = String(form.get("next") ?? "");
  redirect(/^\/admin\/[a-z0-9/_-]*$/i.test(next) ? next : "/admin/");
}

export async function logout() {
  await endSession();
  redirect("/admin/masuk/");
}
