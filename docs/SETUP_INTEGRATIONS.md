# Panduan Integrasi — n8n, Hermes, OpenClaw, Google, Midtrans

## 0. Wajib sebelum mulai

- Install Docker Desktop + Docker Compose v2.
- `cp .env.example .env` (Windows PowerShell: `Copy-Item .env.example .env`).
- Isi secret acak panjang minimal 32 byte untuk `INTERNAL_API_KEY`, `N8N_SHARED_SECRET`, `N8N_ENCRYPTION_KEY`, `SESSION_SECRET`, `ADMIN_KEY`. Samakan password Postgres dengan `DATABASE_URL`.
- Gunakan `APP_ENV=development`, `PAYMENT_MODE=demo`, `ALLOW_DEMO_PAYMENT=true` **hanya untuk tes lokal**.
- Jalankan `docker compose up --build -d`. Akses website `http://localhost:4000` dan n8n `http://localhost:5678`.
- Pilih owner/admin n8n pada onboarding pertama. Jangan bagikan akun ini.

## 1. Import 3 workflow n8n

1. n8n → Workflows → Import from File → `n8n/01-delivery.json`.
2. Import `n8n/02-b2b-leads.json` dan `n8n/03-agent-ops-optional.json`.
3. Workflow 01: sambungkan akun Google Drive pada node *Create Session Folder*, *Upload File to Drive*, dan *Share Privately With Customer*.
4. Workflow 01: sambungkan Google Sheets pada *Append Finance Row*, pilih Google Spreadsheet ID (`GOOGLE_SHEET_ID`) dan tab **Transaksi**. Jika pemilihan ID via env gagal di UI n8n, isi langsung Spreadsheet ID pada node (non-secret).
5. Workflow 01: sambungkan Gmail pada *Email Customer*. Pastikan *Send Email* di Gmail credential bisa mengirim.
6. Workflow 01: sambungkan Telegram pada *Notify CS Telegram*, isi `TELEGRAM_CS_CHAT_ID` di .env (gunakan bot pribadi; tambahkan bot ke group CS bila perlu).
7. Workflow 02: isi Gmail CS + Telegram CS + Sheets **Leads_B2B**.
8. Pastikan `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` hanya pada lingkungan self-hosted admin tepercaya. Node Verify Delivery/Lead mengecek secret dari header.
9. **Activate** Workflow 01 dan 02. URL produksi n8n di dalam Docker: `http://n8n:5678/webhook/era-snap-delivery` dan `/era-snap-lead`.
10. Kirim satu order demo, simulasi bayar, ambil foto. Status `PROCESSING` menjadi `READY` hanya setelah Drive file + share selesai dan API callback sukses.

### Header Spreadsheet Google

Tab `Transaksi` kolom baris 1, urutan persis:
`timestamp,order_id,name,email,phone,theme,amount_idr,status,drive_file_id,drive_link`

Tab `Leads_B2B` kolom baris 1:
`timestamp,lead_id,company,contact_name,email,phone,event_type,event_date,notes`

Template ada di `finance/model_keuangan_era_snap.xlsx` (tab Transaksi dan Leads_B2B). Import workbook itu ke Google Sheets dan pastikan tab serta header-nya cocok.

### Akses Drive (privat, bukan public link)

Node *Share Privately With Customer* menambahkan izin `reader` ke **email customer yang masuk pada order**. Gmail kemudian mengirim URL Drive khusus. Customer harus login ke akun email yang sama untuk membuka file; tidak menggunakan izin `anyone` publik.

### Troubleshooting

- Order tetap PROCESSING: pastikan Workflow 01 aktif, `x-fotobox-secret` sesuai `N8N_SHARED_SECRET`, dan Google OAuth/Tg/Gmail credential dipilih. Cek n8n → Executions. Jika gagal setelah respons webhook 200, backend outbox *tidak* mengulang otomatis karena Drive duplikat. Pulihkan secara manual setelah mengecek folder/Drive ID.
- Error 403 internal: `INTERNAL_API_KEY` pada API dan n8n tidak sama atau env belum terbaca. Restart Compose.
- Kamera tidak muncul: browser butuh HTTPS atau localhost. Izinkan izin kamera.
- Drive berhasil tetapi email gagal: pesanan tetap READY. Dari UI, user dapat mengunduh lewat token sesi; perbaiki email dan kirim ulang email melalui n8n.
- Tidak bisa klik: jalankan frontend di `http://localhost:4000`, buka DevTools Console dan log `docker compose logs -f api`, periksa overlay modal dan browser extension.

## 2. Midtrans untuk transaksi sesungguhnya

1. Buat akun merchant Midtrans dan ambil Server Key sandbox. Set `.env`: `PAYMENT_MODE=midtrans`, `ALLOW_DEMO_PAYMENT=false`, `MIDTRANS_IS_PRODUCTION=false`, `MIDTRANS_SERVER_KEY=...`.
2. Tentukan domain HTTPS publik untuk API. Di dashboard merchant, set Payment Notification URL ke `https://domain-anda/api/webhooks/midtrans`.
3. Uji pembayaran sandbox dari browser, lalu pastikan callback signed masuk dan status berubah PAID.
4. Ketika akun merchant lulus aktivasi, set `MIDTRANS_IS_PRODUCTION=true`, Server Key production, domain/TLS, serta rate limits. **Jangan** pakai demo mode di production.
5. SHA-512 signature Midtrans dipastikan dari `order_id+status_code+gross_amount+ServerKey`; total dan ID dicocokkan dengan data server.

Rujukan resmi: https://docs.midtrans.com/docs/https-notification-webhooks dan https://docs.midtrans.com/reference/backend-integration

## 3. Hermes Agent AI — kontrol operasional

Hermes Agent dari Nous Research **bukan API key generik ChatGPT**. Instal Hermes sesuai dokumentasi resminya, lalu aktifkan API Server dengan `API_SERVER_ENABLED=true`, `API_SERVER_KEY=<TOKEN>`. Gateway default melayani `http://127.0.0.1:8642/v1/chat/completions` dan model `hermes-agent`. Rujukan: https://hermes-agent.nousresearch.com/docs/user-guide/features/api-server

Pilihan A — Hermes di host Windows/WSL: jalankan `hermes gateway`, isi `HERMES_API_URL=http://host.docker.internal:8642/v1/chat/completions`, `HERMES_API_KEY=<TOKEN>` pada `.env`. Pastikan gateway di-bind secara aman agar kontainer bisa mengaksesnya (host loopback mungkin perlu host networking/port proxy).

Pilihan B — Hermes Docker official (lebih sederhana untuk jaringan Compose): siapkan konfigurasi/model Nous terlebih dahulu lalu jalankan service `hermes` lewat overlay:

```sh
docker compose -f docker-compose.yml -f docker-compose.agents.yml --profile agents run --rm hermes setup
docker compose -f docker-compose.yml -f docker-compose.agents.yml --profile agents up -d
```

Set `HERMES_API_KEY` yang sama untuk service Hermes dan API backend. Output Hermes pada MVP digunakan untuk **ringkasan kinerja anonim** saja. Jangan memberikan akses terminal Hermes pada pesan pelanggan tanpa approval, sandbox dan allowlist.

File petunjuk operator: `agents/hermes/AGENT_INSTRUCTIONS.md`.

## 4. OpenClaw — agent workflow opsional

OpenClaw adalah **gateway agent** yang dijalankan dan di-onboard secara terpisah. Gunakan instalasi resmi (bisa via Docker) https://docs.openclaw.ai/install/docker. Aktifkan ingress terautentikasi pada config gateway:

```json
{
  "hooks": {
    "enabled": true,
    "token": "GANTI_TOKEN_RANDOM_PANJANG",
    "path": "/hooks",
    "allowedAgentIds": ["main"],
    "allowRequestSessionKey": false
  }
}
```

`OPENCLAW_HOOK_URL` menunjuk ke `http://host.docker.internal:18789/hooks/agent` jika gateway di host. Set `OPENCLAW_HOOK_TOKEN` di `.env` sesuai token hook, bukan token admin dashboard. Workflow 03 secara terpisah mengirim ringkasan agregat Hermes ke Telegram CS dan OpenClaw pada pukul 09:00 WIB. **Jangan aktifkan sebelum Hermes dan OpenClaw gateway siap.** Rujukan: https://docs.openclaw.ai/automation/cron-jobs/webhooks

File instruksi agent: `agents/openclaw/AGENTS.md`.

## 5. Email / “single mail protocol”

Satu alamat CS (`CS_EMAIL`) berfungsi sebagai pintu masuk inquiry B2B dan pengirim otomatis customer delivery menggunakan node Gmail n8n. Jika yang dimaksud istilah *single mail protocol* adalah SMTP, provider Gmail n8n dapat diganti dengan SMTP relay yang valid. Bila yang dimaksud *MCP* (Model Context Protocol), itu berbeda dari email/SMTP; paket ini **tidak** mengklaim sudah memiliki server MCP atau konektor Paragon khusus. Integrasi agent menggunakan Hermes API dan OpenClaw HTTP hook resmi.

## 6. “SAMP/Paragon”

Nama SAMP/Paragon belum menentukan produk backend, API base URL, maupun credential yang jelas. Implementasi inti memakai stack **Node.js/Express + PostgreSQL**, dengan adapter HTTP/worker pada backend untuk kelak dihubungkan ke API SAMP/Paragon yang Anda gunakan. Jangan menempel key Paragon di frontend.

## 7. GitHub & Antigravity

- Buka folder `era-snap` di IDE Antigravity. Gunakan `docs/ANTIGRAVITY_PROMPT.md` untuk modifikasi UI/UX dan kerja agen.
- Push source ke repo GitHub yang sudah Anda punya; **jangan commit `.env` atau storage**. Contoh:

```sh
git init
git add .
git commit -m "feat: Era Snap photobooth foundation"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main
```

- Sebelum launching, atur domain, SSL/TLS, monitoring, privacy policy, refund policy, rate limiting, payment reconciliation, durable n8n error workflows, backup, dan uji dengan customer sebenarnya.
