/** Koneksi SQLite dan migrasi skema. Satu file database di DATA_DIR. */
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

type DB = Database.Database;
const g = globalThis as unknown as { __fdqDb?: DB; __fdqDbPath?: string };

export function dataDir(): string {
  const dir = path.resolve(/*turbopackIgnore: true*/ process.env.DATA_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), "data"));
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function uploadsDir(): string {
  const dir = path.join(dataDir(), "uploads");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function getDb(): DB {
  const file = path.join(dataDir(), "fdq.sqlite");
  if (g.__fdqDb && g.__fdqDbPath === file) return g.__fdqDb;
  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");
  migrate(db);
  g.__fdqDb = db;
  g.__fdqDbPath = file;
  return db;
}

/** Dipakai tes: tutup koneksi agar DATA_DIR baru terbaca. */
export function resetDbForTests() {
  g.__fdqDb?.close();
  g.__fdqDb = undefined;
  g.__fdqDbPath = undefined;
}

// Kolom teks dua bahasa memakai akhiran _id dan _en.
const bi = (name: string) => `${name}_id TEXT NOT NULL DEFAULT '', ${name}_en TEXT NOT NULL DEFAULT ''`;

const MIGRATIONS: string[] = [
  `
  CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    name TEXT NOT NULL DEFAULT '',
    password_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );
  CREATE TABLE login_attempts (key TEXT NOT NULL, at INTEGER NOT NULL);
  CREATE INDEX idx_attempts ON login_attempts(key, at);
  CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  CREATE TABLE projects (
    id INTEGER PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    ${bi("summary")}, ${bi("role")}, ${bi("period")},
    ${bi("context")}, ${bi("problem")}, ${bi("approach")}, ${bi("result")},
    stack TEXT NOT NULL DEFAULT '',
    year INTEGER,
    live_url TEXT NOT NULL DEFAULT '',
    repo_url TEXT NOT NULL DEFAULT '',
    hero_image TEXT NOT NULL DEFAULT '',
    featured INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    sort INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE TABLE project_images (
    id INTEGER PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    ${bi("alt")},
    sort INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE experiences (id INTEGER PRIMARY KEY, ${bi("role")}, org TEXT NOT NULL DEFAULT '', ${bi("period")}, sort INTEGER NOT NULL DEFAULT 0);
  CREATE TABLE education (id INTEGER PRIMARY KEY, school TEXT NOT NULL, ${bi("degree")}, ${bi("detail")}, year_end INTEGER, sort INTEGER NOT NULL DEFAULT 0);
  CREATE TABLE certifications (id INTEGER PRIMARY KEY, name TEXT NOT NULL, issuer TEXT NOT NULL DEFAULT '', sort INTEGER NOT NULL DEFAULT 0);
  CREATE TABLE skills (id INTEGER PRIMARY KEY, ${bi("group")}, items TEXT NOT NULL DEFAULT '', sort INTEGER NOT NULL DEFAULT 0);
  CREATE TABLE cvs (
    id INTEGER PRIMARY KEY,
    label TEXT NOT NULL,
    lang TEXT NOT NULL DEFAULT 'id' CHECK (lang IN ('id', 'en', 'both')),
    file TEXT NOT NULL,
    is_primary INTEGER NOT NULL DEFAULT 0,
    sort INTEGER NOT NULL DEFAULT 0,
    uploaded_at INTEGER NOT NULL
  );
  `,
];

function migrate(db: DB) {
  const current = db.pragma("user_version", { simple: true }) as number;
  for (let v = current; v < MIGRATIONS.length; v++) {
    db.transaction(() => {
      db.exec(MIGRATIONS[v]);
      db.pragma(`user_version = ${v + 1}`);
    })();
  }
}
