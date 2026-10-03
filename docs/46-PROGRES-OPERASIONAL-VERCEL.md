# Penyelesaian operasional Vercel

> Pembaruan 3 Oktober 2026: perluasan kelompok 2 terpasang di database production; cakupan dan batas aktivasi ada di [laporan kelompok 2](50-KELOMPOK-2-OPERASIONAL.md).

> Pembaruan 2 Oktober 2026: kelompok modul lanjutan kini memiliki sambungan hosted. Lihat [laporan kelompok 1](49-KELOMPOK-1-MODUL-HOSTED.md) untuk cakupan, bukti deployment, dan batas aktivasi. Tabel di bawah mempertahankan catatan paket sebelumnya.

Dimulai 2 Oktober 2026. Status berdasarkan implementasi hosted, bukan jumlah layar lokal. Paket selesai hanya setelah kode, migrasi, pengujian dan deployment terkait terverifikasi.

| Paket | Status | Kriteria selesai |
| --- | --- | --- |
| 1. Pemetaan | Selesai | Inventaris fitur dan bukti sambungan hosted |
| 2. Database/izin | Berjalan | Migrasi per modul, isolasi organisasi/periode/divisi, audit, tes negatif |
| 3. Fitur utama | Berjalan | Dokumen, rapat, rujukan, publikasi, formulir dan kasus tersimpan online |
| 4. Workflow | Belum selesai | Penugasan, review, revisi, approval dan notifikasi atomik |
| 5. Modul lanjutan | Belum selesai | Keuangan, evaluasi, handover, admin, AI berizin |
| 6. Storage | Belum selesai | Berkas private dan upload/download terotorisasi |
| 7. Uji Vercel | Belum selesai | Uji positif/negatif authenticated, persistence dan workflow |

## Baseline sebelum pekerjaan

Login/profil/akses, organisasi/periode dan tugas mempunyai implementasi hosted. Proxy hanya membuka route tersebut; route modul lainnya ditulis ulang ke halaman contoh/status. API lokal memakai SQLite serta identitas test dan tidak operasional di Vercel. Contoh baca saja tidak dihitung sebagai modul online.

| Fitur | Sebelum pekerjaan | Bukti kode |
| --- | --- | --- |
| Login/profil/akses | Hosted | platform/identity/hosted-auth.ts, api/v1/auth/access |
| Organisasi/periode | Hosted admin | api/v1/auth/administration, migration system_administration |
| Tugas | Hosted | api/v1/work/tasks, migration hosted_tasks |
| Rapat | Lokal/contoh | platform/work/meeting-service.ts; proxy rewrite |
| Dokumen | Lokal/contoh | api/v1/documents; proxy rewrite |
| Rujukan | Lokal/contoh | api/v1/knowledge; proxy rewrite |
| Redaksi/publikasi | Lokal/contoh | api/v1/editor/publications; proxy rewrite |
| Formulir/kasus/pengaduan | Lokal/contoh | api/v1/cases, api/v1/public/aspirations |
| Notifikasi | Lokal/contoh | api/v1/notifications |
| Keuangan | Lokal/contoh | api/v1/finance |
| Evaluasi | Lokal/contoh | api/v1/evaluations |
| Handover | Lokal/contoh | api/v1/handover |
| AI | Lokal/provider belum dibuktikan | api/v1/ai |
| Storage operasional | Belum terbukti hosted | platform/storage/local-private-blob-store.ts |

## Ketergantungan eksternal

Akun nyata untuk UAT beberapa peran, roster/divisi/penugasan resmi, dokumen resmi yang boleh digunakan, serta penyedia AI dan izin penggunaan data tidak boleh dibuat berdasarkan asumsi. Tidak memasukkan kasus atau transaksi fiktif sebagai data resmi. Tidak mengubah izin akun tanpa kebutuhan dan persetujuan yang sesuai.

## Pembaruan 2 Oktober 2026

**Paket penuh selesai: 1/7.** Paket lain mempunyai kemajuan implementasi berikut, tetapi belum memenuhi seluruh kriteria selesai. Jumlah tes lulus tidak menggantikan UAT akun produksi.

Periode resmi `KPI_PPMI_MESIR / 2026_2027`, 17 Oktober 2026–17 Oktober 2027, telah dicatat sebagai **PLANNED**. Owner menyatakan belum ada periode aktif. Tidak membuat periode aktif fiktif atau mengganti tanggal untuk membuka transaksi. Periode mendatang tidak memberikan managed scope operasional, termasuk bagi admin penuh. Aktivasi pada waktunya dan penugasan resmi masih diperlukan.

Migrasi hosted 00500–01200 telah dipasang dan hasil SQL success diperiksa di Supabase production. Deployment production `dpl_923BHwSqc8iw8An3aFAUUXUQFiuY` READY pada https://kpi-ppmi-mesir-preview.vercel.app. Build deployment lulus tujuh pemeriksaan koneksi/skema sebelum build Next.js. Pemeriksaan lokal memakai environment audit yang telah disensor tidak valid sebagai tes koneksi; bukti koneksi berasal dari build Vercel dengan konfigurasi deployment sebenarnya.

| Area | Implementasi hosted terbaru | Batas yang masih ada |
| --- | --- | --- |
| Tugas | Tersimpan, penugasan, submit, review terpisah, revisi, audit | Belum seluruh fitur lanjutan lokal dipindah: subtugas, template, dependensi, diskusi, tenggat/delegasi |
| Rapat | Agenda, roster resmi, RSVP, presensi, notulen berversi, review terpisah, voting dengan snapshot peserta/quorum, audit | Tindak lanjut rapat ke tugas dan attachment belum dipindah; belum UAT Vercel |
| Rujukan/redaksi | Draft, snapshot revisi, submit, review independen, publish/withdraw/archive; daftar publik membaca hanya publikasi PUBLISHED organisasi yang sesuai | Editor rich text, media, pemeriksaan PII otomatis, jadwal publikasi belum setara alur lokal |
| Dokumen | Upload server terotorisasi, bucket private, path UUID, hash, idempotensi, status pemeriksaan, signed download 60 detik | Pemindai eksternal belum dikonfigurasi: file tetap PENDING_SCAN, download terkunci. PDF/PNG/JPEG/TXT maksimum 4 MB; versioning/recipient grants/Office belum dipindah |
| Kasus/pengaduan | Tabel private, ACL personel terlibat, sekretariat menerima, IOD ditugaskan, tindak lanjut, review penutupan terpisah, timeline internal/publik, token digest, idempotensi, rate limit | Routing resmi/roster belum tersedia; kanal tetap tertutup; UI konfigurasi routing, form template dan bukti berkas kasus belum selesai |
| Kotak masuk | Notifikasi atomik dari tugas/rapat/konten/kasus, baca sendiri, periksa izin sumber saat dibaca, pencabutan akses menyembunyikan notifikasi | Worker email/WA, reminder dan template resmi belum dihubungkan |
| Administrasi | Login/akses/admin penuh dan organisasi/periode memakai Supabase | Manajemen roster, divisi/jabatan/assignment, perubahan grant dan operasi/audit UI masih belum seluruhnya hosted |
| Keuangan/evaluasi/handover | Implementasi lokal masih tersedia; bukan modul hosted operasional | Database/RPC/workflow/UI hosted masih harus dibangun |
| AI | Nonaktif di hosted | Nama provider/model belum diberikan; izin penggunaan data, key dan integrasi tindakan berizin belum tersedia |

**Validasi:** 168 tes lulus; TypeScript lulus; build production Vercel lulus. Tes PostgreSQL terpisah meliputi idempotensi, versi kedaluwarsa, isolasi akun, penolakan akses langsung, review sendiri ditolak, dokumen pending tidak dapat diunduh, publikasi draft tidak tampil, timeline kasus internal tidak bocor, pencabutan izin menyembunyikan notifikasi, dan periode PLANNED tidak membuka transaksi. Fixture tidak menjalankan aktivasi admin production; aktivasi tersebut diuji terpisah.

**Pemeriksaan deployment:** health HTTP 200; enam API work (tugas, rapat, assets, cases, content, notifications) HTTP 401 tanpa sesi; pengiriman publik HTTP 503 `INTAKE_UNAVAILABLE` ketika routing/periode belum siap. Browser memerlihatkan kanal pengaduan tertutup dan katalog publik tanpa publikasi resmi. Belum melakukan create/edit/approval/upload dengan sesi akun nyata di Vercel, sehingga paket 7 belum selesai. Halaman kasus tanpa sesi hanya memerlihatkan permintaan masuk.

**Yang diperlukan dari owner:** roster nyata/akun uji beberapa peran, sekretaris penerima dan petugas IOD berikut penugasan/grant, SOP penerimaan/routing, provider/model AI beserta izin penggunaan data, layanan pemeriksaan berkas, dan aktivasi periode resmi pada waktunya. Tidak memerlukan owner menjalankan SQL yang sudah dipasang. Akun/credential baru tetap dibuat melalui alur resmi; tidak melewati login untuk pengujian.

Fingerprint rate limit memakai HMAC server, bukan alamat IP mentah di database, dan hanya mempercayai ingress Vercel. Rujukan header: [Vercel request headers](https://vercel.com/docs/headers/request-headers). Bukti visual tersimpan di `.vercel/official-period-planned.png` dan `.vercel/operational-public-closed.png` (diabaikan Git).
