# BUSINESS PLAN STARTUP
## ERA SNAP — *Your little moment, forever.*
**Dokumen kerja / versi MVP, November 2026**

### 1. Executive summary
Era Snap merupakan photobooth berbasis web dengan model **B2C-first, B2B-enabled**. Pengunjung memilih tema **Idol Glow** (estetika K-pop orisinal, bukan foto artis) atau **Anime Dream** (ilustrasi motif Jepang orisinal), memasukkan email/WhatsApp, membayar, melakukan empat kali foto dengan maksimal dua retake, mendapatkan dua photostrip digital, lalu menerima tautan Google Drive secara privat melalui email. Startup tidak memerlukan pencetakan di tahap awal. B2B dijual sebagai paket berlabel acara untuk wedding, event kampus, fan gathering, konser, atau booth brand.

**Unique value proposition:** pengalaman photobooth yang ringan, bisa dimainkan dari laptop/kiosk kamera, harga masuk akal untuk mahasiswa/penggemar, koleksi tema, integrasi delivery/keuangan/CS, dan template frame beridentitas acara.

**Hipotesis strategis:** B2C membentuk kebiasaan dan pengenalan merek; B2B menghasilkan revenue per event lebih tinggi dan menyediakan kanal akuisisi pengguna B2C. Angka keuangan seluruhnya asumsi awal, bukan fakta atau estimasi pasar terverifikasi.

### 2. Potential user: segmentasi yang diprioritaskan

| Segmen | Masalah yang diselesaikan | Produk | Prioritas |
|---|---|---|---|
| B2C penggemar K-pop & anime usia muda | Butuh kenangan lucu/personal untuk dibagikan | Foto 4 pose / 2 strip digital Rp15.000 | **Utama — MVP** |
| B2C pasangan & teman kampus | Momen spontan, hadiah kecil, konten story | Paket 2 strip digital, tema bisa berganti | Utama |
| B2B fan gathering / EO kampus | Aktivitas booth dengan branding komunitas | Paket event, template custom, kuota sesi | **B2B pilot awal** |
| B2B wedding & engagement | Photo corner dengan frame pengantin | Paket 4 jam, label acara, akses tamu | Tahap kedua |
| B2B brand activation / konser | Aktivasi interaktif dengan analytics | White-label, QR, branding, sesi massal | Tahap lanjutan |

**Mengapa tidak hanya B2B wedding?** Siklus penjualan dan kebutuhan onsite lebih kompleks; biaya hardware/staf/koordinasi bisa tinggi. B2C lebih cepat untuk validasi produk. B2B fan gathering dan event kampus paling selaras dengan tema K-pop/anime, menjadi jembatan sebelum wedding/corporate.

### 3. Produk & customer journey

1. **Landing & tema:** pilih Idol Glow/Anime Dream; di masa depan bisa filter template acara/brand.
2. **Identitas & pembayaran:** email untuk menerima file; verifikasi pembayaran backend dengan Midtrans.
3. **Kamera:** empat pose; tiap foto countdown; dua kali retake di UI.
4. **Composer:** foto disusun menjadi dua strip dengan desain sesuai tema; file diproses server.
5. **Drive privat:** n8n membuat satu folder per sesi, upload file, memberi akses ke email customer.
6. **Delivery:** email dikirim; Google Sheets menerima transaksi; Telegram CS mendapat notifikasi.
7. **Customer care:** event inquiry B2B masuk ke CS Gmail + Telegram, serta daftar prospek.
8. **AI ops:** Hermes merangkum KPI anonim, OpenClaw menindaklanjuti arahan ops yang tidak sensitif.

**Invarian produk:** Foto *tidak* dapat diunduh sebelum status upload Drive berhasil (`READY`). Status bayar tidak boleh diubah dari frontend. Modal izin kamera wajib. Akun Google Drive tetap private dan share hanya ke alamat penerima.

### 4. Value & positioning merek

- Brand master: **Era Snap**. Tone: playful, soft pastel, nostalgic, ekspresif.
- Tagline: **Your little moment, forever.**
- Konten visual: original pastel ornaments, stars, hearts, photocards, bukan logo atau wajah idol/anime berhak cipta.
- Pembeda: dua strip untuk satu transaksi + delivery otomatis + event-ready workflow.
- Eksperimen: web self-service untuk B2C; kiosk laptop/tablet + kamera bagi event B2B.

### 5. Revenue model

**B2C:** Harga kerja Rp15.000/sesi (dua photostrip digital), margin tergantung payment fee, cloud, marketing, refund, dan traffic. Tidak ada cetak fisik dalam harga MVP.

**B2B:** Uji penawaran awal Rp2.500.000/event untuk paket digital terbatas dengan branding event (angka hipotesis). Paket onsite dengan operator, lighting, printer, transport, dan jam operasional perlu dihitung terpisah. Konsep paket:

- Event Digital: branding frame custom + kuota sesi + delivery pribadi.
- Event Onsite: Event Digital + perangkat kamera + operator + lighting; harga berdasarkan quotation.
- White Label: integrasi brand, laporan, API/batch billing, kontrak bulanan.

### 6. Go-to-market / validasi 90 hari

**Hari 1–30: validasi keinginan & UX.** Wawancarai 20–30 pengguna B2C relevan dan 5 calon EO/organizer. Uji tiga tema mockup, willingness-to-pay untuk 2 strip, persentase yang menyelesaikan sesi, drop-off kamera, dan conversion dari landing ke bayar. Pilot internal menggunakan demo payment; jangan salah catat sebagai revenue.

**Hari 31–60: closed beta berbayar.** Aktifkan Midtrans sandbox lalu production sesuai kesiapan merchant, satu inbox CS, retention policy, quota. Promosi melalui komunitas K-pop/anime, micro-creator, kolaborasi BEM/UKM kampus. Tes 1–2 acara kecil (sewa digital/organizer), ukur kepuasan organizer dan utilisasi booth.

**Hari 61–90: event pilot & monetisasi.** Tawarkan tiga paket B2B yang jelas; uji penjualan 2–4 event; siapkan template custom dan dashboard ROI event. Kaji ulang unit economics dan reklamasi pengiriman foto.

**Channel promosi:** Instagram Reels / TikTok showcase template orisinal, fandom fan gathering, komunitas anime, promotor kampus, wedding organizer lokal, referral teman dan QR acara.

### 7. KPI & North Star

**North Star:** *jumlah sesi photobooth yang berhasil dibayar, diproses, dan diterima pelanggan di Drive*.

| KPI | Definisi | Target pilot (hipotesis) |
|---|---|---|
| Payment completion | Paid orders / checkout initiated | >70% setelah beta |
| Delivery success | Drive READY / paid photographed orders | >98% |
| End-to-end processing | Median waktu paid → file ready | Diukur awal; optimasi setelah data tersedia |
| Session completion | Sesi selesai / sesi mulai kamera | >85% |
| Support rate | Tiket CS / 100 paid orders | <5 |
| B2B conversion | Kontrak deal / qualified event leads | Diukur pilot pertama |
| Photo retention satisfaction | Hasil survey dari 1–5 | ≥4 rata-rata |

Target hanyalah alat pembelajaran; bukan benchmark industri yang sudah diverifikasi.

### 8. Proyeksi keuangan — skenario ilustratif

Berkas `finance/model_keuangan_era_snap.xlsx` memuat input yang dapat diedit, proyeksi 12 bulan, ringkasan omzet/kas, header transaksi aktual untuk n8n, dan pipeline lead B2B. Default assumptions:

| Parameter | Nilai asumsi |
|---|---:|
| Harga B2C, 2 strip | Rp15.000 |
| Volume B2C bulan 1 | 150 sesi |
| Pertumbuhan B2C / bulan | 8% |
| Fee pembayaran | 2,5% dari B2C, *cek tarif riil per channel* |
| Storage/variabel digital / sesi | Rp1.500 |
| Harga B2B / event | Rp2.500.000 (hipotesis) |
| Biaya langsung B2B / event | Rp1.000.000 (hipotesis) |
| Event bulan 1 | 2 |
| Biaya tetap / bulan (hosting + marketing + CS) | Rp3.200.000 |
| Capex awal | Rp4.000.000 |

Proyeksi default dari workbook menghasilkan total *omzet sekitar Rp147,7 juta*, laba operasional *sekitar Rp62,0 juta*, serta kas akhir *sekitar Rp58,0 juta* untuk 12 bulan **hanya bila seluruh asumsi tercapai**. Belum termasuk pajak, gaji pendiri penuh, potongan gateway riil per transaksi, refund, pajak/biaya B2B aktual, biaya perangkat, dan risiko kegagalan bisnis. Jangan gunakan angka itu sebagai klaim investor tanpa data pilot.

### 9. Technology & scaling

**FE:** React + Vite, mobile-responsive, webcam, tema, countdown/retake, form B2B.

**BE:** Node.js/Express + PostgreSQL, kontrol harga/status server, signed Midtrans callback, private media, outbox event, protected download, internal service token.

**Workflow:** n8n — Google Drive, Google Sheets, Gmail, Telegram. Hermes — API server OpenAI compatible untuk ops; OpenClaw — protected inbound webhook agen ops; Docker Compose untuk API/DB/n8n dan Hermes opsional. Paragon/SAMP belum dikunci tanpa kejelasan vendor/API; adapter HTTP dapat ditambahkan.

**Scale-up:** pindahkan dari local volume ke object storage/private buckets, job queue durable, CDN hanya untuk aset publik, monitoring dan auto retry per node, retention, delete request, event-code signed, per-venue account dan reporting.

### 10. Risks & mitigations

| Risiko | Mitigasi |
|---|---|
| Kamera/browser menolak akses | HTTPS, test device matrix, fallback panduan permission |
| Pembayaran palsu | Hanya Midtrans signature verified/backend, sandbox terpisah |
| Customer photo bocor | Private files, access token, Drive share ke email tertentu, retention & deletion |
| Workflow n8n gagal setelah HTTP 200 | Error workflow, alert, idempotent reconciliation, CS manual replay |
| Penggunaan copyright K-pop/anime | Jangan gunakan wajah idol, logo band, klip anime, lagu komersial tanpa lisensi |
| Harga terlalu rendah untuk CAC | Uji marketing cost/session, margin kontribusi, repeat purchase |
| B2B event onsite mahal | Quote berdasarkan lokasi/jam/staf/cetak, jangan pakai harga B2C |
| AI agent melakukan aksi tak diotorisasi | Hanya laporan agregat, no PII, approval manusia, least privilege |

### 11. Roadmap produk

**MVP (paket ZIP ini):** checkout demo/Midtrans, webcam 4 pose, 2 retakes UI, two strips composer, Drive first, email & Telegram (setelah OAuth), Google Sheets, B2B form, Hermes/OpenClaw API hooks opsional.

**V1 launch-ready:** production domain HTTPS, stronger reconciliation, email failure retry, Google OAuth granted+tested, payment QA, customer consent and deletion, legal pages, CI/CD + tests E2E.

**V2:** paket/frames builder, event code, dashboard organizer, print kiosk, customer QR, coupon/fan campaign, referral, manual photo editor, image enhancements.

### 12. Kriteria Go / No-Go

Go jika 30 transaksi production uji coba terselesaikan tanpa foto salah kirim, seluruh pembayaran diverifikasi, Google Drive mencapai ready sesuai SLA pilot, CS mampu menangani masalah, margin kontribusi positif setelah biaya nyata; minimal 1 event B2B membayar dan menunjukkan kebutuhan produk. Jika gagal, pilih penyesuaian harga, UX, atau channel sebelum memperbesar marketing.
