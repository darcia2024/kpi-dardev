# Super admin KPI

Target: `kpippmimesirofficial@gmail.com`. Persetujuan pengguna: 6 Oktober 2026, akses seluruh modul dan data termasuk kasus/keuangan rahasia.

## Mekanisme

- Role teknis Supabase tetap ADMIN_SISTEM; hak super admin merupakan persetujuan eksplisit pada tabel privat `identity.super_administrators`, per organisasi, dengan waktu mulai, expiry opsional, rujukan persetujuan dan pencabutan.
- Metadata login atau label UI saja tidak memberi hak ini. Akun harus aktif, terverifikasi, mempunyai persetujuan admin teknis yang belum dicabut, dan tidak diakhiri melalui F05.
- Hak tambahan hanya untuk organisasi KPI. Scope organisasi lain tidak otomatis terbuka. Registry tidak dapat diubah dari akun authenticated/anon.
- Seluruh permission aplikasi yang dikenal tersedia dalam periode operasional sah. Baca data tersedia pada periode resmi terdaftar, termasuk periode belum mulai/sudah berakhir. Mutasi bisnis tetap memerlukan periode ACTIVE/CLOSING dengan tanggal yang berlaku.
- Kasus/keuangan/penilaian dan workflow kerahasiaan dapat dibaca mengikuti scope tersebut. Pemeriksaan konflik kepentingan tetap berlaku. Identitas pemeriksa, pelaksana, penerima, pemilik draf dan mandat keputusan resmi tetap diperiksa oleh workflow masing-masing; tidak ada self-approval otomatis.
- Perlindungan berkas, scanner, klasifikasi publikasi, legal hold, konflik versi, kuota AI dan audit tidak dihapus. Super admin bukan service-role key dan bukan bypass RLS global.

## Pemasangan dan aktivasi

1. Terapkan migration `20261006003300_explicit_super_administration.sql` melalui jalur migration yang digunakan database. Migration ini menambah mekanisme, tidak mengaktifkan orang secara otomatis.
2. Jalankan `supabase/manual/activate-kpi-super-admin.sql` hanya setelah persetujuan aktivasi production. Berkas memvalidasi akun/organisasi yang ada dan mencatat SUPER_ADMIN_ACTIVATED. Tidak membuat akun, periode, mandat atau data contoh baru.
3. Deploy perubahan pembacaan context/UI. Setelah refresh atau login ulang, `/portal/akses` dan `/portal/profil` menampilkan Super admin beserta scope dan status baca/operasional.
4. Untuk pencabutan oleh owner database, isi `revoked_at=now()` pada baris account/organization yang tepat dan catat alasan dalam audit. Jangan membuka update tabel ini untuk klien. Pencabutan menghapus hak tambahan, bukan menghapus grant biasa lain yang sudah sah.

## Pemeriksaan

Tes `hosted-super-admin.test.ts` memeriksa role teknis tanpa persetujuan, scope salah, permission tidak dikenal, seluruh permission aplikasi, registry tidak bisa diubah klien, larangan self-review tugas, periode mendatang baca saja, pencabutan, kedaluwarsa, penangguhan akun dan pencabutan admin teknis. Database tes terisolasi.

Status aktivasi production harus dibuktikan dari hasil SQL dan context akun; file SQL atau tampilan yang sudah deployed bukan bukti bahwa akun telah aktif.

Verifikasi 6 Oktober 2026: typecheck, 187/187 tes dan build production lulus. Deployment `dpl_J66Myq4EHoBcXGcy8ceUsjHcqTrw` READY pada alias `https://kpi-ppmi-mesir-preview.vercel.app`. SQL migration/aktivasi sudah disiapkan di dashboard Supabase, belum dijalankan; menunggu konfirmasi aktivasi saat tindakan browser. Log lokal berada pada `.vercel/super-admin-verify.log` dan `.vercel/super-admin-deploy.log`.

Pembaruan 30 Oktober 2026: kode ini di-commit ke `main` dan terbit di website resmi https://kpi-dardev.vercel.app (188/188 tes lulus). Status migration dan SQL aktivasi di Supabase production belum diperiksa ulang sejak catatan 6 Oktober. Selama migration belum terpasang, `kpi_access_context` tidak mengirim `superAdmin`, sehingga akun berjalan sebagai admin teknis biasa.
