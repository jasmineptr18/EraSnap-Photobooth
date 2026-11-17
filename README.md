# ✨ ERA SNAP

> **Your little moment, forever.** Web photobooth B2C & B2B foundation: React + Express/Postgres + n8n + Drive/Sheets/Gmail/Telegram + optional Hermes Agent/OpenClaw.

**Status:** runnable local **demo foundation**, bukan sistem production yang sudah tersambung ke akun Anda. Login OAuth, API key, domain dan provider agent harus dikonfigurasi sendiri. Paket dibuat agar mudah dikembangkan di Google Antigravity IDE dan GitHub.

## Cara tercepat menjalankan

```sh
# Windows PowerShell: Copy-Item .env.example .env
cp .env.example .env
# ubah variabel secret dan database password di .env
# untuk demo lokal saja, pembayaran simulasi aktif
docker compose up --build -d
# Buka http://localhost:4000
# Buka http://localhost:5678 untuk n8n onboarding + import workflow
```

**Penting:** Docker Desktop perlu aktif. API menunggu Postgres sehat. Workflow eksternal tidak berjalan sampai Anda import dan activate serta menyambungkan kredensialnya. Jangan expose localhost port n8n/DB/API ke internet tanpa HTTPS reverse proxy dan kontrol akses.

## Jalur demo

1. Buka `http://localhost:4000` → pilih **Taylor-inspired frames** atau **Taylor-inspired frames**.
2. Masukkan nama, email, dan WhatsApp → lanjut checkout.
3. Tekan `Simulasikan Pembayaran (DEMO)` → kamera aktif. Mode ini hanya bekerja kalau `APP_ENV=development` + `PAYMENT_MODE=demo` + `ALLOW_DEMO_PAYMENT=true`.
4. Izinkan kamera, lakukan 4 pose, maksimal 2 retake, lalu klik **Simpan & Kirim Hasil**.
5. Server membuat JPEG dari 4 foto × 2 strip dan menyimpan **sementara pada volume privat**. Status `PROCESSING`.
6. Bila workflow 01 sudah aktif dan OAuth terpasang, n8n akan membuat folder Drive, upload, share ke email customer, konfirmasi backend `READY`, log Sheets, kirim Gmail, dan notify Telegram CS.
7. Tombol download **baru** aktif setelah Drive callback berhasil. Jika n8n belum aktif, status PROCESSING dan download tetap terkunci.

## Struktur folder

```text
era-snap/
├── README.md, BUSINESS_PLAN.md
├── .env.example, docker-compose.yml, docker-compose.agents.yml, Dockerfile
├── web/               React + Vite UI/UX; theme picker, camera, B2B leads
├── api/
│   ├── src/           REST API, payment signature, photo composer, outbox worker
│   ├── sql/           PostgreSQL schema initialization
│   └── test/          Node built-in tests
├── n8n/
│   ├── 01-delivery.json
│   ├── 02-b2b-leads.json
│   └── 03-agent-ops-optional.json
├── agents/
│   ├── hermes/        Agent instruction / restriction
│   └── openclaw/      Agent instruction / restriction
├── finance/           Model keuangan XLSX, Sheets header templates
├── docs/              Integrations, architecture, Antigravity prompt
└── scripts/           Workflow generator & QA
```

## Alur dan roles

- **B2C:** Rp15.000 untuk 2 strip digital; tema K-pop-inspired/anime-inspired yang *orisinal* (tidak menggunakan idol/anime berhak cipta).
- **B2B:** inquiry bagi wedding, fan gathering, kampus, corporate. Penjualan dan kontrak custom masih manual via CS; portal organizer, hardware onsite dan quotation generator merupakan roadmap.
- **n8n:** orchestration delivery, keuangan, email, Telegram.
- **Hermes:** AI analyst ringkasan operasional **tanpa data pribadi**.
- **OpenClaw:** ops agent melalui authenticated HTTP hook, workflow 03 optional.
- **Single mail:** satu inbox CS / Gmail. “Single mail protocol” tidak dianggap sebagai protokol teknis baru; SMTP/MCP harus ditetapkan sesuai maksud bila ingin implementasi lebih jauh.
- **SAMP/Paragon:** belum ada API vendor spesifik yang dapat dihubungkan tanpa dokumentasi dan kredensial; BE inti menggunakan Express + PostgreSQL.

## Dokumen penting

- `docs/SETUP_INTEGRATIONS.md` — panduan lengkap Google OAuth, Midtrans, Hermes, OpenClaw, n8n dan troubleshooting.
- `docs/ARCHITECTURE.md` — diagram, status engine, security invariants, backlog production.
- `docs/ANTIGRAVITY_PROMPT.md` — prompt untuk Antigravity IDE dan acceptance criteria.
- `BUSINESS_PLAN.md` — target user B2C/B2B, monetisasi, go-to-market 90 hari, KPI, risiko.
- `finance/model_keuangan_era_snap.xlsx` — asumsi, proyeksi 12 bulan, dashboard, tab `Transaksi` dan `Leads_B2B` untuk Google Sheets.

## QA & test

```sh
cd api
npm install
npm test
cd ../web
npm install
npm run build
```

Node built-in tests memvalidasi signature Midtrans, token dan pricing. Uji integrasi browser/kamera, database, OAuth, n8n dan real webhook harus dilakukan pada lingkungan Anda karena kunci API tidak tersedia dalam ZIP.

## Security sebelum produksi

- Nonaktifkan demo payment dan gunakan HTTPS + Midtrans production callback verification.
- Buat privacy policy + consent, retention/deletion foto, CS mail auth, data minimization, dan aturan hak cipta.
- Simpan env key di secret manager, restrict n8n admin, audit logs dan node permissions.
- Buat reconciliation workflow per order serta error alerts; outbox saat ini melakukan retry **pengiriman event**, bukan retry setiap langkah Google setelah accepted webhook.
- Enforce hard image count/size, add real abuse prevention and end-to-end tests.

## Referensi official integrations

- Midtrans Snap: https://docs.midtrans.com/reference/backend-integration
- Midtrans notification: https://docs.midtrans.com/docs/https-notification-webhooks
- n8n Docker: https://docs.n8n.io/hosting/installation/docker/
- Hermes Agent API: https://hermes-agent.nousresearch.com/docs/user-guide/features/api-server
- OpenClaw hook: https://docs.openclaw.ai/automation/cron-jobs/webhooks
- Google Drive sharing: https://developers.google.com/workspace/drive/api/guides/manage-sharing

© 2026 Era Snap. Demo foundation, no customer photos or credentials bundled.


## Deploy to Vercel

The web frontend is configured for Vercel at the project root. Import this folder into Vercel; it will install and build the Vite app. Set VITE_API_URL to your publicly reachable API base URL (include /api), and set CORS_ORIGIN on the API to the exact Vercel site origin. The Express API, PostgreSQL database, private photo storage, and n8n workflows need a separately hosted backend with persistent storage; Vercel deployment alone publishes the frontend. Apply api/sql/002_era_snap_frames.sql to an existing database, or use the updated 001_init.sql for a new one.

Era Snap includes 15 original album-era-inspired frame styles. The visual designs use original typography, colors, and ornamentation and do not include album cover art or artist photographs.
