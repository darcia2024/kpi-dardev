# Alur pengguna dan wireframe struktural

Wireframe berikut menjelaskan urutan dan posisi konten, bukan gambar final atau kode frontend. Ukuran mengikuti design system. Nama/alamat rute pada implementasi masih dapat berubah.

## User journey per role

| Pengguna | Masuk dan tujuan | Alur utama | Batas |
|---|---|---|---|
| Pengunjung | Beranda/search/link publik | Temukan kegiatan/publikasi → detail → sumber/unduh; atau layanan → form → tracking | Tanpa login umum; hanya konten published |
| Pengurus | Login/MFA → My Workspace | Tugas → progress/hambatan → bukti → ajukan selesai → revisi bila diminta | Tidak menerima bukti sendiri secara default |
| Reviewer | Action Required | Buka versi ditugaskan → baca/unduh → catatan → keputusan | Review resource tertentu bukan akses seluruh divisi |
| Koordinator | Dashboard divisi | Workload → assignment; antrean review/extension/reassignment → tindak lanjut | Scope divisi/classification tetap berlaku |
| Ketua/Sekjend | Dashboard organisasi | Laporan sesuai mandat → drill-down → tindakan melalui modul sumber | Akses sensitif diaudit; export hak terpisah |
| Leadership lain | Dashboard scoped | Ringkasan dan approval sesuai mandat | Tidak otomatis cross-division performance |
| Admin teknis | Administration | Lifecycle akun/sesi, metadata organisasi/configuration | Tidak otomatis membuka bukti, kasus, isi rapat atau dokumen rahasia |
| Auditor | Audit/akses khusus | Filter event → detail aman → export bila diizinkan | Tidak mengedit jejak; isi resource hanya jika grant mencakupnya |
| Pengurus masuk | Handover | Pilih paket → review tiap item → terima/tandai outstanding | Akses tidak diwariskan bebas dari pemilik lama |

## Alur lengkap dan cabang

### F01 Login dan perubahan akses

A01 identifier/password → A02 challenge jika wajib → load scope/periode → W02. Salah credential: pesan generik. MFA belum selesai: portal belum dapat diakses. Reset: A03, token one-time. Jika sesi expired saat menulis, UI menghentikan pengiriman dan meminta login; pemulihan draft mengikuti sensitivitas, tidak menyimpan secret otomatis. Revoke/blocked harus menghentikan request meskipun UI belum berganti. Setelah membership berubah, menu dan data dimuat ulang; periode historis tidak memperoleh akses otomatis.

### F02 Tugas sampai diterima

T02 create → T03 assigned → T04 work/progress/blocker → T05 evidence tersedia → completion request → W03 reviewer → T06 accept/revise → selesai/aktif kembali. Drag-and-drop board tidak dapat melompati review.

| Pemicu | Tampilan | Keputusan sistem yang diperlukan |
|---|---|---|
| Deadline lewat | Badge Terlambat + status kerja tetap; tindakan Isi alasan | Overdue diturunkan dari deadline, terminal status dan policy |
| Ajukan tanpa bukti | Error dekat daftar bukti, fokus ke uploader | Tolak jika evidence wajib |
| Semua subtugas selesai | Pesan Siap diajukan dan tautan review | Jangan auto-accept tanpa completion policy final |
| Extension disetujui | Deadline baru + timeline lama/baru | Transaksi approval dan history |
| User nonaktif | Attention untuk koordinator | Tidak menghapus assignee historis |
| Bukti baru saat direview | “Bukti telah berubah. Tinjau versi terbaru.” | Optimistic locking/version binding |

### F03 Dokumen dan sharing

F02 pilih file → validasi → upload → checking/quarantine → Available → F03 detail. F04 pilih recipient/permission/expiry → ringkasan → share. Link eksternal-style hanya jika policy mengizinkan; belum berarti file menjadi Public. Revoke/classification naik → akses dievaluasi ulang; antarmuka tidak menjanjikan recall file yang sudah diunduh. Versi baru gagal tidak mengganti versi aktif. Archive bukti mempertahankan reference dan versi institusional.

### F04 Rapat ke tindakan

M02 draft → validate waktu/peserta → conflict warning → schedule → invitation → M03 RSVP/attendance → M04 minutes → M05 decision/voting → close round → M06 linked task → M07 archive. Rapat selesai tidak otomatis menyelesaikan tindak lanjut. Official minutes final read-only; reopen menghasilkan revisi baru. Pemilih melihat konfirmasi pilihan sebelum submit jika sesuai policy; setelah closed pilihan tidak diedit biasa.

### F05 Editorial bilingual

C02 draft varian bahasa → C03 submit/review → revision/reject/approve versi → C04 publish/schedule → P detail/search. Editing published content membuat draft baru; public pointer tetap pada versi sebelumnya. Publish memeriksa kembali akses approver, approved version dan asset classification. Translation kosong mengikuti fallback policy; tidak menggunakan draft. Archive menghapus dari discovery dan memicu invalidasi cache/sitemap. Reviewer notes tidak masuk response publik.

### F06 Pengaduan dan formulir

P11 → P12 form → validasi → tinjau → kirim sekali secara logis → P13 token → S03 triage → S04 assign/action → public-safe update → close → archive. Pisahkan area “Catatan internal” dan “Update untuk pelapor”, termasuk preview sebelum publikasi. Refresh setelah timeout tidak boleh membuat submission kedua tanpa diketahui. Tidak ada janji pemulihan token hilang sebelum identitas/recovery policy ditentukan. S01 perubahan field menghasilkan versi baru; S02 tetap menunjukkan label dan field dari versi submission asal.

### F07 Pengetahuan dan evaluasi

K03 draft + sources → submit review → revisi/approve → K01 search → K02 citation. Sumber tidak dapat diakses: jangan membocorkan judulnya; sumber outdated menampilkan indikator kepada pengguna berhak. E01 skor selalu punya konteks periode/metode/data; E03 correction menyimpan kalkulasi awal, nilai koreksi dan alasan; E02 comparison mengikuti keputusan role final.

### F08 Handover

A08 closing → H02 susun paket → masukkan pekerjaan/dokumen/keputusan/laporan → H03 incoming review → acceptance per item → final acceptance ketika syarat terpenuhi → H01 arsip. Outstanding tidak hilang karena periode berganti. Closed-period corrections harus melalui policy khusus, bukan tombol edit biasa.

### F09 AI dengan konfirmasi manusia

I01 ask → permission-filter sources → answer/citations → opsional I02 analisis → I03 proposed action → manusia review → confirm → server reauthorize/version check → execute/audit → hasil. Izin hilang/payload berubah: stop dan minta review baru. Failed execution tidak ditampilkan berhasil. AI tidak menekan approval atau publish atas nama pengguna tanpa konfirmasi yang sah.

## Wireframe 1: Beranda publik

Desktop:

```text
[KPI / PPMI] [Tentang] [Program] [Publikasi] [Data] [Layanan] [Cari] [ID/EN] [Portal]

           [Nama lembaga]
           [Judul utama ringkas, copy belum final]
           [Penjelasan fungsi untuk publik]
           [Kenali KPI] [Sampaikan aspirasi]
           [Foto relevan resmi / ilustrasi berlabel jika dipakai]

[Layanan: penjelasan pendek]       [Akses layanan / Lacak aspirasi]

[Kegiatan terbaru: satu unggulan] [Daftar kegiatan lain]
[Publikasi pilihan: daftar editorial dengan metadata]
[Data/transparansi: tautan ke sumber, indikator hanya bila approved]
[Footer: identitas, kontak, kebijakan, preferensi aksesibilitas]
```

Mobile: header ringkas KPI / Cari / Menu; drawer memuat navigasi dan ID/EN. Hero judul → copy → CTA → media. Urutan bagian sama; item unggulan di atas list. Footer satu kolom. Foto bukan syarat mengakses layanan.

## Wireframe 2: Workspace

```text
[Sidebar 232] | [Breadcrumb] [Cari sesuai akses] [Periode] [Notifikasi] [Akun]
              | [My Workspace]                 [Hari ini / Minggu ini]
              | [Konteks role/periode yang aman]
              | [Perlu tindakan]                 | [Agenda]
              | [Bukti menunggu review] [Tinjau]  | [Waktu + judul]
              | [Extension]            [Periksa] | [Waktu Kairo]
              | [Revisi]               [Buka]    |
              | [Tugas saya: filter / list]       | [Konteks divisi]
              | [Judul | status | deadline]      |
```

Mobile: topbar Menu / KPI / notifikasi; periode selalu dapat dijangkau; judul; Perlu tindakan; Tugas saya; Agenda. Tugas menjadi list dengan status/deadline. Tidak memasukkan semua 16 modul ke bottom navigation. Drawer memberi akses lengkap.

## Wireframe 3: Task detail dan review

```text
[Breadcrumb + periode]
[Judul tugas] [status kerja] [overdue jika ada]
[Klasifikasi + konteks akses]
[Assignee] [prioritas] [deadline] [progress]

[Ringkasan | Bukti | Subtugas | Komentar | Riwayat] | [Panel reviewer]
[File versi tertentu] [Unduh]                     | [Target versi]
[Catatan pengajuan]                              | [Catatan]
[Riwayat ringkas]                                | [Terima hasil]
                                                 | [Minta revisi]
```

Mobile: metadata membungkus; tab dapat scroll lokal; evidence dan catatan dahulu; review panel di bawah bukti. Sticky action ringkas hanya bila tidak menutupi isi; membuka panel review lengkap, bukan langsung accept. Executor melihat Ajukan selesai, reviewer melihat keputusan; tidak menampilkan keduanya karena sekadar layout template.

## Wireframe 4: Document detail dan share

```text
[Library / Detail] [Klasifikasi]
[Judul] [Versi aktif] [Status upload/final]
[Metadata / Versi / Relasi / Aktivitas]
[Metadata dan sumber]                         [Unduh]
[Linked tasks/meetings yang accessible]       [Bagikan jika berhak]

Dialog Bagikan:
[Resource + versi/scope yang dibagikan]
[Recipient picker] [Hak] [Mulai] [Berakhir]
[Peringatan classification bila perlu]
[Batal] [Berikan akses]
```

Mobile dialog menjadi sheet/full screen dengan label dan summary sama. Tidak menampilkan daftar pengguna di luar scope. Copy share token hanya sesudah grant/link berhasil dibuat.

## Wireframe 5: CMS editor dan penerbitan

```text
[Item / Bahasa ID | EN] [Status versi]
[Judul dan slug]
[Ringkasan + body editor]                    [Metadata]
[Sources/media/alt/caption]                  [Kategori / periode / SEO]
[Simpan draft] [Ajukan review]               [History]

Review/publish screen:
[Versi dan bahasa tepat] [Preview privat]
[Review notes] [Sumber] [Asset/public-safe check]
[Keputusan approver] → [Jadwal atau terbitkan]
```

Mobile editor satu kolom. Tidak menyandingkan ID/EN dalam dua kolom sempit; switch language menyimpan draft secara aman atau menampilkan unsaved warning. Reviewer panel menjadi bagian terpisah setelah preview.

## Wireframe 6: Rapat

```text
[Judul + status + klasifikasi] [Waktu + zona]
[Agenda | Peserta | Notulen | Keputusan | Tindak lanjut]
[Agenda/isi aktif]                       [Aksi yang berhak]
[Keputusan → nomor / statement / result / Buat tugas]
[Tindak lanjut → task / assignee / deadline / status]
```

Mobile default agenda list untuk kalender; detail memakai tab lokal. Voting screen terpisah menampilkan pertanyaan/opsi/status round dan konsekuensi submit. Meeting link hanya muncul pada akses yang sah.

## Wireframe 7: Complaint dan tracking

```text
Publik: [Nomor pelacakan] [Lacak]
        [Status aman] [Timeline update untuk pelapor]

Internal: [Kasus + scope] [Status] [Assignee]
          [Uraian/lampiran] | [Penanganan]
          [Catatan internal - bukan untuk publik]
          [Update untuk pelapor] [Preview] [Publikasikan update]
```

Mobile mempertahankan label pemisah kedua jenis catatan. Warna saja tidak cukup membedakan. Tidak menaruh nomor token pada analytics/browser title publik.

## Wireframe 8: Knowledge, handover dan AI

Knowledge: header metadata → body bacaan → sumber/versi di rail desktop; mobile sumber menjadi section setelah isi dengan anchor. Review/history actions mengikuti role.

Handover: header from/to period → status readiness → daftar kategori/item → panel acceptance. Mobile item list lalu acceptance; menerima paket tidak otomatis membuka semua file di dalamnya.

AI desktop: daftar percakapan collapse → chat utama → rail sources/actions. Mobile: chat utama + tombol Sumber/Tindakan membuka sheet. Konfirmasi action wajib menampilkan seluruh perubahan, tidak diringkas menjadi tombol “Ya” dalam bubble.

## Pesan state usulan

| Keadaan | Copy |
|---|---|
| Empty tasks | Belum ada tugas dalam tampilan ini. |
| Filter no results | Tidak ada hasil untuk filter ini. Atur ulang filter. |
| Read gagal | Data belum dapat dimuat. Coba lagi. Referensi: [ID aman]. |
| Koneksi putus | Koneksi terputus. Perubahan belum terkirim. |
| Upload checking | File sedang diperiksa dan belum dapat digunakan. |
| Conflict | Data telah diperbarui pengguna lain. Tinjau perubahan sebelum menyimpan. |
| Restricted | Item tidak tersedia atau Anda tidak memiliki akses. |
| Expired grant | Akses sementara telah berakhir. |
| Stale approval | Versi yang Anda tinjau telah berubah. Buka versi terbaru. |
| Public submit timeout | Status pengiriman belum dapat dipastikan. Periksa sebelum mengirim ulang. |

Pesan terakhir memerlukan dukungan idempotency/status lookup backend. UI tidak boleh menjanjikan draft tersimpan sebelum menerima acknowledgement. Local recovery untuk konten sensitif menunggu policy; default rancangan tidak menyimpan isi rahasia permanen di browser.
