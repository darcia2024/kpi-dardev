# Paket 2 — identitas dan hak akses Production

Status: implementasi dan tes lokal selesai; aktivasi Supabase serta uji akun pengurus nyata masih diperlukan. Tidak membuat dummy pengurus atau memberi izin bisnis otomatis.

Pemeriksaan kandidat Production `dpl_EdiEVoTeYU8XWC4CkcZjjnAwqvbX` pada 2 Oktober 2026: Auth, REST database dan schema organisasi PASS; `identity-access-rpc` gagal HTTP 404 / PGRST202. RPC belum ditemukan oleh API Supabase. Build berhenti sebelum rilis; kandidat menggunakan `--skip-domain`, sehingga domain live tetap memakai deployment paket 1. Audit dependency produksi tetap 0 temuan.

## Implementasi

- Login memerlukan akun Auth dengan email terverifikasi dan metadata KPI yang disetujui, lalu membaca `kpi_access_context()` dari database dengan sesi pengguna. Tidak ada fallback ke metadata ketika RPC/database belum siap.
- `identity.accounts.auth_user_id` menghubungkan akun organisasi ke UUID Supabase Auth secara eksplisit. Status ACTIVE, email yang cocok, role aktif, dan metadata akses diperiksa ulang di database.
- RPC mengembalikan identitas sendiri, penugasan saat ini, dan grant aktif. Grant terikat organisasi, periode, divisi atau objek; akun tanpa penugasan aktif tidak mendapat izin bisnis.
- Helper `hasHostedPermission` serta `requireHostedPermission` tersedia untuk migrasi modul berikutnya. Scope organisasi dan periode wajib; nama role bukan shortcut untuk seluruh permission.
- Profil `/portal/profil` dan `/portal/akses` menampilkan konteks database. Modul lain tetap ditutup sampai persistence online tersedia.
- API `/api/v1/auth/access`: GET membaca konteks sendiri; POST memberi/mencabut grant melalui RPC sesi pengguna. POST memeriksa origin, UUID, dan alasan. Tabel tidak memberi izin mutasi langsung kepada authenticated.
- RPC manajemen membutuhkan IDENTITY_MANAGE dalam scope yang sama; melarang mutasi izin diri sendiri dan pendelegasian IDENTITY_MANAGE, hanya dapat mendelegasikan permission yang sedang dimiliki, membatasi expiry ke masa izin pengelola, serta mencatat audit. Bootstrap pengelola pertama dilakukan owner database, bukan self-service.
- RLS SELECT membatasi akun, role, grant, penugasan, organisasi, periode, posisi dan divisi. Tidak membuka SELECT ke anon atau UPDATE/INSERT/DELETE ke authenticated.
- Build Production kini juga memeriksa keberadaan RPC identitas. Probe server tanpa sesi manusia tidak mengembalikan identitas; ini hanya pemeriksaan instalasi, bukan bukti login akun nyata.

## Pengujian

`npm run verify` lulus: **156 tes**, TypeScript dan build. SQL installer dijalankan dalam PGlite (PostgreSQL tertanam) dengan fixture Auth dan role Supabase; pgcrypto tidak dipasang pada runtime tes, karena UUID generation tersedia bawaan.

Pengujian mencakup membaca hanya akun/organisasi/periode sendiri, penolakan mutasi langsung dan akses anon, pembatasan lintas organisasi, penugasan yang berakhir, pencabutan grant, penangguhan akun, penolakan self escalation/delegasi izin yang tidak dimiliki, expiry delegasi dan audit. Tes ini tidak menggantikan pengujian pada Supabase live dengan akun nyata.

## Langkah manual Supabase Production

1. Buka SQL Editor pada project Supabase yang digunakan Vercel Production. Jalankan **sekali** seluruh [installer paket 2](../supabase/manual/paket-2-install.sql). Installer menggabungkan fondasi identitas/divisi serta dua migration baru dalam satu transaksi. Prasyarat: fondasi platform paket 1 sudah terpasang. Jika migration sudah dikelola oleh CLI, terapkan berkas migration yang belum diterapkan; jangan menjalankan installer setelah dua migration baru sudah terpasang.
2. Tidak perlu expose schema `identity`: RPC berada di `public`, yang sudah digunakan API Supabase. Schema `org` tetap exposed dari paket 1. Installer tidak memasukkan daftar pengurus atau data contoh.
3. Pastikan organisasi, periode ACTIVE dan posisi/divisi resmi telah dimasukkan dengan data yang disahkan KPI. Periksa ID untuk penugasan:

   ```sql
   select id, code, name from org.organizations;
   select id, organization_id, code, starts_on, ends_on, status from org.periods;
   select id, organization_id, division_id, code, name from org.positions;
   ```

4. Buat/undang akun Auth pengurus melalui dashboard Supabase dan pastikan email terverifikasi. Jangan kirim password melalui chat. Temukan UUID akun tersebut di Auth Users.
5. Buka [template aktivasi satu pengurus](../supabase/manual/paket-2-aktifkan-pengurus.sql), isi empat nilai yang masih `null`: UUID Auth, nama resmi, UUID posisi, dan UUID periode. Pilih technical role PENGURUS atau ADMIN_SISTEM. Jalankan sebagai owner database. Template belum diisi sengaja akan berhenti; tidak ada data dummy yang dibuat. Role teknis admin tidak otomatis memberi izin keuangan/kasus/publikasi.
6. Berikan permission yang disahkan KPI pada `identity.permission_grants`. Set account, organisasi, periode, divisi/objek jika terbatas, alasan, aktor pemberi, dan expiry sesuai kebijakan. Penugasan penerima harus sesuai scope. Untuk pengelola pertama, IDENTITY_MANAGE harus diberikan oleh owner; untuk delegasi izin lain API hanya memperbolehkan permission yang sudah dimiliki pengelola.

Nama jabatan menentukan tanggung jawab resmi; grant harus ditetapkan sesuai matrix yang disahkan. Jangan mengubah semua account menjadi admin agar bisa login.

## Aktivasi dan uji online

Setelah SQL dan minimal satu akun resmi siap:

```powershell
vercel deploy --prod --yes
```

Build menolak rilis jika RPC belum tersedia. Uji login, profil, hak akses, reload sesi, logout, akun tidak disetujui, grant dicabut, dan akun SUSPENDED. Pastikan perubahan langsung memengaruhi permintaan baru. Akun tanpa grant tetap dapat melihat profil, tetapi tidak memperoleh pekerjaan bisnis.

Paket 2 belum dinyatakan tuntas operasional sebelum instalasi dan login pengurus nyata terverifikasi. MFA hosted dan pemulihan password dengan provider belum diselesaikan pada paket ini; jangan memakai MFA/reset lokal sebagai bukti fitur tersebut siap online. Administrasi roster/jabatan melalui UI masih memakai jalur lokal; onboarding hosted saat ini melalui template owner, dan manajemen grant hosted melalui API/RPC.

## Aktivasi production — 2 Oktober 2026

Pemeriksaan SQL Editor project `gtjzlkmwafyttevertho` menemukan RPC identitas dan kolom Auth sudah terpasang, tetapi organisasi, periode, posisi dan akun internal masih kosong. Installer tidak dijalankan ulang.

Setelah persetujuan pengguna, akun Auth terverifikasi `kpippmimesirofficial@gmail.com` diaktifkan dengan peran teknis ADMIN_SISTEM memakai `supabase/manual/paket-2-aktifkan-admin-awal.sql`. RPC identitas terverifikasi mengembalikan nama dan role yang benar, memberships kosong dan grants kosong. Aktivasi dicatat pada audit. Tidak membuat periode, jabatan, penugasan atau izin bisnis rekaan.

Template aktivasi pengurus diperbaiki agar memasukkan role hanya bila belum ada role aktif; primary key account_roles memuat starts_at sehingga conflict(account_id,role_id) tidak valid. Tes PostgreSQL mencakup aktivasi admin awal, pengulangan tanpa menggandakan role aktif, dan ketiadaan membership/grant otomatis.

Production deployment `dpl_DfTH8sJooBxgoXyNdhQPcYm4bJoT` READY. Keempat probe koneksi termasuk identity RPC lulus HTTP 200, TypeScript dan build lulus. Domain live: https://kpi-ppmi-mesir-preview.vercel.app. Halaman /masuk sudah menampilkan form login hosted. Uji login dengan kata sandi asli masih menunggu pengguna; keberhasilan aktivasi database bukan bukti sesi login browser berhasil. Pengguna mengisi kata sandi akun Supabase Auth yang sudah ada, tanpa mengirimkannya ke chat.
