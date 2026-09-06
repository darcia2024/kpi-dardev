/**
 * Rancangan UI/UX & Pengerjaan Website KPI PPMI Mesir
 * Interactive Core Application Engine
 * Dirancang & dikembangkan oleh Dar Dev
 * Tanggal: 5 September 2026
 * Diperkaya dengan 13 Dokumen Spesifikasi Sumber
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
  { id: 'A12', name: 'Pengaturan Sistem Global', category: 'Fondasi', role: 'Admin Sistem', source: 'D15, A22', purpose: 'Pengaturan umum: pemberitahuan, batas ukuran file, lama penyimpanan, dan daftar kategori.', controls: 'Perubahan yang berdampak luas perlu ringkasan dampak dan konfirmasi terpisah.', db: 'audit_logs' },
  { id: 'A13', name: 'Registri Konfigurasi Sistem', category: 'Fondasi', role: 'Admin Sistem', source: 'ADM', purpose: 'Daftar semua pengaturan sistem beserta nomor versinya dan status draf atau sudah berlaku.', controls: 'Setiap perubahan pengaturan tercatat lengkap dengan nilai sebelum dan sesudahnya.', db: 'configurations, audit_logs' },
  { id: 'A14', name: 'Kebijakan Persetujuan', category: 'Fondasi', role: 'Pimpinan / Admin Sistem', source: 'ADM, LIFE', purpose: 'Menetapkan siapa menyetujui apa, batas nominal, dan siapa penyetuju penggantinya.', controls: 'Pengaju tidak boleh menjadi penyetuju atas pengajuannya sendiri.', db: 'approval_policies, roles' },
  { id: 'A15', name: 'Kebijakan Penyimpanan & Retensi', category: 'Fondasi', role: 'Pimpinan / Admin Sistem', source: 'ADM, DICT', purpose: 'Berapa lama tiap jenis catatan disimpan, kapan boleh diarsipkan, dan mana yang tidak boleh dihapus.', controls: 'Catatan yang sedang diaudit atau bersengketa ditahan dan tidak bisa dihapus.', db: 'retention_policies, archives' },
  { id: 'A16', name: 'Cadangan & Pemulihan Data', category: 'Fondasi', role: 'Admin Sistem', source: 'ADM, HANDOFF', purpose: 'Jadwal pencadangan data, hasil uji pemulihan, dan riwayatnya.', controls: 'Cadangan wajib terenkripsi dan pemulihannya diuji berkala, bukan hanya dijanjikan.', db: 'backup_jobs, audit_logs' },

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
  { id: 'S07', name: 'Antrean Formulir Masuk', category: 'Layanan', role: 'Petugas Layanan', source: 'FORM', purpose: 'Kiriman formulir yang belum dipilah, lengkap dengan persetujuan privasi dari pengirimnya.', controls: 'Kiriman tidak boleh diubah tanpa jejak. Identitas pengirim disamarkan pada daftar.', db: 'form_submissions, tracking_tokens' },
  { id: 'S08', name: 'Berkas Bukti Kasus', category: 'Layanan', role: 'Penindak Lanjut Aduan', source: 'CASE', purpose: 'Kumpulan bukti satu kasus beserta sumber, pengunggah, dan waktu unggahnya.', controls: 'Bukti tidak dapat dihapus selama kasus masih berjalan, disengketakan, atau sedang diaudit.', db: 'case_evidence, files' },
  { id: 'S09', name: 'Penutupan & Pembukaan Ulang Kasus', category: 'Layanan', role: 'Pimpinan / Reviewer', source: 'CASE, LIFE', purpose: 'Menutup kasus dengan ringkasan dan alasan, atau membukanya kembali bila ada bukti baru.', controls: 'Penutupan perlu persetujuan. Pembukaan ulang wajib beralasan dan tercatat permanen.', db: 'cases, case_actions, audit_logs' },

  // Keuangan (B01 - B09)
  { id: 'B01', name: 'Dasbor Keuangan', category: 'Keuangan', role: 'Pimpinan / Bendahara', source: 'FIN', purpose: 'Ringkasan anggaran, realisasi, posisi kas, kewajiban yang belum selesai, dan status periode keuangan.', controls: 'Nominal sensitif hanya terlihat oleh pihak yang berwenang.', db: 'financial_period, budget, financial_transaction' },
  { id: 'B02', name: 'Anggaran & Revisinya', category: 'Keuangan', role: 'Bendahara / Pengusul', source: 'FIN', purpose: 'Menyusun anggaran per periode, program, atau sumber dana, lengkap dengan riwayat revisinya.', controls: 'Revisi tidak menghapus versi lama. Setiap perubahan lewat persetujuan berjenjang.', db: 'budget, budget_line, fund' },
  { id: 'B03', name: 'Sumber Dana', category: 'Keuangan', role: 'Bendahara', source: 'FIN', purpose: 'Daftar sumber dana beserta batasan penggunaannya dan penanggung jawabnya.', controls: 'Dana yang terikat peruntukan tidak boleh dipakai untuk keperluan lain.', db: 'fund' },
  { id: 'B04', name: 'Pengajuan & Klaim Biaya', category: 'Keuangan', role: 'Semua Pengurus', source: 'FIN', purpose: 'Formulir pengajuan biaya, pembelian, uang muka, atau penggantian dana pribadi.', controls: 'Sistem mengecek sisa anggaran sebelum pengajuan diteruskan ke pemeriksa.', db: 'financial_request' },
  { id: 'B05', name: 'Detail Transaksi', category: 'Keuangan', role: 'Bendahara / Pemeriksa', source: 'FIN', purpose: 'Riwayat satu transaksi: status, persetujuan, bukti, pembayaran, dan rekonsiliasinya.', controls: 'Transaksi yang sudah dibukukan hanya bisa dikoreksi lewat catatan penyesuaian baru.', db: 'financial_transaction, payment' },
  { id: 'B06', name: 'Antrean Pembayaran', category: 'Keuangan', role: 'Bendahara', source: 'FIN', purpose: 'Daftar transaksi yang sudah disetujui dan menunggu dibayar, beserta bukti pembayarannya.', controls: 'Pengaju tidak boleh sekaligus menjadi penyetuju dan pembayar transaksi yang sama.', db: 'payment, financial_transaction' },
  { id: 'B07', name: 'Rekonsiliasi Kas & Bank', category: 'Keuangan', role: 'Bendahara / Pemeriksa', source: 'FIN', purpose: 'Mencocokkan catatan internal dengan rekening koran atau hasil hitungan kas.', controls: 'Selisih dicatat sebagai pengecualian dengan penanggung jawab dan batas waktu penyelesaian.', db: 'reconciliation' },
  { id: 'B08', name: 'Laporan Keuangan', category: 'Keuangan', role: 'Pimpinan / Bendahara / Auditor', source: 'FIN', purpose: 'Anggaran dibanding realisasi, posisi kas, penggunaan dana, dan kewajiban yang belum selesai.', controls: 'Laporan selalu mencantumkan tanggal batas data dan status periodenya.', db: 'budget, financial_transaction' },
  { id: 'B09', name: 'Audit Keuangan Internal', category: 'Keuangan', role: 'Auditor', source: 'FIN', purpose: 'Rencana audit, temuan, tanggapan pihak terkait, tindakan perbaikan, dan verifikasi penutupannya.', controls: 'Auditor hanya bisa membaca, tidak mengubah transaksi. Dilarang mengaudit transaksi buatannya sendiri.', db: 'audit_plan, audit_finding, corrective_action' },

  // Notifikasi & Komunikasi (N01 - N04)
  { id: 'N01', name: 'Preferensi Notifikasi', category: 'Notifikasi', role: 'Semua Pengurus', source: 'NOTIF', purpose: 'Mengatur saluran pengiriman, kategori, ringkasan harian, dan jam tenang.', controls: 'Notifikasi yang sifatnya wajib tidak dapat dimatikan.', db: 'notification_preferences' },
  { id: 'N02', name: 'Penyusun Siaran Pengumuman', category: 'Notifikasi', role: 'Sekjend / Humas', source: 'NOTIF', purpose: 'Menyusun pengumuman: sasaran penerima, bahasa, template, jadwal kirim, dan pratinjau.', controls: 'Daftar penerima wajib dipratinjau dulu sebelum pengumuman dikirim.', db: 'notifications, public_content' },
  { id: 'N03', name: 'Template Pesan', category: 'Notifikasi', role: 'Admin Sistem', source: 'NOTIF', purpose: 'Daftar template pesan beserta versi, variabel isian, pratinjau, dan status persetujuannya.', controls: 'Mengubah template tidak mengubah pesan yang sudah terlanjur terkirim.', db: 'notification_templates' },
  { id: 'N04', name: 'Pemantau Pengiriman', category: 'Notifikasi', role: 'Admin Sistem', source: 'NOTIF', purpose: 'Status pengiriman per saluran, antrean, sebab kegagalan, dan percobaan ulang.', controls: 'Isi yang sensitif tidak ditampilkan pada pratinjau notifikasi.', db: 'communication_log, notifications' },

  // Evaluasi, Handover & AI (E01 - E08, H01 - H06, I01 - I06)
  { id: 'E01', name: 'Laporan Kinerja Pengurus & Divisi', category: 'Evaluasi', role: 'Pimpinan / Koordinator', source: 'D18, TK21', purpose: 'Statistik penyelesaian tugas: jumlah selesai, ketepatan waktu, dan keabsahan bukti kerja.', controls: 'Data yang belum ada dibedakan jelas dari nilai nol. Dihitung per periode aktif.', db: 'performance_scores, tasks' },
  { id: 'E02', name: 'Perbandingan Antar Divisi & Ekspor', category: 'Evaluasi', role: 'Ketua / Sekjend', source: 'U15, R9', purpose: 'Membandingkan kinerja antar bagian organisasi dan mengekspor laporan resmi.', controls: 'Sementara ini hanya untuk pimpinan tertinggi, selama aturannya masih ditinjau.', db: 'performance_scores, audit_logs' },
  { id: 'E03', name: 'Pengajuan Koreksi Nilai Kinerja', category: 'Evaluasi', role: 'Koordinator', source: 'TK21', purpose: 'Mengajukan keberatan bila ada kendala di luar kendali yang mempengaruhi angka kinerja.', controls: 'Koreksi tidak menimpa angka asli; alasan keberatan tetap disimpan.', db: 'performance_scores, audit_logs' },
  { id: 'E04', name: 'Siklus & Target Kinerja', category: 'Evaluasi', role: 'Pimpinan / Kepala Divisi', source: 'PERF', purpose: 'Menetapkan periode penilaian, indikator yang dipakai, bobotnya, dan dari mana datanya diambil.', controls: 'Setelah siklus berjalan, definisi indikator dikunci agar penilaian tetap adil.', db: 'performance_cycle, performance_target' },
  { id: 'E05', name: 'Pencatatan Capaian', category: 'Evaluasi', role: 'Semua Pengurus', source: 'PERF', purpose: 'Mengisi angka capaian beserta penjelasan singkat dan bukti pendukungnya.', controls: 'Data yang belum diisi tidak dianggap nol, melainkan ditandai belum ada.', db: 'measurement, files' },
  { id: 'E06', name: 'Ruang Evaluasi', category: 'Evaluasi', role: 'Evaluator', source: 'PERF', purpose: 'Memberi penilaian berdasarkan rubrik, disertai catatan dan bukti yang ditinjau.', controls: 'Evaluator yang punya konflik kepentingan tidak boleh menilai orang tersebut.', db: 'evaluation' },
  { id: 'E07', name: 'Kalibrasi Nilai', category: 'Evaluasi', role: 'Panel Kalibrasi', source: 'PERF', purpose: 'Menyelaraskan penilaian antar penilai agar standarnya setara.', controls: 'Nilai sebelum dan sesudah kalibrasi dicatat beserta alasannya; bukti asli tidak diubah.', db: 'calibration, evaluation' },
  { id: 'E08', name: 'Rencana Perbaikan & Sanggah', category: 'Evaluasi', role: 'Pengurus / Reviewer', source: 'PERF', purpose: 'Rencana perbaikan bertahap dan jalur mengajukan keberatan atas hasil penilaian.', controls: 'Penilai awal tidak boleh menjadi satu-satunya pemutus keberatan atas nilainya sendiri.', db: 'pip, dispute' },
  { id: 'H01', name: 'Arsip Periode Sebelumnya', category: 'Handover', role: 'Pimpinan / Pengurus', source: 'M O', purpose: 'Membuka dokumen dan keputusan dari kepengurusan sebelumnya, dengan penyaringan.', controls: 'Pengurus baru tidak otomatis mendapat semua akses arsip lama.', db: 'archives, periods' },
  { id: 'H02', name: 'Susun Paket Serah Terima', category: 'Handover', role: 'Pengurus Demisioner', source: 'D17', purpose: 'Merangkum pekerjaan yang masih berjalan, dokumen penting, inventaris, dan catatan kunci.', controls: 'Kelengkapan paket diperiksa dulu sebelum diserahkan ke kepengurusan baru.', db: 'handovers, archives' },
  { id: 'H03', name: 'Terima & Cek Serah Terima', category: 'Handover', role: 'Pengurus Periode Baru', source: 'U23, D17', purpose: 'Daftar periksa penerimaan item satu per satu: "Diterima" atau "Perlu Klarifikasi".', controls: 'Paket belum dianggap selesai sebelum semua poin penting dicek.', db: 'handovers, audit_logs' },
  { id: 'H04', name: 'Panduan Bertahap Serah Terima', category: 'Handover', role: 'Pengurus Demisioner', source: 'HAND', purpose: 'Menuntun penyusunan paket serah terima langkah demi langkah agar tidak ada yang terlewat.', controls: 'Item yang ditandai penting harus terisi sebelum paket bisa diajukan.', db: 'handovers' },
  { id: 'H05', name: 'Daftar Tanggung Jawab Berjalan', category: 'Handover', role: 'Pengurus Demisioner', source: 'HAND', purpose: 'Inventaris tugas, dokumen, keputusan, dan kewajiban yang masih berjalan saat pergantian.', controls: 'Tanggung jawab harus punya pemilik baru; tidak boleh menggantung tanpa penanggung jawab.', db: 'handover_items, tasks' },
  { id: 'H06', name: 'Rencana Peralihan Akses', category: 'Handover', role: 'Admin Sistem / Sekretaris', source: 'HAND, RECON', purpose: 'Mengatur kapan akses pengurus lama dicabut dan akses pengurus baru diaktifkan.', controls: 'Akses lama dicabut setelah akses baru terbukti aktif, agar tidak ada celah kosong.', db: 'access_grants, audit_logs' },
  { id: 'I01', name: 'Tanya Jawab Asisten AI', category: 'AI', role: 'Semua Pengurus', source: 'U16, D19', purpose: 'Tanya jawab cepat soal aturan organisasi, SOP, dan ringkasan rapat.', controls: 'AI hanya membaca dokumen yang boleh diakses pengguna. Selalu mencantumkan sumber.', db: 'ai_conversations, ai_messages, ai_sources' },
  { id: 'I02', name: 'Alat Bantu Analisis Kajian', category: 'AI', role: 'Tim Kajian / Pimpinan', source: 'B11', purpose: 'Membandingkan dokumen kebijakan, menemukan celah, dan menyusun kerangka argumen.', controls: 'Semua hasilnya diberi label "saran AI"; keputusan tetap di tangan manusia.', db: 'ai_conversations, ai_messages' },
  { id: 'I03', name: 'Tinjau & Jalankan Usulan AI', category: 'AI', role: 'Pengurus Berwenang', source: 'M M, D19', purpose: 'Halaman persetujuan untuk perubahan yang disarankan AI, misalnya membuat draf tugas.', controls: 'Wajib dikonfirmasi manusia sebelum dijalankan. Izin dicek ulang saat dikirim.', db: 'ai_actions, audit_logs' },
  { id: 'I04', name: 'Riwayat Permintaan AI', category: 'AI', role: 'Semua Pengurus', source: 'AI', purpose: 'Daftar permintaan ke AI beserta tujuannya, sumber yang dipakai, dan status peninjauannya.', controls: 'Setiap pemakaian AI tercatat, termasuk tingkat kerahasiaan data yang disertakan.', db: 'ai_conversations, ai_messages' },
  { id: 'I05', name: 'Registri Model & Pola Perintah', category: 'AI', role: 'Admin Sistem', source: 'AI', purpose: 'Daftar model dan pola perintah yang disetujui dipakai, lengkap dengan nomor versinya.', controls: 'Perubahan pola perintah dicatat agar hasil lama tetap bisa ditelusuri.', db: 'ai_prompts, audit_logs' },
  { id: 'I06', name: 'Dasbor Tata Kelola AI', category: 'AI', role: 'Pimpinan / Admin Sistem', source: 'AI', purpose: 'Ringkasan pemakaian AI, pelanggaran kebijakan, dan hasil peninjauan output oleh manusia.', controls: 'AI tidak pernah menjadi penentu keputusan akhir; hasilnya selalu berlabel usulan.', db: 'ai_actions, audit_logs' }
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
  { code: 'C', file: 'Granular_Module_Specification_CMS_PUB_KPI_v1.0.docx', title: 'Granular CMS & PUB Public Web v1.0', scope: 'Bagian 3-27', purpose: 'Rincian alur redaksi dua bahasa yang terpisah, persetujuan per versi teks, dan pencegahan bocornya data rahasia.' },

  { code: 'CASE', file: '13. Granular_Module_Specification_FORM_CASE_KPI_v1.0.docx', title: 'Granular FORM & CASE v1.0', scope: 'Bagian 1-25', purpose: 'Rincian formulir masuk, pemilahan aduan, penanganan kasus, brankas bukti, sampai penutupan dan pembukaan ulang kasus.' },
  { code: 'NOTIF', file: '14. Granular_Module_Specification_NOTIF_KPI_v1.0.docx', title: 'Granular NOTIF Notifikasi v1.0', scope: 'Bagian 1-21', purpose: 'Rincian pusat notifikasi, preferensi saluran, penyusun siaran, template pesan, dan pemantau pengiriman.' },
  { code: 'FIN', file: '15. Granular_Module_Specification_FIN_KPI_v1.0.docx', title: 'Granular FIN Keuangan v1.0', scope: 'Bagian 1-38', purpose: 'Modul baru: anggaran, sumber dana, pengajuan biaya, pembayaran, rekonsiliasi kas, laporan, dan audit keuangan internal.' },
  { code: 'PERF', file: '16. Granular_Module_Specification_PERF_KPI_v1.0.docx', title: 'Granular PERF Kinerja v1.0', scope: 'Bagian 1-24', purpose: 'Rincian siklus kinerja, target dan indikator, pencatatan capaian, evaluasi, kalibrasi nilai, rencana perbaikan, dan sanggah.' },
  { code: 'AI', file: '17. Granular_Module_Specification_AI_KPI_v1.0.docx', title: 'Granular AI Asisten v1.0', scope: 'Bagian 1-30', purpose: 'Rincian batas kewenangan AI, kewajiban mencantumkan sumber, peninjauan manusia, registri model, dan tata kelolanya.' },
  { code: 'ADM', file: '18. Granular_Module_Specification_ADMIN_KPI_v1.0.docx', title: 'Granular ADMIN Pengaturan v1.0', scope: 'Bagian 1-29', purpose: 'Rincian pengelolaan organisasi, keanggotaan, peran, konfigurasi, kebijakan persetujuan, retensi, cadangan, dan kesehatan sistem.' },
  { code: 'HAND', file: '19. Granular_Module_Specification_HAND_KPI_v1.0.docx', title: 'Granular HAND Serah Terima v1.0', scope: 'Bagian 1-31', purpose: 'Rincian paket serah terima, inventaris tanggung jawab, peralihan akses, item belum selesai, dan pemantauan setelah pergantian.' },
  { code: 'DICT', file: '20. Cross_Module_Data_Dictionary_KPI_v1.0.docx', title: 'Kamus Data Lintas Modul v1.0', scope: 'Bagian 1-21', purpose: 'Menyamakan arti, format, dan pemilik setiap data yang dipakai bersama antar modul, termasuk daftar status resminya.' },
  { code: 'LIFE', file: '21. Lifecycle_Workflow_Matrix_KPI_v1.0.docx', title: 'Matriks Alur & Status v1.0', scope: 'Bagian 1-21', purpose: 'Alur setiap proses dari pemicu, pelaku, syarat, status, persetujuan, notifikasi, sampai catatan riwayatnya.' },
  { code: 'INTG', file: '22. Integration_Dependency_Matrix_KPI_v1.0.docx', title: 'Matriks Keterkaitan Antar Modul v1.0', scope: 'Bagian 1-15', purpose: 'Modul mana bergantung pada modul mana, data apa yang mengalir, dan urutan pengerjaan yang disarankan.' },
  { code: 'RECON', file: '23. Role_Permission_Reconciliation_KPI_v1.0.docx', title: 'Rekonsiliasi Peran & Hak Akses v1.0', scope: 'Bagian 1-19', purpose: 'Struktur organisasi resmi, 13 peran baku, 12 jenis izin, aturan pergantian jabatan, dan batas akses pengembang.' },
  { code: 'TEST', file: '24. Acceptance_Test_Matrix_KPI_v1.0.docx', title: 'Matriks Uji Terima v1.0', scope: 'Bagian 1-14', purpose: 'Daftar pengujian yang harus lulus sebelum sistem dinyatakan siap: fungsi, izin akses, keamanan, integrasi, dan uji pengguna.' },
  { code: 'HANDOFF', file: '25. Developer_Handoff_Package_KPI_v1.0.docx', title: 'Paket Serah Terima ke Pengembang v1.0', scope: 'Bagian 1-12', purpose: 'Kewajiban pengembang, batas aksesnya, syarat keamanan, tolok ukur selesai, dan daftar yang harus diserahkan ke KPI.' },
  { code: 'REVIEW', file: '27. Final_Architecture_Review_KPI_v1.0.docx', title: 'Tinjauan Akhir Arsitektur v1.0', scope: 'Bagian 1-11', purpose: 'Hasil pemeriksaan akhir seluruh dokumen, temuan yang harus diselesaikan, dan keputusan teknis yang wajib dikunci sebelum pengerjaan.' }
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
  { domain: 'Governance & AI', table: 'ai_actions', pk: 'id (UUID)', fields: 'user_id (FK), action_type, proposed_payload_json, status, confirmed_by (FK)', desc: 'Persetujuan manusia atas tindakan yang disarankan AI.' },

  { domain: 'Keuangan', table: 'financial_period', pk: 'id (UUID)', fields: 'name, start_date, end_date, status (Open/Soft Closed/Closed/Reopened)', desc: 'Periode keuangan; periode tertutup menolak transaksi biasa.' },
  { domain: 'Keuangan', table: 'fund', pk: 'id (UUID)', fields: 'name, fund_type, restriction_type, currency, opening_balance, owner_id (FK), status', desc: 'Sumber dana beserta batasan penggunaannya.' },
  { domain: 'Keuangan', table: 'account_category', pk: 'id (UUID)', fields: 'code, name, parent_id (FK), status', desc: 'Kategori atau pos akun keuangan.' },
  { domain: 'Keuangan', table: 'budget', pk: 'id (UUID)', fields: 'period_id (FK), fund_id (FK), owner_id (FK), version_no, status', desc: 'Dokumen anggaran; revisi membuat versi baru, bukan menimpa.' },
  { domain: 'Keuangan', table: 'budget_line', pk: 'id (UUID)', fields: 'budget_id (FK), account_id (FK), program, amount, currency', desc: 'Rincian baris anggaran per pos dan program.' },
  { domain: 'Keuangan', table: 'financial_request', pk: 'id (UUID)', fields: 'type, requester_id (FK), amount, currency, budget_line_id (FK), status', desc: 'Pengajuan biaya, pembelian, uang muka, atau penggantian dana.' },
  { domain: 'Keuangan', table: 'financial_transaction', pk: 'id (UUID)', fields: 'code, date, account_id (FK), amount, payee_id (FK), evidence_ref, status', desc: 'Pencatatan transaksi; setelah dibukukan hanya bisa dikoreksi lewat penyesuaian baru.' },
  { domain: 'Keuangan', table: 'payment', pk: 'id (UUID)', fields: 'transaction_id (FK), method, proof_file_id (FK), paid_at, recorded_by (FK)', desc: 'Catatan pembayaran beserta bukti transfernya.' },
  { domain: 'Keuangan', table: 'vendor_payee', pk: 'id (UUID)', fields: 'name, verification_status, masked_account_details, status', desc: 'Pihak penerima pembayaran; nomor rekening disimpan tersamar.' },
  { domain: 'Keuangan', table: 'reconciliation', pk: 'id (UUID)', fields: 'account_id (FK), period_id (FK), matched_items, difference, status', desc: 'Pencocokan catatan internal dengan rekening koran atau hitungan kas.' },
  { domain: 'Keuangan', table: 'audit_plan', pk: 'id (UUID)', fields: 'scope, period_id (FK), auditor_id (FK), status', desc: 'Rencana audit keuangan internal beserta ruang lingkupnya.' },
  { domain: 'Keuangan', table: 'audit_finding', pk: 'id (UUID)', fields: 'audit_id (FK), severity, condition, owner_id (FK), due_date, status', desc: 'Temuan audit beserta tingkat keparahan dan penanggung jawab tindak lanjutnya.' },
  { domain: 'Keuangan', table: 'corrective_action', pk: 'id (UUID)', fields: 'finding_id (FK), owner_id (FK), due_date, verification_by (FK), status', desc: 'Tindakan perbaikan atas temuan audit dan verifikasi penutupannya.' },

  { domain: 'Kinerja & Serah Terima', table: 'performance_cycle', pk: 'id (UUID)', fields: 'name, period_id (FK), start_date, end_date, framework, status', desc: 'Siklus penilaian kinerja beserta kerangka penilaiannya.' },
  { domain: 'Kinerja & Serah Terima', table: 'performance_target', pk: 'id (UUID)', fields: 'cycle_id (FK), subject_id (FK), indicator, baseline, target, weight, status', desc: 'Target dan indikator kinerja per orang atau per divisi.' },
  { domain: 'Kinerja & Serah Terima', table: 'measurement', pk: 'id (UUID)', fields: 'target_id (FK), value, measured_at, source, evidence_ref, submitted_by (FK)', desc: 'Pencatatan capaian; data yang belum ada tidak dianggap nol.' },
  { domain: 'Kinerja & Serah Terima', table: 'evaluation', pk: 'id (UUID)', fields: 'cycle_id (FK), evaluator_id (FK), rating, rationale, evidence_ref, status', desc: 'Hasil penilaian beserta alasan dan bukti yang ditinjau.' },
  { domain: 'Kinerja & Serah Terima', table: 'calibration', pk: 'id (UUID)', fields: 'evaluation_id (FK), value_before, value_after, reason, approver_id (FK)', desc: 'Penyelarasan nilai antar penilai; nilai lama tetap tersimpan.' },
  { domain: 'Kinerja & Serah Terima', table: 'handover_items', pk: 'id (UUID)', fields: 'handover_id (FK), item_type, source_ref, responsibility, acknowledgement, status', desc: 'Item dalam paket serah terima: tugas, dokumen, keputusan, atau kewajiban.' },
  { domain: 'Kinerja & Serah Terima', table: 'continuity_risk', pk: 'id (UUID)', fields: 'handover_id (FK), risk, impact, mitigation, owner_id (FK), status', desc: 'Risiko kesinambungan saat pergantian pengurus beserta rencana penanganannya.' },

  { domain: 'Notifikasi & Kasus', table: 'notification_preferences', pk: 'id (UUID)', fields: 'user_id (FK), channel, category, enabled, quiet_hours', desc: 'Pengaturan notifikasi tiap pengguna; notifikasi wajib tidak bisa dimatikan.' },
  { domain: 'Notifikasi & Kasus', table: 'notification_templates', pk: 'id (UUID)', fields: 'code, version_no, subject, body, variables, approved_by (FK)', desc: 'Template pesan beserta versinya.' },
  { domain: 'Notifikasi & Kasus', table: 'communication_log', pk: 'id (UUID)', fields: 'sender_id (FK), recipients, channel, sent_at, delivery_status', desc: 'Catatan pengiriman pesan beserta status dan sebab kegagalannya.' },
  { domain: 'Notifikasi & Kasus', table: 'cases', pk: 'id (UUID)', fields: 'code, case_type, classification, source_ref, lead_officer_id (FK), status', desc: 'Kasus hasil pemilahan aduan; aksesnya terbatas sesuai kebutuhan tugas.' },
  { domain: 'Notifikasi & Kasus', table: 'case_actions', pk: 'id (UUID)', fields: 'case_id (FK), action_type, actor_id (FK), note, evidence_ref, next_due', desc: 'Tindakan yang dilakukan pada satu kasus beserta buktinya.' },
  { domain: 'Notifikasi & Kasus', table: 'case_evidence', pk: 'id (UUID)', fields: 'case_id (FK), file_id (FK), source, uploaded_by (FK), uploaded_at', desc: 'Bukti kasus; tidak dapat dihapus selama kasus berjalan atau diaudit.' }
];

// --- 4. DATA MASTER: 18 KEPUTUSAN TERBUKA (Q01 - Q18) ---
const QUESTIONS_DATA = [
  { id: 'Q01', cat: 'Organisasi', title: 'Nama Pengurus & Jabatannya',
    q: 'Kapan daftar nama pengurus beserta jabatannya bisa kami terima? Selama belum ada, sistem masih memakai nama contoh.',
    prop: 'Sementara memakai kode jabatan standar, bukan nama orang.', block: 'Seluruh sistem' },

  { id: 'Q02', cat: 'Kebijakan', title: 'Siapa Boleh Membandingkan Kinerja Divisi',
    q: 'Siapa saja yang boleh melihat perbandingan kinerja antar divisi? Cukup Ketua dan Sekjend, atau kepala divisi juga boleh melihat divisinya sendiri?',
    prop: 'Sementara dibuka hanya untuk Ketua dan Sekjend.', block: 'Halaman E02' },

  { id: 'Q03', cat: 'Akses', title: 'Batas Akses Admin Sistem',
    q: 'Apakah Admin Sistem boleh membaca isi dokumen rahasia, atau hanya boleh mengurus pengaturan sistemnya saja?',
    prop: 'Admin mengurus sistem, tidak otomatis boleh membaca isi dokumen rahasia.', block: 'Halaman A06, F05' },

  { id: 'Q04', cat: 'Tugas', title: 'Tugas Induk Selesai Otomatis?',
    q: 'Kalau semua sub-tugas sudah selesai, apakah tugas induknya langsung dianggap selesai, atau tetap harus diperiksa dulu?',
    prop: 'Statusnya jadi "Siap Diajukan", pemeriksaan tetap dilakukan manusia.', block: 'Halaman T08' },

  { id: 'Q05', cat: 'Tugas', title: 'Penandaan Tugas Terlambat',
    q: 'Kalau tugas lewat tenggat, apakah langsung ditandai terlambat oleh sistem? Dan apakah pelaksana wajib mengisi alasan keterlambatannya?',
    prop: 'Ditandai otomatis, dan alasan wajib diisi.', block: 'Halaman T03' },

  { id: 'Q06', cat: 'Keamanan', title: 'Divisi Sensitif di Website Publik',
    q: 'Untuk Divisi Intelligence and Operation, apa saja yang boleh tampil di website publik? Apakah nama anggotanya disembunyikan sepenuhnya?',
    prop: 'Nama anggota dan cara kerjanya tidak ditampilkan sama sekali ke publik.', block: 'Halaman P03, P04' },

  { id: 'Q07', cat: 'Keamanan', title: 'Login Dua Langkah',
    q: 'Apakah pengurus wajib memakai kode dari aplikasi di HP saat login? Dan berapa lama sesi login boleh bertahan sebelum harus masuk ulang?',
    prop: 'Wajib untuk pemegang jabatan; sesi dicek ulang secara berkala.', block: 'Halaman A02' },

  { id: 'Q08', cat: 'Rapat', title: 'Kerahasiaan Pilihan Suara',
    q: 'Saat voting rapat, apakah pilihan tiap orang dirahasiakan, atau boleh dilihat siapa memilih apa?',
    prop: 'Daftar pemilih tercatat, tetapi pilihan tiap orang dirahasiakan.', block: 'Halaman M05' },

  { id: 'Q09', cat: 'Tugas', title: 'Boleh Memeriksa Bukti Sendiri?',
    q: 'Kami usulkan pembuat tugas tidak boleh menyetujui bukti kerjanya sendiri. Disetujui? Kalau di divisi kecil orangnya terbatas, siapa penggantinya?',
    prop: 'Dilarang. Pemeriksa harus orang lain.', block: 'Halaman T06' },

  { id: 'Q10', cat: 'Dokumen', title: 'Batas Ukuran & Jenis File',
    q: 'Berapa ukuran file maksimal yang boleh diunggah pengurus?',
    prop: 'Maksimal 25 MB per file. File program (.exe, .sh) diblokir.', block: 'Halaman F02' },

  { id: 'Q11', cat: 'Editorial', title: 'Kalau Versi Bahasa Inggris Belum Siap',
    q: 'Kalau artikel versi Inggris belum selesai, apa yang dilihat pengunjung? Pemberitahuan bahwa belum tersedia, atau langsung ditampilkan versi Indonesia?',
    prop: 'Tampilkan pemberitahuan; draf mentah tidak pernah ditampilkan.', block: 'Halaman C02, P15' },

  { id: 'Q12', cat: 'Layanan', title: 'Aduan Anonim & Janji Waktu Tanggapan',
    q: 'Apakah warga boleh mengirim aduan tanpa mencantumkan nama? Dan berapa hari kerja janji waktu tanggapan yang realistis untuk dicantumkan?',
    prop: 'Anonim didukung lewat kode pelacakan. Janji waktu diisi sesuai kemampuan nyata, bukan dikarang.', block: 'Halaman P12, S04' },

  { id: 'Q13', cat: 'Evaluasi', title: 'Cara Menghitung Nilai Kinerja',
    q: 'Nilai kinerja pengurus dihitung dari apa saja dan berapa bobot masing-masing? Misalnya: ketepatan waktu, jumlah tugas selesai, kelengkapan bukti.',
    prop: 'Rumusnya ditampilkan terbuka. Data yang belum ada tidak dihitung sebagai nol.', block: 'Halaman E01, E04' },

  { id: 'Q14', cat: 'Serah Terima', title: 'Memperbaiki Data Periode Lama',
    q: 'Kalau ada data periode lama yang keliru, siapa yang berwenang memperbaikinya dan lewat prosedur apa?',
    prop: 'Hanya lewat berita acara resmi, dan perbaikannya tercatat.', block: 'Halaman A08, H03' },

  { id: 'Q15', cat: 'AI', title: 'Dokumen yang Boleh Dibaca AI',
    q: 'Dokumen tingkat kerahasiaan apa saja yang boleh dibaca AI?',
    prop: 'Hanya tingkat Umum dan Internal. Tidak termasuk Terbatas, Rahasia, dan Sangat Rahasia.', block: 'Halaman I01, I06' },

  { id: 'Q16', cat: 'Komunikasi', title: 'Data di Buku Kontak',
    q: 'Data apa yang boleh ditampilkan di buku kontak pengurus dan mitra?',
    prop: 'Hanya email resmi lembaga dan jabatan. Nomor HP pribadi tidak ditampilkan.', block: 'Halaman S06' },

  { id: 'Q17', cat: 'Identitas', title: 'File Logo Resmi & Warna',
    q: 'Kapan file logo resmi dalam format aslinya bisa kami terima? Dan apakah kode warna merah yang kami pakai sekarang sudah sesuai?',
    prop: 'Sementara memakai merah #C4161C hasil pencocokan dari gambar logo.', block: 'Seluruh tampilan' },

  { id: 'Q18', cat: 'Sistem', title: 'Zona Waktu yang Dipakai',
    q: 'Semua jadwal memakai waktu Kairo, benar? Untuk pengurus yang sedang di Indonesia, apakah perlu ditampilkan dua waktu sekaligus?',
    prop: 'Waktu resmi Kairo, ditulis jelas pada setiap jadwal.', block: 'Kalender & jadwal' },

  { id: 'Q19', cat: 'Keuangan', title: 'Awal & Akhir Tahun Keuangan',
    q: 'Tahun keuangan KPI mulai tanggal berapa dan berakhir tanggal berapa? Apakah mengikuti periode kepengurusan?',
    prop: 'Mengikuti periode kepengurusan 2026/2027.', block: 'Halaman B01, B02' },

  { id: 'Q20', cat: 'Keuangan', title: 'Mata Uang Pembukuan',
    q: 'Pembukuan memakai mata uang apa? Kalau ada transaksi dalam mata uang lain, kurs mana yang dipakai dan kapan dicatat?',
    prop: 'Satu mata uang utama untuk pembukuan; kurs dicatat pada saat transaksi terjadi.', block: 'Halaman B04, B05' },

  { id: 'Q21', cat: 'Keuangan', title: 'Batas Nominal Persetujuan',
    q: 'Sampai nominal berapa Bendahara boleh menyetujui sendiri? Di atas nominal berapa harus naik ke Ketua atau BPH?',
    prop: 'Perlu daftar batas nominal dari KPI. Belum bisa kami tebak.', block: 'Halaman B04, A14' },

  { id: 'Q22', cat: 'Keuangan', title: 'Pembayaran Besar Perlu Dua Penyetuju?',
    q: 'Untuk pembayaran di atas nominal tertentu, apakah wajib disetujui dua orang? Kalau ya, mulai nominal berapa?',
    prop: 'Sebaiknya ya, untuk pengaman. Nominalnya menunggu keputusan KPI.', block: 'Halaman B06' },

  { id: 'Q23', cat: 'Keuangan', title: 'Batas Waktu Pertanggungjawaban Uang Muka',
    q: 'Setelah menerima uang muka, berapa hari batas waktu mempertanggungjawabkannya? Apakah yang belum lunas diblokir mengajukan lagi?',
    prop: 'Ada batas waktu, dan pengajuan baru diblokir bila masih ada tunggakan.', block: 'Halaman B04, B08' },

  { id: 'Q24', cat: 'Keuangan', title: 'Penyimpanan Nomor Rekening',
    q: 'Nomor rekening penerima disimpan lengkap di sistem, atau cukup sebagian saja seperti empat angka terakhir?',
    prop: 'Disimpan tersamar, hanya sebagian yang terlihat.', block: 'Halaman B03, B06' },

  { id: 'Q25', cat: 'Keuangan', title: 'Membuka Kembali Periode yang Sudah Ditutup',
    q: 'Kalau periode keuangan sudah ditutup lalu ada yang perlu diperbaiki, siapa yang berwenang membukanya kembali?',
    prop: 'Hanya lewat persetujuan pimpinan, dengan alasan tertulis dan tercatat.', block: 'Halaman B01, B08' },

  { id: 'Q26', cat: 'Sistem', title: 'Lama Penyimpanan Catatan',
    q: 'Berapa lama dokumen, transaksi keuangan, kasus, dan catatan riwayat disimpan sebelum boleh diarsipkan?',
    prop: 'Perlu daftar dari KPI per jenis catatan. Catatan yang sedang diaudit tidak boleh dihapus.', block: 'Halaman A15' },

  { id: 'Q27', cat: 'Akses', title: 'Akses Admin Demisioner',
    q: 'Ketua atau Sekretaris demisioner yang menjadi admin sementara, boleh mengakses apa saja? Seluruh data, atau hanya pengaturan sistem?',
    prop: 'Hanya pengaturan sistem, dan dicabut begitu admin baru ditetapkan.', block: 'Halaman A05, H06' },

  { id: 'Q28', cat: 'AI', title: 'AI Menandai Kejanggalan Keuangan',
    q: 'Bolehkah AI ikut menandai transaksi yang terlihat janggal untuk diperiksa manusia? Atau sebaiknya AI tidak menyentuh data keuangan sama sekali?',
    prop: 'Boleh sebatas menandai. AI tidak menyimpulkan adanya pelanggaran.', block: 'Halaman I06, B09' }
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
        <td data-label="Kode"><span class="screen-code-tag" onclick="openScreenModal('${screen.id}')">${screen.id}</span></td>
        <td data-label="Nama Halaman">
          <strong style="display: block; font-size: 13.5px; color: var(--text-primary); cursor: pointer;" onclick="openScreenModal('${screen.id}')">${screen.name}</strong>
          <span style="font-size: 11.5px; color: var(--text-tertiary);">${screen.category}</span>
        </td>
        <td data-label="Untuk Peran"><span class="badge badge-neutral">${screen.role}</span></td>
        <td data-label="Untuk Apa" style="max-width: 320px;">${screen.purpose}</td>
        <td data-label="Aturan & Batas Akses" style="max-width: 300px; font-size: 12.5px; color: var(--text-secondary);">${screen.controls}</td>
        <td data-label="Sumber & Data">
          <code style="font-size: 11px; background: var(--surface-secondary); padding: 2px 6px; border-radius: 4px; display: inline-block; margin-bottom: 4px;">${screen.source}</code>
          <span style="font-size: 10.5px; color: var(--accent); font-family: var(--font-mono); display: block;">${screen.db}</span>
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
    },

    W9: {
      title: 'Contoh 9: Login & Verifikasi Dua Langkah (A01, A02)',
      render: () => `
        <div class="m m-auth">
          <div class="m-auth-brand">
            <i>KPI</i>
            <h2>Portal Pengurus KPI</h2>
            <p>Masuk memakai akun pengurus yang terdaftar. Menu dan data yang tampil menyesuaikan jabatan aktif Anda.</p>
            <ul class="m-auth-points">
              <li>Akses berlaku selama masa jabatan</li>
              <li>Setiap masuk tercatat dalam riwayat keamanan</li>
              <li>Anggota tim dari luar KPI tidak dibuatkan akun</li>
            </ul>
          </div>

          <div class="m-auth-form">
            <div class="m-authbox">
              <div class="m-authstep">Langkah 1 dari 2</div>
              <h3>Masuk</h3>
              <div class="m-field"><label>Email atau username</label><div class="m-input">ahmad.fauzi</div></div>
              <div class="m-field"><label>Kata sandi</label><div class="m-input">••••••••••</div></div>
              <button class="btn-primary" style="justify-content:center;">Lanjut</button>
              <a class="m-link">Lupa kata sandi</a>

              <div class="m-divider"><span>Langkah 2 dari 2</span></div>

              <div class="m-field">
                <label>Kode 6 angka dari aplikasi di HP</label>
                <div class="m-otp"><span>4</span><span>1</span><span>9</span><span>2</span><span>0</span><span class="on"></span></div>
              </div>
              <p class="m-muted">Kode berganti tiap 30 detik. Portal belum terbuka sebelum kode ini benar.</p>
              <button class="btn-primary" style="justify-content:center;">Verifikasi dan masuk</button>
              <p class="m-muted" style="text-align:center;">Kalau salah, pesannya dibuat umum dan tidak menyebut bagian mana yang keliru.</p>
            </div>
          </div>
        </div>
      `
    },

    W10: {
      title: 'Contoh 10: Papan Tugas Divisi (T01)',
      render: () => `
        <div class="m m-app">
          <aside class="m-aside">
            <div class="m-brand"><i>${LOGO_SM}</i> Ruang Kerja</div>
            <div class="m-navitem">${NAV.grid} Dashboard</div>
            <div class="m-navitem">${NAV.home} My Workspace</div>
            <div class="m-navitem">${NAV.check} Perlu Tindakan <span class="m-count">3</span></div>
            <div class="m-aside-label">Operasional</div>
            <div class="m-navitem on">${NAV.list} Tugas Divisi</div>
            <div class="m-navitem">${NAV.cal} Kalender &amp; Rapat</div>
            <div class="m-navitem">${NAV.doc} Pustaka Dokumen</div>
          </aside>

          <main class="m-main">
            <div class="m-topbar">
              <div>
                <div class="m-crumb">Divisi Prevention and Education</div>
                <h1>Tugas Divisi</h1>
              </div>
              <div style="display:flex;align-items:center;gap:8px;">
                <span class="m-seg"><span class="on">Papan</span><span>Tabel</span></span>
                <button class="btn-primary" style="padding:8px 14px;font-size:12px;">Buat tugas</button>
              </div>
            </div>

            <div class="m-board">
              <div class="m-col">
                <div class="m-col-h">Belum dikerjakan <span>3</span></div>
                <div class="m-tcard"><div class="t">Susun materi sosialisasi</div><div class="s">Tenggat 9 Sep &middot; Nabila</div><div class="m-prog"><span style="width:0%"></span></div></div>
                <div class="m-tcard"><div class="t">Kumpulkan data peserta</div><div class="s">Tenggat 11 Sep &middot; Rifqi</div><div class="m-prog"><span style="width:0%"></span></div></div>
              </div>
              <div class="m-col">
                <div class="m-col-h">Sedang dikerjakan <span>2</span></div>
                <div class="m-tcard"><div class="t">Rilis pers Buletin No. 4</div><div class="s">Tenggat besok &middot; Ahmad</div><div class="m-prog"><span style="width:75%"></span></div></div>
                <div class="m-tcard err"><div class="t">Verifikasi dokumentasi webinar</div><div class="s m-red">Terlambat 1 hari &middot; Salsa</div><div class="m-prog"><span style="width:40%"></span></div></div>
              </div>
              <div class="m-col">
                <div class="m-col-h">Menunggu diperiksa <span>1</span></div>
                <div class="m-tcard"><div class="t">Laporan triwulan divisi</div><div class="s">Bukti 1 berkas &middot; Ahmad</div><div class="m-prog"><span style="width:100%"></span></div></div>
              </div>
              <div class="m-col">
                <div class="m-col-h">Selesai <span>12</span></div>
                <div class="m-tcard"><div class="t">Notulen rapat pleno</div><div class="s">Diterima 2 Sep &middot; Nabila</div><div class="m-prog"><span style="width:100%"></span></div></div>
              </div>
            </div>

            <p class="m-muted">Kartu hanya bisa digeser ke tahap yang sah. Tahap "Menunggu diperiksa" tidak bisa dilompati.</p>
          </main>
        </div>
      `
    },

    W11: {
      title: 'Contoh 11: Dasbor Keuangan (B01)',
      render: () => `
        <div class="m m-app">
          <aside class="m-aside">
            <div class="m-brand"><i>${LOGO_SM}</i> Keuangan</div>
            <div class="m-navitem on">${NAV.grid} Dasbor</div>
            <div class="m-navitem">${NAV.list} Anggaran</div>
            <div class="m-navitem">${NAV.check} Pengajuan <span class="m-count">5</span></div>
            <div class="m-aside-label">Proses</div>
            <div class="m-navitem">${NAV.doc} Antrean Pembayaran</div>
            <div class="m-navitem">${NAV.cal} Rekonsiliasi</div>
            <div class="m-navitem">${NAV.bell} Audit Internal</div>
          </aside>

          <main class="m-main">
            <div class="m-topbar">
              <div>
                <div class="m-crumb">Periode 2026/2027 &middot; status: Terbuka</div>
                <h1>Dasbor Keuangan</h1>
              </div>
              <div style="display:flex;align-items:center;gap:10px;">
                <button class="btn-secondary" style="padding:8px 14px;font-size:12px;">Unduh laporan</button>
                <div class="m-avatar">BD</div>
              </div>
            </div>

            <div class="m-stats">
              <div class="m-stat s1"><span class="lbl">Anggaran disahkan</span><span class="val">[nominal]</span><span class="sub">12 pos anggaran</span></div>
              <div class="m-stat s2"><span class="lbl">Sudah terpakai</span><span class="val">[nominal]</span><span class="sub">64% dari anggaran</span></div>
              <div class="m-stat s3"><span class="lbl">Posisi kas</span><span class="val">[nominal]</span><span class="sub">per 5 Sep 2026</span></div>
              <div class="m-stat s4"><span class="lbl">Belum selesai</span><span class="val">7 item</span><span class="sub">uang muka &amp; tagihan</span></div>
            </div>

            <div class="m-grid2">
              <div class="m-panel">
                <div class="m-panel-h">Anggaran dibanding realisasi</div>
                <div class="m-panel-b">
                  <div class="m-bar"><div class="lbl"><span>Program kerja</span><span class="m-muted">72%</span></div><div class="m-prog"><span style="width:72%"></span></div></div>
                  <div class="m-bar"><div class="lbl"><span>Publikasi &amp; media</span><span class="m-muted">55%</span></div><div class="m-prog"><span style="width:55%"></span></div></div>
                  <div class="m-bar"><div class="lbl"><span>Operasional</span><span class="m-muted">88%</span></div><div class="m-prog"><span style="width:88%"></span></div></div>
                  <div class="m-bar"><div class="lbl"><span>Kegiatan insidental</span><span class="m-muted">21%</span></div><div class="m-prog mut"><span style="width:21%"></span></div></div>
                  <p class="m-muted">Angka pada contoh ini belum diisi karena menunggu data resmi dari Bendahara.</p>
                </div>
              </div>

              <div class="m-panel">
                <div class="m-panel-h">Perlu tindakan <span class="m-muted">5</span></div>
                <div class="m-panel-b">
                  <div class="m-row"><div><div class="t">Pengajuan cetak buletin</div><div class="s">Menunggu persetujuan Anda</div></div><span class="m-status warn">Menunggu</span></div>
                  <div class="m-row"><div><div class="t">Uang muka kegiatan webinar</div><div class="s">Jatuh tempo 3 hari lagi</div></div><span class="m-status err">Segera</span></div>
                  <div class="m-row"><div><div class="t">Selisih rekonsiliasi Agustus</div><div class="s">Perlu penjelasan</div></div><span class="m-status warn">Diperiksa</span></div>
                </div>
              </div>
            </div>
          </main>
        </div>
      `
    },

    W12: {
      title: 'Contoh 12: Pengajuan & Persetujuan Biaya (B04, B05)',
      render: () => `
        <div class="m m-section">
          <div class="m-topbar" style="margin-bottom:16px;">
            <div>
              <div class="m-crumb">Pengajuan FIN-2026-0148 &middot; Divisi Media and Publication</div>
              <h1 style="font-size:17px;">Cetak Buletin Edisi September</h1>
            </div>
            <div style="text-align:right;">
              <div class="m-status warn">Menunggu persetujuan</div>
              <div class="m-muted" style="margin-top:4px;">Diajukan 4 Sep 2026</div>
            </div>
          </div>

          <div class="m-grid2" style="grid-template-columns:1.5fr 1fr;">
            <div style="display:flex;flex-direction:column;gap:14px;">
              <div class="m-panel">
                <div class="m-panel-h">Rincian pengajuan</div>
                <div class="m-panel-b">
                  <div class="m-kv"><span>Jenis</span><b>Permintaan pembelian</b></div>
                  <div class="m-kv"><span>Pos anggaran</span><b>Publikasi &amp; media</b></div>
                  <div class="m-kv"><span>Sumber dana</span><b>Alokasi internal</b></div>
                  <div class="m-kv"><span>Nominal</span><b>[nominal]</b></div>
                  <div class="m-kv"><span>Sisa anggaran pos ini</span><b class="m-green">Cukup</b></div>
                  <div class="m-kv"><span>Penerima</span><b>Percetakan (terverifikasi)</b></div>
                </div>
              </div>

              <div class="m-panel">
                <div class="m-panel-h">Berkas pendukung <span class="m-muted">2 berkas</span></div>
                <div class="m-panel-b">
                  <div class="m-row"><div style="display:flex;gap:10px;align-items:center;"><div class="m-thumb" style="width:34px;height:42px;"></div><div><div class="t">Penawaran_Percetakan.pdf</div><div class="s">Lolos pemeriksaan</div></div></div><button class="btn-secondary" style="padding:5px 11px;font-size:11px;">Buka</button></div>
                  <div class="m-row"><div style="display:flex;gap:10px;align-items:center;"><div class="m-thumb" style="width:34px;height:42px;"></div><div><div class="t">Rencana_Distribusi.pdf</div><div class="s">Lolos pemeriksaan</div></div></div><button class="btn-secondary" style="padding:5px 11px;font-size:11px;">Buka</button></div>
                </div>
              </div>
            </div>

            <div style="display:flex;flex-direction:column;gap:14px;">
              <div class="m-panel">
                <div class="m-panel-h">Riwayat persetujuan</div>
                <div class="m-panel-b">
                  <div class="m-time"><span class="dot ok"></span><div><div class="t">Diajukan</div><div class="s">Koordinator M&amp;P &middot; 4 Sep</div></div></div>
                  <div class="m-time"><span class="dot ok"></span><div><div class="t">Diperiksa Bendahara</div><div class="s">Bukti lengkap &middot; 5 Sep</div></div></div>
                  <div class="m-time"><span class="dot now"></span><div><div class="t">Menunggu persetujuan Ketua</div><div class="s">Di atas batas kewenangan Bendahara</div></div></div>
                  <div class="m-time"><span class="dot"></span><div><div class="t">Pembayaran</div><div class="s">Belum dijadwalkan</div></div></div>
                </div>
              </div>

              <div class="m-panel">
                <div class="m-panel-h">Keputusan Anda</div>
                <div class="m-panel-b">
                  <div class="m-field"><label>Catatan (wajib bila menolak)</label><div class="m-textarea" style="min-height:56px;">Tulis catatan...</div></div>
                  <button class="btn-primary" style="justify-content:center;">Setujui</button>
                  <button class="btn-secondary" style="justify-content:center;">Kembalikan untuk perbaikan</button>
                  <p class="m-muted">Pengaju tidak bisa menyetujui pengajuannya sendiri.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `
    },

    W13: {
      title: 'Contoh 13: Penilaian Kinerja (E04, E06)',
      render: () => `
        <div class="m m-section">
          <div class="m-topbar" style="margin-bottom:16px;">
            <div>
              <div class="m-crumb">Siklus Semester I 2026/2027 &middot; tahap Evaluasi</div>
              <h1 style="font-size:17px;">Penilaian Kinerja Divisi</h1>
            </div>
            <span class="m-status warn">Batas isi 15 Sep 2026</span>
          </div>

          <div class="m-grid2" style="grid-template-columns:1.4fr 1fr;">
            <div class="m-panel">
              <div class="m-panel-h">Target &amp; capaian <span class="m-muted">bobot total 100%</span></div>
              <div class="m-panel-b">
                <div class="m-bar"><div class="lbl"><span>Ketepatan waktu tugas <em>(bobot 30%)</em></span><span class="m-muted">82%</span></div><div class="m-prog"><span style="width:82%"></span></div></div>
                <div class="m-bar"><div class="lbl"><span>Tugas selesai &amp; diterima <em>(bobot 30%)</em></span><span class="m-muted">75%</span></div><div class="m-prog"><span style="width:75%"></span></div></div>
                <div class="m-bar"><div class="lbl"><span>Kelengkapan bukti kerja <em>(bobot 25%)</em></span><span class="m-muted">90%</span></div><div class="m-prog"><span style="width:90%"></span></div></div>
                <div class="m-bar"><div class="lbl"><span>Kehadiran rapat <em>(bobot 15%)</em></span><span class="m-muted">Belum ada data</span></div><div class="m-prog mut"><span style="width:0%"></span></div></div>
                <p class="m-muted">Indikator tanpa data ditandai "belum ada data", tidak dihitung sebagai nol.</p>
              </div>
            </div>

            <div class="m-panel">
              <div class="m-panel-h">Lembar penilaian</div>
              <div class="m-panel-b">
                <div class="m-field"><label>Yang dinilai</label><div class="m-input">Nabila Rahma &middot; Anggota</div></div>
                <div class="m-field">
                  <label>Nilai menurut rubrik</label>
                  <div class="m-rate"><span>1</span><span>2</span><span class="on">3</span><span>4</span><span>5</span></div>
                </div>
                <div class="m-field"><label>Alasan penilaian (wajib)</label><div class="m-textarea" style="min-height:60px;">Tulis alasan berdasarkan bukti yang ditinjau...</div></div>
                <button class="btn-primary" style="justify-content:center;">Kirim penilaian</button>
                <p class="m-muted">Penilai yang punya konflik kepentingan tidak boleh menilai orang ini.</p>
              </div>
            </div>
          </div>
        </div>
      `
    },

    W14: {
      title: 'Contoh 14: Serah Terima Jabatan (H02, H03)',
      render: () => `
        <div class="m m-section">
          <div class="m-topbar" style="margin-bottom:14px;">
            <div>
              <div class="m-crumb">Periode 2025/2026 ke 2026/2027 &middot; Sekretaris</div>
              <h1 style="font-size:17px;">Paket Serah Terima Jabatan</h1>
            </div>
            <span class="m-status warn">4 dari 9 item diterima</span>
          </div>

          <div class="m-prog" style="margin-bottom:16px;"><span style="width:44%"></span></div>

          <div class="m-grid2" style="grid-template-columns:1.5fr 1fr;">
            <div class="m-panel">
              <div class="m-panel-h">Daftar item <span class="m-muted">9 item</span></div>
              <div class="m-panel-b">
                <div class="m-row"><div><div class="t">Arsip surat masuk &amp; keluar</div><div class="s">142 berkas &middot; wajib</div></div><span class="m-status ok">Diterima</span></div>
                <div class="m-row"><div><div class="t">Notulen rapat pleno</div><div class="s">18 dokumen &middot; wajib</div></div><span class="m-status ok">Diterima</span></div>
                <div class="m-row"><div><div class="t">Daftar kontak mitra</div><div class="s">Buku alamat kelembagaan</div></div><span class="m-status ok">Diterima</span></div>
                <div class="m-row"><div><div class="t">Tugas yang masih berjalan</div><div class="s">6 tugas belum selesai &middot; wajib</div></div><span class="m-status warn">Perlu klarifikasi</span></div>
                <div class="m-row"><div><div class="t">Akun dan hak akses</div><div class="s">Peralihan akses &middot; wajib</div></div><span class="m-status">Menunggu</span></div>
                <div class="m-row"><div><div class="t">Inventaris barang sekretariat</div><div class="s">Belum dilampirkan</div></div><span class="m-status err">Belum siap</span></div>
              </div>
            </div>

            <div style="display:flex;flex-direction:column;gap:14px;">
              <div class="m-panel">
                <div class="m-panel-h">Item yang ditandai</div>
                <div class="m-panel-b">
                  <div style="background:var(--warning-bg);border:1px solid var(--warning-border);border-radius:10px;padding:11px;">
                    <strong style="font-size:11.5px;color:var(--warning);">Tugas yang masih berjalan</strong>
                    <p style="margin-top:4px;font-size:12px;">Pengurus baru meminta kejelasan penanggung jawab untuk 2 tugas yang tenggatnya sudah lewat.</p>
                  </div>
                  <div class="m-field"><label>Tanggapan pengurus lama</label><div class="m-textarea" style="min-height:52px;">Tulis penjelasan...</div></div>
                  <button class="btn-primary" style="justify-content:center;">Kirim tanggapan</button>
                </div>
              </div>

              <div class="m-panel">
                <div class="m-panel-h">Penutupan</div>
                <div class="m-panel-b">
                  <p style="font-size:12px;color:var(--text-secondary);">Paket belum bisa ditutup selama masih ada item wajib yang belum diterima.</p>
                  <button class="btn-secondary" style="justify-content:center;">Tutup serah terima</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `
    },

    W15: {
      title: 'Contoh 15: Pusat Notifikasi & Preferensi (W05, N01)',
      render: () => `
        <div class="m m-section">
          <div class="m-topbar" style="margin-bottom:14px;">
            <div>
              <div class="m-crumb">7 belum dibaca</div>
              <h1 style="font-size:17px;">Pusat Notifikasi</h1>
            </div>
            <span class="m-seg"><span class="on">Semua</span><span>Belum dibaca</span><span>Perlu tindakan</span></span>
          </div>

          <div class="m-grid2" style="grid-template-columns:1.6fr 1fr;">
            <div class="m-panel">
              <div class="m-panel-h">Hari ini</div>
              <div class="m-panel-b">
                <div class="m-notif unread"><span class="dot"></span><div><div class="t">Bukti tugas menunggu diperiksa</div><div class="s">Laporan Triwulan &middot; dari Ahmad &middot; 18:12</div></div><span class="m-status warn">Perlu tindakan</span></div>
                <div class="m-notif unread"><span class="dot"></span><div><div class="t">Pengajuan biaya perlu persetujuan</div><div class="s">Cetak buletin &middot; dari Bendahara &middot; 16:40</div></div><span class="m-status warn">Perlu tindakan</span></div>
                <div class="m-notif"><span class="dot"></span><div><div class="t">Rapat pleno dimulai 20:00 Kairo</div><div class="s">Pengingat &middot; 15:00</div></div><span class="m-status">Info</span></div>
                <div class="m-notif"><span class="dot"></span><div><div class="t">Notulen rapat sudah final</div><div class="s">Sekretaris &middot; kemarin</div></div><span class="m-status">Info</span></div>
              </div>
            </div>

            <div class="m-panel">
              <div class="m-panel-h">Preferensi</div>
              <div class="m-panel-b">
                <div class="m-toggle"><span>Ringkasan harian lewat email</span><i class="on"></i></div>
                <div class="m-toggle"><span>Pengingat tenggat tugas</span><i class="on"></i></div>
                <div class="m-toggle"><span>Pengumuman umum</span><i></i></div>
                <div class="m-toggle locked"><span>Persetujuan &amp; keamanan akun</span><i class="on"></i></div>
                <p class="m-muted">Notifikasi persetujuan dan keamanan bersifat wajib, jadi tidak bisa dimatikan.</p>
                <div class="m-field"><label>Jam tenang</label><div class="m-input">23:00 sampai 06:00 waktu Kairo</div></div>
              </div>
            </div>
          </div>
        </div>
      `
    }
  };

  const WF_SHELL = {
    W1: 'public', W2: 'app', W3: 'app', W4: 'app', W5: 'app', W6: 'app', W7: 'app', W8: 'app',
    W9: 'plain', W10: 'app', W11: 'app', W12: 'app', W13: 'app', W14: 'app', W15: 'app'
  };

  function renderWireframe(id) {
    const wf = WF_TEMPLATES[id];
    if (!wf || !wfContentArea) return;
    activeWfId = id;

    if (wfTitleBadge) wfTitleBadge.textContent = wf.title;
    wfContentArea.innerHTML = wf.render();
    if (simFrame) simFrame.setAttribute('data-shell', WF_SHELL[id] || 'app');

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
      simFrame.setAttribute('data-shell', WF_SHELL[activeWfId] || 'app');
    });
  });

  renderWireframe('W1');
}

// Workflow Journey Engine
function initFlowVisualizer() {
  const menuButtons = document.querySelectorAll('.flow-menu-btn');
  const flowContainer = document.getElementById('active-flow-display');

  // Pertanyaan rinci per alur, diambil dari bagian "keputusan yang harus dikunci"
  // pada dokumen kebutuhan. Kode di belakang menunjukkan dokumen sumbernya.
  const FLOW_ASKS = {
    F01: [
      { q: 'Berapa lama sesi login boleh bertahan sebelum pengurus harus masuk ulang?', src: 'AUTH' },
      { q: 'Verifikasi dua langkah wajib untuk semua pengurus, atau hanya jabatan tertentu saja?', src: 'AUTH' },
      { q: 'Kode verifikasi dikirim lewat apa: aplikasi authenticator, email, atau WhatsApp?', src: 'AUTH' },
      { q: 'Setelah berapa kali salah kata sandi akun dikunci sementara, dan berapa lama kuncinya?', src: 'AUTH' },
      { q: 'Kalau seseorang mengganti kata sandi, apakah semua perangkat lain otomatis dikeluarkan?', src: 'AUTH' },
      { q: 'Berapa lama catatan riwayat keamanan disimpan sebelum boleh diarsipkan?', src: 'AUTH, ADM' }
    ],
    F02: [
      { q: 'Kalau semua sub-tugas selesai, tugas induknya otomatis diajukan selesai, atau tetap menunggu pelaksana mengajukan sendiri?', src: 'TK' },
      { q: 'Tugas yang lewat tenggat: statusnya diganti menjadi "Terlambat", atau status kerjanya tetap dan hanya diberi penanda terlambat?', src: 'TK' },
      { q: 'Mengubah tenggat dan mengganti pelaksana: cukup keputusan koordinator, atau perlu persetujuan di atasnya?', src: 'TK' },
      { q: 'Bukti kerja wajib untuk semua jenis tugas, atau hanya untuk tugas tertentu saja?', src: 'TK' },
      { q: 'Kalau tugas telat berulang kali, apa yang terjadi: naik ke atasan, atau hanya ditampilkan lebih menonjol?', src: 'TK' },
      { q: 'Siapa yang berhak membatalkan tugas dan mengarsipkannya?', src: 'TK, LIFE' }
    ],
    F03: [
      { q: 'Jenis file apa saja yang boleh diunggah, dan berapa ukuran maksimalnya?', src: 'DO' },
      { q: 'Dokumen tingkat kerahasiaan apa yang wajib diberi cap air saat diunduh?', src: 'DO' },
      { q: 'Berapa lama izin berbagi berlaku secara bawaan sebelum otomatis kedaluwarsa?', src: 'DO' },
      { q: 'Boleh membuat tautan berbagi yang bisa dibuka tanpa login? Kalau boleh, untuk tingkat kerahasiaan apa saja?', src: 'DO' },
      { q: 'Siapa yang berhak menurunkan tingkat kerahasiaan sebuah dokumen?', src: 'DO, RECON' },
      { q: 'Berapa lama dokumen yang sudah diarsipkan disimpan sebelum boleh dihapus?', src: 'DO, ADM' }
    ],
    F04: [
      { q: 'Berapa jumlah minimal peserta agar rapat dianggap sah?', src: 'ME' },
      { q: 'Hasil voting ditampilkan sebagai angka saja, atau termasuk siapa memilih apa?', src: 'ME' },
      { q: 'Siapa yang berhak mengesahkan notulen menjadi final?', src: 'ME' },
      { q: 'Notulen final yang perlu dikoreksi: dibuka kembali, atau dibuat dokumen tambahan terpisah?', src: 'ME, LIFE' },
      { q: 'Rapat rahasia di kalender bersama: tampil sebagai "acara tertutup", atau tidak tampil sama sekali?', src: 'ME' },
      { q: 'Kalau jadwal rapat bentrok, boleh tetap dijadwalkan dengan alasan, atau langsung diblokir?', src: 'ME' }
    ],
    F05: [
      { q: 'Siapa yang berhak memberi persetujuan akhir sebelum konten terbit ke publik?', src: 'C' },
      { q: 'Konten berisiko tinggi perlu satu atau dua tingkat persetujuan?', src: 'C, RECON' },
      { q: 'Kalau lampiran artikel berubah menjadi rahasia setelah terbit, artikelnya otomatis ditarik atau hanya diberi peringatan?', src: 'C' },
      { q: 'Sampai berapa lama sebelum jadwal terbit, konten masih boleh diubah?', src: 'C' },
      { q: 'Artikel yang ditarik dari publik: dihapus dari pencarian, atau tetap bisa dibuka lewat tautan lama?', src: 'C' }
    ],
    F06: [
      { q: 'Lewat kanal apa saja warga boleh mengirim aduan: formulir website saja, atau termasuk email dan pesan?', src: 'CASE' },
      { q: 'Aduan tanpa nama diterima? Kalau ya, apakah tetap bisa ditindaklanjuti tanpa identitas pelapor?', src: 'CASE' },
      { q: 'Berapa hari batas waktu tanggapan untuk tiap tingkat urgensi aduan?', src: 'CASE' },
      { q: 'Siapa yang berhak membuka isi kasus sensitif, dan bagaimana konflik kepentingan ditangani?', src: 'CASE, RECON' },
      { q: 'Alasan penutupan kasus apa saja yang dianggap sah, dan siapa yang boleh membukanya kembali?', src: 'CASE' },
      { q: 'Berapa lama berkas kasus dan buktinya disimpan setelah kasus ditutup?', src: 'CASE, ADM' }
    ],
    F07: [
      { q: 'Siklus penilaian kinerja dilakukan tahunan, per semester, atau per triwulan?', src: 'PERF' },
      { q: 'Indikator apa saja yang dipakai dan berapa bobot masing-masing? Apakah totalnya harus 100%?', src: 'PERF' },
      { q: 'Siapa penilai untuk tiap peran dan divisi?', src: 'PERF' },
      { q: 'Apakah penilaian diri sendiri wajib diisi setiap pengurus?', src: 'PERF' },
      { q: 'Perlu panel kalibrasi untuk menyamakan standar antar penilai?', src: 'PERF' },
      { q: 'Nilai kinerja punya konsekuensi administratif, atau sekadar bahan informasi?', src: 'PERF' },
      { q: 'Siapa yang boleh melihat nilai dan catatan penilaian yang bersifat pribadi?', src: 'PERF, RECON' }
    ],
    F08: [
      { q: 'Jenis serah terima apa yang dipakai lebih dulu: antar periode, antar jabatan, atau keduanya?', src: 'HAND' },
      { q: 'Item apa saja yang dianggap kritis dan wajib beres sebelum serah terima boleh ditutup?', src: 'HAND' },
      { q: 'Berapa lama batas waktu pengurus baru menerima atau menolak paket serah terima?', src: 'HAND' },
      { q: 'Boleh menerima sebagian item dulu, atau harus diterima sekaligus?', src: 'HAND' },
      { q: 'Konfirmasi penerimaan cukup lewat sistem, atau tetap perlu tanda tangan berkas fisik?', src: 'HAND' },
      { q: 'Item yang masih menggantung setelah serah terima ditutup menjadi tanggung jawab siapa?', src: 'HAND' }
    ],
    F09: [
      { q: 'Siapa penanggung jawab tata kelola AI di KPI?', src: 'AI' },
      { q: 'Pemakaian AI apa saja yang dibuka di tahap pertama?', src: 'AI' },
      { q: 'Dokumen tingkat kerahasiaan apa yang boleh diproses AI, dan bolehkah lewat layanan pihak luar?', src: 'AI' },
      { q: 'Riwayat percakapan dengan AI disimpan? Kalau ya, berapa lama?', src: 'AI' },
      { q: 'Pemakaian yang mana saja yang wajib ditinjau manusia sebelum hasilnya dipakai?', src: 'AI' },
      { q: 'Ada batas pemakaian atau batas biaya AI per bulan?', src: 'AI' }
    ],
    F10: [
      { q: 'Pembukuan memakai pencatatan sederhana, atau pencatatan berpasangan seperti akuntansi penuh?', src: 'FIN' },
      { q: 'Daftar pos anggaran atau kategori biaya apa yang disetujui KPI?', src: 'FIN' },
      { q: 'Batas nominal persetujuan untuk tiap jenis transaksi, dan siapa penyetujunya?', src: 'FIN' },
      { q: 'Pembayaran di atas nominal berapa wajib disetujui dua orang?', src: 'FIN' },
      { q: 'Dokumen wajib untuk tiap jenis transaksi apa saja? Misalnya nota, kuitansi, atau bukti transfer.', src: 'FIN' },
      { q: 'Berapa hari batas waktu mempertanggungjawabkan uang muka?', src: 'FIN' },
      { q: 'Vendor atau penerima pembayaran wajib diverifikasi dulu sebelum dibayar?', src: 'FIN' },
      { q: 'Audit keuangan internal dikerjakan tim terpisah, atau pemeriksa yang ditunjuk saat itu?', src: 'FIN' }
    ],
    F11: [
      { q: 'Siapa yang berwenang menyetujui pengangkatan, pergantian, dan pencabutan akses?', src: 'RECON' },
      { q: 'Ada masa tenggang setelah masa jabatan berakhir, atau akses langsung mati di hari itu juga?', src: 'RECON' },
      { q: 'Pelaksana tugas sementara diberi kewenangan penuh, atau dibatasi hanya sebagian?', src: 'RECON' },
      { q: 'Delegasi kewenangan maksimal berapa lama, dan kewenangan apa yang tidak boleh didelegasikan?', src: 'RECON' },
      { q: 'Akses darurat: siapa yang boleh mengaktifkan, berlaku berapa lama, dan siapa yang meninjau setelahnya?', src: 'RECON' },
      { q: 'Seberapa sering hak akses seluruh pengurus ditinjau ulang?', src: 'RECON, ADM' }
    ]
  };

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
    },
    {
      id: 'F10',
      name: 'Keuangan: Anggaran sampai Audit',
      summary: 'Perjalanan uang dari penyusunan anggaran, pengajuan, pembayaran, pencocokan, sampai diperiksa auditor.',
      steps: [
        { num: 1, title: 'Susun & Sahkan Anggaran (B02)', desc: 'Bendahara menyusun anggaran per periode dan sumber dana, lalu diperiksa dan disahkan pimpinan.' },
        { num: 2, title: 'Ajukan Biaya (B04)', desc: 'Pengurus mengajukan biaya, pembelian, atau uang muka. Sistem mengecek sisa anggaran lebih dulu.' },
        { num: 3, title: 'Periksa & Setujui (B05)', desc: 'Pemeriksa mengecek kelengkapan bukti, lalu penyetuju mengesahkan sesuai batas kewenangannya.' },
        { num: 4, title: 'Bayar & Unggah Bukti (B06)', desc: 'Bendahara mencatat pembayaran dan mengunggah bukti transfernya.' },
        { num: 5, title: 'Cocokkan dengan Rekening (B07)', desc: 'Catatan internal dicocokkan dengan rekening koran atau hitungan kas. Selisih dicatat dan ditindaklanjuti.' },
        { num: 6, title: 'Diperiksa Auditor (B09)', desc: 'Auditor memeriksa kepatuhan dan kelengkapan bukti, menerbitkan temuan bila ada, lalu memverifikasi perbaikannya.' }
      ],
      rule: 'Satu orang tidak boleh mengajukan, menyetujui, dan membayar transaksi yang sama. Transaksi yang sudah dibukukan tidak bisa diubah diam-diam, hanya bisa dikoreksi lewat catatan penyesuaian baru yang ikut tercatat.'
    },
    {
      id: 'F11',
      name: 'Pergantian Jabatan & Hak Akses',
      summary: 'Apa yang terjadi pada akses seseorang ketika jabatannya berubah, berakhir, atau digantikan.',
      steps: [
        { num: 1, title: 'Keputusan Resmi (M05)', desc: 'Pengangkatan, perpindahan, atau pergantian ditetapkan lewat musyawarah BPH atau sidang anggota KPI.' },
        { num: 2, title: 'Catat Penugasan Baru (A07)', desc: 'Penugasan lama ditutup dan penugasan baru dibuat. Rangkap jabatan tidak diperbolehkan.' },
        { num: 3, title: 'Alihkan Akses (H06)', desc: 'Akses pengurus baru diaktifkan, lalu akses pengurus lama dicabut setelah akses baru terbukti berjalan.' },
        { num: 4, title: 'Serahkan Pekerjaan Berjalan (H05)', desc: 'Tugas, dokumen, dan kewajiban yang belum selesai dipindahkan ke penanggung jawab baru.' }
      ],
      rule: 'Akses melekat pada jabatan yang sedang aktif, bukan pada orangnya. Begitu masa jabatan berakhir, akses otomatis gugur meski pekerjaannya belum selesai. Anggota tim dari luar KPI tidak pernah dibuatkan akun.'
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

      ${(FLOW_ASKS[flow.id] || []).length ? `
      <div class="flow-asks">
        <div class="flow-asks-head">
          <h3>Yang perlu dijawab KPI untuk alur ini</h3>
          <span>${FLOW_ASKS[flow.id].length} pertanyaan</span>
        </div>
        <p class="flow-asks-note">Alur di atas belum bisa dikunci sebelum pertanyaan berikut dijawab. Jawaban singkat sudah cukup, misalnya angka, nama jabatan, atau pilihan salah satu.</p>
        <ol class="flow-asks-list">
          ${FLOW_ASKS[flow.id].map(a => `
            <li>
              <span class="ask-text">${a.q}</span>
              <span class="ask-src">Sumber: ${a.src}</span>
            </li>
          `).join('')}
        </ol>
      </div>
      ` : ''}
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
      <div class="question-ask">
        <span class="ask-label">Pertanyaan untuk KPI</span>
        ${q.q}
      </div>
      <div class="question-prop">
        <strong>Usulan kami:</strong> ${q.prop}
      </div>
      <div class="question-footer">
        <span>Terkait: <strong>${q.block}</strong></span>
        <span style="color: var(--warning); font-weight: 600;">Menunggu jawaban</span>
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
        <td data-label="Nama Tabel"><strong style="font-family: var(--font-mono); color: var(--accent); font-size: 13px;">${e.table}</strong></td>
        <td data-label="Kelompok"><span class="badge badge-neutral">${e.domain}</span></td>
        <td data-label="Nomor Identitas"><code style="font-size: 11.5px;">${e.pk}</code></td>
        <td data-label="Kolom Utama" style="font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); max-width: 380px;">${e.fields}</td>
        <td data-label="Untuk Apa" style="font-size: 12.5px; color: var(--text-primary);">${e.desc}</td>
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
