# Modul tugas hosted — 2 Oktober 2026

## Hasil implementasi

Pilot modul kerja online memakai Supabase PostgreSQL, sesi Auth pengguna dan permission scope yang sudah dibuat pada Paket 2. Tidak memakai SQLite, akun hardcoded, atau service-role untuk membaca maupun mengubah pekerjaan.

- `/portal/tugas`: penugasan aktif, pencarian dan filter status, membuat tugas untuk diri sendiri, detail dan riwayat.
- `/api/v1/work/tasks`: daftar maksimal 200 tugas terbaru dan membuat tugas.
- `/api/v1/work/tasks/[id]`: detail dan tindakan START, SUBMIT, APPROVE, REQUEST_REVISION, CANCEL.
- Migration `20261002000300_hosted_tasks.sql`: tabel `work.tasks`, `work.task_events`, RPC transaksi, policy read berdasarkan scope, dan probe readiness untuk deployment.
- Tugas: OPEN → IN_PROGRESS → IN_REVIEW → DONE; review bisa meminta REVISION → IN_PROGRESS. Pembatalan hanya dari OPEN, IN_PROGRESS, REVISION.
- Catatan wajib untuk setiap tindakan. Riwayat dan audit ditulis dalam transaksi yang sama.
- Reviewer tidak boleh merupakan pembuat atau pemilik tugas. Pengajuan hanya oleh pemilik. Permission diperiksa ulang dalam RPC; role ADMIN_SISTEM tidak otomatis memberi izin.
- Versi optimistis dan row lock menolak perubahan dari layar lama. Idempotency key per pembuat menangani pengulangan create, dan ditolak jika payload berubah.
- Input dibatasi, POST memeriksa origin, respons data memakai private/no-store, dan RPC memakai search_path kosong. Tidak ada mutasi tabel langsung untuk authenticated/anon.

## Persiapan production

Migration belum terpasang saat pemeriksaan awal SQL Editor: `work.tasks` dan `kpi_tasks_ready()` keduanya NULL. Pemasangan dan rilis menunggu konfirmasi perubahan akses RPC melalui browser. Build production menolak rilis sebelum readiness RPC mengembalikan true.

Tidak membuat data organisasi/periode/jabatan atau grant rekaan. Untuk memakai modul: masukkan periode resmi yang aktif, posisi resmi, penugasan akun, dan permission TASK_READ/TASK_CREATE/TASK_SUBMIT/TASK_REVIEW yang disahkan sesuai tugasnya. Review perlu akun kedua yang berizin, bukan akun pembuat/pemilik. Akun tanpa penugasan atau izin melihat penjelasan dan tautan hak akses, tanpa data pekerjaan.

## Pengujian

`npm run verify` lulus (TypeScript, suite tes dan build). PostgreSQL tertanam menjalankan migration yang sebenarnya dan memverifikasi: persistence, retry create, payload konflik, versi lama, larangan self review, transisi revisi dan selesai, akun tanpa penugasan, periode/divisi salah, larangan mutasi langsung, anon, pencabutan izin, dan riwayat/audit. Pengujian tambahan membatasi grant objek dan periode CLOSED.

UAT pada Supabase production menggunakan penugasan dan dua akun nyata belum dijalankan. Kelulusan tes lokal bukan bukti UAT hosted selesai.

## Batas tahap ini

Pilot ini belum memigrasikan lampiran/storage, checklist, komentar, dependency, template, delegasi pemilik, notifikasi atau deadline extension dari modul lokal. Daftar dibatasi 200 tugas terbaru; pagination lanjutan menyusul. Halaman belum menyediakan pintu detail untuk grant yang hanya mengizinkan satu objek; RPC detail tetap membatasi objek sesuai grant. Modul internal lain tetap ditutup sebelum repository hosted-nya siap.

Langkah setelah pilot tugas: intake/pengaduan dan alur sekretaris–IOD, dokumen/storage private, rapat dan redaksi, lalu modul tata kelola lainnya. Jangan mengaktifkan penerimaan laporan sensitif sebelum penanggung jawab dan izin kasus nyata siap.

## Pemasangan dan rilis production

Setelah persetujuan eksplisit pengguna, migration dijalankan melalui SQL Editor Supabase project `gtjzlkmwafyttevertho`. Hasil Success; verifikasi owner mengembalikan ready=true, tasks=0, events=0, grants=0. Tidak ada data contoh, penugasan atau izin akun baru.

Deployment production `dpl_6xe6aJhbAUEfzZtqkNUw7UEPx6K1` READY dan terhubung ke domain https://kpi-ppmi-mesir-preview.vercel.app. Lima probe koneksi lulus HTTP 200, TypeScript dan build lulus. Browser anonim membuka /portal/tugas tanpa redirect ke /portal dan menampilkan Masuk diperlukan. UAT login/pekerjaan memakai penugasan resmi belum dilakukan; periode, posisi dan grants masih perlu disahkan serta dimasukkan.
