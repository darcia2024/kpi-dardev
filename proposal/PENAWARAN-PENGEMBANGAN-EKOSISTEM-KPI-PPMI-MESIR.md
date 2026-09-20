# Penawaran Pengembangan Ekosistem Digital KPI PPMI Mesir

**Penyedia:** Dar Dev  
**Klien:** Komisi Peduli Interaksi (KPI), PPMI Mesir  
**Tanggal:** 8 September 2026  
**Masa berlaku penawaran:** 30 hari kalender  
**Status:** Draft untuk dibahas dan disetujui

## 1. Tujuan pekerjaan

Dar Dev akan membangun ekosistem digital KPI PPMI Mesir secara bertahap. Sistem terdiri dari website publik, portal internal pengurus, penyimpanan dokumen, pengelolaan tugas dan rapat, arsip lintas periode, serta layanan AI dengan batas akses yang ditetapkan KPI.

Pekerjaan mengikuti dokumen kebutuhan KPI, rancangan UI/UX, dan 28 keputusan yang telah disetujui KPI pada 8 September 2026. Fitur dikerjakan per phase agar setiap bagian dapat diuji dan diterima sebelum phase berikutnya dimulai.

## 2. Nilai penawaran

Nilai total pengembangan adalah **Rp375.000.000**.

Nilai tersebut mencakup analisis teknis, desain antarmuka, pengembangan frontend dan backend, database Supabase, pengujian, dokumentasi handover, serta masa stabilisasi setelah rilis tiap phase. Nilai ini belum termasuk PPN bila berlaku dan belum termasuk biaya layanan pihak ketiga.

| Phase | Lingkup utama | Nilai |
|---|---|---:|
| 1 | Website publik dan CMS | Rp55.000.000 |
| 2 | Portal MVP | Rp135.000.000 |
| 3 | Operasional lanjutan | Rp110.000.000 |
| 4 | AI, hardening, UAT, dan handover | Rp75.000.000 |
|  | **Total** | **Rp375.000.000** |

## 3. Lingkup pekerjaan

### Phase 1: Website publik dan CMS

Nilai: **Rp55.000.000**

Mencakup:

- Halaman beranda, Tentang KPI, struktur organisasi publik, profil divisi, program dan kegiatan, publikasi, repository, statistik publik, transparansi, serta layanan.
- Website publik dua bahasa, Indonesia dan Inggris, mengikuti aturan fallback yang disepakati.
- CMS dengan alur draft, review, approval, publish, dan archive.
- Pengelolaan publikasi, metadata, repository, media, data/statistik publik, SEO dasar, sitemap, dan preview privat.
- Form aspirasi/pengaduan publik dan pelacakan dengan kode unik.
- Design system KPI beracuan Apple HIG dan desain responsif untuk mobile.

Tidak termasuk penulisan artikel, terjemahan profesional, foto, video, logo, maupun data statistik resmi. KPI menyediakan atau menyetujui seluruh konten publik sebelum diterbitkan.

### Phase 2: Portal MVP

Nilai: **Rp135.000.000**

Mencakup:

- Login, MFA aplikasi authenticator, pemulihan akun, pengelolaan sesi, dan logout seluruh perangkat.
- Pengguna, jabatan, divisi, periode, keanggotaan, role, dan permission.
- Hak akses berdasarkan jabatan, divisi, periode, resource, dan lima tingkat kerahasiaan.
- Dashboard, My Workspace, Action Required, notifikasi, pencarian internal, serta konteks periode aktif.
- Task management: create, assign, progress, hambatan, bukti, review, revisi, deadline, overdue, extension, reassignment, subtasks, dependency, template, tugas berulang, workload, archive, dan history.
- Dokumen dasar untuk upload bukti dan dokumen kerja: validasi ukuran maksimal 25 MB, larangan file program, status pemeriksaan, versi, klasifikasi, unduh terkontrol, serta log akses sensitif.
- Audit log dan security events untuk tindakan penting.

### Phase 3: Operasional lanjutan

Nilai: **Rp110.000.000**

Mencakup:

- Rapat, kalender, kehadiran, notulen ber-versi, keputusan, voting rahasia, dan tindak lanjut menjadi task.
- Dokumen lengkap: sharing, access grant sementara, share link dengan expiry, revoke, watermark sesuai kebijakan, archive, dan restore.
- Knowledge Base: taxonomy, sumber, citation, review, versioning, archive, dan pencarian sesuai izin.
- Form builder dan workflow submission.
- Pengaduan internal: triage, assignment, catatan internal, update aman untuk pelapor, penutupan, dan archive.
- Pengumuman internal dan buku kontak lembaga dengan batas data yang telah disepakati.
- Laporan kinerja, rumus dan koreksi yang dapat ditelusuri setelah KPI memberikan formula dan bobot.
- Serah terima kepengurusan, arsip periode, daftar outstanding, dan acceptance incoming leadership.
- Modul keuangan sesuai keputusan KPI: periode anggaran, mata uang utama, pengajuan, approval bertingkat, bukti transaksi, masking rekening, pencocokan, dan audit. Nilai nominal, batas approval, periode, serta retensi menunggu data resmi KPI.

### Phase 4: AI, hardening, UAT, dan handover

Nilai: **Rp75.000.000**

Mencakup:

- AI Assistant untuk dokumen klasifikasi Umum dan Internal saja.
- Citation sumber, pembatasan retrieval berdasarkan izin pengguna, pemisahan fakta, analisis, dan rekomendasi.
- AI untuk menyiapkan tindakan, dengan review, konfirmasi manusia, pemeriksaan ulang izin, dan audit sebelum eksekusi.
- AI dapat menandai transaksi yang perlu diperiksa manusia, tanpa menyimpulkan pelanggaran.
- Pengujian authorization, workflow, akses dokumen, public/internal boundary, AI leakage, mobile, accessibility, dan UAT.
- Hardening keamanan, pengujian backup/restore, dokumentasi teknis, dokumentasi admin, panduan pengguna, serta handover.

## 4. Deliverable setiap phase

Setiap phase menghasilkan:

- Desain layar dan alur yang disetujui untuk lingkup phase.
- Source code yang dikelola pada repository yang disepakati.
- Database migration dan konfigurasi environment yang terdokumentasi.
- Kontrak API dan daftar permission terkait.
- Skenario pengujian serta hasil UAT untuk lingkup phase.
- Dokumentasi penggunaan dan administrasi yang relevan.
- Rilis ke environment staging, lalu production setelah penerimaan KPI.

## 5. Jadwal indikatif

Jadwal bergantung pada kecepatan KPI memberi konten, keputusan, akses layanan pihak ketiga, dan hasil UAT. Estimasi kerja setelah kickoff:

| Phase | Estimasi durasi |
|---|---|
| 1 | 6 sampai 8 minggu |
| 2 | 12 sampai 16 minggu |
| 3 | 12 sampai 16 minggu |
| 4 | 8 sampai 12 minggu |

Target totalnya sekitar **10 sampai 13 bulan**. Jadwal final dibuat saat kickoff, setelah KPI menunjuk PIC yang dapat menerima atau memberi revisi atas setiap deliverable.

## 6. Termin pembayaran

Pembayaran dilakukan pada setiap phase dengan pola berikut:

| Termin | Persentase nilai phase | Pemicu |
|---|---:|---|
| 1 | 30% | Kontrak phase ditandatangani dan pekerjaan dimulai |
| 2 | 40% | Demo staging memenuhi lingkup utama phase |
| 3 | 20% | UAT phase diterima KPI atau perbaikan UAT kritis selesai |
| 4 | 10% | Rilis production, handover, dan stabilisasi selesai |

Pembayaran phase berikutnya dimulai setelah phase sebelumnya diterima dan termin yang jatuh tempo dibayarkan.

## 7. Masa stabilisasi dan support

Setiap phase mencakup **30 hari kalender masa stabilisasi** setelah rilis production. Masa ini mencakup perbaikan defect yang menyimpang dari scope dan acceptance criteria phase tersebut.

Support operasional setelah masa stabilisasi bersifat opsional:

| Layanan | Nilai |
|---|---:|
| Maintenance standar, maksimal 12 jam kerja per bulan | Rp5.000.000 per bulan |
| Pekerjaan tambahan di luar retainer atau perubahan kecil | Rp500.000 per jam |

Maintenance tidak termasuk biaya provider dan tidak mencakup fitur baru yang mengubah scope. Fitur baru akan diproses melalui Change Request.

## 8. Biaya pihak ketiga

KPI membayar langsung atau mengganti biaya aktual layanan pihak ketiga. Contohnya:

- Domain dan DNS.
- Vercel atau hosting frontend/API.
- Supabase, storage, backup, dan add-on sesuai kebutuhan.
- Provider email transaksional.
- Provider WhatsApp resmi bila dipakai.
- Layanan AI dan model yang dipilih.
- Monitoring, error tracking, dan layanan keamanan tambahan.

Dar Dev akan merekomendasikan konfigurasi yang sesuai sebelum biaya tersebut diaktifkan. Biaya aktual tergantung penggunaan dan paket provider.

## 9. Tanggung jawab KPI

KPI menunjuk PIC produk dan PIC keputusan. KPI menyediakan atau menyetujui:

- Struktur organisasi, nama pemegang jabatan, dan approver yang berlaku.
- Konten publik, logo, warna resmi, foto, dokumen, dan terjemahan yang akan diterbitkan.
- Nilai yang belum ditetapkan dalam 28 keputusan, termasuk batas nominal keuangan, formula kinerja, retensi data, masa sesi, mata uang, dan SLA pengaduan.
- Akses yang diperlukan untuk domain, hosting, Supabase, email, WhatsApp, serta provider AI.
- UAT dan keputusan penerimaan phase dalam waktu yang disepakati pada kickoff.

KPI tetap menjadi pemilik data organisasi dan bertanggung jawab atas keabsahan konten, kebijakan, serta keputusan organisasi yang dimasukkan ke sistem.

## 10. Perubahan lingkup

Perubahan yang menambah modul, alur, integrasi, role, field, laporan, jumlah bahasa, atau aturan bisnis di luar scope proposal ini diproses sebagai Change Request.

Setiap Change Request memuat dampak terhadap biaya, jadwal, desain, database, keamanan, permission, pengujian, dan data yang sudah ada. Pekerjaan perubahan dimulai setelah KPI menyetujui estimasi tertulis.

## 11. Batas pekerjaan

Proposal ini tidak mencakup:

- Aplikasi native Android atau iOS.
- Integrasi eksternal yang belum disepakati, seperti payment gateway, kalender eksternal, SSO, atau CRM.
- Migrasi massal data historis yang format dan kualitasnya belum diperiksa.
- Pemulihan data akibat kegagalan provider di luar kontrol Dar Dev, selain prosedur backup/restore yang termasuk dalam scope.
- Layanan legal, audit hukum, penerjemahan tersumpah, atau penulisan konten substantif.
- SLA 24/7, on-call, dan operasi infrastruktur penuh, kecuali dibuat perjanjian support tersendiri.

## 12. Penerimaan proposal

Dengan menyetujui proposal ini, KPI menyetujui nilai, pembagian phase, mekanisme pembayaran, batas pekerjaan, dan proses Change Request. Detail kontrak, invoice, rekening pembayaran, pajak, serta identitas para pihak dicantumkan dalam dokumen kerja sama final.

| Untuk KPI PPMI Mesir | Untuk Dar Dev |
|---|---|
| Nama: __________________________ | Nama: __________________________ |
| Jabatan: ________________________ | Jabatan: ________________________ |
| Tanggal: ________________________ | Tanggal: ________________________ |
| Tanda tangan: ___________________ | Tanda tangan: ___________________ |
