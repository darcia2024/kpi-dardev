# Perbaikan dependency dan verifikasi akses

Tanggal: 6 Oktober 2026.

## Perubahan

Dependency transitif `source-map-js` dalam lockfile diperbarui dari 1.2.1 ke 1.2.2 untuk GHSA-68fv-2mgg-jv7q. Versi Next.js dan konfigurasi izin pengguna tidak berubah. Pembaruan dilakukan dengan `npm update source-map-js --ignore-scripts`.

Script `scripts/check-anonymous-access.ts` memeriksa endpoint GET internal yang ditemukan di direktori `src/app/api/v1/work`. Permintaan tidak membawa cookie/token, tidak mengikuti redirect, dan tidak melakukan mutasi. ID berbentuk UUID hanya dipakai sebagai parameter URL, tanpa membuat record.

Jalankan dari root repository:

```powershell
$env:NODE_OPTIONS='--use-system-ca'
node --import tsx scripts/check-anonymous-access.ts https://kpi-ppmi-mesir-preview.vercel.app
```

## Hasil lokal dan website sebelum patch deployment

- `npm audit --omit=dev`: 0 kerentanan yang diketahui oleh registry saat pemeriksaan. Hasil ini bukan sertifikasi keamanan aplikasi.
- `npm run verify`: typecheck, 185/185 tes, dan build production lulus.
- Typecheck setelah penambahan script juga lulus.
- Website production sebelum rilis patch: 27/27 endpoint GET internal merespons 401 terhadap permintaan anonim.
- Log lokal: `.vercel/security-readiness-verify.log` dan `.vercel/security-anonymous-before.log`. Log tidak disimpan dalam Git.

## Bukti dan batas pengujian

Suite mencakup penolakan akses anonim, pencabutan izin, isolasi organisasi/periode/objek, konflik perubahan, larangan perubahan tabel langsung oleh pengguna, berkas private, serta pemeriksaan independen dalam database pengujian PGlite. Pemeriksaan source pada endpoint kasus juga menemukan validasi sesi di server, pemeriksaan origin untuk mutasi, dan otorisasi di RPC.

Tes tersebut tidak membuktikan setiap halaman dan tindakan dengan sesi pengguna di Vercel. Script hanya memeriksa penolakan GET anonim; tidak menguji POST, izin antarperan, isi database production, atau ketahanan serangan.

## Penutupan yang masih diperlukan

1. UAT Vercel memakai admin dan akun pengurus resmi dengan izin terbatas: tambah/edit, refresh, berkas, revisi/approval, akses URL langsung, serta pencabutan izin. Gunakan scope dan periode yang sah; jangan membuat mandat/periode palsu untuk membuka alur production.
2. Konfigurasi dan persetujuan penyedia pemindai berkas, AI, serta pengiriman eksternal yang masih tertunda.
3. Pembuktian backup dan restore database/storage production, monitoring, dan prosedur insiden.
4. Commit/push seluruh perubahan terbaru agar repository sesuai dengan deployment, lalu catat release dan penerimaan pengurus.

## Deployment patch

Deployment `dpl_98bQDNTPLwg55ND5nrwsGGx5fh1f` berstatus Ready, target production, dan alias `https://kpi-ppmi-mesir-preview.vercel.app` sudah mengarah ke rilis tersebut. URL deployment: `https://kpi-ppmi-mesir-preview-ojg3ncocf-darcia2024s-projects.vercel.app`.

Pemeriksaan ulang setelah deploy: 27/27 endpoint GET internal menolak permintaan anonim dengan 401. Log lokal: `.vercel/security-anonymous-after.log`; log deploy: `.vercel/security-patch-deploy.log`.

Status: perbaikan dependency selesai dan sudah live. Penerimaan keamanan dan operasional final masih menunggu bukti di atas.
