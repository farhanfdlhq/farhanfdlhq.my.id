import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { resetDbForTests } from "@/lib/db";

/** Arahkan DATA_DIR ke folder sementara yang baru, lalu tutup koneksi lama. */
export function freshDataDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "fdq-test-"));
  process.env.DATA_DIR = dir;
  resetDbForTests();
  return dir;
}
