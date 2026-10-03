# Alur elektronik SOP kerahasiaan v1.1

Tanggal verifikasi: 2 Oktober 2026. Halaman: `/portal/kebijakan`.

## Status implementasi

| Paket | Hasil |
| --- | --- |
| F01–F02 | Pengajuan pemberian, perubahan, pencabutan, pemulihan; keputusan independen termasuk sebagian/ditolak; pelaksanaan teknis; register, jatuh tempo tiga bulan, tindak lanjut, verifikasi dan penangguhan. |
| F03–F04 | Laporan belum lengkap, metadata terbatas, penetapan petugas sesuai mandat, jalur BPI, kronologi tindakan, perbaikan/PIC/tenggat, verifikasi independen, keputusan pemberitahuan, approval pemulihan, dan penutupan teknis. |
| F05 | Sepuluh checklist, rincian serah terima, penerimaan penerus, verifier, pengecualian, akses transisi, persetujuan, pencabutan dan penutupan. Izin berhenti pada tanggal efektif dan batas transisi meskipun pelaksanaan teknis belum dicatat. |
| Klasifikasi | Usulan klasifikasi/penurunan dengan mandat tambahan, persetujuan independen, versi objek, penahanan bukti dan pelepasan berdasarkan keputusan; tidak otomatis memublikasikan dokumen. |
| Uji Vercel | Deploy production dan penolakan pengunjung anonim diperiksa. Uji beberapa peran resmi belum selesai: belum ada periode aktif maupun mandat resmi yang terdaftar. |

## Lokasi dan penyimpanan

Migrasi `20261002001500_governance_workflows.sql` sampai `20261002001700_workflow_approval_binding.sql` dipasang pada Supabase `gtjzlkmwafyttevertho`. Semua alur disimpan di PostgreSQL melalui RPC yang memeriksa identitas dan kewenangan server. Tabel privat tidak menerima penulisan langsung dari authenticated/anon.

Setiap tindakan memakai versi data dan transaksi. Klik ulang dengan request key dan isi sama tidak membuat permohonan kedua. Konflik versi meminta pemuatan ulang. Riwayat memuat pelaksana, waktu, rujukan dan tindakan. Admin teknis hanya mendapat metadata pelaksanaan; catatan penanganan F04 tidak otomatis dibuka kepada pelapor.

Dokumen dan kasus memiliki register objek informasi. Akses per objek dapat membuka daftar dokumen/kasus tanpa memberikan akses seluruh arsip. Bukti yang ditahan tidak dapat dihapus melalui tabel terkait.

F01 memakai kode izin modul yang tersedia, bukan hak universal. Catatan formulir tidak menggantikan dokumen mandat. Formulir ini bukan tanda tangan elektronik tersertifikasi. Rujukan penerimaan dan keputusan harus mengarah ke bukti administrasi resmi. Peninjauan jatuh tempo ditampilkan pada register; pengiriman pengingat eksternal belum diaktifkan.

## Validasi

- TypeScript dan build production lulus.
- Seluruh 171 tes lulus; pengujian database SOP memakai tiga identitas di database terisolasi.
- Uji khusus: self approval, persetujuan di luar permintaan, penolakan, konflik versi, metadata admin, persetujuan sebagian, perubahan/pencabutan/pemulihan, peninjauan/suspensi, pelapor tidak membaca catatan F04, jalur BPI, penutupan prematur, penahanan/pembebasan bukti, penurunan klasifikasi, versi objek berubah, checklist belum lengkap, penerimaan, pencabutan tanggal efektif dan habisnya akses transisi.
- Tidak ada permohonan, insiden, mandate atau periode fiktif yang dimasukkan ke production.
- Vercel tanpa login: halaman 307 ke `/masuk`, API GET/POST 401.

## Syarat untuk menyelesaikan UAT operasional

1. KPI memberikan mandat tertulis pejabat: kode akun, cakupan organisasi/divisi/periode, klasifikasi, izin, tanggal berlaku/berakhir, dan rujukan keputusan. Hak BPI, handler insiden, approver pemulihan, verifier pengakhiran, peninjau akses, klasifikasi/penurunan, dan pengamanan bukti harus disebut secara terpisah.
2. Aktifkan periode berdasarkan keputusan resmi; periode yang diberikan adalah 17 Oktober 2026–17 Oktober 2027 dan belum mulai pada tanggal verifikasi. Jangan menandainya aktif sebelum tanggal dan keputusan resminya sesuai.
3. Sediakan minimal akun pemohon, pejabat pemberi keputusan, dan pelaksana teknis. Uji sesi Vercel sebenarnya tanpa berbagi kata sandi kepada pengembang.
4. Jalankan pengajuan → keputusan → pelaksanaan → refresh; periksa akun lain dan pencabutan. Lakukan juga insiden dan F05 dengan bahan uji yang disepakati, bukan informasi kasus pribadi.
5. Catat hasil UAT, persetujuan operasional, kontak insiden/BPI, jadwal retensi dan pejabat berwenang. Sampai itu tersedia, statusnya implementasi teknis, bukan pengesahan siap produksi penuh.

## Deployment terverifikasi

Deployment terakhir: `dpl_F8q8UCfBZxyqnX2kiprGNXHtxEtF`, production READY; alias https://kpi-ppmi-mesir-preview.vercel.app. Tujuh pemeriksaan koneksi build lulus. Setelah deploy, API anonim GET/POST 401 dengan `Cache-Control: private, no-store`, halaman `/portal/kebijakan` 307 ke `/masuk`.

SQL production mengembalikan database siap = true, F01–F05 terpasang = true, batas transisi aktif = true, mandat resmi = 0. Bukti screenshot lokal: `.vercel/governance-production-proof.png`.

Pengguna menyatakan sudah login dalam Codex, tetapi sesi yang tersedia melalui alat browser masih menampilkan `/masuk`. Pengecekan formulir melalui sesi pengguna itu belum terverifikasi; jangan menyamakan hasil tes PostgreSQL terisolasi dengan UAT multiakun di Vercel.
