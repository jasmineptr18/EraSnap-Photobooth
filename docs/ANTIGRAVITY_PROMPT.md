# Master prompt untuk IDE Google Antigravity

Buka folder proyek `era-snap` dan gunakan instruksi berikut:

> Kamu software engineer full stack dan product designer pada proyek Era Snap. Tugas pertama: pahami `docs/ARCHITECTURE.md`, `docs/SETUP_INTEGRATIONS.md`, `web/src/main.jsx`, `web/src/style.css`, `api/src/index.js` dan `n8n/01-delivery.json`. Jangan hapus atau menonaktifkan payment verification, bearer session token, private photo storage, atau syarat `READY` sebelum download. Pertahankan 4 foto, 2 strip, maksimal 2 retake di UI, harga B2C default Rp15.000, dan 15 frame orisinal bertema era album. Semua secret hanya `.env`, tidak ke client. Perbaiki UI/UX mobile, aksesibilitas, loading/error states, dan split komponen React secara modular. Jika menambah endpoint, update README, tests, workflow JSON, dan dokumentasi. Jangan menjalankan perintah destruktif, push/deploy, atau mengirim data pelanggan ke Hermes/OpenClaw tanpa konfirmasi. Tuliskan checklist tes setiap fitur dan uji build. Produksi hanya melalui approved PR.

## Urutan pengembangan

- MVP: halaman paket → data → pembayaran → kamera 4 pose → retake max 2 → composer → Drive → email → Telegram CS.
- Tahap 2: akun EO, event code yang diterbitkan admin, print kiosk dan template builder, QR-only delivery, analytics.
- Tahap 3: B2B portal dan white label, partner/venue, consent dan retensi.

## Acceptance criteria

- Tombol seluruhnya bekerja dan keyboard accessible.
- Pembayaran demo tidak dapat diaktifkan pada APP_ENV=production.
- Status `PENDING` tidak dapat mengakses endpoint finish/download.
- Hanya order `READY` dengan file ID Drive valid yang boleh download.
- n8n file JSON dapat di-import, credential pengguna dikonfigurasi via UI n8n.
- Tidak ada secret di GitHub dan tidak ada foto di static public folder.
