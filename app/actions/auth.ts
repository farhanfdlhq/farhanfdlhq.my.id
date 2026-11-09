"use server";
import { redirect } from "next/navigation";
import { clientIp, endSession, startSession } from "@/lib/auth";
import { clearFailures, recordFailure, tooManyAttempts } from "@/lib/sessions";
import { authenticate } from "@/lib/users";

export type LoginState = { message?: string };

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  // Dibatasi per IP dan per akun: kalau IP berhasil dipalsukan, batas per akun tetap mencegah tebak-tebakan password
  const keys = [`login:${await clientIp()}`, `akun:${email}`];
  if (keys.some((k) => tooManyAttempts(k))) return { message: "Terlalu banyak percobaan. Coba lagi dalam 15 menit." };
  const user = await authenticate(email, String(form.get("password") ?? ""));
  if (!user) {
    keys.forEach(recordFailure);
    return { message: "Email atau password salah." };
  }
  keys.forEach(clearFailures);
  await startSession(user.id);
  const next = String(form.get("next") ?? "");
  redirect(/^\/admin\/[a-z0-9/_-]*$/i.test(next) ? next : "/admin/");
}

export async function logout() {
  await endSession();
  redirect("/admin/masuk/");
}
