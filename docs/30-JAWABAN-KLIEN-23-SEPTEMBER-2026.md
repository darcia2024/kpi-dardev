# Keputusan awal klien — 23 September 2026

Catatan dari sepuluh jawaban klien yang diteruskan pengguna. Ini adalah arahan produk yang dapat dipakai untuk menyelaraskan rancangan dan UI. Belum ada nama pejabat, nomor keputusan, dokumen penetapan, atau hasil UAT yang dilampirkan; jangan menafsirkannya sebagai izin membuka data kasus nyata atau mengaktifkan produksi.

| No. | Jawaban klien | Keputusan kerja | Masih diperlukan |
|---|---|---|---|
| 1 | Tiga divisi, satu subbidang. | Media & Publikasi ditampilkan sebagai subbidang di bawah Pencegahan & Edukasi. Empat lambang tetap mewakili empat unit kerja. | Bagan organisasi resmi dan nama/masa jabatan personel. |
| 2 | Ada 28 dokumen. | Jumlah dokumen rancangan menurut klien adalah 28. | Folder yang diterima berisi 27 DOCX; berkas bernomor 26 belum diterima. Daftar 28 dokumen beserta versi dan status persetujuannya perlu dicocokkan. Jawaban ini belum menyatakan semua dokumen telah disahkan. |
| 3 | Ketua KPI. | Ketua KPI menjadi pengambil keputusan produk dan pemberi persetujuan utama. | Nama pejabat, kontak resmi, periode jabatan, delegasi saat berhalangan, dan bukti penunjukan. |
| 4 | Semua fitur. | Semua fitur dalam rancangan ditargetkan tersedia pada rilis pertama. Pembangunan dan pengujian tetap dapat dilakukan bertahap sebelum rilis tersebut. | Matriks 113 layar/fungsi, kriteria selesai tiap modul, jadwal, dan hasil uji. Tidak boleh menganggap halaman atau backend TEST sebagai fitur produksi yang selesai. |
| 5 | Iya. | Klien menyetujui secara prinsip penayangan profil, tugas unit, logo, dan foto kegiatan pada situs publik. | Paket konten final dan daftar foto/aset yang boleh tayang berikut caption, sumber, izin penggunaan, serta peninjau akhir. |
| 6 | Sekretaris KPI menerima; Intelligence and Operation Division menindaklanjuti; seluruh personel KPI yang terlibat dalam pengurusan kasus menjaga kerahasiaan. | Alur pengaduan: penerimaan oleh Sekretaris, tindak lanjut oleh divisi Intelijen & Operasional. Akses kasus dibatasi berdasarkan keterlibatan dan tugas, bukan otomatis untuk semua pengurus. | SOP triage, penetapan petugas/akun, eskalasi, konflik kepentingan, rujukan, informasi yang boleh dilihat tiap peran, SLA, retensi, dan aturan penutupan. Sekretaris KPI jangan disamakan otomatis dengan Sekjend sebelum struktur jabatan resmi jelas. |
| 7 | Ketua, Sekjend, Wakil, OIC per divisi. | Ini daftar kategori pengguna awal portal. | Nama/akun, divisi dan periode OIC, cakupan izin per modul, serta hubungan dengan jabatan Sekretaris penerima pengaduan. |
| 8 | Domain dan hosting belum; database milik KPI; domain milik KPI; hosting disewa atas nama developer terlebih dahulu. | Kepemilikan database dan domain ditujukan kepada KPI; hosting sementara berada pada developer. | Penyedia, region, kontrak pemrosesan data, biaya, akses admin KPI, backup, jadwal transfer hosting ke KPI, dan prosedur bila kerja sama developer berakhir. Belum ada domain atau hosting yang dapat dianggap final. |
| 9 | Dokumen menyusul. | Parameter operasional belum diputuskan. | Dokumen resmi berisi SLA, masa simpan, kuorum, ambang keuangan, formula kinerja, privasi, dan aturan terkait lainnya. Nilai tidak boleh diisi dengan tebakan. |
| 10 | Ketua KPI dan tim pengelola website KPI. | Kedua pihak tersebut menjadi peserta/pemberi penerimaan UAT. | Nama peserta, jadwal, skenario, kriteria lulus, catatan defect, dan bukti persetujuan akhir. |

## Dampak implementasi sekarang

- Copy situs publik diperbarui menjadi **tiga divisi dan satu subbidang**; Media & Publikasi tetap mempunyai profil unit sendiri agar empat lambangnya dapat ditampilkan tanpa mengubah kedudukan organisasinya.
- Halaman pengaduan menjelaskan peran Sekretaris dan Intelligence and Operation Division. Simulasi tetap memakai data fiktif lokal TEST. Laporan nyata belum dapat diterima sampai SOP, akses, infrastruktur, dan pengujian disahkan.
- Semua fitur menjadi **cakupan target**, tetapi belum sama dengan status selesai atau layak rilis. Gunakan inventaris fitur dan UAT per modul untuk menghitung kemajuan.

## Tindak lanjut yang paling mendesak

1. Terima dokumen ke-28/berkas nomor 26 dan daftar versi serta status pengesahan seluruh dokumen.
2. Terima bagan organisasi, daftar akun awal, serta pemisahan peran Sekretaris KPI dan Sekjend.
3. Terima SOP pengaduan dan kebijakan klasifikasi/akses sebelum pengiriman perkara nyata diaktifkan.
4. Tetapkan kontrak hosting sementara: kepemilikan data KPI, hak akses, backup, biaya, serta jalur dan tenggat pengalihan ke akun KPI.
5. Susun matriks cakupan semua fitur dan UAT bersama Ketua serta tim pengelola website.
