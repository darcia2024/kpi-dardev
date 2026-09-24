# Rancangan seluruh halaman internal KPI

Status: rancangan implementasi UI/UX portal pengurus per 23 September 2026. Sumber cakupan adalah `02-COVERAGE-MATRIX.md`, backlog E02–E11, katalog 113 ID, dan kode portal saat ini. **Nama layar di bawah adalah pemetaan kerja yang perlu direkonsiliasi dengan spesifikasi granular sebelum dianggap kontrak final.**

Implementasi Fase 0–1 dan audit batasnya dicatat di [24-IMPLEMENTASI-FASE-0-1-INTERNAL.md](24-IMPLEMENTASI-FASE-0-1-INTERNAL.md).
Irisan implementasi Fase 2–3, pengujian, dan dependensi yang masih tertunda dicatat di [25-IMPLEMENTASI-FASE-2-3-INTERNAL.md](25-IMPLEMENTASI-FASE-2-3-INTERNAL.md).
Irisan implementasi Fase 4–5 dan batas provider/kebijakan dicatat di [26-IMPLEMENTASI-FASE-4-5-INTERNAL.md](26-IMPLEMENTASI-FASE-4-5-INTERNAL.md).
Irisan implementasi Fase 6–7 dan batas data resmi/infrastruktur dicatat di [27-IMPLEMENTASI-FASE-6-7-INTERNAL.md](27-IMPLEMENTASI-FASE-6-7-INTERNAL.md).

## Batas cakupan dan kondisi sekarang

Katalog mencatat 113 ID: 15 layar publik (P01–P15) dan **98 layar internal** dalam 13 kelompok. Komponen katalog saat ini membangkitkan ID dari jumlah per kelompok dan memberi semua ID status `UI TEST selesai awal`; ia belum menyimpan nama, route, acceptance criteria, atau bukti per layar. Jadi 98 adalah **baseline cakupan**, bukan 98 halaman jadi.

Portal sudah memiliki halaman induk `/portal`, `/portal/workspace`, `/portal/tugas`, `/portal/rapat`, `/portal/dokumen`, `/portal/kasus`, `/portal/keuangan`, `/portal/evaluasi`, `/portal/editor`, `/portal/handover`, `/portal/ai`, `/portal/akses`, dan `/portal/katalog`. Modul utama membaca API lokal TEST. Banyak subalur masih terwakili satu panel atau belum punya UI operasional. Implementasi baru harus mempertahankan fungsi yang sudah berjalan sambil mengganti placeholder secara bertahap.

## Prinsip pengalaman internal

1. Satu shell portal: header ringkas, navigasi berdasarkan pekerjaan, breadcrumb, identitas/periode aktif, pencarian, notifikasi, dan tema terang/gelap yang konsisten.
2. Navigasi utama maksimal enam kelompok: **Beranda**, **Pekerjaan**, **Layanan**, **Konten**, **Tata kelola**, **Admin**. Item yang tidak diizinkan disembunyikan atau menampilkan penjelasan akses yang jelas; API tetap memeriksa izin.
3. Satu objek memiliki daftar, detail, histori, dan tindakan yang konsisten. Gunakan halaman untuk alur panjang atau URL yang perlu dibagikan; panel/dialog untuk tindakan singkat. Jangan mengubah tiap ID katalog menjadi URL tanpa alasan.
4. Tiap aksi menunjukkan syarat, dampak, aktor, status, dan hasil. Draft, review, approve, publish, reject, revoke, dan archive diberi bahasa yang berbeda. Keputusan sensitif meminta alasan dan menampilkan riwayat.
5. Tiap layar harus punya loading, kosong, error/retry, forbidden, sukses, validasi field, dan state mobile. Data TEST diberi label; tindakan yang belum didukung backend tidak ditampilkan sebagai tombol aktif.
6. Gaya visual mengikuti brand KPI: merah sebagai aksen keputusan penting, Plus Jakarta Sans untuk teks, hierarki tipografi rapi, kepadatan kerja yang nyaman, kontras dan focus keyboard memadai. Arah visual lama di `05-DESIGN-DIRECTION.md` perlu diperbarui agar cocok dengan keputusan brand yang muncul kemudian.

## Peta 98 layar internal

Kolom “bentuk” adalah rekomendasi penyajian, bukan route final. `H` = halaman, `D` = detail dengan URL, `P` = panel/tab, `A` = aksi/dialog. URL induk yang sudah ada dipertahankan.

| ID | Layar/kapabilitas yang dibangun | Bentuk |
|---|---|---|
| A01 | Masuk | H `/masuk` |
| A02 | Verifikasi MFA | P pada `/masuk` |
| A03 | Sesi, keluar, dan sesi kedaluwarsa | P/A |
| A04 | Profil akun saya | H |
| A05 | Preferensi akun dan tampilan | H/P |
| A06 | Daftar akun | H `/portal/akses` |
| A07 | Detail akun, role, dan status | D |
| A08 | Struktur organisasi dan jabatan | H |
| A09 | Periode dan penugasan | H/P |
| A10 | Matriks role/permission | H/P |
| A11 | Grant akses, expiry, dan pencabutan | H/P pada `/portal/akses` |
| A12 | Konfigurasi sistem | H |
| A13 | Audit aktivitas | H |
| A14 | Retensi dan legal hold | H/P |
| A15 | Backup dan restore drill | H/P |
| A16 | Kesehatan integrasi dan operasi | H |
| W01 | Beranda kerja personal | H `/portal/workspace` |
| W02 | Action Required | H/P |
| W03 | Aktivitas dan linimasa kerja | H/P |
| W04 | Pencarian lintas objek berizin | H |
| W05 | Ringkasan tim/periode | H/P |
| T01 | Daftar tugas dan filter | H `/portal/tugas` |
| T02 | Detail tugas dan progres | D |
| T03 | Buat/ubah tugas | H/A |
| T04 | Tugas saya dan antrean review | P |
| T05 | Bukti dan pengajuan selesai | P/A |
| T06 | Keputusan review dan alasan | P/A |
| T07 | Perpanjangan tenggat | A |
| T08 | Delegasi, subtugas, dan dependency | P |
| T09 | Template tugas | H/P |
| T10 | Workload dan overdue | H/P |
| T11 | Pembatalan, arsip, dan histori | P/A |
| M01 | Kalender rapat | H `/portal/rapat` |
| M02 | Daftar dan detail rapat | H/D |
| M03 | Agenda, peserta, RSVP | P/A |
| M04 | Notulen draf, revisi, final | P |
| M05 | Voting dan hasil sesuai izin | P |
| M06 | Keputusan dan follow-up tugas | P |
| M07 | Arsip rapat | H/P |
| F01 | Pustaka dokumen, cari/filter | H `/portal/dokumen` |
| F02 | Unggah file, validasi, scan | H/P |
| F03 | Detail file dan riwayat versi | D |
| F04 | Preview/unduh berizin | P |
| F05 | Berbagi, expiry, revoke | P/A |
| F06 | Audit akses, arsip, retensi | P |
| K01 | Daftar knowledge/SOP/FAQ/brief | H `/portal/evaluasi` atau `/portal/knowledge` |
| K02 | Artikel dan sitasi sumber | D |
| K03 | Editor dan review knowledge | H/P |
| K04 | Versi, pencarian, dan arsip | P |
| C01 | Daftar konten dan kalender editorial | H `/portal/editor` |
| C02 | Buat/edit draf | H/D |
| C03 | Review dan permintaan revisi | P/A |
| C04 | Approval dan publikasi | P/A |
| C05 | Aset/media konten | P |
| C06 | Preview ID/EN dan tautan publik | P |
| C07 | Riwayat versi dan arsip | P |
| S01 | Kotak masuk aspirasi/kasus | H `/portal/kasus` |
| S02 | Detail kasus dan linimasa | D |
| S03 | Triage, urgensi, owner | P/A |
| S04 | Update pelapor dan catatan internal | P |
| S05 | Pengumuman dan target penerima | H/P |
| S06 | Komunikasi terarah | P |
| S07 | Form layanan dan versi | H/P |
| S08 | Status layanan dan SLA | H/P |
| S09 | Penutupan, pembukaan kembali, arsip | P/A |
| N01 | Kotak masuk notifikasi | H/P |
| N02 | Preferensi dan kanal | H/P |
| N03 | Template notifikasi | H/P |
| N04 | Monitor antrean, gagal/retry | H/P |
| B01 | Ringkasan anggaran/periode | H `/portal/keuangan` |
| B02 | Pos anggaran dan versi | H/P |
| B03 | Pengajuan/klaim/uang muka | H/A |
| B04 | Detail transaksi dan bukti | D |
| B05 | Antrean approval | H/P |
| B06 | Keputusan approval dan alasan | A |
| B07 | Pencatatan pembayaran | P/A |
| B08 | Rekonsiliasi | H/P |
| B09 | Ledger, audit, dan laporan | H/P |
| E01 | Ringkasan evaluasi | H `/portal/evaluasi` |
| E02 | Daftar subjek/periode/indikator | H/P |
| E03 | Detail capaian dan evidence | D |
| E04 | Input nilai dan status missing | P |
| E05 | Review evaluator | P/A |
| E06 | Koreksi dan versi formula | P |
| E07 | Sanggah dan keputusan | P/A |
| E08 | Riwayat dan laporan evaluasi | H/P |
| H01 | Daftar paket handover | H `/portal/handover` |
| H02 | Detail item, sumber, dan owner | D |
| H03 | Review dan penerimaan penerus | P/A |
| H04 | Outstanding dan peralihan akses | P |
| H05 | Checklist operasi/runbook | H/P |
| H06 | Arsip dan audit handover | P |
| I01 | Asisten tanya jawab berizin | H `/portal/ai` |
| I02 | Sitasi dan pemeriksaan sumber | P |
| I03 | Histori pertanyaan dan feedback | P |
| I04 | Registry provider/model/prompt | H/P |
| I05 | Kebijakan penggunaan/retensi | H/P |
| I06 | Preview tindakan dan konfirmasi manusia | P/A |

Jumlah: A16 + W05 + T11 + M07 + F06 + K04 + C07 + S09 + N04 + B09 + E08 + H06 + I06 = **98**. P01–P15 tetap berada pada rencana situs publik dan tidak dihitung sebagai halaman internal.

## Fase pembangunan

| Fase | Isi dan hasil yang harus terlihat | Kriteria selesai |
|---|---|---|
| 0. Inventaris dan kontrak | Ganti katalog generatif dengan registry 98 ID internal bernama, route, status, role, API, dependensi, dan acceptance criteria. Audit semua tombol dan placeholder pada halaman yang ada. | Tiap ID punya owner implementasi, state, dan bukti; status tidak lagi otomatis “selesai”. |
| 1. Shell dan pola bersama | Navigasi role-aware, konteks periode, breadcrumb, pencarian dasar, notifikasi, tabel/filter, form, detail, timeline, dialog keputusan, state loading/error/empty/forbidden. | Desktop/mobile, terang/gelap, keyboard, dan izin diuji; tidak ada link mati. |
| 2. Pekerjaan harian | W01–W05 dan T01–T11: workspace, action required, tugas, detail, bukti, review, dependency, workload. | Buat → kerjakan → ajukan → review → reload tetap konsisten pada data TEST; role salah ditolak. |
| 3. Dokumen dan rapat | F01–F06 dan M01–M07: pustaka/versi/akses, kalender, notulen, voting, keputusan, follow-up. | Alur yang belum punya storage/scanner/quorum resmi ditandai nonaktif; alur lokal yang tersedia diuji sampai backend. |
| 4. Layanan dan komunikasi | S01–S09 dan N01–N04: inbox kasus, triage, catatan terpisah, tracking, template/antrean notifikasi. | Pelapor hanya melihat update publik; pengurus hanya melihat kasus berizin; retry notifikasi tidak diklaim terkirim tanpa provider. |
| 5. Konten dan knowledge | C01–C07 dan K01–K04: kalender editorial, editor, review, publish, artikel bersitasi, versi. | Draft tidak bocor ke publik; reviewer terpisah; sumber yang dicabut hilang dari hasil berizin. |
| 6. Tata kelola | B01–B09 dan E01–E08: anggaran, transaksi/ledger, review, rekonsiliasi, indikator, sanggah, revisi. | Nilai kosong berbeda dari nol; approval terpisah dari requester; tidak memakai formula/budget fiktif sebagai data resmi. |
| 7. Admin, handover, AI | A01–A16, H01–H06, I01–I06: akun/grant/audit/operasi, penerimaan, AI preview dan policy. | Izin bisa dicabut dan berlaku setelah reload; handover diterima penerus; AI tidak mengirim/mengeksekusi data ke provider yang belum disetujui. |
| 8. Verifikasi menyeluruh | Tes per role, objek, tema, viewport, keyboard, kegagalan API, reload, konflik versi, audit, dan UAT dengan data TEST. | Matriks 98 ID menunjukkan `belum`, `UI`, `terhubung`, `teruji`, atau `tertunda keputusan`; bukti pemeriksaan dapat dibuka. |

Fase dapat dijalankan per irisan vertikal: satu objek dari daftar sampai keputusan dan reload. Jangan menyatakan suatu fase selesai hanya karena layar tampak lengkap.

## Dependensi yang ditunda tanpa menghentikan UI

- File nyata: storage privat, scanner malware, preview, download, sharing, retensi, legal hold.
- Identitas dan produksi: membership/jabatan resmi, RLS PostgreSQL, MFA/SSO, secret, backup/restore, observability.
- Kebijakan KPI: formula evaluasi, anggaran/mata uang/approval, quorum voting, SLA kasus, hak akses dan masa retensi, template pesan.
- Layanan eksternal: provider notifikasi, email, dan AI, termasuk wilayah pemrosesan dan persetujuan pemakaian data.

Untuk setiap dependensi tersebut, tampilkan penjelasan “belum tersedia” yang spesifik. Jangan membuat aksi palsu atau data yang terlihat resmi.

## Ukuran progres

Laporkan tiga angka terpisah: **cakupan UI** (ID dengan layar dan seluruh state), **integrasi** (ID yang aksi utamanya memakai API persisten), dan **verifikasi** (ID yang lolos tes role serta alur). Katalog saat ini belum memiliki bukti per ID, sehingga tidak ada persentase 98 layar yang sah untuk dilaporkan. Fase 0 menyiapkan dasar hitungnya.
