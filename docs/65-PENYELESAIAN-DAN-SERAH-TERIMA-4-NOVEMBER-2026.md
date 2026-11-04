# Penyelesaian dan serah terima, 4 November 2026

Dokumen ini menutup temuan di [dokumen 64](64-AUDIT-5-MODUL-1-NOVEMBER-2026.md) dan menjadi pegangan saat proyek dilanjutkan setelah KPI selesai dengan regulasi termin satu.

## Aturan yang dipakai, menunggu pengesahan KPI

Pengembang memilih aturan berikut supaya sistem bisa diselesaikan selama KPI fokus pada regulasi. Semuanya **default**, belum keputusan KPI. Mohon disahkan atau dikoreksi; mengubahnya tidak memerlukan pembangunan ulang.

| No | Pertanyaan | Aturan sekarang |
|---|---|---|
| C1 | Siapa yang menyetujui akses Rahasia? | Hanya pemegang kewenangan khusus `SOP_SECRET_APPROVE` di mandatnya, sesuai teks SOP (Ketua atau delegasi khusus). |
| C2 | Siapa yang melihat rapat? | Internal: pemegang izin rapat atau peserta undangan. Terbatas dan Rahasia: harus punya izin dan diundang. Pembuat rapat dan super admin tetap bisa membaca. |
| C3 | Siapa yang mengaktifkan periode? | Super admin, dengan rujukan keputusan, tercatat di audit. Hanya satu periode berjalan per organisasi. Periode baru selalu Direncanakan. |
| C4 | Hak super admin | Tidak diubah. Membaca kasus tetap perlu penugasan per kasus; unduh hanya di periode berjalan; periode tertutup tetap bisa dibaca. |
| C5 | Tinjauan tiga bulan terlewat | Pengingat saja, tanpa penangguhan otomatis. |
| C6 | Catatan pada konfirmasi hadir dan voting | Opsional. Tindakan pengelolaan rapat tetap wajib catatan. |
| C7 | Kategori dokumen baru | Pengunggah memilih, default Internal. Pengunggah selalu bisa melihat dan mengunduh berkasnya sendiri. |
| C8 | Pencabutan akses orang lain | Pemegang mandat (izin terkait atau `SOP_ACCESS_REVIEW`) boleh mengajukan. Pejabat lain memutuskan, admin teknis melaksanakan. F01 pemberian akses tetap hanya untuk diri sendiri. CHANGE yang disetujui sebagian tetap mencabut seluruh keputusan lama. |

## Status temuan

| Temuan | Status | Lokasi |
|---|---|---|
| B1 Jalan pintas keputusan akses | Selesai | migration `3400` |
| B2 Periode aktif tanpa keputusan, U12 simpan ulang menyesatkan | Selesai | migration `3500`, Pengaturan |
| B3 Dua periode berjalan | Selesai | index `periods_one_running` |
| B4 Pencabutan macet saat mandat penyetuju berakhir | Selesai | migration `3600` |
| B5 Tanggal mundur membuat permohonan macet | Selesai: ditolak saat dibuat | migration `3600` |
| B6 Rahasia tanpa objek | Selesai di server dan form | migration `3600` |
| B7 Daftar sumber memakai izin salah | Selesai | migration `3600` |
| B8 Klasifikasi lintas divisi | Selesai | migration `3600` |
| **B9 (baru)** Form mandat memakai kode kewenangan yang tidak dikenali database, dan menawarkan klasifikasi Terbuka yang ditolak database | Selesai | `permission-labels.ts`, form roster |
| U1–U13 | Selesai | form F01 kini memilih divisi dari daftar; Konten dan Manajemen ikut berlabel Baca saja |
| G1 Klasifikasi rapat | Selesai | migration `3700` |
| G2 Unggahan selalu Rahasia, lampiran buntu | Selesai | migration `3700` |
| G3 Pencabutan oleh pejabat | Selesai | migration `3600`, kartu register |
| G4 Tinjauan tiga bulan | Selesai: penanda di register dan pengingat di Kotak masuk | migration `3700` |
| G5 Deklarasi konflik | Selesai | `kpi_conflict_action`, tab F02 |
| G6 Tarik dan batalkan pengajuan | Selesai | aksi `WITHDRAW`, `CANCEL` |
| G7 Riwayat tinjauan F02 | Selesai | hasil keputusan juga masuk riwayat |
| G8 Unit contoh | Selesai: ditandai, skrip hapus memeriksa dulu dan menyebut berkas yang perlu dihapus manual | form roster, `contoh-hapus.sql` |
| G9 Celah tes | Selesai | `tests/hosted-completion.test.ts` |
| G10 Pengaduan memperlakukan CLOSING berbeda | **Tidak diubah** | Tidak berdampak: tidak ada fitur yang menyetel CLOSING. Tombol Tutup langsung ke CLOSED. |
| G11 Kecocokan organisasi–periode | Selesai | trigger di rapat, aset, keputusan, workflow |
| Tutorial per peran | Selesai | `/tutorial` |

Sengaja belum dibuat: tautan `?document=` tidak membuka berkas tertentu, karena modul Dokumen hosted tidak punya halaman detail. Tautannya tetap membuka daftar dokumen.

## Cara dipasang di production

Urutannya penting. Database dulu, baru kode. Kode lama tetap berjalan dengan database baru, tapi tidak sebaliknya.

1. **Cek migration sebelumnya.** Di SQL Editor, jalankan:
   ```sql
   select has_function_privilege('authenticated','public.kpi_record_access_decision(jsonb)','execute'),
          has_function_privilege('authenticated','public.kpi_apply_access_decision(uuid)','execute');
   ```
   Keduanya harus `false`.
2. **Cek periode.** Hasil kueri ini harus kosong:
   ```sql
   select organization_id from org.periods where status in ('ACTIVE','CLOSING') group by organization_id having count(*)>1;
   ```
   Migration `3500` akan berhenti tanpa mengubah apa pun kalau tidak kosong.
3. **Jalankan tiga migration berurutan**, masing-masing sekali. Semuanya memakai transaksi, jadi kalau gagal tidak ada yang berubah. Jangan dijalankan ulang kalau sudah berhasil.
   - `supabase/migrations/20261104003500_period_activation.sql`
   - `supabase/migrations/20261104003600_access_request_completion.sql`
   - `supabase/migrations/20261104003700_meeting_asset_classification.sql`
   - `supabase/migrations/20261104003800_governance_names.sql`: nama pemegang akses di register F02 dan riwayat. Ditambahkan belakangan; jalankan kalau tiga di atas sudah terpasang.
4. **Push kode** supaya Vercel melakukan deploy.

Data yang sudah ada tidak dihapus. Rapat lama menjadi Internal, sama seperti perlakuan sebelumnya. Dokumen lama tetap Rahasia, dan pengunggahnya kini bisa melihatnya.

## Yang perlu dicoba dengan akun sungguhan

Sudah diuji di database tiruan dengan seluruh migration dan di browser dengan data tiruan. Belum pernah dicoba dengan akun sungguhan di production.

1. Super admin: buka Organisasi & periode. CONTOH tampil Aktif dengan tombol Tutup, 2026_2027 tampil Direncanakan. **Jangan menekan tombolnya** selama belum ada keputusan resmi.
2. Pengurus: ajukan F01, setujui dengan akun lain, laksanakan dengan admin teknis, lalu periksa Hak akses saya. Coba juga menarik pengajuan.
3. Rapat: buat rapat Terbatas, lalu pastikan peserta tanpa izin tidak bisa membukanya. Buat rapat Internal dan pastikan peserta undangan tanpa izin bisa konfirmasi hadir.
4. Dokumen: unggah berkas Internal dan Rahasia, lalu lihat dari akun lain.

## Yang dibutuhkan dari KPI sebelum dipakai resmi

Bukan pekerjaan kode:

1. Mengesahkan atau mengoreksi aturan C1–C8.
2. Menunjuk pejabat Penyetuju Rahasia. Mandat awalnya dicatat lewat `supabase/manual/uji-peran-3-mandat-awal.sql` dengan `penyetuju_rahasia := true`.
3. Menyetujui layanan pemeriksaan virus. Tanpa ini, berkas bisa diunggah tapi **tidak bisa diunduh**, dan transaksi keuangan serta evaluasi berhenti di draf karena wajib melampirkan berkas yang sudah lolos pemeriksaan.
4. Menyiapkan daftar pengurus 2026_2027 dan keputusan pengaktifan periode.
5. Layanan opsional: penyedia AI, pengiriman email/WhatsApp. Tanpa ini fitur tersebut menampilkan pesan belum tersedia.

## Langkah saat periode resmi dimulai

1. Jalankan `supabase/manual/contoh-hapus.sql`. Kalau skrip menyebut berkas Storage, hapus manual lewat dasbor.
2. Super admin mengaktifkan 2026_2027 dengan rujukan keputusan, dari `/portal/pengaturan`.
3. Catat mandat awal, lalu buat penugasan pengurus.
4. Pengurus mengajukan F01 sesuai kebutuhan. `/tutorial` menjelaskan alurnya per peran.

## Selama jeda

- Situs publik tetap berjalan. Portal tidak perlu dikenalkan dulu ke pengurus baru.
- Tetap pasang patch keamanan dan pastikan backup berjalan (dokumen 58).
- Periksa paket Supabase dan Vercel. Project paket gratis yang lama tidak aktif bisa dijeda penyedianya.
- Super admin dan admin jangan mengubah data resmi selain yang diperlukan.

## Memperbarui gambar tutorial

Gambar di `public/tutorial` diambil dari portal asli yang berjalan di komputer sendiri, memakai database sementara berisi seluruh migration dan data contoh. Alat ini tidak memakai akun, kunci, atau data production, dan tidak ikut ter-deploy sebagai fitur aplikasi.

1. Jalankan `node scripts/tutorial-capture/start.mjs` lalu tunggu portal siap di port 3100.
2. Di terminal lain jalankan `node scripts/tutorial-capture/capture.mjs`. Tambahkan nama adegan untuk mengambil satu layar saja.
3. Kalau layar atau langkah berubah, sesuaikan juga `src/lib/portal-guide.ts`.

Gambar bisa dibuka lewat alamat langsung tanpa login, jadi hanya boleh berisi data contoh.
