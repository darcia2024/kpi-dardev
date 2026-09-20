# Register persetujuan usulan

**KOREKSI:** Pengguna menegaskan bahwa persetujuan merujuk pada 28 pertanyaan di situs, bukan Q01–Q18 lokal. Dokumen ini merupakan catatan lama yang telah digantikan oleh [Register 28 pertanyaan situs](06-PERSETUJUAN-28-PERTANYAAN-SITUS.md). Gunakan register terbaru untuk keputusan; isi di bawah dipertahankan sebagai riwayat.

Tanggal pencatatan: 8 September 2026.

Dasar: pengguna menyampaikan, “orangnya setuju dengan semua usulan yang kita tulis di hal yang perlu dipastikan”. Identitas/jabatan pemberi persetujuan tidak disebutkan; tidak diinventarisasi sebagai nama atau tanda tangan formal. Konfirmasi dipetakan ke Q01–Q18 pada daftar keputusan rancangan terakhir.

Seluruh arah usulan tersebut diterima sebagai baseline rancangan. Tidak perlu meminta ulang persetujuan atas arah yang sama. Ini tidak memperluas scope menjadi implementasi aplikasi, database atau deployment, dan bukan bukti pengujian atau persetujuan visual final.

| ID | Baseline yang disetujui | Rincian yang masih perlu dilengkapi |
|---|---|---|
| Q01 | Gunakan kode role sumber, bukan nama orang buatan | Mapping orang, jabatan, role dan approver nyata |
| Q02 | Perbandingan kinerja lintas divisi dibatasi Ketua/Sekjend | Mapping akun pemegang role |
| Q03 | Permission bisnis DOC/CMS terpisah dari administrasi teknis | Daftar pemegang permission bisnis |
| Q04 | Semua subtugas selesai membuat parent siap diajukan; review tetap diperlukan | Perincian transisi dan tampilan review |
| Q05 | Overdue sebagai flag dengan Action Required pengisian alasan | Tenggat pengisian alasan dan detail eskalasi |
| Q06 | Larangan publikasi detail operasional Intelligence/Operation dipertahankan | Materi profil umum yang resmi boleh dipublikasikan |
| Q07 | Kebijakan sesi dibuat eksplisit; TOTP menjadi arah MFA yang diterima | Durasi sesi, idle timeout, arti login setiap kali, recovery dan faktor tambahan |
| Q08 | Eligibility pemilih memakai snapshot | Quorum, secret voting, rounds, abstain dan koreksi; belum ada pilihan konkret dalam usulan |
| Q09 | Tidak ada bypass bukti/self-approval secara default | Setiap pengecualian baru harus didefinisikan secara eksplisit |
| Q10 | File private default dan policy configurable | Allowlist, ukuran maksimum, retensi, deletion window, watermark per tipe |
| Q11 | Tidak memakai draft sebagai fallback; keputusan editorial per versi | Missing-language fallback, approval levels dan archive URL policy |
| Q12 | Tidak menjanjikan anonimitas/SLA tanpa kebijakan | Identitas pelapor, recovery token, masa berlaku token dan SLA |
| Q13 | Skor punya metode/versi dan tidak dibuat-buat | Formula, bobot, definisi responsiveness, correction authority |
| Q14 | Closed period read-only kecuali controlled correction | Otoritas koreksi dan detail acceptance handover |
| Q15 | Tidak otomatis mengirim semua klasifikasi ke AI | Provider, retensi, kategori yang boleh diproses |
| Q16 | Kontak & Relasi disusun sebagai scope terpisah | Field, lifecycle, permission, retensi dan acceptance |
| Q17 | Token Apple-style dan nama teks sementara diterima | Logo, aset resmi, foto, warna institusional dan konten final |
| Q18 | Zona waktu organisasi Africa/Cairo; zona tampil eksplisit, bukan fixed offset | Preferensi display pengguna bila diperlukan |

## Dampak ke dokumen rancangan

- Q02/Q03 menjadi acuan akses E02, A06, C01 dan F05.
- Q04/Q05/Q09 menjadi acuan T03/T05/T06/T08 dan alur F02.
- Q06 menjadi acuan P03/P04 dan editorial public-safe.
- Q18 menjadi acuan kalender, agenda, recurring tasks dan scheduled publication.
- Label “usulan”, “menunggu keputusan” atau “belum final” pada file sebelumnya dibaca bersama register ini: arah usulan telah disetujui, tetapi rincian yang belum diberikan belum dianggap lengkap.
- Rincian tersebut dapat dilengkapi pada tahap desain modul terkait; tidak menghalangi pekerjaan rancangan independen lainnya.
