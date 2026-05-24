# 🚀 Belajar Bun + Hono: Project Contact Sederhana

> **Tujuan**: Membuat REST API Contact (CRUD) menggunakan **Bun** sebagai runtime dan **Hono** sebagai web framework.  
> **Level**: Pemula – Menengah  
> **Estimasi waktu**: 60–90 menit

---

## 📌 Apa itu Bun & Hono?

| | Bun | Hono |
|---|---|---|
| **Jenis** | JavaScript Runtime (seperti Node.js) | Web Framework ringan |
| **Keunggulan** | Sangat cepat, built-in bundler & test runner | Ultra-cepat, TypeScript native, multi-runtime |
| **Cocok untuk** | Pengganti Node.js | REST API, edge functions |

---

## 📋 Prasyarat

Pastikan sudah terinstall:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) ✅
- [Bun](https://bun.sh/) (opsional jika pakai Docker) ✅

```bash
# Cek versi Bun
bun --version
# Output: 1.x.x

# Cek Docker
docker --version
```

---

## 🗂️ Struktur Project

```
hono-project/
├── src/
│   ├── index.ts          ← Entry point aplikasi
│   ├── routes/
│   │   └── contacts.ts   ← Route CRUD contact
│   ├── db/
│   │   └── database.ts   ← Setup SQLite database
│   └── types/
│       └── contact.ts    ← TypeScript types
├── package.json
├── tsconfig.json
├── Dockerfile
├── docker-compose.yml
└── TUTORIAL.md           ← (file ini)
```

---

## Step 1 — Inisialisasi Project

```bash
# Masuk ke direktori project
cd hono-project

# Inisialisasi project Bun
bun init -y
```

### 📝 Penjelasan
`bun init -y` membuat file `package.json` dan `index.ts` secara otomatis, tanpa perlu menjawab pertanyaan interaktif.

---

## Step 2 — Install Dependencies

```bash
# Install Hono web framework
bun add hono

# Install adapter untuk Bun
bun add @hono/node-server

# Install untuk SQLite (database ringan, built-in di Bun!)
# bun:sqlite sudah built-in, tidak perlu install

# DevDependencies
bun add -d @types/bun
```

### 📝 Penjelasan
- **hono**: Web framework utama
- **bun:sqlite**: SQLite driver yang sudah built-in di Bun (tidak perlu install!)
- **@types/bun**: TypeScript types untuk Bun API

---

## Step 3 — Konfigurasi TypeScript

Buka `tsconfig.json` dan pastikan isinya seperti ini:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "types": ["bun-types"],
    "lib": ["ESNext"],
    "outDir": "./dist",
    "rootDir": "./src",
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Step 4 — Buat TypeScript Types

Buat file `src/types/contact.ts`:

```typescript
// src/types/contact.ts

export interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

export interface CreateContactDto {
  name: string;
  email: string;
  phone: string;
}

export interface UpdateContactDto {
  name?: string;
  email?: string;
  phone?: string;
}
```

### 📝 Penjelasan
- **Interface** mendefinisikan "bentuk" data yang digunakan
- **DTO** (Data Transfer Object) adalah tipe khusus untuk request body

---

## Step 5 — Setup Database (SQLite)

Buat file `src/db/database.ts`:

```typescript
// src/db/database.ts
import { Database } from "bun:sqlite";

// Buat atau buka database file
const db = new Database("contacts.db", { create: true });

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
```

### 📝 Penjelasan
- `bun:sqlite` adalah modul built-in Bun — tidak perlu package eksternal!
- `WAL mode` (Write-Ahead Logging) membuat SQLite lebih cepat untuk operasi concurrent
- `CREATE TABLE IF NOT EXISTS` = hanya buat tabel jika belum ada (aman dijalankan berkali-kali)

---

## Step 6 — Buat Route Contacts (CRUD)

Buat file `src/routes/contacts.ts`:

```typescript
// src/routes/contacts.ts
import { Hono } from "hono";
import db from "../db/database";
import type { Contact, CreateContactDto, UpdateContactDto } from "../types/contact";

const contacts = new Hono();

// ──────────────────────────────────────────
// GET /contacts — Ambil semua contact
// ──────────────────────────────────────────
contacts.get("/", (c) => {
  const stmt = db.prepare("SELECT * FROM contacts ORDER BY created_at DESC");
  const result = stmt.all() as Contact[];

  return c.json({
    success: true,
    data: result,
    total: result.length,
  });
});

// ──────────────────────────────────────────
// GET /contacts/:id — Ambil 1 contact by ID
// ──────────────────────────────────────────
contacts.get("/:id", (c) => {
  const id = Number(c.req.param("id"));

  if (isNaN(id)) {
    return c.json({ success: false, message: "ID tidak valid" }, 400);
  }

  const stmt = db.prepare("SELECT * FROM contacts WHERE id = ?");
  const contact = stmt.get(id) as Contact | null;

  if (!contact) {
    return c.json({ success: false, message: "Contact tidak ditemukan" }, 404);
  }

  return c.json({ success: true, data: contact });
});

// ──────────────────────────────────────────
// POST /contacts — Tambah contact baru
// ──────────────────────────────────────────
contacts.post("/", async (c) => {
  const body = await c.req.json<CreateContactDto>();

  // Validasi sederhana
  if (!body.name || !body.email || !body.phone) {
    return c.json(
      { success: false, message: "name, email, dan phone wajib diisi" },
      400
    );
  }

  try {
    const stmt = db.prepare(
      "INSERT INTO contacts (name, email, phone) VALUES (?, ?, ?)"
    );
    const result = stmt.run(body.name, body.email, body.phone);

    const newContact = db
      .prepare("SELECT * FROM contacts WHERE id = ?")
      .get(result.lastInsertRowid) as Contact;

    return c.json({ success: true, data: newContact }, 201);
  } catch (error: any) {
    // Handle duplicate email
    if (error.message.includes("UNIQUE constraint failed")) {
      return c.json({ success: false, message: "Email sudah digunakan" }, 409);
    }
    return c.json({ success: false, message: "Gagal menyimpan contact" }, 500);
  }
});

// ──────────────────────────────────────────
// PUT /contacts/:id — Update contact
// ──────────────────────────────────────────
contacts.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));

  if (isNaN(id)) {
    return c.json({ success: false, message: "ID tidak valid" }, 400);
  }

  const existing = db
    .prepare("SELECT * FROM contacts WHERE id = ?")
    .get(id) as Contact | null;

  if (!existing) {
    return c.json({ success: false, message: "Contact tidak ditemukan" }, 404);
  }

  const body = await c.req.json<UpdateContactDto>();

  // Merge data lama dengan data baru
  const updatedName = body.name ?? existing.name;
  const updatedEmail = body.email ?? existing.email;
  const updatedPhone = body.phone ?? existing.phone;

  try {
    db.prepare(
      "UPDATE contacts SET name = ?, email = ?, phone = ? WHERE id = ?"
    ).run(updatedName, updatedEmail, updatedPhone, id);

    const updated = db
      .prepare("SELECT * FROM contacts WHERE id = ?")
      .get(id) as Contact;

    return c.json({ success: true, data: updated });
  } catch (error: any) {
    if (error.message.includes("UNIQUE constraint failed")) {
      return c.json({ success: false, message: "Email sudah digunakan" }, 409);
    }
    return c.json({ success: false, message: "Gagal mengupdate contact" }, 500);
  }
});

// ──────────────────────────────────────────
// DELETE /contacts/:id — Hapus contact
// ──────────────────────────────────────────
contacts.delete("/:id", (c) => {
  const id = Number(c.req.param("id"));

  if (isNaN(id)) {
    return c.json({ success: false, message: "ID tidak valid" }, 400);
  }

  const existing = db
    .prepare("SELECT * FROM contacts WHERE id = ?")
    .get(id) as Contact | null;

  if (!existing) {
    return c.json({ success: false, message: "Contact tidak ditemukan" }, 404);
  }

  db.prepare("DELETE FROM contacts WHERE id = ?").run(id);

  return c.json({ success: true, message: "Contact berhasil dihapus" });
});

export default contacts;
```

### 📝 Penjelasan
| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | `/contacts` | Ambil semua contact |
| GET | `/contacts/:id` | Ambil 1 contact |
| POST | `/contacts` | Tambah contact baru |
| PUT | `/contacts/:id` | Update contact |
| DELETE | `/contacts/:id` | Hapus contact |

---

## Step 7 — Buat Entry Point

Buat/edit file `src/index.ts`:

```typescript
// src/index.ts
import { Hono } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import contacts from "./routes/contacts";

const app = new Hono();

// ── Middleware Global ──────────────────────
app.use("*", logger());       // Log setiap request
app.use("*", prettyJSON());   // Format JSON response

// ── Health Check ───────────────────────────
app.get("/", (c) => {
  return c.json({
    status: "🟢 Online",
    app: "Contact API",
    version: "1.0.0",
    runtime: "Bun + Hono",
  });
});

// ── Routes ──────────────────────────────────
app.route("/contacts", contacts);

// ── 404 Handler ────────────────────────────
app.notFound((c) => {
  return c.json({ success: false, message: "Route tidak ditemukan" }, 404);
});

// ── Error Handler ───────────────────────────
app.onError((err, c) => {
  console.error("Error:", err.message);
  return c.json({ success: false, message: "Terjadi kesalahan server" }, 500);
});

// ── Start Server ────────────────────────────
const PORT = Number(process.env.PORT) || 3000;

export default {
  port: PORT,
  fetch: app.fetch,
};

console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
```

### 📝 Penjelasan
- `logger()`: Middleware bawaan Hono untuk logging request
- `prettyJSON()`: Format JSON agar mudah dibaca di browser
- `app.route()`: Mount sub-router ke path tertentu
- `export default { port, fetch }`: Format export khusus Bun untuk menjalankan server

---

## Step 8 — Update package.json

Pastikan `package.json` memiliki script yang benar:

```json
{
  "name": "hono-project",
  "version": "1.0.0",
  "main": "src/index.ts",
  "scripts": {
    "dev": "bun --watch src/index.ts",
    "start": "bun src/index.ts",
    "build": "bun build src/index.ts --outdir dist --target bun"
  },
  "dependencies": {
    "hono": "^4.x.x"
  },
  "devDependencies": {
    "@types/bun": "latest"
  }
}
```

### 📝 Penjelasan script
| Script | Perintah | Fungsi |
|--------|----------|--------|
| `dev` | `bun run dev` | Jalankan dengan auto-reload (development) |
| `start` | `bun run start` | Jalankan tanpa auto-reload (production) |
| `build` | `bun run build` | Compile ke JavaScript |

---

## Step 9 — Test Lokal (tanpa Docker)

```bash
# Jalankan server dalam mode development
bun run dev

# Server akan berjalan di http://localhost:3000
```

Coba endpoint dengan `curl` atau tool seperti **Postman** / **Thunder Client**:

```bash
# 1. Health check
curl http://localhost:3000/

# 2. Tambah contact baru
curl -X POST http://localhost:3000/contacts \
  -H "Content-Type: application/json" \
  -d '{"name":"Budi Santoso","email":"budi@example.com","phone":"08123456789"}'

# 3. Ambil semua contact
curl http://localhost:3000/contacts

# 4. Ambil contact by ID
curl http://localhost:3000/contacts/1

# 5. Update contact
curl -X PUT http://localhost:3000/contacts/1 \
  -H "Content-Type: application/json" \
  -d '{"phone":"08999999999"}'

# 6. Hapus contact
curl -X DELETE http://localhost:3000/contacts/1
```

---

## Step 10 — Dockerfile

Buat file `Dockerfile`:

```dockerfile
# Gunakan image resmi Bun
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS install
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Copy source code
FROM base AS release
COPY --from=install /app/node_modules ./node_modules
COPY src ./src
COPY package.json tsconfig.json ./

# Expose port
EXPOSE 3000

# Jalankan aplikasi
CMD ["bun", "run", "start"]
```

---

## Step 11 — Docker Compose

Buat file `docker-compose.yml`:

```yaml
version: "3.9"

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: hono-contact-api
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - NODE_ENV=production
    volumes:
      # Mount folder data agar database SQLite persisten
      - ./data:/app/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
```

---

## Step 12 — Jalankan dengan Docker Compose

```bash
# Build dan jalankan container
docker compose up --build

# Atau jalankan di background (detached mode)
docker compose up --build -d

# Cek status container
docker compose ps

# Lihat logs
docker compose logs -f

# Stop container
docker compose down
```

Setelah container berjalan, akses API di:
- **API**: http://localhost:3000
- **Health check**: http://localhost:3000/

---

## 🧪 Contoh Response API

### POST /contacts
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "phone": "08123456789",
    "created_at": "2024-01-01 10:00:00"
  }
}
```

### GET /contacts
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Budi Santoso",
      "email": "budi@example.com",
      "phone": "08123456789",
      "created_at": "2024-01-01 10:00:00"
    }
  ],
  "total": 1
}
```

### Error Response
```json
{
  "success": false,
  "message": "Contact tidak ditemukan"
}
```

---

## 🔍 Konsep Penting yang Dipelajari

| Konsep | Lokasi | Penjelasan |
|--------|--------|------------|
| Hono app & routing | `src/index.ts` | Cara setup app dan mount routes |
| Middleware | `src/index.ts` | logger, prettyJSON |
| Sub-router | `src/routes/contacts.ts` | Modularisasi routes dengan `new Hono()` |
| Bun SQLite | `src/db/database.ts` | Built-in database tanpa package eksternal |
| TypeScript types | `src/types/contact.ts` | Interface & DTO |
| Error handling | Routes & app | Try-catch + global error handler |
| Docker | `Dockerfile` | Containerisasi app Bun |
| Docker Compose | `docker-compose.yml` | Orkestrasi container |

---

## 📚 Referensi

- [Dokumentasi Bun](https://bun.sh/docs)
- [Dokumentasi Hono](https://hono.dev)
- [Bun SQLite API](https://bun.sh/docs/api/sqlite)
- [Hono Middleware](https://hono.dev/docs/middleware/builtin/logger)
- [Docker Bun Image](https://hub.docker.com/r/oven/bun)

---

## 🎯 Langkah Selanjutnya (Bonus)

Setelah menyelesaikan project ini, coba tambahkan:

1. **Validasi dengan Zod** — Library validasi TypeScript yang powerful
2. **Search & Pagination** — `GET /contacts?search=budi&page=1&limit=10`
3. **JWT Authentication** — Proteksi endpoint dengan token
4. **Swagger UI** — Dokumentasi API interaktif dengan `@hono/swagger-ui`
5. **Unit Testing** — Gunakan `bun test` untuk menulis test

---

*Happy coding! 🎉*
