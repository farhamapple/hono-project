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

  // Validasi format email sederhana
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    return c.json({ success: false, message: "Format email tidak valid" }, 400);
  }

  try {
    const stmt = db.prepare(
      "INSERT INTO contacts (name, email, phone) VALUES (?, ?, ?)"
    );
    const result = stmt.run(body.name.trim(), body.email.trim(), body.phone.trim());

    const newContact = db
      .prepare("SELECT * FROM contacts WHERE id = ?")
      .get(result.lastInsertRowid) as Contact;

    return c.json({ success: true, data: newContact }, 201);
  } catch (error: any) {
    if (error.message?.includes("UNIQUE constraint failed")) {
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
  const updatedName = body.name?.trim() ?? existing.name;
  const updatedEmail = body.email?.trim() ?? existing.email;
  const updatedPhone = body.phone?.trim() ?? existing.phone;

  try {
    db.prepare(
      "UPDATE contacts SET name = ?, email = ?, phone = ? WHERE id = ?"
    ).run(updatedName, updatedEmail, updatedPhone, id);

    const updated = db
      .prepare("SELECT * FROM contacts WHERE id = ?")
      .get(id) as Contact;

    return c.json({ success: true, data: updated });
  } catch (error: any) {
    if (error.message?.includes("UNIQUE constraint failed")) {
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

  return c.json({
    success: true,
    message: `Contact "${existing.name}" berhasil dihapus`,
  });
});

export default contacts;
