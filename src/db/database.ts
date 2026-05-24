import { Database } from "bun:sqlite";
import path from "path";

// Gunakan folder /app/data agar bisa di-mount sebagai Docker volume
const dbPath = process.env.NODE_ENV === "production"
  ? path.join(process.cwd(), "data", "contacts.db")
  : "contacts.db";

// Buat atau buka database file
const db = new Database(dbPath, { create: true });

// Enable WAL mode untuk performa lebih baik
db.exec("PRAGMA journal_mode = WAL;");

// Buat tabel contacts jika belum ada
db.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    email      TEXT    NOT NULL UNIQUE,
    phone      TEXT    NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

export default db;
