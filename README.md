# 📱 Hono + Bun: Contact REST API

REST API Contact (CRUD) sederhana namun premium yang dibuat menggunakan **Bun** sebagai JavaScript runtime super cepat dan **Hono** sebagai web framework yang ultra-ringan, menggunakan SQLite sebagai database lokal, serta terintegrasi penuh dengan Docker Compose untuk development.

---

## 🚀 Fitur Utama

- **Ultra Cepat & Ringan**: Memanfaatkan runtime Bun dan framework Hono.
- **SQLite Built-in**: Menggunakan driver SQLite bawaan Bun (`bun:sqlite`), tanpa package eksternal.
- **Docker Compose Ready**: Dilengkapi konfigurasi containerization untuk deployment cepat.
- **Live Hot-Reload di Docker (Mac/Linux/Windows)**: Menggunakan polling watch (`nodemon -L`) agar perubahan kode di luar container langsung terefleksi secara real-time di dalam container (termasuk pada Docker Desktop / Colima di macOS).
- **TypeScript Native**: Full support TypeScript untuk keamanan tipe data dan autocompletion.

---

## 🛠️ Tech Stack

- **Runtime**: [Bun v1.x](https://bun.sh/)
- **Framework**: [Hono v4.x](https://hono.dev/)
- **Database**: SQLite (built-in Bun)
- **Containerization**: Docker & Docker Compose
- **Language**: TypeScript

---

## 📋 Prasyarat

Pastikan komputer Anda sudah terinstal:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) atau [Colima](https://github.com/abiosoft/colima) (jika ingin menjalankan via Docker)
- [Bun](https://bun.sh/) (jika ingin menjalankan langsung di lokal host)

---

## ⚙️ Cara Menjalankan

### Opsi 1: Menggunakan Docker Compose (Direkomendasikan)
Dalam mode ini, container disetup untuk mode **Development** dengan volume mount ke folder lokal Anda. Setiap perubahan kode pada mesin lokal Anda akan otomatis memicu hot-reload di dalam Docker.

1. **Jalankan container di background**:
   ```bash
   docker compose up -d
   ```
2. **Lihat log server**:
   ```bash
   docker compose logs -f
   ```
3. **Akses API**:
   Aplikasi akan berjalan di: [http://localhost:3000](http://localhost:3000)

4. **Matikan container**:
   ```bash
   docker compose down
   ```

---

### Opsi 2: Menjalankan Secara Lokal (Tanpa Docker)
Jika Anda ingin menjalankan langsung di OS host Anda menggunakan CLI Bun:

1. **Install dependensi**:
   ```bash
   bun install
   ```
2. **Jalankan server development (dengan Auto-Reload)**:
   ```bash
   bun run dev
   ```
3. **Jalankan mode produksi**:
   ```bash
   bun run start
   ```

---

## 📂 Struktur Project

```
├── src/
│   ├── index.ts          # Entry point utama aplikasi & konfigurasi Hono
│   ├── routes/
│   │   └── contacts.ts   # Endpoint & Logic CRUD Contact
│   ├── db/
│   │   └── database.ts   # Inisialisasi SQLite database
│   └── types/
│       └── contact.ts    # Definisi Type/Interface TypeScript
├── Dockerfile            # Multi-stage Docker configuration untuk Bun
├── docker-compose.yml    # Konfigurasi orkestrasi container & Volume Mount
├── package.json          # Dependency & script aplikasi
├── tsconfig.json         # Konfigurasi TypeScript compiler
├── TUTORIAL.md           # Langkah-langkah pembuatan step-by-step
└── WALKTHROUGH.md        # Rangkuman pengujian dan pembaharuan proyek
```

---

## 🔌 API Endpoints & Pengujian

### 1. Health Check
*Memeriksa status aplikasi.*
- **Method**: `GET`
- **URL**: `http://localhost:3000/`
- **Contoh Response**:
  ```json
  {
    "status": "🟢 Online",
    "app": "Contact API",
    "version": "1.0.0",
    "runtime": "Bun + Hono",
    "mode": "Docker Dev Mode (Hot Reload Verified!)"
  }
  ```

### 2. Tambah Contact Baru
- **Method**: `POST`
- **URL**: `http://localhost:3000/contacts`
- **Header**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "phone": "081234567890"
  }
  ```
- **Contoh Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "Budi Santoso",
      "email": "budi@example.com",
      "phone": "081234567890",
      "created_at": "2026-05-24 14:51:18"
    }
  }
  ```

### 3. Ambil Semua Contact
- **Method**: `GET`
- **URL**: `http://localhost:3000/contacts`
- **Contoh Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "Budi Santoso",
        "email": "budi@example.com",
        "phone": "081234567890",
        "created_at": "2026-05-24 14:51:18"
      }
    ],
    "total": 1
  }
  ```

### 4. Ambil Contact by ID
- **Method**: `GET`
- **URL**: `http://localhost:3000/contacts/:id`

### 5. Update Contact
- **Method**: `PUT`
- **URL**: `http://localhost:3000/contacts/:id`
- **Body**: (Kirim field yang ingin diupdate saja)
  ```json
  {
    "phone": "089999999999"
  }
  ```

### 6. Hapus Contact
- **Method**: `DELETE`
- **URL**: `http://localhost:3000/contacts/:id`
