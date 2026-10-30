# Firewall website KPI

Dipasang 30 Oktober 2026 atas permintaan owner. Ada dua lapis: aturan di kode aplikasi (ikut repo, aktif di setiap deploy) dan Vercel Firewall (diatur di dashboard Vercel project `kpi-dardev`).

## Lapis 1: di kode aplikasi

| Perlindungan | Isi | Lokasi |
|---|---|---|
| Content-Security-Policy | Browser cuma boleh memuat script, gaya, gambar, font, dan koneksi dari `kpi-dardev.vercel.app` sendiri. Website nggak bisa ditampilkan di dalam iframe situs lain. | `src/platform/http/security-headers.ts`, dipasang lewat `next.config.ts` |
| Strict-Transport-Security | Browser dipaksa selalu pakai HTTPS selama 2 tahun. | sama |
| X-Frame-Options `DENY` | Cadangan anti-clickjacking untuk browser lama. | sama |
| X-Content-Type-Options `nosniff`, Referrer-Policy, Permissions-Policy, Cross-Origin-Opener-Policy | Browser nggak menebak jenis berkas, nggak membocorkan alamat lengkap ke situs lain, dan kamera/mikrofon/lokasi dimatikan. | sama |
| Cek asal request | `/api/v1/auth/sign-in` dan `/api/v1/auth/recovery` menolak (403) request yang nggak datang dari website ini sendiri. Rute portal lain sudah punya cek ini sebelumnya. | `src/platform/http/attempt-limit.ts` |
| Pembatas percobaan login | Per alamat IP: maksimal 30 percobaan login per 15 menit, dan 10 per 15 menit untuk satu email. Lupa sandi: 5 permintaan per 15 menit. Lewat dari itu dijawab 429 dan formulir menampilkan "Tunggu 15 menit". | sama |
| Pembatas formulir pengaduan | Sudah ada sejak awal, dihitung di database per sidik IP. | `hosted-public-intake.ts` |

Batasan pembatas login: hitungannya disimpan di memori server, jadi berlaku per instance Vercel dan hilang kalau instance diganti. Ini rem, bukan jaminan. Supabase Auth juga punya batas login sendiri.

Tes: `tests/firewall.test.ts` (pembatas, IP, origin, isi header) dan `e2e/publik.spec.ts` (header ada di halaman publik dan login, tanpa pelanggaran CSP di konsol).

## Lapis 2: Vercel Firewall (dashboard)

Vercel → `kpi-dardev` → Firewall → Rules.

| Fitur | Status | Catatan |
|---|---|---|
| DDoS mitigation | Aktif otomatis | Dikelola Vercel, gratis. |
| AI Bots | **Aktif (blokir)** sejak 30 Oktober 2026 | Bot AI dan scraper yang dikenal ditolak. |
| Bot Protection | Off, sengaja | Kalau dinyalakan, cek uptime dari GitHub Actions (curl) akan kena challenge dan memicu alarm palsu. |
| Rate limit di edge | Tidak dipasang | Vercel menagih $0.50 per 1 juta request yang dicek. Owner memutuskan tidak dulu; pembatas di kode yang dipakai. |
| Attack Mode | Off | Nyalakan hanya saat diserang (Danger Zone → Enable Attack Mode). Semua pengunjung dicek JavaScript dulu; cek uptime akan ikut gagal selama aktif. |
| IP Blocking | Kosong | Isi kalau ada alamat yang terbukti menyerang (Add IP). Gratis. |
| OWASP Core Ruleset | Tidak tersedia | Khusus paket Enterprise. |

## Kalau ada serangan

1. Buka Vercel → `kpi-dardev` → Firewall untuk melihat lalu lintas yang ditolak dan alamat asalnya.
2. Alamat yang jelas menyerang: Rules → IP Blocking → Add IP.
3. Serangan besar: Danger Zone → Enable Attack Mode, lalu matikan lagi setelah reda.
4. Catat kejadiannya di issue GitHub.

## Kalau menambah layanan luar

CSP hanya mengizinkan origin sendiri. Kalau nanti memasang analitik, peta, video embed, atau widget dari domain lain, tambahkan domainnya di `securityHeaders()` dan jalankan `npm run test:e2e` untuk memastikan tidak ada pelanggaran CSP.
