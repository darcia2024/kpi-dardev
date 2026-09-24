# Lanjutan 20 layar lokal — 24 September 2026

Pekerjaan ini menuntaskan bagian yang dapat dibangun tanpa isi resmi, keputusan kebijakan, atau layanan eksternal. Angka katalog 58 connected / 40 partial **belum berubah** karena tes lokal tidak setara dengan penerimaan produksi.

## Sudah dikerjakan

- **A09:** pilihan periode di portal memakai cookie server yang hanya menerima kode periode terdaftar dan belum ditutup. Sebanyak 44 rute API dan 13 halaman portal membaca konteks periode per permintaan. Grant untuk periode baru dapat dibuat lewat admin; akses tetap ditolak jika izin modul belum diberikan. Cookie dihapus saat login ulang/logout. Kasus dari asisten mengikuti periode terpilih, sedangkan pengaduan publik masuk ke periode aktif.
- **A08:** migrasi tambahan menyiapkan tabel `org.divisions` dan relasi divisi–jabatan dengan batas organisasi yang sama. API lokal untuk divisi, jabatan, dan penugasan sudah ada; migrasi belum dijalankan pada Supabase produksi.
- **K01–K02:** draf artikel kini memerlukan badan tulisan dan penunjuk bab/halaman sumber. Revisi membawa isi baru, review dua akun tetap berlaku, dan pembaca melihat isi hanya selama akses ke versi sumber sah.
- **E08:** endpoint dan panel **pratinjau** laporan menampilkan nilai, versi formula, revisi, bukti beserta versi, dan alasan baris belum siap. Sanggah terbuka, nilai kosong, atau bukti tak terakses tidak disamarkan sebagai nilai final. Penetapan final resmi belum diaktifkan.
- **I02:** sitasi yang nantinya diterima dari provider dapat diperiksa ulang pada saat dibuka; URL sumber baru ditampilkan setelah izin dan versi lolos pemeriksaan server. Provider saat ini belum menghasilkan sitasi.
- **I06:** usulan tindakan lokal diikat ke organisasi dan periode sehingga konfirmasi di periode lain ditolak. Konfirmasi belum menjalankan aksi sistem karena kebijakan tindakan AI belum disahkan; asisten laporan terpisah sudah menyimpan laporan setelah pengguna meninjau dan mengirimnya.
- Akses revisi evaluasi, sanggah, transaksi, checklist, konten editorial, aktivitas aset, dan antrean kasus diperketat terhadap periode terpilih.

## Masih bergantung pada keputusan/data/layanan

1. **Nilai final KPI:** indikator, formula, versi rubrik, pejabat yang mengesahkan, jendela sanggah, dan aturan pembekuan harus disetujui. Laporan sekarang sengaja berstatus `PREVIEW_ONLY`.
2. **Artikel resmi:** naskah/SOP, versi dokumen sumber yang dapat dibuka, dan keputusan redaksi knowledge harus masuk. Form dan review teknis siap.
3. **File produksi:** storage dan scanner nyata, retensi, serta daftar penerima resmi belum disediakan. Endpoint scan tetap menolak saat scanner tidak ada.
4. **AI produksi:** provider/model, lokasi proses, retensi, kelas data, prompt, daftar aksi yang boleh dieksekusi, dan uji keamanan belum disahkan. AI tidak mengarang jawaban atau sitasi.
5. **Data organisasi:** divisi, jabatan, akun, penugasan, dan grant resmi belum dimigrasikan ke Supabase. Migrasi skema saja tidak mengaktifkan akses produksi.

Validasi: `npm run verify` lulus dengan **99 tes**, TypeScript, dan build Next.js. Portal `/portal`, `/portal/evaluasi`, dan `/portal/knowledge` diperiksa di localhost. Belum ada pengujian integrasi Supabase/scanner/provider karena layanan tersebut belum tersedia.
