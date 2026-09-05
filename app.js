/**
 * Rancangan UI/UX & Pengerjaan Website KPI PPMI Mesir
 * Interactive Core Application Engine
 * Tanggal: 5 September 2026
 * Diperkaya dengan 13 Dokumen Spesifikasi Sumber (Downloads/*.docx)
 */

// --- 1. DATA MASTER: 61 LAYAR (PETA LENGKAP & RELASI ENTITAS DB) ---
const ALL_SCREENS = [
  // Publik (P01 - P15)
  { id: 'P01', name: 'Beranda Publik', category: 'Publik', role: 'Semua / Tamu', source: 'B2, U4, C3', purpose: 'Halaman depan website. Berisi pengenalan singkat KPI, tombol menuju layanan, kegiatan terbaru, dan publikasi pilihan.', controls: 'Hanya menampilkan informasi yang sudah disetujui untuk umum. Bagian yang belum ada isinya disembunyikan, bukan diisi data karangan.', db: 'public_content, forms, tracking_tokens' },
  { id: 'P02', name: 'Tentang KPI & PPMI', category: 'Publik', role: 'Semua / Tamu', source: 'U4, C3', purpose: 'Menjelaskan profil, visi-misi, tugas, wewenang, sejarah, dan kepengurusan yang sedang menjabat.', controls: 'Isinya versi untuk umum. Tidak menampilkan data anggota internal.', db: 'public_content, periods' },
  { id: 'P03', name: 'Struktur Organisasi', category: 'Publik', role: 'Semua / Tamu', source: 'U4, C12', purpose: 'Bagan susunan organisasi yang bisa diklik, per periode kepengurusan.', controls: 'Hanya bagian yang boleh dilihat umum. Divisi yang sifatnya sensitif tidak ditampilkan detail anggotanya.', db: 'divisions, positions, memberships' },
  { id: 'P04', name: 'Profil Divisi Publik', category: 'Publik', role: 'Semua / Tamu', source: 'B2, C12', purpose: 'Menjelaskan tugas dan program tiap divisi yang boleh diketahui umum.', controls: 'Informasi yang sifatnya rahasia tidak ditampilkan sama sekali.', db: 'divisions, public_content' },
  { id: 'P05', name: 'Program & Kegiatan', category: 'Publik', role: 'Semua / Tamu', source: 'C11, U4', purpose: 'Daftar kegiatan per periode beserta statusnya (rencana, berjalan, selesai) dan dokumentasinya.', controls: 'Tautan ke sistem internal tidak ikut tampil.', db: 'tasks (projection), public_content' },
  { id: 'P06', name: 'Berita & Informasi', category: 'Publik', role: 'Semua / Tamu', source: 'C3', purpose: 'Kabar kegiatan dan pengumuman umum, lengkap dengan tanggal dan sumbernya.', controls: 'Berita dan hasil riset diberi label berbeda supaya tidak tertukar.', db: 'public_content, public_content_versions' },
  { id: 'P07', name: 'Publikasi & Riset', category: 'Publik', role: 'Semua / Tamu', source: 'C10, U12', purpose: 'Kumpulan tulisan dan riset yang bisa disaring berdasarkan jenis, tahun, penulis, dan bahasa, lengkap dengan ringkasan dan file unduhan.', controls: 'Hanya file yang sudah disetujui untuk umum.', db: 'public_content, citations, files' },
  { id: 'P08', name: 'Repository Digital', category: 'Publik', role: 'Semua / Tamu', source: 'M C, C10', purpose: 'Katalog arsip yang bisa dicari, lengkap dengan cara menuliskan sumber kutipannya.', controls: 'Terhubung ke publikasi resmi, tidak menggandakan data.', db: 'knowledge_items, citations' },
  { id: 'P09', name: 'Data & Statistik', category: 'Publik', role: 'Semua / Tamu', source: 'C13', purpose: 'Angka dan grafik yang terbuka untuk umum, lengkap dengan satuan, cara hitung, dan tanggal datanya.', controls: 'Hanya data yang sudah disahkan. Data yang belum ada tidak ditulis sebagai angka nol.', db: 'performance_scores (public view)' },
  { id: 'P10', name: 'Portal Transparansi', category: 'Publik', role: 'Semua / Tamu', source: 'B2, U4', purpose: 'Laporan pertanggungjawaban untuk umum beserta file resminya.', controls: 'Tidak memuat klaim keberhasilan sebelum datanya resmi disahkan.', db: 'public_content, archives' },
  { id: 'P11', name: 'Pusat Layanan Aspirasi', category: 'Publik', role: 'Semua / Tamu', source: 'U4', purpose: 'Daftar saluran resmi untuk menyampaikan aspirasi atau keluhan, beserta panduannya.', controls: 'Jam layanan yang ditampilkan sesuai kenyataan.', db: 'forms, forms_versions' },
  { id: 'P12', name: 'Formulir Pengaduan / Aspirasi', category: 'Publik', role: 'Semua / Tamu', source: 'D13, U14', purpose: 'Formulir untuk mengirim aduan atau aspirasi: pilih kategori, tulis uraian, dan lampirkan bukti.', controls: 'Ada pengaman supaya tidak bisa disalahgunakan dan tidak terkirim dobel saat sinyal jelek.', db: 'complaints, tracking_tokens, form_submissions' },
  { id: 'P13', name: 'Hasil & Pelacakan Status', category: 'Publik', role: 'Semua / Tamu', source: 'B2, D13', purpose: 'Mengecek perkembangan aduan memakai nomor kode unik, tanpa perlu bikin akun.', controls: 'Catatan internal pengurus tidak pernah ikut terlihat oleh pelapor.', db: 'tracking_tokens, complaint_updates' },
  { id: 'P14', name: 'Pencarian Publik Global', category: 'Publik', role: 'Semua / Tamu', source: 'C16', purpose: 'Kotak pencarian untuk artikel, publikasi, dan program, bisa disaring per jenis dan bahasa.', controls: 'Dokumen yang masih draf atau bersifat privat tidak muncul di hasil pencarian.', db: 'public_content (search index)' },
  { id: 'P15', name: 'Preferensi & Aksesibilitas', category: 'Publik', role: 'Semua / Tamu', source: 'U18-20, C4', purpose: 'Pengaturan bahasa (ID/EN), tampilan terang/gelap, ukuran teks, dan pengurangan animasi.', controls: 'Pengaturan disimpan di perangkat pengguna masing-masing.', db: 'Local Storage Browser' },

  // Akses & Fondasi (A01 - A12)
  { id: 'A01', name: 'Login Pengurus', category: 'Fondasi', role: 'Pengurus / Tamu', source: 'A4-8', purpose: 'Halaman masuk untuk pengurus memakai email/username dan kata sandi.', controls: 'Kalau gagal, pesannya umum (tidak memberitahu bagian mana yang salah). Percobaan berulang dibatasi.', db: 'users, security_events' },
  { id: 'A02', name: 'Verifikasi Dua Langkah', category: 'Fondasi', role: 'Pengurus', source: 'A5', purpose: 'Langkah keamanan tambahan: memasukkan kode dari aplikasi di HP sebelum benar-benar masuk.', controls: 'Selama kode ini belum benar, seluruh sistem internal tetap terkunci.', db: 'users (mfa_secret), security_events' },
  { id: 'A03', name: 'Pemulihan Akun / Reset', category: 'Fondasi', role: 'Pengurus', source: 'A5-8', purpose: 'Meminta pengaturan ulang kata sandi lewat tautan sekali pakai.', controls: 'Tautan otomatis kedaluwarsa. Sistem tidak memberitahu apakah suatu email terdaftar atau tidak.', db: 'users, security_events' },
  { id: 'A04', name: 'Profil & Perangkat Login', category: 'Fondasi', role: 'Semua Pengurus', source: 'A6, U28', purpose: 'Melihat daftar perangkat yang sedang login dan bisa mengeluarkan perangkat yang mencurigakan.', controls: 'Perangkat yang sedang dipakai ditandai jelas. Mengeluarkan perangkat perlu konfirmasi.', db: 'users, audit_logs' },
  { id: 'A05', name: 'Manajemen Pengguna', category: 'Fondasi', role: 'Admin Teknis', source: 'A13', purpose: 'Daftar akun pengurus: status aktif, penetapan peran dasar, dan riwayat login.', controls: 'Setiap perubahan status dicatat beserta alasannya.', db: 'users, user_roles, audit_logs' },
  { id: 'A06', name: 'Daftar Hak Akses & Peran', category: 'Fondasi', role: 'Pimpinan / Admin', source: 'R4-6, A14', purpose: 'Daftar rinci siapa boleh melakukan apa, di divisi mana, dan sampai kapan.', controls: 'Hak untuk melihat data dipisahkan dari hak untuk mengunduh atau mengekspor data.', db: 'roles, permissions, role_permissions' },
  { id: 'A07', name: 'Struktur Organisasi Internal', category: 'Fondasi', role: 'Admin / Sekjend', source: 'A9-12', purpose: 'Mengatur divisi, jabatan, dan keanggotaan lintas periode.', controls: 'Menonaktifkan sebuah jabatan tidak menghapus catatan siapa yang pernah menjabat.', db: 'divisions, positions, memberships' },
  { id: 'A08', name: 'Manajemen Periode Kerja', category: 'Fondasi', role: 'Pimpinan', source: 'A11, D17', purpose: 'Mengatur status periode kepengurusan (rencana, aktif, penutupan, selesai) dan memulai serah terima.', controls: 'Periode yang sudah selesai bersifat hanya-baca, kecuali lewat prosedur koreksi resmi.', db: 'periods, handovers' },
  { id: 'A09', name: 'Permintaan Akses Khusus', category: 'Fondasi', role: 'Pengurus / Koordinator', source: 'R14', purpose: 'Mengajukan izin sementara untuk membuka dokumen atau tugas tertentu, dengan batas waktu.', controls: 'Wajib menyebutkan alasan dan disetujui bertingkat. Izin otomatis habis sendiri.', db: 'access_grants, audit_logs' },
  { id: 'A10', name: 'Akses Darurat', category: 'Fondasi', role: 'Ketua / Sekjend', source: 'R14-15', purpose: 'Prosedur darurat untuk membuka akses saat terjadi kejadian genting.', controls: 'Muncul peringatan di seluruh sistem, ada hitung mundur, dan diperiksa setelah kejadian.', db: 'emergency_access_events, audit_logs' },
  { id: 'A11', name: 'Catatan Riwayat Keamanan', category: 'Fondasi', role: 'Auditor / Pimpinan', source: 'A15-20', purpose: 'Catatan lengkap aktivitas: siapa, melakukan apa, kapan, dan hasilnya.', controls: 'Catatan ini tidak bisa dihapus atau diubah siapa pun. Bagian sensitif disamarkan.', db: 'audit_logs, security_events' },
  { id: 'A12', name: 'Pengaturan Sistem Global', category: 'Fondasi', role: 'Admin Teknis', source: 'D15, A22', purpose: 'Pengaturan umum: pemberitahuan, batas ukuran file, lama penyimpanan, dan daftar kategori.', controls: 'Perubahan yang berdampak luas perlu ringkasan dampak dan konfirmasi terpisah.', db: 'audit_logs' },

  // Workspace & Tugas (W01 - W05, T01 - T11)
  { id: 'W01', name: 'Dashboard Pengurus', category: 'Workspace', role: 'Semua Pengurus', source: 'U7', purpose: 'Ringkasan cepat: beban kerja, rapat hari ini, dan pemberitahuan penting.', controls: 'Tanpa grafik hiasan. Grafik kinerja hanya muncul bila konteks periodenya jelas.', db: 'tasks, meetings, notifications' },
  { id: 'W02', name: 'My Workspace', category: 'Workspace', role: 'Semua Pengurus', source: 'U8, TK15', purpose: 'Ruang kerja pribadi: tugas sendiri, tenggat yang mendekat, agenda rapat (waktu Kairo), dan file kerja.', controls: 'Hanya menampilkan hal-hal yang memang jadi wewenang pengguna itu.', db: 'tasks, task_assignees, meetings' },
  { id: 'W03', name: 'Action Required (Perlu Tindakan)', category: 'Workspace', role: 'Koordinator / Reviewer', source: 'U8, TK15', purpose: 'Daftar hal mendesak yang harus dikerjakan: memeriksa bukti tugas, revisi, permintaan perpanjangan waktu, dan kendala.', controls: 'Isinya hal yang butuh tindakan nyata, bukan sekadar info.', db: 'tasks, task_evidence, task_evaluations' },
  { id: 'W04', name: 'Pencarian Internal Global', category: 'Workspace', role: 'Semua Pengurus', source: 'U21, K5', purpose: 'Mencari file, tugas, notulen, dan panduan, dengan penyaringan sesuai izin dan periode.', controls: 'Dokumen yang di atas level izin pengguna tidak muncul judul maupun cuplikannya.', db: 'files, tasks, knowledge_items' },
  { id: 'W05', name: 'Pusat Notifikasi', category: 'Workspace', role: 'Semua Pengurus', source: 'U22, D14', purpose: 'Kumpulan pemberitahuan: perubahan tugas, komentar, jadwal rapat, dan info sistem.', controls: 'Membaca notifikasi tidak otomatis menyelesaikan tugas di "Perlu Tindakan".', db: 'notifications' },
  { id: 'T01', name: 'Daftar & Papan Tugas', category: 'Tugas', role: 'Pengurus / Koordinator', source: 'U9, TK2', purpose: 'Melihat tugas dalam bentuk tabel atau papan tempel (Kanban).', controls: 'Menggeser kartu hanya untuk perpindahan yang sah; tidak bisa melewati tahap pemeriksaan bukti.', db: 'tasks, task_assignees' },
  { id: 'T02', name: 'Buat & Edit Tugas', category: 'Tugas', role: 'Koordinator', source: 'TK5-6', purpose: 'Mengisi judul tugas, divisi, penanggung jawab, tenggat, prioritas, dan tingkat kerahasiaan.', controls: 'Mengubah tenggat atau penanggung jawab setelah tugas berjalan harus lewat permohonan resmi.', db: 'tasks, task_assignees, audit_logs' },
  { id: 'T03', name: 'Detail Tugas & Status', category: 'Tugas', role: 'Semua Pengurus', source: 'TK7-8', purpose: 'Informasi lengkap satu tugas: data, perkembangan, bukti, sub-tugas, dan diskusi.', controls: 'Perkembangan 100% belum berarti "selesai"; harus lewat persetujuan bukti dulu.', db: 'tasks, task_evidence, task_history' },
  { id: 'T04', name: 'Lapor Progres & Hambatan', category: 'Tugas', role: 'Pelaksana Tugas', source: 'TK7', purpose: 'Memperbarui persentase perkembangan dan melaporkan bila ada hambatan.', controls: 'Melaporkan hambatan otomatis menandai tugas dan memberi tahu koordinator.', db: 'tasks, task_history' },
  { id: 'T05', name: 'Pengajuan Selesai & Unggah Bukti', category: 'Tugas', role: 'Pelaksana Tugas', source: 'TK8', purpose: 'Mengunggah file hasil kerja dan catatan, lalu mengirimkannya ke pemeriksa.', controls: 'File bukti harus lolos pemeriksaan keamanan dulu sebelum bisa dikirim.', db: 'task_evidence, files, task_history' },
  { id: 'T06', name: 'Panel Pemeriksaan Bukti Tugas', category: 'Tugas', role: 'Reviewer / Koordinator', source: 'TK8, 20', purpose: 'Pemeriksa menilai bukti kerja: tombol "Terima Hasil" atau "Minta Revisi".', controls: 'Orang yang mengerjakan tugas tidak boleh memeriksa buktinya sendiri.', db: 'task_evaluations, tasks, audit_logs' },
  { id: 'T07', name: 'Pengajuan Perpanjangan Waktu', category: 'Tugas', role: 'Pelaksana Tugas', source: 'TK10', purpose: 'Meminta perpanjangan tenggat dengan alasan dan tanggal baru.', controls: 'Tenggat lama tidak diganti sebelum koordinator menyetujui.', db: 'tasks, task_history' },
  { id: 'T08', name: 'Sub-tugas & Urutan Pengerjaan', category: 'Tugas', role: 'Koordinator', source: 'TK11', purpose: 'Memecah tugas besar menjadi bagian kecil dan mengatur urutan pengerjaannya.', controls: 'Tugas induk baru bisa selesai setelah semua bagiannya selesai diperiksa.', db: 'tasks (parent_task_id)' },
  { id: 'T09', name: 'Template Tugas Berulang', category: 'Tugas', role: 'Koordinator', source: 'TK12', purpose: 'Pola tugas rutin yang otomatis muncul lagi, lengkap dengan perkiraan tanggal berikutnya.', controls: 'Mengubah template tidak merusak tugas yang sudah terlanjur berjalan.', db: 'tasks' },
  { id: 'T10', name: 'Analisis Beban Kerja', category: 'Tugas', role: 'Koordinator', source: 'TK14', purpose: 'Peta pembagian tugas tiap anggota supaya tenggatnya tidak menumpuk.', controls: 'Hanya memberi peringatan bila ada bentrok, tanpa memaksakan penugasan otomatis.', db: 'tasks, task_assignees' },
  { id: 'T11', name: 'Pembatalan & Arsip Tugas', category: 'Tugas', role: 'Koordinator', source: 'TK13', purpose: 'Menonaktifkan tugas yang dibatalkan sambil mencatat alasannya.', controls: 'Tidak ada penghapusan permanen; riwayat dan file tetap disimpan.', db: 'tasks, archives, audit_logs' },

  // Kalender & Rapat (M01 - M07)
  { id: 'M01', name: 'Kalender Kegiatan & Rapat', category: 'Rapat', role: 'Semua Pengurus', source: 'ME10-11', purpose: 'Tampilan kalender (bulan/minggu/agenda) yang menggabungkan jadwal rapat dan tenggat tugas.', controls: 'Zona waktu Kairo ditulis jelas. Judul rapat rahasia tidak bocor.', db: 'meetings, tasks' },
  { id: 'M02', name: 'Buat & Jadwalkan Rapat', category: 'Rapat', role: 'Sekretaris / Pemimpin Rapat', source: 'ME4-5', purpose: 'Membuat agenda rapat, mengundang peserta, menautkan link daring, dan menetapkan tingkat kerahasiaan.', controls: 'Sistem mengecek jam selesai harus setelah jam mulai, dan mendeteksi jadwal yang bentrok.', db: 'meetings, meeting_participants' },
  { id: 'M03', name: 'Detail Rapat & Kehadiran', category: 'Rapat', role: 'Peserta Rapat', source: 'ME9', purpose: 'Konfirmasi kehadiran, absen saat rapat, dan bahan bacaan sebelum rapat.', controls: 'Konfirmasi hadir mandiri dicatat terpisah dari verifikasi oleh notulis.', db: 'meeting_attendance, meetings' },
  { id: 'M04', name: 'Editor Notulen Rapat', category: 'Rapat', role: 'Notulis / Sekretaris', source: 'ME8', purpose: 'Mencatat poin bahasan, kesimpulan, dan revisi notulen sampai final.', controls: 'Notulen yang sudah final dikunci; kalau perlu dibuka lagi, dibuat versi baru.', db: 'meeting_minutes, audit_logs' },
  { id: 'M05', name: 'Keputusan & Pemungutan Suara', category: 'Rapat', role: 'Anggota Rapat Berhak', source: 'ME7', purpose: 'Voting resmi untuk sebuah usulan: setuju, tolak, atau abstain.', controls: 'Satu orang satu suara. Daftar pemilih disimpan. Hasilnya terbuka.', db: 'meeting_decisions, meeting_votes' },
  { id: 'M06', name: 'Tindak Lanjut Rapat', category: 'Rapat', role: 'Sekretaris / Koordinator', source: 'ME11', purpose: 'Mengubah kesepakatan rapat langsung menjadi tugas yang saling terhubung.', controls: 'Tugas hasil rapat otomatis mencantumkan nomor notulen dan tanggal rapatnya.', db: 'meeting_followups, tasks' },
  { id: 'M07', name: 'Arsip Risalah Rapat', category: 'Rapat', role: 'Pimpinan / Pengurus', source: 'ME15-16', purpose: 'Pustaka untuk mencari keputusan lama, risalah lengkap, dan mengunduh paket rapat.', controls: 'Item rahasia hanya tampil bila pengguna punya izin khusus untuk arsip itu.', db: 'meetings, archives' },

  // Dokumen & Knowledge (F01 - F06, K01 - K04)
  { id: 'F01', name: 'Pustaka Dokumen Organisasi', category: 'Dokumen', role: 'Semua Pengurus', source: 'DO11, D8', purpose: 'Katalog file resmi yang bisa disaring per tingkat kerahasiaan, kategori, divisi, dan status.', controls: 'Izin membuka file dicek setiap kali diminta; file yang sangat pribadi tetap terlindungi.', db: 'files, file_classifications' },
  { id: 'F02', name: 'Unggah & Pemeriksaan Berkas', category: 'Dokumen', role: 'Pengurus', source: 'DO5, 15', purpose: 'Mengunggah file, mengisi keterangannya, lalu file diperiksa otomatis sebelum bisa dipakai.', controls: 'Alurnya: sedang diunggah -> sedang diperiksa -> siap dipakai (atau dikarantina bila gagal).', db: 'files, file_versions' },
  { id: 'F03', name: 'Detail Berkas & Versi', category: 'Dokumen', role: 'Pengurus', source: 'DO9', purpose: 'Melihat riwayat versi file, siapa yang mengunggah, dan tugas atau rapat yang terkait.', controls: 'Kalau unggahan versi baru gagal, versi yang sekarang tetap aktif.', db: 'files, file_versions, audit_logs' },
  { id: 'F04', name: 'Pengaturan Berbagi & Hak Akses', category: 'Dokumen', role: 'Pemilik Dokumen', source: 'DO7-8', purpose: 'Memberi izin baca atau unduh ke orang atau divisi lain, dengan batas waktu.', controls: 'Tidak bisa membagikan lebih dari hak si pemilik. Ada tombol cabut izin seketika.', db: 'share_links, download_logs' },
  { id: 'F05', name: 'Label Kerahasiaan & Cap Digital', category: 'Dokumen', role: 'Pimpinan / Admin', source: 'DO7, 12', purpose: 'Mengubah label kerahasiaan file (Umum, Internal, Rahasia, Sangat Rahasia) dan memberi cap digital.', controls: 'Menurunkan tingkat kerahasiaan wajib lewat persetujuan bertingkat.', db: 'file_classifications, classification_history' },
  { id: 'F06', name: 'Catatan Akses & Arsip Berkas', category: 'Dokumen', role: 'Auditor', source: 'DO15-17', purpose: 'Daftar siapa saja yang membuka dan mengunduh file sensitif.', controls: 'Arsip file tetap menyimpan kaitannya dengan tugas yang sudah selesai.', db: 'download_logs, archives, audit_logs' },
  { id: 'K01', name: 'Pusat Panduan & SOP', category: 'Knowledge', role: 'Semua Pengurus', source: 'K2-5', purpose: 'Kumpulan panduan kerja, SOP, praktik terbaik, dan materi pelatihan.', controls: 'Bisa dicari lewat teks, dan artikel yang sudah usang diberi tanda.', db: 'knowledge_items, citations' },
  { id: 'K02', name: 'Detail Artikel & Sumber Rujukan', category: 'Knowledge', role: 'Semua Pengurus', source: 'K3, 12', purpose: 'Halaman baca yang fokus, dengan panel sumber rujukan dan tombol masukan.', controls: 'Kalau akses ke dokumen sumber sudah dicabut, judulnya tidak ditampilkan.', db: 'knowledge_items, citations' },
  { id: 'K03', name: 'Tulis & Periksa Panduan', category: 'Knowledge', role: 'Editor Knowledge', source: 'K4', purpose: 'Menyusun artikel SOP baru, menautkan sumber, lalu mengajukannya untuk diperiksa.', controls: 'Artikel baru harus disetujui koordinator sebelum tampil untuk umum internal.', db: 'knowledge_items, audit_logs' },
  { id: 'K04', name: 'Kategori & Arsip Pengetahuan', category: 'Knowledge', role: 'Admin Pengetahuan', source: 'K8, 12', purpose: 'Mengatur kategori, tag topik, dan menggabungkan panduan yang mirip.', controls: 'Mengarsipkan artikel tidak menghapus versi lama yang pernah dipakai tugas terdahulu.', db: 'knowledge_items, archives' },

  // Editorial, Layanan & Komunikasi (C01 - C07, S01 - S06)
  { id: 'C01', name: 'Dashboard Redaksi', category: 'CMS', role: 'Tim Publikasi / Media', source: 'C5-7', purpose: 'Mengelola antrean konten publik: draf, sedang diperiksa, terjadwal, terbit.', controls: 'Tombolnya "Simpan Draf", bukan "Terbitkan". Izin redaksi terpisah dari admin sistem.', db: 'public_content, public_content_versions' },
  { id: 'C02', name: 'Editor Konten Dua Bahasa (ID/EN)', category: 'CMS', role: 'Editor Publikasi', source: 'C4', purpose: 'Menulis artikel dalam Bahasa Indonesia dan Bahasa Inggris sekaligus.', controls: 'Status terbit tiap bahasa berdiri sendiri; versi ID terbit tidak memaksa versi EN ikut terbit.', db: 'public_content, public_content_versions' },
  { id: 'C03', name: 'Tinjauan & Persetujuan Redaksi', category: 'CMS', role: 'Pemimpin Redaksi', source: 'C7', purpose: 'Melihat pratinjau sebelum terbit, memeriksa kelayakan untuk umum, lalu menyetujui.', controls: 'Persetujuan menempel pada versi teks tertentu, supaya tidak diam-diam diubah setelah disetujui.', db: 'public_content_versions, audit_logs' },
  { id: 'C04', name: 'Jadwal & Penerbitan', category: 'CMS', role: 'Koordinator Publikasi', source: 'C8, 25', purpose: 'Menjadwalkan rilis berita otomatis atau menerbitkannya langsung ke website publik.', controls: 'Sistem mengecek ulang semua lampiran harus berstatus "boleh untuk umum".', db: 'public_content, audit_logs' },
  { id: 'C05', name: 'Kelola Publikasi & Repositori', category: 'CMS', role: 'Pengelola Riset', source: 'C10-11', purpose: 'Menata keterangan publikasi ilmiah, identitas penulis, dan file PDF siap unduh.', controls: 'Keterangan yang sifatnya internal tidak ikut tampil ke publik.', db: 'public_content, files, citations' },
  { id: 'C06', name: 'Kelola Data & Media Publik', category: 'CMS', role: 'Tim Data', source: 'C13-15', purpose: 'Mengelola data terbuka, grafik indikator, serta gambar dan media.', controls: 'Hanya kolom data yang sudah disahkan yang boleh tampil ke publik.', db: 'performance_scores, files' },
  { id: 'C07', name: 'Kategori & Pengalihan Alamat Halaman', category: 'CMS', role: 'Admin Web', source: 'C25', purpose: 'Mengelola kategori publik dan pengalihan alamat halaman bila halaman pindah atau dihapus.', controls: 'Menarik sebuah artikel otomatis membersihkannya dari pencarian dan daftar publik.', db: 'public_content, archives' },
  { id: 'S01', name: 'Pembuat Formulir', category: 'Layanan', role: 'Koordinator Layanan', source: 'D12', purpose: 'Membuat formulir survei atau aspirasi publik dengan aturan pengisian dan pertanyaan bercabang.', controls: 'Formulir berdiri sendiri; tidak bisa menulis bebas ke basis data.', db: 'forms, form_versions, form_fields' },
  { id: 'S02', name: 'Daftar Jawaban Formulir', category: 'Layanan', role: 'Petugas Layanan', source: 'D12', purpose: 'Melihat jawaban masyarakat yang masuk dan mengekspor datanya dengan aman.', controls: 'Jawaban lama tetap mengikuti versi formulir saat responden mengisinya.', db: 'form_submissions' },
  { id: 'S03', name: 'Antrean Pemilahan Pengaduan', category: 'Layanan', role: 'Tim Pengaduan', source: 'D13, R5', purpose: 'Memilah aduan yang masuk: menentukan tingkat urgensi, divisi penanggung jawab, dan status.', controls: 'Akses per kasus; tidak semua pengurus bisa melihat isi aduan yang sensitif.', db: 'complaints, complaint_updates' },
  { id: 'S04', name: 'Detail Pengaduan & Catatan', category: 'Layanan', role: 'Penindak Lanjut Aduan', source: 'D13', purpose: 'Menangani aduan sampai selesai, memisahkan tegas "catatan internal" dan "kabar untuk pelapor".', controls: 'Kabar untuk pelapor wajib dipratinjau dulu sebelum dikirim ke nomor kode pelapor.', db: 'complaints, complaint_updates, tracking_tokens' },
  { id: 'S05', name: 'Pengumuman Internal', category: 'Komunikasi', role: 'Sekjend / Humas', source: 'B9, M E', purpose: 'Menyiarkan pengumuman penting ke seluruh pengurus atau divisi tertentu.', controls: 'Sasaran divisinya jelas; daftar penerima ditampilkan dulu sebelum dikirim.', db: 'notifications, public_content' },
  { id: 'S06', name: 'Buku Kontak & Mitra Relasi', category: 'Komunikasi', role: 'Humas / Pimpinan', source: 'M D', purpose: 'Buku alamat kelembagaan: PPMI, KBRI, organisasi kekeluargaan dan kedaerahan.', controls: 'Nomor pribadi dilindungi; menambah kontak baru lewat pemeriksaan pengurus.', db: 'users, audit_logs' },

  // Evaluasi, Handover & AI (E01 - E03, H01 - H03, I01 - I03)
  { id: 'E01', name: 'Laporan Kinerja Pengurus & Divisi', category: 'Evaluasi', role: 'Pimpinan / Koordinator', source: 'D18, TK21', purpose: 'Statistik penyelesaian tugas: jumlah selesai, ketepatan waktu, dan keabsahan bukti kerja.', controls: 'Data yang belum ada dibedakan jelas dari nilai nol. Dihitung per periode aktif.', db: 'performance_scores, tasks' },
  { id: 'E02', name: 'Perbandingan Antar Divisi & Ekspor', category: 'Evaluasi', role: 'Ketua / Sekjend', source: 'U15, R9', purpose: 'Membandingkan kinerja antar bagian organisasi dan mengekspor laporan resmi.', controls: 'Sementara ini hanya untuk pimpinan tertinggi, selama aturannya masih ditinjau.', db: 'performance_scores, audit_logs' },
  { id: 'E03', name: 'Pengajuan Koreksi Nilai Kinerja', category: 'Evaluasi', role: 'Koordinator', source: 'TK21', purpose: 'Mengajukan keberatan bila ada kendala di luar kendali yang mempengaruhi angka kinerja.', controls: 'Koreksi tidak menimpa angka asli; alasan keberatan tetap disimpan.', db: 'performance_scores, audit_logs' },
  { id: 'H01', name: 'Arsip Periode Sebelumnya', category: 'Handover', role: 'Pimpinan / Pengurus', source: 'M O', purpose: 'Membuka dokumen dan keputusan dari kepengurusan sebelumnya, dengan penyaringan.', controls: 'Pengurus baru tidak otomatis mendapat semua akses arsip lama.', db: 'archives, periods' },
  { id: 'H02', name: 'Susun Paket Serah Terima', category: 'Handover', role: 'Pengurus Demisioner', source: 'D17', purpose: 'Merangkum pekerjaan yang masih berjalan, dokumen penting, inventaris, dan catatan kunci.', controls: 'Kelengkapan paket diperiksa dulu sebelum diserahkan ke kepengurusan baru.', db: 'handovers, archives' },
  { id: 'H03', name: 'Terima & Cek Serah Terima', category: 'Handover', role: 'Pengurus Periode Baru', source: 'U23, D17', purpose: 'Daftar periksa penerimaan item satu per satu: "Diterima" atau "Perlu Klarifikasi".', controls: 'Paket belum dianggap selesai sebelum semua poin penting dicek.', db: 'handovers, audit_logs' },
  { id: 'I01', name: 'Tanya Jawab Asisten AI', category: 'AI', role: 'Semua Pengurus', source: 'U16, D19', purpose: 'Tanya jawab cepat soal aturan organisasi, SOP, dan ringkasan rapat.', controls: 'AI hanya membaca dokumen yang boleh diakses pengguna. Selalu mencantumkan sumber.', db: 'ai_conversations, ai_messages, ai_sources' },
  { id: 'I02', name: 'Alat Bantu Analisis Kajian', category: 'AI', role: 'Tim Kajian / Pimpinan', source: 'B11', purpose: 'Membandingkan dokumen kebijakan, menemukan celah, dan menyusun kerangka argumen.', controls: 'Semua hasilnya diberi label "saran AI"; keputusan tetap di tangan manusia.', db: 'ai_conversations, ai_messages' },
  { id: 'I03', name: 'Tinjau & Jalankan Usulan AI', category: 'AI', role: 'Pengurus Berwenang', source: 'M M, D19', purpose: 'Halaman persetujuan untuk perubahan yang disarankan AI, misalnya membuat draf tugas.', controls: 'Wajib dikonfirmasi manusia sebelum dijalankan. Izin dicek ulang saat dikirim.', db: 'ai_actions, audit_logs' }
];

// --- 2. DATA MASTER: 13 DOKUMEN SPESIFIKASI SUMBER (DOWNLOADS/*.DOCX) ---
const SOURCE_DOCUMENTS = [
  { code: 'B', file: 'Blueprint_Sistem_Digital_KPI.docx', title: 'Blueprint Sistem Digital KPI', scope: 'Bagian 2-13, 16', purpose: 'Gambaran besar visi sistem, prinsip kendali tetap di tangan manusia, bahasa resmi, dan batasan sistem digital.' },
  { code: 'M', file: 'Master_Architecture_KPI_v1.0.docx', title: 'Master Architecture KPI v1.0', scope: 'Bagian C-G, J-P', purpose: 'Susunan induk menu publik dan internal, pemisahan antar bagian, dan model wewenang organisasi.' },
  { code: 'T', file: 'Technical_Architecture_KPI_v1.0.docx', title: 'Technical Architecture KPI v1.0', scope: 'Bagian 8-16', purpose: 'Standar teknologi yang dipakai, cara login yang aman, dan batas tegas antara bagian publik dan internal.' },
  { code: 'R', file: 'Role_Permission_Matrix_KPI_v1.0.docx', title: 'Role & Permission Matrix v1.0', scope: 'Bagian 5-19', purpose: 'Daftar 10 peran, 15 jenis izin, 5 tingkat kerahasiaan, dan aturan akses darurat.' },
  { code: 'U', file: 'UI_UX_Architecture_KPI_v1.0.docx', title: 'UI/UX Architecture KPI v1.0', scope: 'Bagian 3-29', purpose: 'Prinsip tampilan, cara kerja tiap bagian, tata letak untuk layar kecil, dan tolok ukur kelayakan tampilan.' },
  { code: 'D', file: 'Development_Specification_KPI_v1.0.docx', title: 'Development Specification v1.0', scope: 'Bagian 4-19, 23-25', purpose: 'Panduan teknis untuk pembuat sistem: aturan data, pencegahan kiriman dobel, pemeriksaan di sisi server, dan tolok ukur "selesai".' },
  { code: 'DB', file: 'Database_Architecture_ERD_KPI_v1.0.docx', title: 'Database Architecture & ERD v1.0', scope: 'Bagian 4-14', purpose: 'Rancangan 34 tabel penyimpanan data, cara antar-tabel saling terkait, dan aturan siapa boleh melihat baris data mana.' },
  { code: 'A', file: 'Granular_Module_Specification_AUTH_CORE_AUDIT_KPI_v1.0.docx', title: 'Granular AUTH, CORE & AUDIT v1.0', scope: 'Bagian 3-20', purpose: 'Rincian alur login, kode keamanan tambahan, pengelolaan sesi, keanggotaan per periode, dan catatan aktivitas yang tak bisa diubah.' },
  { code: 'TK', file: 'Granular_Module_Specification_TASK_KPI_v1.0.docx', title: 'Granular TASK Work Management v1.0', scope: 'Bagian 2-22', purpose: 'Rincian 8 status tugas, kewajiban melampirkan bukti kerja, pelaporan hambatan, dan penilaian oleh pemeriksa.' },
  { code: 'ME', file: 'Granular_Module_Specification_MEET_KPI_v1.0.docx', title: 'Granular MEET Meetings & Decisions v1.0', scope: 'Bagian 3-17', purpose: 'Rincian kalender rapat waktu Kairo, absensi mandiri, penguncian notulen final, voting tertutup, dan tugas tindak lanjut.' },
  { code: 'DO', file: 'Granular_Module_Specification_DOC_KPI_v1.0.docx', title: 'Granular DOC Documents & Files v1.0', scope: 'Bagian 3-17', purpose: 'Rincian alur unggah file (diunggah -> diperiksa -> siap/karantina), izin berbagi yang ada batas waktunya, dan pencatatan unduhan.' },
  { code: 'K', file: 'Granular_Module_Specification_KNOW_KPI_v1.0_fixed.docx', title: 'Granular KNOW Knowledge Base v1.0', scope: 'Bagian 2-13', purpose: 'Rincian penyusunan SOP yang mencantumkan sumber sah, penandaan artikel usang, dan pencarian sesuai izin.' },
  { code: 'C', file: 'Granular_Module_Specification_CMS_PUB_KPI_v1.0.docx', title: 'Granular CMS & PUB Public Web v1.0', scope: 'Bagian 3-27', purpose: 'Rincian alur redaksi dua bahasa yang terpisah, persetujuan per versi teks, dan pencegahan bocornya data rahasia.' }
];

// --- 3. DATA MASTER: 34 TABEL DATABASE & ERD (POSTGRESQL / SUPABASE) ---
const DATABASE_ENTITIES = [
  { domain: 'Identity & Access', table: 'users', pk: 'id (UUID)', fields: 'email, username, password_hash, mfa_secret, status, created_at', desc: 'Data akun pengurus dan kata sandi yang disimpan terenkripsi.' },
  { domain: 'Identity & Access', table: 'roles', pk: 'id (UUID)', fields: 'name, description, is_system', desc: 'Daftar peran baku, misalnya Ketua, Sekjend, dan lainnya.' },
  { domain: 'Identity & Access', table: 'permissions', pk: 'id (UUID)', fields: 'action, resource, description', desc: 'Daftar izin satuan: lihat, buat, setujui, ekspor, dan sebagainya.' },
  { domain: 'Identity & Access', table: 'role_permissions', pk: 'id (UUID)', fields: 'role_id (FK), permission_id (FK)', desc: 'Menghubungkan tiap peran dengan izin-izinnya.' },
  { domain: 'Identity & Access', table: 'user_roles', pk: 'id (UUID)', fields: 'user_id (FK), role_id (FK), valid_from, valid_until', desc: 'Pemberian peran ke pengguna beserta masa berlakunya.' },
  { domain: 'Identity & Access', table: 'access_grants', pk: 'id (UUID)', fields: 'user_id (FK), resource_type, resource_id, expires_at', desc: 'Izin khusus sementara untuk membuka sesuatu.' },
  { domain: 'Identity & Access', table: 'emergency_access_events', pk: 'id (UUID)', fields: 'actor_id (FK), reason, countdown_expires_at', desc: 'Catatan setiap kali akses darurat diaktifkan.' },

  { domain: 'Organization Core', table: 'periods', pk: 'id (UUID)', fields: 'name, start_date, end_date, status (Planned/Active/Closing/Closed)', desc: 'Data periode kepengurusan.' },
  { domain: 'Organization Core', table: 'divisions', pk: 'id (UUID)', fields: 'name, code, description, is_sensitive', desc: 'Data divisi dan biro.' },
  { domain: 'Organization Core', table: 'positions', pk: 'id (UUID)', fields: 'division_id (FK), title, level', desc: 'Data jabatan resmi kepengurusan.' },
  { domain: 'Organization Core', table: 'memberships', pk: 'id (UUID)', fields: 'user_id (FK), period_id (FK), division_id (FK), position_id (FK)', desc: 'Siapa menjabat apa, di divisi mana, pada periode mana.' },

  { domain: 'Work & Tasks', table: 'tasks', pk: 'id (UUID)', fields: 'title, description, division_id (FK), period_id (FK), deadline, priority, status, progress', desc: 'Data tugas beserta statusnya.' },
  { domain: 'Work & Tasks', table: 'task_assignees', pk: 'id (UUID)', fields: 'task_id (FK), user_id (FK), role_in_task', desc: 'Daftar penanggung jawab dan pelaksana tiap tugas.' },
  { domain: 'Work & Tasks', table: 'task_evidence', pk: 'id (UUID)', fields: 'task_id (FK), file_id (FK), notes, uploaded_by (FK)', desc: 'File bukti penyelesaian tugas yang wajib dilampirkan.' },
  { domain: 'Work & Tasks', table: 'task_evaluations', pk: 'id (UUID)', fields: 'task_id (FK), reviewer_id (FK), decision (Accept/Revise), notes', desc: 'Hasil pemeriksaan bukti oleh pemeriksa (diterima atau revisi).' },
  { domain: 'Work & Tasks', table: 'task_history', pk: 'id (UUID)', fields: 'task_id (FK), actor_id (FK), event_type, old_value, new_value', desc: 'Riwayat perubahan progres, perpanjangan, dan status tugas.' },

  { domain: 'Meetings & Decisions', table: 'meetings', pk: 'id (UUID)', fields: 'title, agenda, start_time, end_time, location_or_link, classification, status', desc: 'Data jadwal dan sesi rapat.' },
  { domain: 'Meetings & Decisions', table: 'meeting_participants', pk: 'id (UUID)', fields: 'meeting_id (FK), user_id (FK), participation_role', desc: 'Daftar undangan peserta rapat.' },
  { domain: 'Meetings & Decisions', table: 'meeting_attendance', pk: 'id (UUID)', fields: 'meeting_id (FK), user_id (FK), status, checked_at', desc: 'Catatan kehadiran peserta rapat.' },
  { domain: 'Meetings & Decisions', table: 'meeting_minutes', pk: 'id (UUID)', fields: 'meeting_id (FK), author_id (FK), content, is_final, approved_at', desc: 'Notulen rapat; yang sudah final terkunci dari perubahan.' },
  { domain: 'Meetings & Decisions', table: 'meeting_decisions', pk: 'id (UUID)', fields: 'meeting_id (FK), title, decision_text, status', desc: 'Keputusan atau usulan kebijakan hasil rapat.' },
  { domain: 'Meetings & Decisions', table: 'meeting_votes', pk: 'id (UUID)', fields: 'decision_id (FK), voter_id (FK), vote_choice, voted_at', desc: 'Suara pada pemungutan suara (satu orang satu suara).' },
  { domain: 'Meetings & Decisions', table: 'meeting_followups', pk: 'id (UUID)', fields: 'decision_id (FK), task_id (FK), note', desc: 'Tugas tindak lanjut yang terhubung ke keputusan rapat.' },

  { domain: 'Files & Storage', table: 'files', pk: 'id (UUID)', fields: 'storage_key, original_name, mime_type, size_bytes, owner_id (FK), status', desc: 'Data file yang disimpan di penyimpanan tertutup.' },
  { domain: 'Files & Storage', table: 'file_versions', pk: 'id (UUID)', fields: 'file_id (FK), version_no, storage_key, uploaded_by (FK)', desc: 'Riwayat versi tiap dokumen.' },
  { domain: 'Files & Storage', table: 'file_classifications', pk: 'id (UUID)', fields: 'file_id (FK), level (1-5), set_by (FK), approved_by (FK)', desc: 'Label tingkat kerahasiaan tiap file.' },
  { domain: 'Files & Storage', table: 'share_links', pk: 'id (UUID)', fields: 'file_id (FK), token_hash, expires_at, revoked_at', desc: 'Tautan berbagi yang ada batas waktunya dan bisa dicabut sewaktu-waktu.' },
  { domain: 'Files & Storage', table: 'download_logs', pk: 'id (UUID)', fields: 'file_id (FK), user_id (FK), downloaded_at, ip_hash', desc: 'Catatan siapa yang mengunduh file rahasia.' },

  { domain: 'Public CMS & Service', table: 'public_content', pk: 'id (UUID)', fields: 'content_type, title, slug, status, published_at', desc: 'Artikel, publikasi, dan rilis pers untuk umum.' },
  { domain: 'Public CMS & Service', table: 'public_content_versions', pk: 'id (UUID)', fields: 'public_content_id (FK), lang (ID/EN), version_no, body', desc: 'Naskah per bahasa (Indonesia/Inggris) yang terpisah.' },
  { domain: 'Public CMS & Service', table: 'complaints', pk: 'id (UUID)', fields: 'tracking_token_id (FK), category, subject, description, status', desc: 'Aduan dan aspirasi dari masyarakat.' },
  { domain: 'Public CMS & Service', table: 'complaint_updates', pk: 'id (UUID)', fields: 'complaint_id (FK), actor_id (FK), note, public_visible', desc: 'Pemisahan catatan internal dan kabar untuk pelapor.' },
  { domain: 'Public CMS & Service', table: 'tracking_tokens', pk: 'id (UUID)', fields: 'token_hash, issued_at, expires_at, status', desc: 'Kode untuk melacak aduan tanpa perlu punya akun.' },

  { domain: 'Governance & AI', table: 'audit_logs', pk: 'id (UUID)', fields: 'actor_id (FK), action, entity_type, entity_id, before_json, after_json', desc: 'Catatan aktivitas yang tidak bisa diubah atau dihapus siapa pun.' },
  { domain: 'Governance & AI', table: 'ai_actions', pk: 'id (UUID)', fields: 'user_id (FK), action_type, proposed_payload_json, status, confirmed_by (FK)', desc: 'Persetujuan manusia atas tindakan yang disarankan AI.' }
];

// --- 4. DATA MASTER: 18 KEPUTUSAN TERBUKA (Q01 - Q18) ---
const QUESTIONS_DATA = [
  { id: 'Q01', title: 'Nama Pejabat & Struktur Asli', cat: 'Organisasi', prop: 'Contoh ini memakai kode peran standar, bukan nama orang asli.', block: 'Pencocokan akun asli' },
  { id: 'Q02', title: 'Perbandingan Kinerja Antar Divisi', cat: 'Kebijakan', prop: 'Untuk sementara, fitur perbandingan hanya dibuka untuk Ketua dan Sekjend.', block: 'Layar E02' },
  { id: 'Q03', title: 'Pemisahan Admin Teknis & Isi Rahasia', cat: 'Akses', prop: 'Admin teknis tidak otomatis bisa membaca dokumen rahasia.', block: 'Layar A06, F05' },
  { id: 'Q04', title: 'Tugas Induk Selesai Otomatis?', cat: 'Tugas', prop: 'Kalau semua bagian selesai, statusnya jadi "Siap Diajukan"; pemeriksaan tetap manual.', block: 'Layar T08' },
  { id: 'Q05', title: 'Penetapan Status Terlambat', cat: 'Tugas', prop: 'Status "terlambat" muncul otomatis saat lewat tenggat, dan wajib diisi alasannya.', block: 'Layar T03' },
  { id: 'Q06', title: 'Pengecualian Divisi Sensitif', cat: 'Keamanan', prop: 'Data anggota dan cara kerja divisi sensitif dirahasiakan penuh dari website publik.', block: 'Layar P03, P04' },
  { id: 'Q07', title: 'Cara & Lama Verifikasi Dua Langkah', cat: 'Keamanan', prop: 'Kode keamanan tambahan memakai aplikasi di HP; sesi login dicek ulang berkala.', block: 'Layar A02' },
  { id: 'Q08', title: 'Kerahasiaan Pemungutan Suara', cat: 'Rapat', prop: 'Daftar pemilih diverifikasi, tapi pilihan suara tiap orang dirahasiakan.', block: 'Layar M05' },
  { id: 'Q09', title: 'Memeriksa Bukti Tugas Sendiri', cat: 'Tugas', prop: 'Dilarang: pembuat tugas tidak boleh menyetujui bukti kerjanya sendiri.', block: 'Layar T06' },
  { id: 'Q10', title: 'Batas Ukuran & Jenis Berkas', cat: 'Dokumen', prop: 'Maksimal 25MB per file; file program (.exe/.sh) diblokir sistem.', block: 'Layar F02' },
  { id: 'Q11', title: 'Konten Bila Versi Bahasa Belum Ada', cat: 'Editorial', prop: 'Kalau versi Inggris belum ada, tampilkan pemberitahuan; jangan tampilkan draf mentah.', block: 'Layar C02, P15' },
  { id: 'Q12', title: 'Identitas Pelapor & Janji Waktu Layanan', cat: 'Layanan', prop: 'Pelapor boleh anonim lewat kode acak; janji waktu layanan tidak dikarang.', block: 'Layar P12, S04' },
  { id: 'Q13', title: 'Cara Menghitung Nilai Kinerja', cat: 'Evaluasi', prop: 'Rumus penilaian ditampilkan terbuka; data yang kosong bukan berarti nol.', block: 'Layar E01' },
  { id: 'Q14', title: 'Koreksi Data Periode yang Sudah Ditutup', cat: 'Handover', prop: 'Hanya bisa dikoreksi lewat berita acara resmi.', block: 'Layar A08, H03' },
  { id: 'Q15', title: 'Dokumen yang Boleh Dibaca AI', cat: 'AI', prop: 'AI hanya boleh membaca dokumen Umum dan Internal yang tidak rahasia.', block: 'Layar I01' },
  { id: 'Q16', title: 'Privasi Buku Kontak', cat: 'Komunikasi', prop: 'Yang ditampilkan hanya email resmi lembaga dan jabatan, bukan nomor pribadi.', block: 'Layar S06' },
  { id: 'Q17', title: 'Logo & Warna Identitas Resmi', cat: 'Branding', prop: 'Memakai tulisan sederhana "KPI PPMI Mesir" dan warna putih-merah yang simpel.', block: 'Seluruh tampilan' },
  { id: 'Q18', title: 'Zona Waktu Resmi Organisasi', cat: 'Sistem', prop: 'Waktu resmi memakai waktu Kairo, dengan keterangan yang jelas.', block: 'Kalender & Jadwal' }
];

// --- 5. INITIALIZATION & UI INTERACTIVITY ---

document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initTabs();
  initScreenCatalog();
  initWireframeStudio();
  initFlowVisualizer();
  initQuestionsTracker();
  initSourceDocsExplorer();
  initErdExplorer();
  initThemeToggles();
});

// Digital Clock (Africa/Cairo EET/EEST)
function initClock() {
  const clockEl = document.getElementById('cairo-clock-text');
  if (!clockEl) return;

  function update() {
    try {
      const now = new Date();
      const timeString = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Africa/Cairo',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(now);
      clockEl.textContent = `${timeString} Kairo (EET)`;
    } catch (e) {
      clockEl.textContent = '17:42 Kairo';
    }
  }
  update();
  setInterval(update, 1000);
}

// Navigation Tabs
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-nav-item');
  const panels = document.querySelectorAll('.tab-content-panel');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      tabButtons.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const activePanel = document.getElementById(`panel-${targetTab}`);
      if (activePanel) activePanel.classList.add('active');
    });
  });
}

// Screen Catalog Explorer
function initScreenCatalog() {
  const tableBody = document.getElementById('screens-table-body');
  const searchInput = document.getElementById('screen-search-input');
  const filterChips = document.querySelectorAll('.catalog-module-filters .filter-chip');

  let currentFilter = 'ALL';
  let searchQuery = '';

  function render() {
    if (!tableBody) return;
    
    const filtered = ALL_SCREENS.filter(item => {
      const matchCat = (currentFilter === 'ALL') || (item.category === currentFilter);
      const query = searchQuery.toLowerCase();
      const matchQuery = !searchQuery || 
        item.id.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query) ||
        item.purpose.toLowerCase().includes(query) ||
        item.controls.toLowerCase().includes(query) ||
        item.role.toLowerCase().includes(query) ||
        (item.db && item.db.toLowerCase().includes(query));
      return matchCat && matchQuery;
    });

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 48px; color: var(--text-secondary);">
            <div style="font-size: 15px; font-weight: 600; margin-bottom: 4px;">Tidak ada hasil untuk filter ini</div>
            <div style="font-size: 13px;">Coba atur ulang kata kunci pencarian atau pilih modul lain.</div>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filtered.map(screen => `
      <tr>
        <td><span class="screen-code-tag" onclick="openScreenModal('${screen.id}')">${screen.id}</span></td>
        <td>
          <strong style="display: block; font-size: 13.5px; color: var(--text-primary); cursor: pointer;" onclick="openScreenModal('${screen.id}')">${screen.name}</strong>
          <span style="font-size: 11.5px; color: var(--text-tertiary);">${screen.category}</span>
        </td>
        <td><span class="badge badge-neutral">${screen.role}</span></td>
        <td style="max-width: 320px;">${screen.purpose}</td>
        <td style="max-width: 300px; font-size: 12.5px; color: var(--text-secondary);">${screen.controls}</td>
        <td>
          <code style="font-size: 11px; background: var(--surface-secondary); padding: 2px 6px; border-radius: 4px; display: block; margin-bottom: 4px;">${screen.source}</code>
          <span style="font-size: 10.5px; color: var(--accent); font-family: var(--font-mono);">${screen.db}</span>
        </td>
      </tr>
    `).join('');
  }

  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.getAttribute('data-cat');
      render();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      render();
    });
  }

  render();
}

// Modal Inspector
window.openScreenModal = function(screenId) {
  const item = ALL_SCREENS.find(s => s.id === screenId);
  if (!item) return;

  const modalOverlay = document.getElementById('screen-modal-overlay');
  const modalContent = document.getElementById('screen-modal-content');
  if (!modalOverlay || !modalContent) return;

  modalContent.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
      <span class="screen-code-tag" style="font-size: 15px; padding: 4px 10px;">${item.id}</span>
      <h2 style="font-size: 20px; font-weight: 600; color: var(--text-primary);">${item.name}</h2>
    </div>
    
    <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">
      <span class="badge badge-accent">Kelompok: ${item.category}</span>
      <span class="badge badge-neutral">Untuk Peran: ${item.role}</span>
      <span class="badge badge-warning">Sumber: ${item.source}</span>
    </div>

    <div style="background: var(--surface-secondary); padding: 16px; border-radius: var(--radius-panel); border: 1px solid var(--border-decor); margin-bottom: 14px;">
      <h4 style="font-size: 12px; text-transform: uppercase; color: var(--text-tertiary); font-weight: 600; margin-bottom: 6px;">Untuk Apa Halaman Ini</h4>
      <p style="font-size: 13.5px; color: var(--text-primary); line-height: 1.5;">${item.purpose}</p>
    </div>

    <div style="background: var(--surface-secondary); padding: 16px; border-radius: var(--radius-panel); border: 1px solid var(--border-decor); margin-bottom: 14px;">
      <h4 style="font-size: 12px; text-transform: uppercase; color: var(--text-tertiary); font-weight: 600; margin-bottom: 6px;">Aturan & Batasan Penting</h4>
      <p style="font-size: 13.5px; color: var(--text-primary); line-height: 1.5;">${item.controls}</p>
    </div>

    <div style="background: var(--accent-subtle); padding: 14px; border-radius: var(--radius-panel); border: 1px solid var(--accent); margin-bottom: 16px;">
      <h4 style="font-size: 12px; text-transform: uppercase; color: var(--accent); font-weight: 600; margin-bottom: 4px;">Data yang Dipakai Halaman Ini</h4>
      <code style="font-size: 12.5px; color: var(--text-primary); font-family: var(--font-mono);">${item.db}</code>
    </div>

    <div style="font-size: 12px; color: var(--text-tertiary); border-top: 1px solid var(--border-decor); padding-top: 12px; display: flex; justify-content: space-between;">
      <span>Status: Sudah Dirancang</span>
      <span>Sumber: Dokumen Kebutuhan KPI v1.0</span>
    </div>
  `;

  modalOverlay.classList.add('active');
};

window.closeScreenModal = function() {
  const modalOverlay = document.getElementById('screen-modal-overlay');
  if (modalOverlay) modalOverlay.classList.remove('active');
};

// Wireframe Simulator Studio
function initWireframeStudio() {
  const wfButtons = document.querySelectorAll('.wf-select-btn');
  const devButtons = document.querySelectorAll('.dev-btn');
  const simFrame = document.getElementById('simulated-screen-frame');
  const wfContentArea = document.getElementById('simulated-wf-body');
  const wfTitleBadge = document.getElementById('current-wf-title');

  let activeWfId = 'W1';

  const NAV = {
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-7 8 7"/><path d="M6 10v9h12v-9"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h8l4 4v14H7z"/><path d="M15 3v5h4"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>'
  };

  const LOGO_SM = '<svg viewBox="0 0 44 50" xmlns="http://www.w3.org/2000/svg"><path d="M9 4Q4 4 4 9L4 23C4 36 11 44 22 47C33 44 40 36 40 23L40 9Q40 4 35 4Z" fill="#C4161C"/><circle cx="18" cy="15" r="5.4" fill="#fff"/><path d="M18 21C11.5 21 8 26.5 8 33.5C8 39 11 43 15.5 45C14 40 14.5 34 16 29C17.2 25 19.5 22.5 22.5 21.8C21.3 21.3 19.8 21 18 21Z" fill="#fff"/><circle cx="30" cy="20.5" r="3.8" fill="#fff"/><path d="M30 24.5C25.5 24.5 23 28.5 23 33.5C23 37.5 25 40.5 28 42C27 38 27.3 33.5 28.5 30C29.4 27 31 25.4 33.2 24.9C32.3 24.6 31.2 24.5 30 24.5Z" fill="#fff"/></svg>';

  const WF_TEMPLATES = {
    W1: {
      title: 'Contoh 1: Beranda Publik (P01)',
      render: () => `
        <div class="m">
          <div class="m-webnav">
            <div class="m-brand"><i>${LOGO_SM}</i> KPI / PPMI Mesir</div>
            <div class="m-navlinks"><span class="on">Beranda</span><span>Tentang</span><span>Program</span><span>Publikasi</span><span>Data</span><span>Layanan</span></div>
            <div class="m-webactions">
              <span class="m-muted">ID / EN</span>
              <button class="btn-primary" style="padding:8px 14px;font-size:12px;">Portal Pengurus</button>
            </div>
          </div>

          <div class="m-hero">
            <div class="m-eyebrow">Komisi Peduli Interaksi</div>
            <h1>Menghubungkan gagasan, mengawal integritas mahasiswa</h1>
            <p>Portal resmi publikasi, keterbukaan data kelembagaan, dan penyampaian aspirasi masyarakat PPMI Mesir.</p>
            <div class="m-cta">
              <button class="btn-primary">Sampaikan aspirasi</button>
              <button class="btn-secondary">Kenali KPI</button>
            </div>
          </div>

          <div class="m-section">
            <div class="m-sec-head"><h2>Kegiatan terbaru</h2><a>Lihat semua</a></div>
            <div class="m-grid3">
              <div class="m-card"><div class="m-thumb"></div><h3>Kajian kebijakan pendidikan</h3><p>Diskusi terbuka bersama perwakilan divisi dan mitra kelembagaan.</p><span class="m-muted">2 Sep 2026</span></div>
              <div class="m-card"><div class="m-thumb"></div><h3>Buletin bulanan edisi 4</h3><p>Rangkuman program kerja dan agenda kepengurusan periode berjalan.</p><span class="m-muted">28 Agu 2026</span></div>
              <div class="m-card"><div class="m-thumb"></div><h3>Webinar literasi data</h3><p>Pelatihan pengolahan data untuk pengurus divisi media dan riset.</p><span class="m-muted">21 Agu 2026</span></div>
            </div>
          </div>

          <div class="m-section">
            <div class="m-sec-head"><h2>Layanan dan transparansi</h2></div>
            <div class="m-grid3">
              <div class="m-card"><h3>Layanan warga</h3><p>Kirim pengaduan atau masukan, lalu lacak perkembangannya lewat nomor token.</p><a style="font-size:12px;color:var(--accent);">Akses layanan</a></div>
              <div class="m-card"><h3>Publikasi dan riset</h3><p>Kajian strategis, buletin, dan riset kebijakan mahasiswa yang terverifikasi.</p><a style="font-size:12px;color:var(--accent);">Buka repositori</a></div>
              <div class="m-card"><h3>Data terbuka</h3><p>Indikator realisasi program kerja kepengurusan tanpa manipulasi angka.</p><a style="font-size:12px;color:var(--accent);">Lihat data</a></div>
            </div>
          </div>
        </div>
      `
    },

    W2: {
      title: 'Contoh 2: Ruang Kerja Pengurus (W02)',
      render: () => `
        <div class="m m-app">
          <aside class="m-aside">
            <div class="m-brand"><i>${LOGO_SM}</i> Ruang Kerja</div>
            <div class="m-navitem">${NAV.grid} Dashboard</div>
            <div class="m-navitem on">${NAV.home} My Workspace</div>
            <div class="m-navitem">${NAV.check} Perlu Tindakan <span class="m-count">3</span></div>
            <div class="m-aside-label">Operasional</div>
            <div class="m-navitem">${NAV.list} Tugas Divisi</div>
            <div class="m-navitem">${NAV.cal} Kalender &amp; Rapat</div>
            <div class="m-navitem">${NAV.doc} Pustaka Dokumen</div>
            <div class="m-navitem">${NAV.bell} Pusat Notifikasi</div>
          </aside>

          <main class="m-main">
            <div class="m-topbar">
              <div>
                <div class="m-crumb">Periode 2026/2027 - Divisi Media &amp; Komunikasi</div>
                <h1>My Workspace</h1>
              </div>
              <div style="display:flex;align-items:center;gap:10px;">
                <span class="m-muted">18:30 Kairo</span>
                <button class="btn-primary" style="padding:8px 14px;font-size:12px;">Buat tugas</button>
                <div class="m-avatar">RA</div>
              </div>
            </div>

            <div class="m-alert">
              <span>1 bukti tugas menunggu pemeriksaan dan 2 permohonan perpanjangan waktu.</span>
              <button class="btn-secondary" style="padding:6px 12px;font-size:11.5px;">Buka antrean</button>
            </div>

            <div class="m-grid2">
              <div class="m-panel">
                <div class="m-panel-h">Tugas saya yang berjalan <span class="m-muted">4</span></div>
                <div class="m-panel-b">
                  <div style="display:flex;flex-direction:column;gap:6px;">
                    <div style="display:flex;justify-content:space-between;"><span class="t">Rilis pers Buletin No. 4</span><span class="m-status">75%</span></div>
                    <div class="m-prog"><span style="width:75%"></span></div>
                    <div style="color:var(--text-tertiary);font-size:11px;">Tenggat besok, 18:00</div>
                  </div>
                  <div style="display:flex;flex-direction:column;gap:6px;">
                    <div style="display:flex;justify-content:space-between;"><span class="t">Verifikasi dokumentasi webinar</span><span class="m-status err">Terlambat 1 hari</span></div>
                    <div class="m-prog"><span style="width:40%"></span></div>
                    <div style="color:var(--text-tertiary);font-size:11px;">Perlu tindakan</div>
                  </div>
                </div>
              </div>

              <div class="m-panel">
                <div class="m-panel-h">Agenda hari ini</div>
                <div class="m-panel-b">
                  <div class="m-row"><div><div class="t">20:00 Rapat Pleno Mingguan</div><div class="s">Tautan daring terverifikasi</div></div><span class="m-status ok">Hadir</span></div>
                  <div class="m-row"><div><div class="t">21:30 Review konten media</div><div class="s">3 peserta</div></div><span class="m-status">Opsional</span></div>
                </div>
              </div>
            </div>
          </main>
        </div>
      `
    },

    W3: {
      title: 'Contoh 3: Detail Tugas & Pemeriksaan Bukti (T03, T06)',
      render: () => `
        <div class="m m-section">
          <div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;border-bottom:1px solid var(--hairline);padding-bottom:16px;margin-bottom:18px;">
            <div>
              <div class="m-crumb">Tugas T-042 - Divisi Komunikasi</div>
              <h1 style="font-size:18px;font-weight:600;margin:4px 0 6px;">Publikasi Laporan Triwulan Divisi Komunikasi</h1>
              <div class="m-muted">Pelaksana Ahmad Fauzi &nbsp;&middot;&nbsp; Pemeriksa Koordinator Media &nbsp;&middot;&nbsp; Tenggat 10 Sep 2026</div>
            </div>
            <div style="text-align:right;">
              <div class="m-status warn">Menunggu pemeriksaan</div>
              <div class="m-muted" style="margin-top:4px;">Progres 100%</div>
            </div>
          </div>

          <div class="m-tabs" style="margin-bottom:16px;"><span class="m-tab on">Bukti (1)</span><span class="m-tab">Sub-tugas 4/4</span><span class="m-tab">Diskusi</span><span class="m-tab">Riwayat</span></div>

          <div class="m-grid2" style="grid-template-columns:1.6fr 1fr;">
            <div class="m-panel">
              <div class="m-panel-h">Berkas bukti</div>
              <div class="m-panel-b">
                <div class="m-row">
                  <div style="display:flex;gap:12px;align-items:center;">
                    <div class="m-thumb" style="width:40px;height:50px;"></div>
                    <div><div class="t">Laporan_Triwulan_Final.pdf</div><div class="s">4,2 MB &nbsp;&middot;&nbsp; lolos pemeriksaan</div></div>
                  </div>
                  <button class="btn-secondary" style="padding:6px 12px;font-size:11px;">Unduh</button>
                </div>
                <p style="font-size:12px;color:var(--text-secondary);">Catatan pelaksana: seluruh bab dan grafik indikator telah direvisi sesuai notulen rapat 2 September.</p>
              </div>
            </div>

            <div class="m-panel">
              <div class="m-panel-h">Keputusan pemeriksa</div>
              <div class="m-panel-b">
                <div class="m-field"><label>Catatan evaluasi</label><div class="m-textarea">Tulis catatan atau alasan revisi...</div></div>
                <button class="btn-primary" style="justify-content:center;">Terima hasil</button>
                <button class="btn-secondary" style="justify-content:center;">Minta revisi</button>
              </div>
            </div>
          </div>
        </div>
      `
    },

    W4: {
      title: 'Contoh 4: Detail Dokumen & Berbagi Izin (F03, F04)',
      render: () => `
        <div class="m">
          <div class="m-section" style="border-bottom:1px solid var(--hairline);">
            <div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;">
              <div>
                <div class="m-status err">Klasifikasi: Rahasia</div>
                <h1 style="font-size:17px;font-weight:600;margin:6px 0 4px;">SOP Pengelolaan Kas Digital</h1>
                <div class="m-muted">Versi aktif v2.0 (Final) &nbsp;&middot;&nbsp; diperbarui 3 hari lalu</div>
              </div>
              <button class="btn-primary" style="padding:8px 14px;font-size:12px;align-self:flex-start;">Bagikan akses</button>
            </div>
          </div>

          <div class="m-dim">
            <div class="m-dialog">
              <h3>Bagikan akses sementara</h3>
              <p style="font-size:12px;color:var(--text-secondary);">Memberi izin lihat atau unduh dengan pencatatan. Tidak dapat melampaui hak pemilik.</p>
              <div class="m-field"><label>Penerima</label><div class="m-input">Ahmad Rizky - Biro Keuangan</div></div>
              <div class="m-grid2" style="gap:12px;">
                <div class="m-field"><label>Jenis izin</label><div class="m-input">Hanya lihat</div></div>
                <div class="m-field"><label>Berlaku sampai</label><div class="m-input">12 Sep 2026</div></div>
              </div>
              <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:2px;">
                <button class="btn-secondary" style="padding:8px 14px;font-size:12px;">Batal</button>
                <button class="btn-primary" style="padding:8px 14px;font-size:12px;">Berikan akses</button>
              </div>
            </div>
          </div>
        </div>
      `
    },

    W5: {
      title: 'Contoh 5: Editor Konten Dua Bahasa & Terbit (C02, C04)',
      render: () => `
        <div class="m m-section">
          <div class="m-topbar" style="margin-bottom:16px;">
            <div>
              <div class="m-crumb">Redaksi - Draf sedang diperiksa</div>
              <h1 style="font-size:17px;">Pernyataan Sikap: Solidaritas Mahasiswa</h1>
            </div>
            <div style="display:flex;gap:8px;">
              <button class="btn-secondary" style="padding:8px 14px;font-size:12px;">Pratinjau publik</button>
              <button class="btn-primary" style="padding:8px 14px;font-size:12px;">Jadwalkan terbit</button>
            </div>
          </div>

          <div class="m-tabs" style="margin-bottom:16px;"><span class="m-tab on">Bahasa Indonesia - lengkap</span><span class="m-tab">English - draf terjemahan</span></div>

          <div class="m-grid2" style="grid-template-columns:1.7fr 1fr;">
            <div style="display:flex;flex-direction:column;gap:14px;">
              <div class="m-field"><label>Judul siaran</label><div class="m-input">Mempererat kebersamaan mahasiswa Indonesia di Mesir</div></div>
              <div class="m-field"><label>Isi naskah</label><div class="m-textarea" style="min-height:150px;color:var(--text-secondary);">Keluarga besar PPMI Mesir senantiasa mengedepankan musyawarah dan keterbukaan informasi dalam merespons dinamika akademik serta kesejahteraan mahasiswa di Kairo...</div></div>
            </div>
            <div class="m-panel">
              <div class="m-panel-h">Pemeriksaan sebelum terbit</div>
              <div class="m-panel-b">
                <div class="m-row" style="padding:9px 12px;"><span class="t">Tidak ada nama anggota rahasia</span><span class="m-status ok">Lolos</span></div>
                <div class="m-row" style="padding:9px 12px;"><span class="t">Lampiran berstatus publik</span><span class="m-status ok">Lolos</span></div>
                <div class="m-row" style="padding:9px 12px;"><span class="t">Versi English disetujui</span><span class="m-status warn">Belum</span></div>
              </div>
            </div>
          </div>
        </div>
      `
    },

    W6: {
      title: 'Contoh 6: Rapat, Presensi & Pemungutan Suara (M03, M05)',
      render: () => `
        <div class="m m-section">
          <div style="border-bottom:1px solid var(--hairline);padding-bottom:14px;margin-bottom:18px;">
            <div class="m-status ok">Rapat selesai - notulen final terkunci</div>
            <h1 style="font-size:17px;font-weight:600;margin:6px 0 4px;">Sidang Pleno Triwulan II KPI PPMI Mesir</h1>
            <div class="m-muted">5 September 2026, 20:00 Kairo &nbsp;&middot;&nbsp; kuorum terpenuhi (18 dari 20 anggota)</div>
          </div>

          <div class="m-grid2">
            <div class="m-panel">
              <div class="m-panel-h">Pemungutan suara tertutup</div>
              <div class="m-panel-b">
                <p style="font-size:12px;color:var(--text-secondary);">Mosi: pengesahan SOP Serah Terima Digital periode 2026/2027.</p>
                <div style="display:flex;flex-direction:column;gap:5px;"><div style="display:flex;justify-content:space-between;font-size:12px;"><span>Setuju</span><span class="m-muted">16 suara</span></div><div class="m-prog"><span style="width:89%"></span></div></div>
                <div style="display:flex;flex-direction:column;gap:5px;"><div style="display:flex;justify-content:space-between;font-size:12px;"><span>Tolak</span><span class="m-muted">1 suara</span></div><div class="m-prog mut"><span style="width:6%"></span></div></div>
                <div style="display:flex;flex-direction:column;gap:5px;"><div style="display:flex;justify-content:space-between;font-size:12px;"><span>Abstain</span><span class="m-muted">1 suara</span></div><div class="m-prog mut"><span style="width:6%"></span></div></div>
                <div class="m-status ok" style="margin-top:2px;">Hasil: mosi diterima sah</div>
              </div>
            </div>

            <div class="m-panel">
              <div class="m-panel-h">Tugas tindak lanjut</div>
              <div class="m-panel-b">
                <div class="m-row"><div><div class="t">Penerbitan SK pengesahan SOP</div><div class="s">Sekjend &nbsp;&middot;&nbsp; tenggat 8 Sep 2026</div></div><span class="m-status">Baru</span></div>
                <div class="m-row"><div><div class="t">Sosialisasi ke koordinator divisi</div><div class="s">Humas &nbsp;&middot;&nbsp; tenggat 12 Sep 2026</div></div><span class="m-status">Baru</span></div>
              </div>
            </div>
          </div>
        </div>
      `
    },

    W7: {
      title: 'Contoh 7: Pengaduan Warga & Penanganan Aman (P13, S04)',
      render: () => `
        <div class="m m-section">
          <div class="m-grid2">
            <div class="m-panel">
              <div class="m-panel-h">Tampilan pelapor <span class="m-muted">Token KP-8291A</span></div>
              <div class="m-panel-b">
                <div class="m-row"><span class="t">Status aduan</span><span class="m-status warn">Dalam penanganan divisi</span></div>
                <div style="background:var(--canvas-tint);border:1px solid var(--hairline);border-radius:10px;padding:12px;">
                  <strong style="font-size:11.5px;">Kabar resmi untuk pelapor</strong>
                  <p style="margin-top:5px;font-size:12px;color:var(--text-secondary);">Laporan diterima dan sedang diverifikasi dengan biro terkait di Kairo. Perkiraan tanggapan 3 hari kerja.</p>
                </div>
                <p class="m-muted">Catatan internal dan identitas penindak lanjut otomatis disembunyikan.</p>
              </div>
            </div>

            <div class="m-panel">
              <div class="m-panel-h">Tampilan pengurus <span class="m-muted">Pemilahan &amp; tindak lanjut</span></div>
              <div class="m-panel-b">
                <div style="display:flex;gap:18px;font-size:11.5px;color:var(--text-secondary);"><span>Kategori: Fasilitas Mahasiswa</span><span>PJ: Biro Advokasi</span></div>
                <div style="background:var(--warning-bg);border:1px solid var(--warning-border);border-radius:10px;padding:12px;">
                  <strong style="font-size:11.5px;color:var(--warning);">Catatan internal - tidak tampil ke publik</strong>
                  <p style="margin-top:5px;font-size:12px;">Koordinasi awal dengan pihak asrama selesai. Menunggu jadwal inspeksi fisik besok pagi.</p>
                </div>
                <button class="btn-primary" style="padding:8px 14px;font-size:12px;align-self:flex-start;">Kirim kabar ke pelapor</button>
              </div>
            </div>
          </div>
        </div>
      `
    },

    W8: {
      title: 'Contoh 8: Asisten AI dengan Konfirmasi Manusia (I01, I03)',
      render: () => `
        <div class="m m-section">
          <div class="m-grid2" style="grid-template-columns:1.7fr 1fr;">
            <div class="m-panel">
              <div class="m-panel-h">Tanya jawab asisten AI</div>
              <div class="m-panel-b">
                <div class="m-chat">
                  <div class="m-bubble me">Buatkan draf agenda rapat evaluasi bulanan divisi media.</div>
                  <div class="m-bubble ai">
                    <strong style="color:var(--accent);font-size:11.5px;">Asisten KPI</strong>
                    <p style="margin-top:5px;">Berdasarkan SOP Rapat dan notulen 25 Agustus, usulan susunan agenda:</p>
                    <ul style="margin:6px 0 0;">
                      <li>Evaluasi realisasi konten mingguan</li>
                      <li>Kendala penerjemahan buletin</li>
                      <li>Penetapan jadwal publikasi September</li>
                    </ul>
                    <p class="m-muted" style="margin-top:6px;">Sumber: SOP-MEET-02 v1.1, Risalah Rapat No. 8</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="m-panel">
              <div class="m-panel-h">Tinjau &amp; konfirmasi</div>
              <div class="m-panel-b">
                <p style="font-size:12px;color:var(--text-secondary);">AI mengusulkan pembuatan jadwal rapat baru. Perlu persetujuan manusia sebelum dijalankan.</p>
                <div style="background:var(--canvas-tint);border:1px solid var(--hairline);border-radius:10px;padding:12px;font-size:12px;display:flex;flex-direction:column;gap:5px;">
                  <div><strong>Aksi</strong> &nbsp; Jadwalkan rapat</div>
                  <div><strong>Waktu</strong> &nbsp; 9 Sep 2026, 19:30 Kairo</div>
                  <div><strong>Peserta</strong> &nbsp; Anggota Divisi Media</div>
                </div>
                <button class="btn-primary" style="justify-content:center;">Konfirmasi &amp; jalankan</button>
                <button class="btn-secondary" style="justify-content:center;">Batal</button>
              </div>
            </div>
          </div>
        </div>
      `
    }
  };

  function renderWireframe(id) {
    const wf = WF_TEMPLATES[id];
    if (!wf || !wfContentArea) return;
    activeWfId = id;

    if (wfTitleBadge) wfTitleBadge.textContent = wf.title;
    wfContentArea.innerHTML = wf.render();

    wfButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-wf') === id);
    });
  }

  wfButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      renderWireframe(btn.getAttribute('data-wf'));
    });
  });

  devButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      devButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const dev = btn.getAttribute('data-dev');
      simFrame.className = `simulated-screen-frame ${dev}`;
    });
  });

  renderWireframe('W1');
}

// Workflow Journey Engine
function initFlowVisualizer() {
  const menuButtons = document.querySelectorAll('.flow-menu-btn');
  const flowContainer = document.getElementById('active-flow-display');

  const FLOWS = [
    {
      id: 'F01',
      name: 'Login & Perubahan Hak Akses',
      summary: 'Langkah masuk pengurus secara berlapis sampai ruang kerjanya terbuka sesuai periode aktif.',
      steps: [
        { num: 1, title: 'Masukkan Username & Kata Sandi (A01)', desc: 'Pengurus mengisi username/email dan kata sandi di halaman yang aman.' },
        { num: 2, title: 'Verifikasi Dua Langkah (A02)', desc: 'Sistem meminta kode 6 angka dari aplikasi keamanan di HP pengguna.' },
        { num: 3, title: 'Sesi Dibuka Sesuai Jabatan', desc: 'Sistem membuka sesi dan menyesuaikan tampilan dengan jabatan pengguna di periode berjalan.' },
        { num: 4, title: 'Masuk ke Ruang Kerja (W02)', desc: 'Ruang kerja tampil, hanya berisi tugas dan info yang jadi wewenangnya.' }
      ],
      rule: 'Kalau sesi habis di tengah pengisian, sistem menahan pengiriman dan meminta login ulang, tanpa menyimpan data rahasia di browser.'
    },
    {
      id: 'F02',
      name: 'Perjalanan Tugas Sampai Diterima',
      summary: 'Perjalanan tugas dari dibuat, dikerjakan, diunggah buktinya, sampai disetujui pemeriksa.',
      steps: [
        { num: 1, title: 'Buat Tugas Baru (T02)', desc: 'Koordinator membuat tugas: rincian pekerjaan, tenggat, dan penanggung jawab.' },
        { num: 2, title: 'Kerjakan & Laporkan Progres (T04)', desc: 'Pelaksana memperbarui progres dan melaporkan hambatan bila ada.' },
        { num: 3, title: 'Ajukan Selesai & Unggah Bukti (T05)', desc: 'Setelah 100%, pelaksana mengunggah file bukti hasil kerja yang sudah lolos pemeriksaan.' },
        { num: 4, title: 'Diperiksa oleh Pemeriksa (T06)', desc: 'Pemeriksa memilih "Terima Hasil" atau "Minta Revisi" beserta catatan.' }
      ],
      rule: 'Tugas tidak bisa dinyatakan selesai hanya dengan menggeser kartu di papan; wajib lewat pemeriksaan bukti.'
    },
    {
      id: 'F03',
      name: 'Dokumen & Pembagian Izin',
      summary: 'Alur unggah file, pemeriksaan keamanan, penetapan kerahasiaan, dan pemberian izin sementara.',
      steps: [
        { num: 1, title: 'Pilih File & Tingkat Kerahasiaan (F02)', desc: 'Pengunggah memilih file dan menetapkan label kerahasiaannya (Internal, Rahasia, dll).' },
        { num: 2, title: 'File Diperiksa Sistem', desc: 'Sistem memeriksa format, keamanan, lalu menyimpannya terenkripsi.' },
        { num: 3, title: 'Beri Izin Sementara (F04)', desc: 'Pemilik file menentukan penerima, jenis izin (baca/unduh), dan tanggal berakhirnya.' },
        { num: 4, title: 'Dibuka & Dicatat (F06)', desc: 'Penerima membuka file; setiap unduhan tercatat permanen.' }
      ],
      rule: 'Mencabut izin atau lewat tanggal berakhir langsung memutus akses, tanpa merusak file aslinya.'
    },
    {
      id: 'F04',
      name: 'Rapat Sampai Tindak Lanjut',
      summary: 'Alur dari merencanakan rapat, mencatat kehadiran, mengesahkan notulen, sampai membuat tugas tindak lanjut.',
      steps: [
        { num: 1, title: 'Jadwalkan & Undang Peserta (M02)', desc: 'Sekretaris membuat agenda, mengecek bentrok jadwal, lalu menyebar undangan.' },
        { num: 2, title: 'Catat Kehadiran (M03)', desc: 'Peserta mengonfirmasi kehadiran sendiri, lalu diverifikasi notulis.' },
        { num: 3, title: 'Tulis Notulen & Voting (M04, M05)', desc: 'Notulis mencatat poin bahasan dan mengadakan voting untuk keputusan penting.' },
        { num: 4, title: 'Ubah Jadi Tugas Tindak Lanjut (M06)', desc: 'Kesimpulan rapat langsung diubah jadi tugas baru yang tertaut ke notulennya.' }
      ],
      rule: 'Notulen yang sudah final dikunci permanen. Koreksi selanjutnya hanya lewat dokumen tambahan versi baru.'
    },
    {
      id: 'F05',
      name: 'Penerbitan Konten Publik Dua Bahasa',
      summary: 'Menyusun artikel publik dua bahasa (ID/EN), diperiksa redaksi, lalu diterbitkan dengan aman ke website.',
      steps: [
        { num: 1, title: 'Tulis Draf Dua Bahasa (C02)', desc: 'Tim redaksi menulis naskah versi Indonesia dan Inggris.' },
        { num: 2, title: 'Ajukan ke Redaksi (C03)', desc: 'Editor menyerahkan draf ke pemimpin redaksi untuk diperiksa faktanya.' },
        { num: 3, title: 'Setujui Versi Tertentu (C04)', desc: 'Pemimpin redaksi menyetujui versi tertentu; perubahan setelahnya otomatis membatalkan persetujuan.' },
        { num: 4, title: 'Terbit ke Website Publik (P06)', desc: 'Konten terbit di website publik dan bisa ditemukan lewat pencarian.' }
      ],
      rule: 'Kalau versi Inggris belum selesai, publik tidak melihat draf mentah, hanya pemberitahuan bahwa versi bahasa itu belum tersedia.'
    },
    {
      id: 'F06',
      name: 'Aspirasi Warga & Penanganan Aman',
      summary: 'Warga mengirim aduan, melacaknya lewat kode, dan pengurus menanganinya dengan aman.',
      steps: [
        { num: 1, title: 'Isi Formulir Publik (P12)', desc: 'Warga mengisi formulir aduan, memilih kategori, dan melampirkan bukti.' },
        { num: 2, title: 'Terima Kode Pelacakan (P13)', desc: 'Sistem memberi kode pelacakan untuk disimpan warga, tanpa perlu bikin akun.' },
        { num: 3, title: 'Dipilah & Ditugaskan (S03)', desc: 'Petugas memilah aduan, menentukan prioritas, dan menugaskannya ke divisi terkait.' },
        { num: 4, title: 'Kabar Aman untuk Warga (S04)', desc: 'Petugas menulis kabar untuk warga; catatan internal pengurus tetap tertutup rapat.' }
      ],
      rule: 'Catatan internal pengurus dan identitas pelapor yang sensitif tidak pernah tampil di halaman pelacakan publik.'
    },
    {
      id: 'F07',
      name: 'Panduan SOP & Penilaian Kinerja',
      summary: 'Mencari panduan kerja SOP dan menilai capaian tugas secara objektif per periode.',
      steps: [
        { num: 1, title: 'Cari SOP & Materi (K01)', desc: 'Pengurus mencari SOP dan panduan divisi, disaring sesuai izinnya.' },
        { num: 2, title: 'Baca Panduan Bersumber (K02)', desc: 'Membaca panduan lengkap dengan sumbernya; artikel usang diberi tanda peringatan.' },
        { num: 3, title: 'Hitung Nilai Kinerja (E01)', desc: 'Sistem menghitung ketepatan waktu, persentase selesai, dan keabsahan bukti kerja periode berjalan.' },
        { num: 4, title: 'Ajukan Koreksi bila Perlu (E03)', desc: 'Bila ada keadaan darurat di luar kendali, pengurus bisa mengajukan koreksi yang tercatat riwayatnya.' }
      ],
      rule: 'Data yang belum ada dibedakan tegas dari nilai nol, dan rumus penilaian dibuka untuk semua pengurus.'
    },
    {
      id: 'F08',
      name: 'Serah Terima Jabatan',
      summary: 'Menutup periode aktif, menyusun paket arsip, dan memvalidasinya bersama kepengurusan baru.',
      steps: [
        { num: 1, title: 'Mulai Penutupan Periode (A08)', desc: 'Pimpinan mengubah status periode jadi "Penutupan".' },
        { num: 2, title: 'Susun Paket Serah Terima (H02)', desc: 'Pengurus lama merangkum pekerjaan berjalan, dokumen, notulen, dan kontak mitra.' },
        { num: 3, title: 'Cek Item Satu per Satu (H03)', desc: 'Pengurus baru memeriksa kelengkapan item satu per satu sebelum menerima.' },
        { num: 4, title: 'Arsipkan Secara Resmi (H01)', desc: 'Setelah selesai, periode ditutup resmi dan arsipnya disimpan dengan izin baca terbatas.' }
      ],
      rule: 'Pengurus baru tidak otomatis bisa membuka semua dokumen rahasia dari masa lalu.'
    },
    {
      id: 'F09',
      name: 'Bantuan AI dengan Konfirmasi Manusia',
      summary: 'Memakai AI untuk menganalisis aturan, tapi izin tetap dijaga dan keputusan tetap di tangan manusia.',
      steps: [
        { num: 1, title: 'Tanya Sesuai Izin (I01)', desc: 'Pengguna bertanya soal aturan/SOP; sistem menyaring dokumen sesuai izin akunnya.' },
        { num: 2, title: 'AI Menjawab dengan Sumber', desc: 'AI menyusun ringkasan jawaban lengkap dengan tautan sumber yang sah, tanpa membocorkan file rahasia.' },
        { num: 3, title: 'AI Mengusulkan Tindakan (I03)', desc: 'Kalau diminta membuat draf tugas/agenda, AI menampilkan kartu usulan yang rinci.' },
        { num: 4, title: 'Manusia Memeriksa & Mengonfirmasi', desc: 'Pengguna memeriksa isinya lalu menekan tombol konfirmasi untuk menjalankannya.' }
      ],
      rule: 'AI dilarang keras menerbitkan konten atau mengubah data tanpa konfirmasi langsung dari pengurus.'
    }
  ];

  function renderFlow(flowId) {
    const flow = FLOWS.find(f => f.id === flowId);
    if (!flow || !flowContainer) return;

    menuButtons.forEach(b => b.classList.toggle('active', b.getAttribute('data-flow') === flowId));

    flowContainer.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <div>
          <span class="badge badge-accent" style="margin-bottom: 4px;">${flow.id}</span>
          <h2 style="font-size: 20px; font-weight: 600; color: var(--text-primary);">${flow.name}</h2>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 2px;">${flow.summary}</p>
        </div>
      </div>

      <div class="flow-steps-stepper">
        ${flow.steps.map(s => `
          <div class="flow-step-node">
            <div class="step-number">${s.num}</div>
            <div class="step-body">
              <h4>${s.title}</h4>
              <p>${s.desc}</p>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="step-rule-box" style="font-size: 13px; line-height: 1.5; padding: 12px 16px;">
        <strong>Aturan Penting & Penanganan Jika Gagal:</strong><br>
        ${flow.rule}
      </div>
    `;
  }

  menuButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      renderFlow(btn.getAttribute('data-flow'));
    });
  });

  renderFlow('F01');
}

// Questions Tracker Q01 - Q18
function initQuestionsTracker() {
  const container = document.getElementById('questions-cards-container');
  if (!container) return;

  container.innerHTML = QUESTIONS_DATA.map(q => `
    <div class="question-card">
      <div class="question-header">
        <span class="question-id">${q.id}</span>
        <span class="badge badge-neutral">${q.cat}</span>
      </div>
      <div class="question-title">${q.title}</div>
      <div class="question-prop">
        <strong>Usulan Sementara:</strong> ${q.prop}
      </div>
      <div class="question-footer">
        <span>Terkait: <strong>${q.block}</strong></span>
        <span style="color: var(--warning); font-weight: 600;">Status: Menunggu Keputusan</span>
      </div>
    </div>
  `).join('');
}

// Source Documents Explorer (13 Dokumen)
function initSourceDocsExplorer() {
  const container = document.getElementById('source-docs-grid');
  if (!container) return;

  container.innerHTML = SOURCE_DOCUMENTS.map(doc => `
    <div class="card" style="display: flex; flex-direction: column; gap: 10px;">
      <div class="card-header-row" style="margin-bottom: 4px;">
        <span class="screen-code-tag" style="font-size: 13px;">${doc.code}</span>
        <span class="badge badge-neutral">${doc.scope}</span>
      </div>
      <h3 style="font-size: 15px; font-weight: 600; color: var(--text-primary);">${doc.title}</h3>
      <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.4;">${doc.purpose}</p>
      <div style="margin-top: auto; padding-top: 10px; border-top: 1px solid var(--border-decor); font-size: 11px; color: var(--text-tertiary); display: flex; justify-content: space-between;">
        <span style="font-family: var(--font-mono);">${doc.file}</span>
        <span style="color: var(--accent); font-weight: 600;">Terverifikasi</span>
      </div>
    </div>
  `).join('');
}

// Database ERD Explorer (34 Tabel)
function initErdExplorer() {
  const tableBody = document.getElementById('erd-table-body');
  const domainFilter = document.getElementById('erd-domain-filter');
  if (!tableBody) return;

  function render(domain) {
    const filtered = domain === 'ALL' ? DATABASE_ENTITIES : DATABASE_ENTITIES.filter(e => e.domain === domain);
    tableBody.innerHTML = filtered.map(e => `
      <tr>
        <td><strong style="font-family: var(--font-mono); color: var(--accent); font-size: 13px;">${e.table}</strong></td>
        <td><span class="badge badge-neutral">${e.domain}</span></td>
        <td><code style="font-size: 11.5px;">${e.pk}</code></td>
        <td style="font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); max-width: 380px;">${e.fields}</td>
        <td style="font-size: 12.5px; color: var(--text-primary);">${e.desc}</td>
      </tr>
    `).join('');
  }

  if (domainFilter) {
    domainFilter.addEventListener('change', (e) => {
      render(e.target.value);
    });
  }

  render('ALL');
}

// Accessibility & Theme Toggles (persist ke localStorage, hormati preferensi sistem)
function initThemeToggles() {
  const root = document.documentElement;
  const themeBtn = document.getElementById('theme-toggle-btn');
  const transBtn = document.getElementById('transparency-toggle-btn');

  const store = {
    get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
    set(key, val) { try { localStorage.setItem(key, val); } catch (e) { /* mode privat */ } }
  };

  const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  let isDark = (store.get('kpi-theme') || (systemDark ? 'dark' : 'light')) === 'dark';
  let isReduceTrans = store.get('kpi-material') === 'solid';

  function applyTheme() {
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    if (themeBtn) {
      themeBtn.textContent = isDark ? 'Tampilan: Gelap' : 'Tampilan: Terang';
      themeBtn.classList.toggle('active', isDark);
      themeBtn.setAttribute('aria-pressed', String(isDark));
    }
  }

  function applyMaterial() {
    root.setAttribute('data-reduce-transparency', isReduceTrans ? 'true' : 'false');
    if (transBtn) {
      transBtn.textContent = isReduceTrans ? 'Efek Kaca: Mati' : 'Efek Kaca: Aktif';
      transBtn.classList.toggle('active', isReduceTrans);
      transBtn.setAttribute('aria-pressed', String(isReduceTrans));
    }
  }

  applyTheme();
  applyMaterial();

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      isDark = !isDark;
      store.set('kpi-theme', isDark ? 'dark' : 'light');
      applyTheme();
    });
  }

  if (transBtn) {
    transBtn.addEventListener('click', () => {
      isReduceTrans = !isReduceTrans;
      store.set('kpi-material', isReduceTrans ? 'solid' : 'glass');
      applyMaterial();
    });
  }
}
