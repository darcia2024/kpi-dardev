# SOP penanganan kasus dan tujuh formulir

Tanggal integrasi: 5 Oktober 2026. Sumber: delapan DOCX yang diberikan owner, tanpa data kasus terisi.

## Yang diterapkan

- `/portal/kasus`: ringkasan rantai komando, prinsip kerahasiaan, target waktu, dan syarat penutupan.
- `/portal/kasus/pedoman`: naskah SOP lengkap dan seluruh bagian tujuh formulir. Akses memerlukan sesi akun portal; naskah tidak masuk ke bundle JavaScript publik.
- Detail kasus: pencatatan draf per bagian, beberapa formulir dalam kasus yang sama, revisi dengan pemeriksaan versi, serta riwayat isi sebelumnya.
- Database: `intake.case_forms` dan `intake.case_form_revisions`, RPC baca/simpan, akses menggunakan izin dan keterlibatan kasus yang sudah berlaku. Tabel tidak tersedia langsung bagi anonymous maupun authenticated.
- Perubahan draf dicatat dalam audit tanpa menyalin isi kasus ke metadata audit. Penyimpanan draf tidak mengubah status kasus, memberikan izin, mengirim pemanggilan, menandatangani dokumen, atau menetapkan sanksi.
- Lampiran yang sudah ditandatangani menggunakan penyimpanan lampiran kasus yang sudah tersedia. Formulir bukti menyediakan bagian sumber, verifikasi, akses, penyimpanan dan pemindahan; ini catatan kerja, bukan pengganti kontrol akses berkas atau bukti otorisasi.

## Pemetaan sumber

| Sumber | Penerapan | Bagian termasuk administrasi |
|---|---|---:|
| SOP_Penanganan_Kasus_KPI_Revisi_IO_OIC_PIC.docx | Pedoman, otoritas Ketua → OIC I&O → PIC, prinsip, target, penutupan | Naskah lengkap |
| 01_Formulir_Penerimaan_Laporan.docx | Identitas, uraian, bukti awal, penerimaan, pemeriksaan OIC | 11 |
| 02_Formulir_Verifikasi_Awal.docx | Kelengkapan, substansi, konflik, klasifikasi, urgensi, rekomendasi, otorisasi | 14 |
| 03_Formulir_Pemanggilan.docx | Dasar, jadwal, hak, reschedule, otorisasi, pelaksanaan, penerimaan | 18 |
| 04_Formulir_Wawancara_dan_Pemeriksaan.docx | Pernyataan pihak, klarifikasi, bukti, temuan, kesimpulan sementara | 18 |
| 05_Formulir_Pencatatan_dan_Pengelolaan_Bukti.docx | Sumber, perolehan, verifikasi, penyimpanan, akses, pemindahan | 25 |
| 06_Format_Laporan_Akhir.docx | Proses, fakta, analisis, rekomendasi, keputusan, monitoring, pengesahan | 24 |
| 07_Format_Keputusan_Penetapan_Sanksi_dan_Penutupan_Kasus.docx | Dasar, hasil, sanksi, implementasi, keberatan, penutupan, arsip | 21 |

Total 131 bagian. Petunjuk dan pilihan asli disimpan bersama format; editor digital menggunakan catatan teks per bagian. Pilihan checkbox belum menjadi kolom terstruktur atau aturan otomatis. Sumber disimpan pada katalog server dengan SHA-256 per teks formulir dan versi `KPI-CASE-20261005-v1`.

## Batas implementasi dan konfirmasi owner

1. Nomor keputusan dan tanggal pengesahan SOP kosong. Pihak pengesahan adalah Sidang Anggota KPI. Tidak dinyatakan sudah disahkan.
2. Sampul SOP menyebut 2025–2027, sedangkan periode yang diberikan sebelumnya 17 Oktober 2026–17 Oktober 2027. Periode database tidak diubah; belum ada periode aktif untuk uji kasus nyata.
3. Formulir menyebut “Sangat Rahasia”; skema klasifikasi sebelumnya memiliki empat kategori sampai RAHASIA. Pemetaan resmi dibutuhkan sebelum menambahkan kategori baru. Tidak dilakukan penurunan klasifikasi secara diam-diam.
4. Identitas PIC, OIC I&O, Ketua, serta delegasi/mandat formal tetap harus tersedia. Isian nama tidak memberikan izin atau menggantikan mandat.
5. Target waktu ditampilkan sebagai acuan; belum dihitung otomatis. Titik awal pemeriksaan, aturan hari kerja/kalender, perpanjangan, dan otorisasi formal harus disepakati sebelum otomatisasi tenggat diaktifkan.
6. Workflow penutupan lama tetap memakai reviewer independen. Belum diganti menjadi mesin keputusan SOP baru: menyimpan draf 07 tidak berarti keputusan Ketua sudah sah. Pengesahan, aturan sanksi, dan peralihan resmi tahap memerlukan konfigurasi mandat serta SOP yang disahkan.

## Validasi

183 tes lulus termasuk persistensi, riwayat revisi, konflik versi, pembuatan beberapa wawancara, penolakan bagian formulir invalid, pengguna tanpa izin, pencabutan akses, dan larangan perubahan draf saat kasus dalam review/ditutup. Typecheck dan build lulus. Uji kasus nyata di Vercel membutuhkan periode aktif, mandat dan akun berizin; hasil tes terisolasi tidak dianggap UAT production.

## Pemasangan

Migrasi `supabase/migrations/20261005003100_case_sop_forms.sql` sudah dijalankan melalui SQL Editor proyek production `gtjzlkmwafyttevertho`, dengan hasil “Success. No rows returned”. Pemeriksaan lanjutan menghasilkan `save_ready=true`, `read_ready=true`, `existing_drafts=0`. Bukti tersimpan di `.vercel/case-sop-database-proof.png`. Migrasi tidak memasukkan kasus dummy atau mengaktifkan akun/periode. Jangan jalankan ulang: migrasi dibungkus transaksi dan membuat tabel/fungsi baru.

UI sudah dideploy production pada alias `https://kpi-ppmi-mesir-preview.vercel.app`. Jalur `/portal/kasus/pedoman` ditambahkan ke daftar route hosted agar tidak dialihkan ke halaman modul generik. Smoke test tanpa sesi: API formulir mengembalikan 401; halaman pedoman meminta login dan tidak membocorkan naskah. Browser Vercel juga terverifikasi menunjukkan “Masuk diperlukan”, sehingga uji isi halaman menggunakan sesi berizin masih menunggu login pengguna.
