export type GuideShot = { file: string; caption: string };
export type GuideFeature = { title: string; href: string; steps: string[]; note?: string; shots: GuideShot[] };
export type GuideRole = { key: string; title: string; who: string; features: GuideFeature[] };

// Menu names and rules here describe the portal as built, and the shots come from scripts/tutorial-capture. Change them together with the feature.
export const portalGuide: GuideRole[] = [
  {
    key: "semua",
    title: "Semua pengurus",
    who: "Berlaku untuk setiap akun. Menu yang tampil mengikuti izin Anda, jadi jabatan saja tidak otomatis membuka semua modul.",
    features: [
      { title: "Masuk ke portal", href: "/masuk", steps: ["Buka halaman masuk, lalu isi email dan kata sandi dari pengelola KPI.", "Tekan tombol masuk. Kalau lupa kata sandi, pakai tautan Lupa kata sandi."], note: "Jangan bagikan kata sandi kepada siapa pun, termasuk pengelola.", shots: [{ file: "masuk", caption: "Halaman masuk portal." }] },
      { title: "Mengenal beranda dan menu", href: "/portal", steps: ["Menu di sisi kiri dikelompokkan menjadi Beranda, Pekerjaan, Layanan, dan Konten.", "Nama akun dan tombol Keluar ada di kiri bawah. Periode yang sedang dipakai tertulis di kanan atas.", "Buka Ruang kerja untuk melihat ringkasan tugas, tenggat, dan rapat."], shots: [{ file: "beranda", caption: "Beranda setelah masuk." }, { file: "ruang-kerja", caption: "Ruang kerja meringkas pekerjaan Anda." }] },
      { title: "Memeriksa akun dan hak akses", href: "/portal/profil", steps: ["Buka Profil saya untuk melihat nama, peran, dan penugasan.", "Tekan Hak akses saya untuk melihat izin yang aktif dan masa berlakunya.", "Kalau ada menu yang Anda perlukan tidak tampil, ajukan F01 di Kerahasiaan & akses."], shots: [{ file: "akun-profil", caption: "Profil saya." }, { file: "akun-izin", caption: "Izin aktif beserta batas waktunya." }] },
      { title: "Mengajukan akses (F01)", href: "/portal/kebijakan", steps: ["Buka Kerahasiaan & akses, tab F01 · Permohonan, lalu buka Buat F01.", "Isi nomor formulir, kategori informasi, jenis permohonan, izin yang diminta, dasar penugasan, tujuan, dan tanggal.", "Kategori Rahasia wajib menunjuk dokumen atau objek tertentu.", "Tekan Simpan pengajuan. Pengajuan belum memberi akses sampai diputuskan pejabat lalu dilaksanakan admin teknis.", "Selama belum diputuskan, Anda bisa membuka Tarik pengajuan di halaman detailnya."], note: "Tanggal akses harus berada di dalam masa penugasan Anda, dan Anda tidak bisa menyetujui permohonan sendiri.", shots: [{ file: "f01-tab", caption: "Mulai dari tab F01 · Permohonan." }, { file: "f01-form", caption: "Contoh formulir F01 yang sudah diisi." }, { file: "f01-detail", caption: "Setelah tersimpan, pengajuan bisa ditarik selama masih menunggu keputusan." }] },
      { title: "Menyatakan konflik kepentingan", href: "/portal/kebijakan", steps: ["Buka Kerahasiaan & akses, tab F02 · Register & review.", "Buka Nyatakan konflik saya, pilih periode dan dokumen terkait, lalu tulis alasan singkat.", "Kalau objeknya tidak dipilih, konflik berlaku untuk seluruh periode dan ikut menutup akses kerja Anda."], note: "Hanya peninjau lain yang dapat mengakhiri konflik.", shots: [{ file: "konflik", caption: "Konflik yang berlaku dan formulir pernyataannya." }] },
      { title: "Mengerjakan tugas", href: "/portal/tugas", steps: ["Buka Tugas, lalu pilih tugas di Daftar tugas.", "Tulis Catatan tindakan, lalu tekan Mulai tugas.", "Setelah selesai, tulis catatan lagi dan tekan Ajukan review.", "Kalau diminta revisi, perbaiki dan ajukan lagi. Tugas selesai setelah disetujui pemeriksa lain."], shots: [{ file: "tugas-daftar", caption: "Daftar tugas dengan statusnya di kanan." }, { file: "tugas-mulai", caption: "Isi catatan, lalu tekan Mulai tugas." }] },
      { title: "Mengikuti rapat", href: "/portal/rapat", steps: ["Buka Rapat dan pilih rapat yang mengundang Anda.", "Tekan Konfirmasi hadir, Konfirmasi tidak hadir, atau Konfirmasi ragu. Catatan boleh dikosongkan.", "Saat voting dibuka dan kehadiran Anda sudah tercatat, pilih Setuju, Tolak, atau Abstain. Pilihan tidak bisa diubah."], note: "Rapat Internal bisa dibuka undangan atau pemegang izin rapat. Rapat Terbatas dan Rahasia memerlukan izin sekaligus undangan.", shots: [{ file: "rapat-daftar", caption: "Daftar rapat dengan tanggal, kategori, dan tahapnya." }, { file: "rapat-konfirmasi", caption: "Tombol konfirmasi kehadiran di halaman rapat." }] },
      { title: "Mengunggah dokumen", href: "/portal/dokumen", steps: ["Buka Dokumen, lalu lihat bagian Upload dokumen. Bagian ini tampil kalau Anda punya izin mengunggah.", "Pilih Dokumen baru, tentukan kategorinya, lalu pilih berkas PDF, gambar, TXT, atau Office maksimal 4 MB.", "Tekan Upload berkas. Berkas Anda selalu tampil di Dokumen tersimpan.", "Untuk memperbarui berkas, pilih versi baru di Jenis upload. Kategorinya mengikuti versi sebelumnya."], note: "Tombol Download baru aktif setelah berkas lolos pemeriksaan virus.", shots: [{ file: "dokumen-unggah", caption: "Pilih kategori sebelum mengunggah." }, { file: "dokumen-daftar", caption: "Dokumen tersimpan beserta status dan kategorinya." }, { file: "dokumen-virus", caption: "Pesan ini tampil selama layanan pemeriksaan virus belum disambungkan." }] },
      { title: "Memeriksa pemberitahuan", href: "/portal/notifikasi", steps: ["Buka Kotak masuk untuk melihat kabar tugas, rapat, dan pengingat.", "Tekan judul pemberitahuan untuk menuju pekerjaannya, atau Tandai dibaca."], shots: [{ file: "notifikasi", caption: "Kotak masuk." }] }
    ]
  },
  {
    key: "pejabat",
    title: "Ketua dan pejabat bermandat",
    who: "Pengurus yang punya mandat tertulis untuk memutuskan akses, meninjau, atau menyetujui. Kewenangan mengikuti isi mandat, bukan nama jabatan.",
    features: [
      { title: "Memutuskan permohonan akses", href: "/portal/kebijakan", steps: ["Buka Kerahasiaan & akses, tab F01 · Permohonan, lalu pilih pengajuan di daftar.", "Buka Catat keputusan, pilih mandat, dan tentukan disetujui, disetujui sebagian, atau ditolak.", "Kalau disetujui, pilih izin yang diberikan. Hanya izin yang diminta dan tercakup mandat yang tampil.", "Isi hasil pemeriksaan, catatan, dan rujukan, lalu tekan Catat keputusan. Admin teknis lalu melaksanakannya."], note: "Akses Rahasia hanya bisa disetujui pemegang kewenangan Menyetujui akses Rahasia.", shots: [{ file: "keputusan-detail", caption: "Isi permohonan di atas, formulir keputusan di bawah." }, { file: "keputusan-form", caption: "Contoh keputusan disetujui sebagian." }] },
      { title: "Meninjau hak akses (F02)", href: "/portal/kebijakan", steps: ["Buka tab F02 · Register & review. Sistem menandai akses yang sudah waktunya ditinjau.", "Pada kartu akses itu, buka Catat peninjauan F02.", "Isi dasar peninjauan, temuan, tindak lanjut, PIC, dan target, lalu tekan Simpan peninjauan.", "Pengurus lain yang berwenang memverifikasi tindak lanjut itu."], note: "Tinjauan yang terlewat memunculkan pengingat. Akses tidak ditangguhkan otomatis.", shots: [{ file: "tinjau-tanda", caption: "Tanda jumlah akses yang perlu ditinjau." }, { file: "tinjau-form", caption: "Formulir peninjauan pada kartu akses." }] },
      { title: "Mencabut atau menangguhkan akses", href: "/portal/kebijakan", steps: ["Di tab F02, cari kartu akses orang tersebut.", "Buka Ajukan pencabutan akses ini dan tulis alasannya. Pejabat lain memutuskan, lalu admin teknis melaksanakan.", "Untuk pengamanan segera, catat peninjauan dulu, lalu pilih Penangguhan untuk pengamanan pada catatan itu."], note: "Penangguhan bukan sanksi atau keputusan bersalah.", shots: [{ file: "cabut", caption: "Formulir pencabutan pada kartu akses." }] },
      { title: "Menangani insiden kerahasiaan (F03–F04)", href: "/portal/kebijakan", steps: ["Buka tab F03–F04 · Insiden dan pilih laporan.", "Buka Tetapkan PIC penanganan, pilih PIC, lalu simpan.", "PIC mencatat pengamanan, pemulihan, risiko tersisa, dan perbaikan.", "Pemberi persetujuan independen memutuskan pemberitahuan, pemulihan, dan penutupan."], note: "Penutupan teknis tidak menutup pemeriksaan personel oleh BPI.", shots: [{ file: "insiden", caption: "Laporan insiden dan penetapan PIC." }] },
      { title: "Mengakhiri akses saat serah terima (F05)", href: "/portal/kebijakan", steps: ["Buka tab F05 · Serah terima, lalu buka formulirnya.", "Pilih personel yang mengakhiri tugas, penerima serah terima, dan petugas verifikasi, lalu isi dasar dan tanggal berlakunya.", "Lengkapi checklist, lalu ajukan verifikasi. Penerima mengonfirmasi, petugas memverifikasi, dan admin teknis mencabut aksesnya."], shots: [{ file: "f05", caption: "Formulir F05." }] },
      { title: "Menetapkan klasifikasi dan melindungi bukti", href: "/portal/kebijakan", steps: ["Buka tab Klasifikasi & bukti, lalu buka formulirnya.", "Pilih objek dan jenis tindakan: menetapkan klasifikasi, melindungi bukti, atau melepas perlindungan.", "Isi alasan dan dasar tertulis. Pemegang kewenangan lain yang menyetujui."], note: "Menurunkan kategori memerlukan mandat khusus.", shots: [{ file: "klasifikasi", caption: "Formulir klasifikasi dan perlindungan bukti." }] },
      { title: "Mengesahkan notulen rapat", href: "/portal/rapat", steps: ["Buka rapat yang berstatus Menunggu review.", "Isi Catatan tindakan, lalu tekan Setujui notulen atau Minta revisi."], note: "Pembuat rapat dan penulis notulen tidak bisa mengesahkan sendiri.", shots: [{ file: "notulen-sahkan", caption: "Tombol pengesahan di bagian Notulen." }] }
    ]
  },
  {
    key: "sekretaris",
    title: "Sekretaris dan pengelola rapat",
    who: "Pengurus yang mengelola rapat dan menerima pengaduan, sesuai izin dan penunjukan.",
    features: [
      { title: "Membuat rapat", href: "/portal/rapat", steps: ["Buka Rapat, lalu isi judul, agenda, dan waktu mulai di Buat undangan rapat.", "Pilih kategori rapat dan centang peserta resmi.", "Tekan Simpan undangan."], shots: [{ file: "rapat-buat", caption: "Contoh undangan rapat." }] },
      { title: "Menjalankan rapat sampai notulen", href: "/portal/rapat", steps: ["Isi Catatan tindakan, lalu tekan Hadir, Izin, atau Tidak hadir pada setiap peserta.", "Kalau ada voting, tulis usulan, tentukan kuorum, tekan Buka voting, lalu Tutup voting setelah selesai.", "Tulis isi notulen, tekan Simpan notulen, lalu Ajukan review.", "Setelah final, buat tugas tindak lanjut bila perlu, lalu arsipkan rapat."], note: "Voting hanya bisa diikuti peserta yang tercatat hadir.", shots: [{ file: "rapat-jalan", caption: "Satu halaman rapat: kehadiran, notulen, voting, lampiran, dan riwayat." }] },
      { title: "Menerima pengaduan", href: "/portal/kasus", steps: ["Buka Kasus. Hanya laporan yang menjadi tugas Anda yang tampil.", "Tekan Buka detail pada laporan.", "Tulis catatan, lalu pilih Simpan catatan internal atau Kirim pembaruan ke pelapor.", "Tetapkan PIC dari personel yang memenuhi syarat."], note: "Kanal pengaduan publik hanya terbuka setelah pengaturan penerimaan siap.", shots: [{ file: "kasus-daftar", caption: "Daftar laporan." }, { file: "kasus-detail", caption: "Detail laporan. Catatan internal terpisah dari pembaruan untuk pelapor." }] }
    ]
  },
  {
    key: "divisi",
    title: "Koordinator divisi dan PIC kasus",
    who: "Pengurus yang membagi pekerjaan divisi atau ditugaskan menangani kasus.",
    features: [
      { title: "Membagi dan memeriksa tugas", href: "/portal/tugas", steps: ["Buka Tugas, isi judul, tenggat, dan uraian di Buat tugas, lalu tekan Simpan tugas. Tugas baru tercatat atas nama Anda.", "Buka tugasnya, lalu pakai Delegasi, tenggat, dan perincian tugas untuk memindahkannya ke pelaksana dan menambah subtugas.", "Saat hasil masuk, pemeriksa selain pembuat dan pelaksana menulis catatan, lalu menekan Setujui hasil atau Minta revisi."], shots: [{ file: "tugas-buat", caption: "Contoh tugas baru." }, { file: "tugas-periksa", caption: "Tugas yang menunggu review." }] },
      { title: "Menangani kasus dan formulir", href: "/portal/kasus", steps: ["Buka Kasus. Hanya kasus tempat Anda ditugaskan yang tampil.", "Tekan Buka detail, lalu isi formulir 01–07 sesuai tahap dan simpan.", "Lampirkan dokumen di Bukti kasus dan catat di register bukti.", "Pisahkan catatan internal dari pembaruan untuk pelapor."], note: "Formulir yang lengkap bukan pengesahan. Keputusan sanksi tetap oleh pihak berwenang.", shots: [{ file: "kasus-detail", caption: "Bukti kasus, formulir, dan riwayat ada di halaman detail." }] }
    ]
  },
  {
    key: "keuangan",
    title: "Bendahara dan petugas keuangan",
    who: "Pembuat, pemeriksa, dan pemberi persetujuan akhir harus orang yang berbeda.",
    features: [
      { title: "Menyusun anggaran dan transaksi", href: "/portal/keuangan", steps: ["Buka Keuangan, lalu pilih Anggaran atau Transaksi di Jenis catatan.", "Isi Catatan baru: judul, jumlah, mata uang, anggaran yang disetujui, dan uraian. Tekan Simpan draf.", "Buka catatan dari daftar, lampirkan bukti yang sudah lolos pemeriksaan, lalu ajukan.", "Pemeriksa memverifikasi bukti, lalu pihak ketiga memberi persetujuan akhir."], note: "Sistem hanya mencatat. Tidak ada transfer uang atau konversi kurs otomatis.", shots: [{ file: "keuangan", caption: "Daftar catatan di kiri, formulir catatan baru di kanan." }] }
    ]
  },
  {
    key: "media",
    title: "Media dan Publikasi",
    who: "Penulis, pemeriksa, dan penerbit memakai izin yang berbeda.",
    features: [
      { title: "Menerbitkan tulisan", href: "/portal/editor", steps: ["Buka Redaksi, buat draf, lalu ajukan.", "Pemeriksa membuka naskah berstatus Menunggu review, mengecek sumber dan privasi, lalu meminta revisi atau menyetujui.", "Penerbit menerbitkan atau menjadwalkan tulisan yang sudah disetujui."], note: "Tulisan yang disetujui belum otomatis tampil di situs publik.", shots: [{ file: "redaksi-daftar", caption: "Daftar konten redaksi dan statusnya." }, { file: "redaksi-periksa", caption: "Naskah yang menunggu review." }] },
      { title: "Mengelola rujukan", href: "/portal/knowledge", steps: ["Buka Rujukan, lalu tekan Buat draf baru.", "Tulis judul, ringkasan, isi, dan sumber, lalu tekan Simpan draf.", "Ajukan untuk diperiksa pengurus lain."], shots: [{ file: "rujukan", caption: "Rujukan internal." }] }
    ]
  },
  {
    key: "evaluasi",
    title: "Evaluator dan serah terima",
    who: "Pengurus yang menilai kinerja atau menyiapkan pergantian kepengurusan.",
    features: [
      { title: "Mengisi evaluasi", href: "/portal/evaluasi", steps: ["Buka Evaluasi. Penilaian individual bersifat rahasia, jadi tekan Buat / ambil nomor catatan dulu.", "Ajukan izin khusus untuk nomor itu lewat F01.", "Setelah izin aktif, isi anggota yang dinilai, nilai 0–100, dan kriteria, lalu ajukan. Pemeriksa harus orang lain dan bukan yang dinilai."], note: "Orang yang dinilai boleh mengajukan satu keberatan setelah disetujui.", shots: [{ file: "evaluasi", caption: "Halaman evaluasi." }] },
      { title: "Menyiapkan serah terima", href: "/portal/handover", steps: ["Buka Serah terima, isi judul dan penerima serah terima, lalu tekan Simpan draf.", "Buka paketnya, tambahkan dokumen, lalu ajukan.", "Penerima memeriksa tiap item, lalu menyelesaikan paket."], note: "Menutup paket tidak mencabut akses. Pengakhiran akses memakai F05 di Kerahasiaan & akses.", shots: [{ file: "handover", caption: "Daftar paket di kiri, paket baru di kanan." }] }
    ]
  },
  {
    key: "admin",
    title: "Administrator teknis",
    who: "Mengelola konfigurasi dan akun. Peran ini tidak otomatis boleh membaca kasus, keuangan, atau dokumen rahasia.",
    features: [
      { title: "Menyiapkan pengurus", href: "/portal/pengaturan", steps: ["Buka Organisasi & periode, lalu pilih periode resmi.", "Di Pengaturan, pilih Divisi / subbidang dan Jabatan untuk menambah unit kerja.", "Pilih Penugasan pengurus, isi akun, jabatan, tanggal, dan rujukan keputusan.", "Isi Catatan tindakan, lalu tekan Simpan pengaturan."], note: "Penugasan tidak otomatis memberi izin. Izin diberikan lewat F01. Jangan memakai unit bertanda data contoh.", shots: [{ file: "admin-penugasan", caption: "Formulir penugasan pengurus." }] },
      { title: "Mencatat mandat pejabat", href: "/portal/pengaturan", steps: ["Di Pengaturan, pilih Ajukan pencatatan mandat.", "Pilih pejabat, klasifikasi, kewenangan, masa berlaku, dan rujukan.", "Tekan Simpan pengaturan. Pengurus lain yang punya mandat pengelolaan menyetujuinya."], note: "Mandat pertama dicatat lewat skrip resmi karena belum ada penyetuju.", shots: [{ file: "admin-mandat", caption: "Formulir pencatatan mandat." }] },
      { title: "Melaksanakan keputusan akses", href: "/portal/kebijakan", steps: ["Buka pengajuan berstatus Disetujui di tab F01 · Permohonan.", "Buka Laksanakan keputusan akses, isi rujukan, lalu tekan tombolnya.", "Kalau keputusan tidak jadi berlaku, pakai Batalkan keputusan yang belum dilaksanakan."], note: "Anda tidak bisa melaksanakan permohonan Anda sendiri.", shots: [{ file: "admin-laksana", caption: "Keputusan yang siap dilaksanakan." }] },
      { title: "Memantau sistem", href: "/portal/operasi", steps: ["Buka Operasi & audit untuk melihat kesiapan layanan, periode, dan jejak tindakan.", "Buka Katalog layar untuk melihat daftar layar internal dan statusnya."], shots: [{ file: "admin-operasi", caption: "Operasi & audit." }, { file: "katalog", caption: "Katalog layar." }] },
      { title: "Memakai asisten internal", href: "/portal/ai", steps: ["Buka AI terkendali, tulis kebutuhan Anda, dan pilih sumber pengetahuan.", "Periksa jawaban dan draf yang diusulkan sebelum menyimpannya sebagai catatan."], note: "Asisten baru menjawab setelah penyedia AI disetujui dan disambungkan. Tidak ada tindakan yang berjalan tanpa konfirmasi Anda.", shots: [{ file: "asisten", caption: "Halaman asisten internal." }] }
    ]
  },
  {
    key: "super",
    title: "Super admin",
    who: "Akun yang disetujui untuk membaca seluruh data KPI. Aturan independensi tetap berlaku.",
    features: [
      { title: "Mengaktifkan dan menutup periode", href: "/portal/pengaturan", steps: ["Simpan periode baru di Organisasi & periode. Statusnya Direncanakan.", "Pastikan data contoh sudah dihapus dan tidak ada periode lain yang berjalan.", "Isi Rujukan keputusan resmi, lalu tekan Aktifkan periode.", "Di akhir kepengurusan, isi rujukan dan tekan Tutup periode."], note: "Hanya satu periode yang bisa berjalan dalam satu organisasi. Semua perubahan tercatat di audit.", shots: [{ file: "super-periode", caption: "Tombol periode dan kolom rujukan keputusan." }] },
      { title: "Membaca periode yang tidak berjalan", href: "/portal/rapat", steps: ["Periode yang belum aktif atau sudah berakhir ditandai Baca saja pada pilihan periode.", "Di periode itu Anda bisa membaca, tapi tidak bisa membuat atau mengubah data."], shots: [{ file: "super-baca", caption: "Label Baca saja beserta penjelasannya." }] }
    ]
  }
];

export function guideSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// Every word of the query has to appear somewhere in the feature, so "unggah dokumen" and "dokumen unggah" match alike.
export function searchGuide(query: string): { role: GuideRole; feature: GuideFeature }[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return portalGuide.flatMap(role => role.features
    .filter(feature => { const text = [feature.title, ...feature.steps, feature.note ?? ""].join(" ").toLowerCase(); return words.every(word => text.includes(word)); })
    .map(feature => ({ role, feature })));
}

export function guideRoleForAccount(account: { systemAdmin?: boolean; superAdmin?: boolean }): string {
  return account.systemAdmin && account.superAdmin ? "super" : account.systemAdmin ? "admin" : "semua";
}
