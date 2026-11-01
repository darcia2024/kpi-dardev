# Data contoh (dummy) di website resmi

Dipasang 1 November 2026 atas permintaan pengembang supaya setiap halaman dan modul bisa dilihat terisi sebelum periode resmi berjalan. Semua data contoh **wajib dihapus sebelum periode 2026_2027 diaktifkan**.

## Apa yang dipasang

| Bagian | Isi |
|---|---|
| Periode | `CONTOH`, status ACTIVE, 30 hari ke belakang sampai 120 hari ke depan dari tanggal pemasangan. Periode resmi `2026_2027` tetap PLANNED dan tidak disentuh. |
| Akun | 6 akun `*@contoh.invalid` (Ketua, Sekretaris, Bendahara, Koordinator, Media, Intelijen). Tanpa kata sandi dan diblokir permanen di Supabase Auth, jadi tidak bisa login. |
| Unit dan jabatan | Divisi `CONTOH_IOD` dan enam jabatan berawalan `CONTOH_`. |
| Izin | Dua mandat pejabat contoh, lalu keputusan F01 dan izin untuk setiap akun, lewat rantai yang sama dengan akun sungguhan. |
| Tugas | 6 tugas dengan status berbeda: selesai, menunggu review, revisi, dikerjakan, dan belum dimulai. |
| Rapat | Satu rapat besok dengan konfirmasi hadir, dan satu rapat minggu lalu dengan voting dan notulen yang sudah disahkan. |
| Situs publik | 2 kabar, 2 agenda kegiatan, 4 pengurus, 2 artikel publikasi, dan 1 artikel bahasa Inggris. Semua berlabel `CONTOH ·`, `SAMPLE ·`, atau `(CONTOH)`. |
| Redaksi dan rujukan | 1 draf yang menunggu review dan 1 rujukan internal. |
| Keuangan | 2 anggaran (satu disetujui, satu menunggu persetujuan) dan 2 transaksi draf. |
| Evaluasi dan serah terima | 1 evaluasi draf (klasifikasi RAHASIA) dan 1 paket serah terima draf. |
| Pengaduan | 1 saran dan 1 pengaduan fiktif. Kanal pengaduan publik **tetap tertutup**. |

## Batasan yang disengaja

- **Keuangan, evaluasi, dan serah terima berhenti di draf.** Mengajukan transaksi atau evaluasi wajib melampirkan berkas yang lolos pemindai virus. Pemindainya belum aktif di production, jadi kondisi contoh sama dengan kondisi nyata.
- **Kotak masuk akun KPI kosong.** Notifikasi contoh dikirim ke akun-akun contoh. Notifikasi baru muncul untuk akun KPI begitu akun itu ikut bertindak di portal.
- **Akun resmi KPI dicatat sebagai personel di dua kasus contoh.** Aturan baca kasus di database mensyaratkan penugasan per kasus, juga untuk super admin (lihat temuan di bawah).

## Temuan saat pemasangan

`intake.can_read` belum punya jalur super admin. Padahal fungsi lain seperti `governance.record_readable` dan `management.can_read` sudah diberi jalur itu di migration `20261006003300_explicit_super_administration.sql`. Akibatnya super admin KPI tidak bisa membuka kasus kecuali ditugaskan sebagai personel kasus itu. Persetujuan super admin (dokumen 57) mencakup "kasus/keuangan rahasia", jadi ini perlu diputuskan: tambahkan jalur super admin ke `intake.can_read`, atau pertahankan prinsip perlu-tahu dan ubah teks persetujuannya.

## Mencoba portal

Masuk dengan akun resmi KPI. Portal otomatis memakai periode `CONTOH` karena itu satu-satunya periode yang aktif. Super admin bisa membuat tugas, rapat, tulisan, dan anggaran baru di periode ini. Aturan independensi tetap berlaku, misalnya anggaran yang diajukan seseorang tidak bisa disetujui oleh orang yang sama.

Semua yang dibuat lewat portal selama mencoba ikut terhapus bersama periode `CONTOH`.

## Memasang dan menghapus

| Langkah | File | Catatan |
|---|---|---|
| Pasang | `supabase/manual/contoh-isi.sql` | Menolak jalan kalau data CONTOH sudah ada atau periode resmi sudah aktif. |
| Hapus | `supabase/manual/contoh-hapus.sql` | Menghapus periode CONTOH beserta seluruh isinya, akun contoh, dan jabatan/divisi `CONTOH_`. Catatan `audit.audit_events` sengaja dibiarkan sebagai jejak. |
| Tes | `tests/contoh-data.test.ts` | Memasang, memeriksa lewat fungsi aplikasi, menghapus, lalu memasang ulang di database tiruan. |

Jalankan keduanya di Supabase → SQL Editor sebagai owner. `uji-peran-1-aktifkan-periode.sql` sekarang menolak mengaktifkan periode resmi selama periode CONTOH masih ada.
