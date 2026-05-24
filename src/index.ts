import { Hono } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import contacts from "./routes/contacts";

const app = new Hono();

// ── Middleware Global ──────────────────────
app.use("*", logger());     // Log setiap request ke console
app.use("*", prettyJSON()); // Format JSON response agar mudah dibaca

// ── Health Check ───────────────────────────
app.get("/", (c) => {
  return c.json({
    status: "🟢 Online",
    app: "Contact API",
    version: "1.0.0",
    runtime: "Bun + Hono",
    mode: "Docker Dev Mode (Hot Reload Verified!)",
    endpoints: {
      "GET    /contacts":     "Ambil semua contact",
      "GET    /contacts/:id": "Ambil contact by ID",
      "POST   /contacts":    "Tambah contact baru",
      "PUT    /contacts/:id": "Update contact",
      "DELETE /contacts/:id": "Hapus contact",
    },
  });
});

// ── Mount Routes ────────────────────────────
app.route("/contacts", contacts);

// ── 404 Handler ────────────────────────────
app.notFound((c) => {
  return c.json(
    { success: false, message: `Route '${c.req.path}' tidak ditemukan` },
    404
  );
});

// ── Global Error Handler ────────────────────
app.onError((err, c) => {
  console.error("[ERROR]", err.message);
  return c.json({ success: false, message: "Terjadi kesalahan server" }, 500);
});

// ── Start Server ────────────────────────────
const PORT = Number(process.env.PORT) || 3000;

console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
console.log(`📋 Coba: curl http://localhost:${PORT}/`);

export default {
  port: PORT,
  fetch: app.fetch,
};
