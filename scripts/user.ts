/**
 * Kelola akun admin dari terminal.
 *   npm run user -- add --email nama@contoh.id --name "Farhan"
 *   npm run user -- reset --email nama@contoh.id
 *   npm run user -- list
 * Password diketik lewat prompt tersembunyi (minimal 10 karakter), jadi tidak tersimpan di riwayat terminal.
 * Kalau input bukan terminal (dipakai tes), password dibaca dari baris pertama stdin.
 */
try { process.loadEnvFile(".env.production"); } catch {}
import readline from "node:readline";
import { getDb } from "../lib/db";
import { createUser, listUsers, setPassword, MIN_PASSWORD } from "../lib/users";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

async function readPassword(label: string): Promise<string> {
  if (!process.stdin.isTTY) {
    const rl = readline.createInterface({ input: process.stdin });
    for await (const line of rl) { rl.close(); return line.trim(); }
    return "";
  }
  return new Promise((resolve) => {
    process.stdout.write(label);
    let pw = "";
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    const onData = (ch: string) => {
      if (ch === "\r" || ch === "\n") { process.stdin.setRawMode(false); process.stdin.pause(); process.stdin.off("data", onData); process.stdout.write("\n"); resolve(pw); }
      else if (ch === "\u0003") process.exit(1);
      else if (ch === "\u007f") pw = pw.slice(0, -1);
      else pw += ch;
    };
    process.stdin.on("data", onData);
  });
}

async function askNewPassword(): Promise<string> {
  const a = await readPassword(`Password baru (minimal ${MIN_PASSWORD} karakter): `);
  if (process.stdin.isTTY && a !== (await readPassword("Ulangi password: "))) throw new Error("Kedua password tidak sama.");
  return a;
}

async function main() {
  const cmd = process.argv[2];
  if (cmd === "add") {
    const email = arg("email"), name = arg("name");
    if (!email || !name) throw new Error('Pakai: npm run user -- add --email nama@contoh.id --name "Nama"');
    const u = await createUser({ email, name, password: await askNewPassword() });
    console.log(`Akun dibuat: ${u.name} <${u.email}>. Masuk di /admin/masuk/.`);
  } else if (cmd === "reset") {
    const row = getDb().prepare("SELECT id, name FROM users WHERE email = ?").get(arg("email")?.toLowerCase()) as { id: number; name: string } | undefined;
    if (!row) throw new Error("Email tidak ditemukan.");
    await setPassword(row.id, await askNewPassword());
    console.log(`Password ${row.name} sudah diganti.`);
  } else if (cmd === "list") {
    for (const u of listUsers()) console.log(`${u.email}  ${u.name}`);
  } else {
    console.log("Perintah: add | reset | list");
  }
}

main().catch((e) => {
  const msg = e instanceof Error ? e.message : String(e);
  console.error(/UNIQUE/.test(msg) ? "Gagal: email itu sudah terdaftar. Untuk mengganti password: npm run user -- reset --email <email>" : "Gagal: " + msg);
  process.exit(1);
});
