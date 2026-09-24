# Hasil Fase 0 dan Fase 1 portal internal

Tanggal audit: 23 September 2026. Lingkungan: local TEST dengan data sintetis. Dokumen ini membedakan cakupan layar dari kesiapan operasional.

## Fase 0 — inventaris dan kontrak layar

- Registry `src/lib/internal-screen-registry.ts` memuat **98 ID internal unik** dalam 13 kelompok. Setiap entri memiliki nama, fase, halaman induk, izin awal, API terkait, kriteria penerimaan, dan status audit awal.
- Status dibagi `API TEST terhubung` (35), `sebagian tersedia` (22), dan `belum dibangun` (41). Angka ini **bukan** persentase kesiapan. Belum ada ID yang diberi status “teruji penuh”. Lima belas ID publik tetap di luar hitungan internal.
- `/portal/katalog` sekarang mencari ID/nama, menyaring kelompok dan status, menampilkan 20 entri bertahap, serta membuka target dan dependensi tiap layar. Katalog lama hanya membangkitkan nomor dan menandai semuanya selesai awal.
- Kartu A04–A11 lama pada `/portal/akses` dihapus karena nomor/judulnya tidak konsisten dengan registry baru. Cakupan lanjutan diarahkan ke katalog.
- Kriteria per ID adalah kontrak kerja awal dari backlog. Owner UAT, keputusan kebijakan, dan bukti penerimaan per ID masih harus diisi bersama KPI; kolom ini sengaja tidak diisi dengan nama atau data rekaan.

### Audit tombol dan placeholder yang tersisa

| Area | Hasil audit | Perlakuan saat ini |
|---|---|---|
| Header portal lama | Hanya menampilkan beberapa modul dan tautan Akun untuk semua pengguna. | Diganti shell yang menyaring tujuan berdasarkan grant. |
| Beranda portal | Kartu mengarah juga ke modul tanpa izin. | Kartu dan aksi awal mengikuti daftar tujuan yang berizin. |
| Route modul langsung | Halaman dapat terbuka sebelum API mengembalikan 403. | Halaman menampilkan “akses dibatasi” lebih awal; API tetap mengecek izin. |
| Dokumen F02–F06 | Byte, scanner, preview, unduh, berbagi, dan audit akses file belum ada. | Hanya metadata TEST aktif; registry menandai sebagian/rencana. |
| Notifikasi N01–N04 | Antrean lokal ada, pengiriman/provider dan preferensi belum ada. | Status tidak diklaim terkirim ke penerima. |
| Workspace W03–W05 dan tugas T07–T11 | Linimasa, pencarian lintas objek, perpanjangan, template, workload, dan arsip belum menjadi alur lengkap. | Registry menandai belum/sebagian, bukan tombol palsu. |
| Rapat M01/M03/M07 | Kalender, RSVP, dan arsip belum lengkap. | Notulen/voting/follow-up yang ada tetap dipakai; sisanya tercatat. |
| Akses A04–A16 | Profil, membership, audit query, retensi, backup/restore, dan health operasi belum menjadi layar kerja. | Registry menandai kondisi sebenarnya. |
| CMS, keuangan, evaluasi, AI | API TEST ada untuk sebagian transisi; kebijakan resmi dan beberapa editor/detail belum ada. | Katalog membedakan fungsi yang terhubung dari cakupan parsial. |

Audit ini berdasarkan route, komponen, dan endpoint yang tersedia; belum menggantikan UAT semua role dan semua aksi.

## Fase 1 — shell dan pola bersama (fondasi terpasang)

- Layout `/portal` memakai satu sidebar dan topbar; situs publik tetap memakai headernya sendiri. Navigasi dibagi Beranda, Pekerjaan, Layanan, Konten, Tata kelola, dan Admin.
- Tautan menu dan beranda dihitung dari grant lokal per organisasi/periode. Pencarian topbar **mencari halaman portal yang berizin**, bukan isi seluruh database.
- Breadcrumb menunjukkan posisi; konteks periode diberi label TEST; tema terang/gelap tetap tersedia. Mobile memakai menu berlabel dengan tombol tutup dan backdrop. Menu dapat ditutup dengan Escape.
- Halaman tanpa grant menunjukkan penjelasan dan jalan kembali ke portal. API tetap menjadi sumber keputusan akses.
- Pola katalog memakai filter, hasil kosong, penjelasan status, ringkasan jumlah, detail target, dan pemuatan bertahap. Form dan daftar modul lain sudah memakai komponen lama; penyatuan pola detail/timeline/dialog keputusan lintas semua modul masuk fase berikutnya saat alur per objek dikerjakan.

## Verifikasi

- Tes registry memeriksa 98 ID unik, route/API/kriteria terisi; tes navigasi memeriksa bahwa grant terbatas hanya menampilkan tujuan yang diizinkan.
- Browser: login admin TEST, buka katalog, cari `T05`, buka kriteria, cari halaman portal, uji menu mobile termasuk tutup dengan Escape, tema gelap/terang, dan viewport desktop 1440 px serta mobile 390 px. Tidak ada scroll horizontal pada viewport mobile yang diuji.
- `npm run typecheck` dan `npm run build` lulus; `npm test` lulus **49/49**. Pemeriksaan HTTP dengan akun pengurus TEST menunjukkan `/portal/tugas` dapat dibuka, sedangkan `/portal/kasus`, `/portal/akses`, dan `/portal/katalog` menampilkan keadaan akses dibatasi. API tetap melakukan pemeriksaan izin terpisah.

## Batas Fase 1

Shell belum menyediakan pencarian lintas objek, pusat notifikasi personal, atau pemilih beberapa periode karena layanan/data pendukung belum tersedia. Menampilkan kontrol tersebut seolah aktif akan menyesatkan. Fase 2 dimulai dari pekerjaan harian dengan satu alur nyata per objek, bukan dari penambahan kartu atau route kosong.
