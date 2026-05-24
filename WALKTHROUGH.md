# 🏁 Walkthrough: Project Contact Bun + Hono Selesai!

Seluruh tahapan proyek contact sederhana menggunakan Bun dan Hono telah berhasil diterapkan dan diuji. Aplikasi kini berjalan di dalam container Docker dan menggunakan SQLite sebagai database lokal yang persisten.

---

## 🛠️ Perubahan yang Dilakukan

1. **Inisialisasi Project**:
   - Menambahkan [package.json](file:///Users/farham/Documents/LEARN_STACK/hono-project/package.json) dengan library utama `hono` dan `@types/bun`.
   - Menambahkan [tsconfig.json](file:///Users/farham/Documents/LEARN_STACK/hono-project/tsconfig.json) untuk mengatur compiler options TypeScript.

2. **Source Code**:
   - **Types**: Membuat [contact.ts](file:///Users/farham/Documents/LEARN_STACK/hono-project/src/types/contact.ts) untuk mendefinisikan interface Contact dan DTO (Data Transfer Object).
   - **Database Setup**: Membuat [database.ts](file:///Users/farham/Documents/LEARN_STACK/hono-project/src/db/database.ts) menggunakan built-in `bun:sqlite` API. Data disimpan secara persisten di folder `data/` jika dijalankan di mode production.
   - **Routes (CRUD)**: Membuat [contacts.ts](file:///Users/farham/Documents/LEARN_STACK/hono-project/src/routes/contacts.ts) dengan router Hono yang mencakup operasi Create, Read, Update, dan Delete.
   - **Entry Point**: Membuat [index.ts](file:///Users/farham/Documents/LEARN_STACK/hono-project/src/index.ts) dengan logger, format pretty JSON response, endpoint kesehatan (health check), dan mount router contacts.

3. **Docker Integration**:
   - **Dockerfile**: Membuat [Dockerfile](file:///Users/farham/Documents/LEARN_STACK/hono-project/Dockerfile) multi-stage build yang ringan berbasis image `oven/bun:1`.
   - **Docker Compose**: Membuat [docker-compose.yml](file:///Users/farham/Documents/LEARN_STACK/hono-project/docker-compose.yml) untuk melakukan mapping port `3000:3000`, me-mount volume local (`.:/app` dan anonymous volume `/app/node_modules`), serta menjalankan command `bun run dev` (menggunakan `bunx nodemon -L`) untuk mendukung live hot-reload langsung dari luar container pada Docker macOS/Colima.

4. **Panduan Lengkap**:
   - Menambahkan panduan belajar lengkap dalam bahasa Indonesia di [TUTORIAL.md](file:///Users/farham/Documents/LEARN_STACK/hono-project/TUTORIAL.md).


---

## 🧪 Hasil Verifikasi & Pengujian API

Aplikasi berhasil dibuild dan dijalankan menggunakan Docker Compose. Berikut adalah hasil pengujian endpoint API:

### 1. Health Check
*Request:*
```bash
curl -s http://localhost:3000/
```

*Response:*
```json
{
  "status": "🟢 Online",
  "app": "Contact API",
  "version": "1.0.0",
  "runtime": "Bun + Hono",
  "endpoints": {
    "GET    /contacts": "Ambil semua contact",
    "GET    /contacts/:id": "Ambil contact by ID",
    "POST   /contacts": "Tambah contact baru",
    "PUT    /contacts/:id": "Update contact",
    "DELETE /contacts/:id": "Hapus contact"
  }
}
```

### 2. Tambah Contact Baru
*Request:*
```bash
curl -s -X POST http://localhost:3000/contacts \
  -H "Content-Type: application/json" \
  -d '{"name":"Ahmad Fauzi","email":"ahmad@example.com","phone":"081234567890"}'
```

*Response:*
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Ahmad Fauzi",
    "email": "ahmad@example.com",
    "phone": "081234567890",
    "created_at": "2026-05-24 14:51:18"
  }
}
```

### 3. Ambil Semua Contact
*Request:*
```bash
curl -s http://localhost:3000/contacts
```

*Response:*
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Ahmad Fauzi",
      "email": "ahmad@example.com",
      "phone": "081234567890",
      "created_at": "2026-05-24 14:51:18"
    }
  ],
  "total": 1
}
```
