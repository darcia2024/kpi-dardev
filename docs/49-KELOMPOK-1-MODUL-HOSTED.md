# Kelompok 1 — sambungan modul hosted

Tanggal: 2 Oktober 2026. Dokumen ini memperbarui status modul kelompok 1 pada laporan 46. Status database terpasang berbeda dari aktivasi operasional dan kelulusan UAT pengguna.

## Cakupan yang dibangun

| Halaman | Sambungan dan alur yang tersedia | Batas pemakaian |
| --- | --- | --- |
| `/portal/workspace` | Ringkasan tugas terbuka, tenggat, rapat mendatang, catatan dalam pemeriksaan, dan notifikasi; pemilihan organisasi/periode/divisi. Setiap baris mengikuti akses sumber. | Memerlukan periode, penugasan, dan WORKSPACE_READ. Ringkasan bukan pengganti seluruh halaman modul. |
| `/portal/keuangan` | Anggaran dan transaksi IDR/EGP/USD; draf/revisi/pengajuan; pemeriksaan bukti; persetujuan akhir oleh pihak berbeda dari pembuat dan pemeriksa; batas anggaran; pencatatan pembayaran; rekonsiliasi independen; riwayat dan notifikasi. | Tidak mengirim uang. Semua pengajuan transaksi memerlukan dokumen bukti terverifikasi dan dapat dibaca. Belum mengotomatisasi rekening, konversi kurs, atau akuntansi pajak. |
| `/portal/evaluasi` | Nilai 0–100 dengan rujukan kriteria dan dokumen bukti; pemeriksaan independen; revisi/penolakan; satu keberatan dari subjek; riwayat versi. | Hasil individual RAHASIA. Nomor catatan dibuat sebelum isinya; izin baca dan pengelolaan per objek harus disetujui melalui F01. Kriteria resmi tidak diganti dengan rubrik buatan developer. |
| `/portal/handover` | Paket serah terima kepada penerima yang ditunjuk; dokumen terverifikasi; penolakan duplikasi dokumen; penerimaan per item; penutupan setelah semua item diterima; jejak tindakan. | Serah terima umum berbeda dari F05. Penutupan paket tidak otomatis mencabut akses atau menggantikan keputusan pengakhiran akses. |
| `/portal/ai` dan tombol floating | Pemilihan maksimum lima sumber pengetahuan yang dapat dibaca; adapter penyedia HTTPS; pemeriksaan persetujuan processor; batas 8 permintaan/menit dan 100/hari per akun; validasi sitasi; pemeriksaan ulang sumber setelah respons; draf tugas/pengetahuan; pratinjau dan konfirmasi atomik. | Penyedia belum disetujui/dikonfigurasi. Tidak ada respons AI palsu. Percakapan tidak otomatis disimpan. Draf disimpan sebagai RAHASIA dan memerlukan izin per objek. Konfirmasi hanya membuat tugas sendiri atau draf pengetahuan; belum membuat transaksi atau kasus dari percakapan. |
| `/portal/operasi` | Kesiapan schema/storage, periode, processor yang berizin, 100 audit teknis terbaru dengan filter/CSV; register bukti uji backup dan pemulihan dengan pemeriksaan independen. | Admin teknis tidak menerima isi kasus/penilaian lewat audit. Register mencatat uji yang sudah dilakukan; tidak menjalankan backup/restore database. |
| `/portal/katalog` | Pencarian dan filter 98 layar rujukan; tujuan modul; sinyal koneksi database untuk admin. | Angka layar rujukan bukan jumlah fitur yang lulus UAT. Status contoh/lokal dalam registry lama tidak diubah menjadi klaim seluruh layar online. |

## Penyimpanan dan otorisasi

- Migration 018–023 membuat `management.records`, `events`, `ai_usage`, dan `reservations`; tabel privat dengan RLS dan tanpa akses langsung dari klien.
- API baru: `/api/v1/work/management`, `/workspace`, `/operations`, `/ai`. API memverifikasi sesi; mutasi memeriksa origin, ukuran input, versi, dan izin melalui RPC. Respons menggunakan `private, no-store`.
- Keputusan akses, konflik kepentingan, batas waktu, penugasan, dan pengakhiran akses dari SOP v1.1 tetap berlaku. Administrator teknis tidak otomatis menerima izin bisnis.
- Anggaran/transaksi/serah terima/register uji pemulihan menggunakan klasifikasi TERBATAS. Penilaian individual dan draf AI menggunakan RAHASIA. Informasi campuran tetap harus ditetapkan sesuai kategori tertingginya melalui alur klasifikasi; jangan menaruh rincian kasus dalam catatan keuangan biasa.
- Reservasi rahasia menyimpan nomor objek, lingkup, pembuat, dan masa berlaku tujuh hari, tanpa isi penilaian/draf. Permintaan F01 menggunakan ID tersebut dan izin EVALUATION_READ/EVALUATION_WRITE atau AI_READ/AI_ACTION_CONFIRM. Tidak ada grant otomatis.
- Draf AI mengikat versi sumber saat usulan dibuat dan saat dikonfirmasi. Izin dicabut, sumber berubah, atau pratinjau kedaluwarsa membuat tindakan ditolak. Tujuan tugas/pengetahuan diperiksa lagi oleh RPC modul tujuan. Konfirmasi ulang tidak membuat data kedua.
- Halaman hosted tidak lagi otomatis menambahkan contoh data. Halaman contoh eksplisit tetap terpisah.

## Verifikasi

`npm run typecheck`, `npm run test`: lulus, 174 tes. Pengujian PostgreSQL terisolasi mencakup instalasi migration 018–023, penolakan akses tanpa grant, reservasi rahasia tanpa izin objek, bukti, pemisahan pembuat/pemeriksa/pemberi persetujuan, batas anggaran, pembayaran/reconciliation, keberatan, penerimaan dokumen, versi usulan AI, masa berlaku pratinjau, pencabutan akses sumber, sitasi, kuota, notifikasi, dan privasi audit. Data fixture hanya berada di database tes terpisah.

Migration dipasang pada Supabase production KPI. Pemeriksaan sebelumnya dan sesudah pemasangan menunjukkan tidak ada data operasional buatan, mandat resmi, atau periode aktif. Deploy production terakhir: `dpl_5j4YWuovnpwCycGNdir9JryezDyj` (READY), alias https://kpi-ppmi-mesir-preview.vercel.app. Build production dan tujuh probe koneksi Vercel lulus. Pemeriksaan akhir Supabase mengembalikan `database_siap=true`, `perlindungan_rahasia=true`, `versi_sumber_ai=true`, `data_buatan=0`, `mandat_resmi=0`, `periode_aktif=0`.

Probe langsung Vercel: GET management/workspace/operations dan POST management/AI tanpa sesi ditolak 401; origin asing ditolak 403; ketujuh halaman internal mengarahkan pengguna tanpa sesi ke `/masuk` (307). Respons API privat tidak dicache. Ini membuktikan penolakan anonim dan kesiapan deployment, bukan UAT pengguna berwenang.

Bukti browser: `.vercel/group-one-database-proof.png` (artefak lokal, tidak dikirim ke Git).

## Yang masih memerlukan tindakan resmi

1. Periode resmi 17 Oktober 2026–17 Oktober 2027 belum mulai pada tanggal laporan. Jangan membuat periode aktif palsu untuk membuka modul.
2. Isi penugasan dan mandat resmi, lalu jalankan F01/F02 untuk grant per peran/divisi/objek. Grant admin teknis tidak menggantikan mandat bisnis.
3. Setujui penyedia pemeriksaan berkas dan konfigurasi scanner. Tanpa pemeriksaan, upload tetap dikarantina dan tidak dapat menjadi bukti AVAILABLE.
4. Pilih dan setujui penyedia AI, endpoint adapter, model, penilaian processor, klasifikasi, dan masa berlaku persetujuan. Setelah itu isi KPI_AI_PROVIDER_URL/TOKEN/MODEL sebagai secret server Vercel. Adapter mengikuti kontrak di `hosted-ai-provider.ts`, bukan otomatis kompatibel dengan setiap penyedia.
5. Lakukan backup/restore nyata di layanan database sesuai prosedur, lalu catat buktinya. Tidak ada klaim pemulihan berhasil hanya karena formulir tersimpan.
6. UAT di Vercel dengan beberapa akun/peran resmi: tulis/muat ulang, upload terverifikasi, approval, pencabutan, dan penolakan akun tanpa izin. Sesi browser yang dapat diakses agent masih berada di `/masuk`; UAT login resmi belum diklaim selesai.

Tidak ada akun, jabatan, mandat, atau data kepengurusan fiktif yang dibuat di production untuk melewati batas ini.
