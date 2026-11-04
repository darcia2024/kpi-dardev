export type GuideFeature = { title: string; href: string; steps: string[]; note?: string };
export type GuideRole = { key: string; title: string; who: string; features: GuideFeature[] };

// Menu names and rules here describe the portal as built. Change them together with the feature.
export const portalGuide: GuideRole[] = [
  {
    key: "semua",
    title: "Semua pengurus",
    who: "Berlaku untuk setiap akun. Menu yang tampil mengikuti izin Anda, jadi jabatan saja tidak otomatis membuka semua modul.",
    features: [
      { title: "Memeriksa akun dan hak akses", href: "/portal/profil", steps: ["Buka Profil saya untuk melihat nama, jabatan, dan periode.", "Buka tautan Hak akses saya untuk melihat izin yang sedang aktif dan masa berlakunya.", "Kalau ada menu yang Anda perlukan tidak tampil, ajukan F01 di Kerahasiaan & akses."] },
      { title: "Mengajukan akses (F01)", href: "/portal/kebijakan", steps: ["Buka Kerahasiaan & akses, tab F01 · Permohonan, lalu Buat F01.", "Isi kategori informasi, jenis permohonan, izin yang diminta, tujuan, dan tanggal mulai serta akhir.", "Kategori Rahasia wajib menunjuk dokumen atau objek tertentu.", "Simpan. Pengajuan belum memberi akses sampai diputuskan pejabat lalu dilaksanakan admin teknis.", "Selama belum diputuskan, Anda bisa menarik pengajuan dari halaman detailnya."], note: "Tanggal akses harus berada di dalam masa penugasan Anda, dan Anda tidak bisa menyetujui permohonan sendiri." },
      { title: "Menyatakan konflik kepentingan", href: "/portal/kebijakan", steps: ["Buka Kerahasiaan & akses, tab F02 · Register & review.", "Pada bagian Konflik kepentingan, pilih periode dan dokumen terkait, lalu tulis alasan singkat.", "Kalau objeknya tidak dipilih, konflik berlaku untuk seluruh periode dan ikut menutup akses kerja Anda."], note: "Hanya peninjau lain yang dapat mengakhiri konflik." },
      { title: "Mengerjakan tugas", href: "/portal/tugas", steps: ["Buka Tugas, pilih tugas yang menjadi tanggung jawab Anda.", "Mulai kerjakan, lalu ajukan hasilnya untuk diperiksa.", "Kalau diminta revisi, perbaiki dan ajukan lagi. Tugas selesai setelah disetujui pemeriksa lain."] },
      { title: "Mengikuti rapat", href: "/portal/rapat", steps: ["Buka Rapat dan pilih rapat yang mengundang Anda.", "Tekan tombol konfirmasi hadir. Catatan boleh dikosongkan.", "Saat voting dibuka dan kehadiran Anda sudah tercatat, pilih Setuju, Tolak, atau Abstain. Pilihan tidak bisa diubah."], note: "Rapat Internal bisa dibuka undangan atau pemegang izin rapat. Rapat Terbatas dan Rahasia memerlukan izin sekaligus undangan." },
      { title: "Mengunggah dokumen", href: "/portal/dokumen", steps: ["Buka Dokumen, pilih periode, lalu pilih Dokumen baru.", "Pilih kategori: Internal, Terbatas, atau Rahasia. Pilih berkas PDF, gambar, TXT, atau Office maksimal 4 MB.", "Berkas Anda selalu tampil di daftar Anda. Pengurus lain mengikuti kategori dan izin mereka.", "Untuk memperbarui berkas, pilih Versi baru. Kategorinya mengikuti versi sebelumnya."], note: "Unduhan terbuka setelah berkas lolos pemeriksaan virus." },
      { title: "Memeriksa pemberitahuan", href: "/portal/notifikasi", steps: ["Buka Kotak masuk untuk melihat kabar tugas, rapat, dan pengingat.", "Tekan pemberitahuan untuk menuju pekerjaannya."] }
    ]
  },
  {
    key: "pejabat",
    title: "Ketua dan pejabat bermandat",
    who: "Pengurus yang punya mandat tertulis untuk memutuskan akses, meninjau, atau menyetujui. Kewenangan mengikuti isi mandat, bukan nama jabatan.",
    features: [
      { title: "Memutuskan permohonan akses", href: "/portal/kebijakan", steps: ["Buka Kerahasiaan & akses, tab F01 · Permohonan, lalu pilih pengajuan.", "Buka Catat keputusan, pilih mandat, dan tentukan disetujui, disetujui sebagian, atau ditolak.", "Kalau disetujui, pilih izin yang diberikan. Hanya izin yang diminta dan tercakup mandat yang tampil.", "Tulis hasil pemeriksaan, catatan, dan rujukan. Admin teknis lalu melaksanakan keputusan."], note: "Akses Rahasia hanya bisa disetujui pemegang kewenangan Menyetujui akses Rahasia." },
      { title: "Meninjau hak akses (F02)", href: "/portal/kebijakan", steps: ["Buka tab F02 · Register & review. Sistem menandai akses yang sudah waktunya ditinjau.", "Buka Catat peninjauan F02, isi temuan, tindak lanjut, PIC, dan target.", "Pengurus lain yang berwenang memverifikasi tindak lanjut itu."], note: "Tinjauan yang terlewat memunculkan pengingat. Akses tidak ditangguhkan otomatis." },
      { title: "Mencabut atau menangguhkan akses", href: "/portal/kebijakan", steps: ["Di tab F02, buka kartu akses orang tersebut.", "Pilih Ajukan pencabutan akses ini dan tulis alasannya. Pejabat lain memutuskan, lalu admin teknis melaksanakan.", "Untuk pengamanan segera, catat peninjauan dulu lalu pilih Penangguhan untuk pengamanan."], note: "Penangguhan bukan sanksi atau keputusan bersalah." },
      { title: "Menangani insiden kerahasiaan (F03–F04)", href: "/portal/kebijakan", steps: ["Buka tab F03–F04 · Insiden dan pilih laporan.", "Tetapkan PIC, lalu catat pengamanan, pemulihan, risiko tersisa, dan perbaikan.", "Pemberi persetujuan independen memutuskan pemberitahuan, pemulihan, dan penutupan."], note: "Penutupan teknis tidak menutup pemeriksaan personel oleh BPI." },
      { title: "Mengesahkan notulen rapat", href: "/portal/rapat", steps: ["Buka rapat yang berstatus Menunggu review.", "Isi catatan tindakan, lalu pilih Setujui notulen atau Minta revisi."], note: "Pembuat rapat dan penulis notulen tidak bisa mengesahkan sendiri." }
    ]
  },
  {
    key: "sekretaris",
    title: "Sekretaris dan pengelola rapat",
    who: "Pengurus yang mengelola rapat dan menerima pengaduan, sesuai izin dan penunjukan.",
    features: [
      { title: "Membuat rapat", href: "/portal/rapat", steps: ["Buka Rapat, isi judul, agenda, dan waktu mulai.", "Pilih kategori rapat dan centang peserta resmi, lalu simpan undangan."] },
      { title: "Menjalankan rapat sampai notulen", href: "/portal/rapat", steps: ["Isi catatan tindakan, lalu catat kehadiran setiap peserta.", "Kalau ada voting, tulis usulan, tentukan kuorum, buka voting, lalu tutup setelah selesai.", "Simpan notulen, lalu ajukan review ke pengurus lain.", "Setelah final, buat tugas tindak lanjut bila perlu, lalu arsipkan rapat."], note: "Voting hanya bisa diikuti peserta yang tercatat hadir." },
      { title: "Menerima pengaduan", href: "/portal/kasus", steps: ["Buka Kasus untuk melihat laporan yang masuk.", "Lakukan pemilahan awal, lalu tetapkan PIC dari personel yang memenuhi syarat."], note: "Kanal pengaduan publik hanya terbuka setelah pengaturan penerimaan siap." }
    ]
  },
  {
    key: "divisi",
    title: "Koordinator divisi dan PIC kasus",
    who: "Pengurus yang membagi pekerjaan divisi atau ditugaskan menangani kasus.",
    features: [
      { title: "Membagi dan memeriksa tugas", href: "/portal/tugas", steps: ["Buka Tugas, buat tugas dengan pelaksana, deskripsi, dan tenggat.", "Tambahkan subtugas atau prasyarat bila perlu.", "Saat hasil masuk, pemeriksa selain pembuat dan pelaksana memberi revisi atau persetujuan."] },
      { title: "Menangani kasus dan formulir", href: "/portal/kasus", steps: ["Buka Kasus. Hanya kasus tempat Anda ditugaskan yang tampil.", "Isi formulir 01–07 sesuai tahap, simpan, lalu ajukan untuk diperiksa.", "Catat bukti di register bukti, termasuk perpindahan lokasinya.", "Pisahkan catatan internal dari pembaruan publik."], note: "Formulir yang lengkap bukan pengesahan. Keputusan sanksi tetap oleh pihak berwenang." }
    ]
  },
  {
    key: "keuangan",
    title: "Bendahara dan petugas keuangan",
    who: "Pembuat, pemeriksa, dan pemberi persetujuan akhir harus orang yang berbeda.",
    features: [
      { title: "Menyusun anggaran dan transaksi", href: "/portal/keuangan", steps: ["Buka Keuangan, buat draf anggaran dengan mata uang dan batasnya.", "Buat transaksi dan lampirkan bukti yang sudah lolos pemeriksaan.", "Ajukan. Pemeriksa memverifikasi bukti, lalu pihak ketiga memberi persetujuan akhir."], note: "Sistem hanya mencatat. Tidak ada transfer uang atau konversi kurs otomatis." }
    ]
  },
  {
    key: "media",
    title: "Media dan Publikasi",
    who: "Penulis, pemeriksa, dan penerbit memakai izin yang berbeda.",
    features: [
      { title: "Menerbitkan tulisan", href: "/portal/editor", steps: ["Buka Redaksi, buat draf lalu ajukan.", "Pemeriksa mengecek sumber dan privasi, lalu meminta revisi atau menyetujui.", "Penerbit menerbitkan atau menjadwalkan tulisan yang sudah disetujui."], note: "Tulisan yang disetujui belum otomatis tampil di situs publik." },
      { title: "Mengelola rujukan", href: "/portal/knowledge", steps: ["Buka Rujukan, tulis judul, ringkasan, isi, dan sumber.", "Ajukan untuk diperiksa pengurus lain."] }
    ]
  },
  {
    key: "evaluasi",
    title: "Evaluator dan serah terima",
    who: "Pengurus yang menilai kinerja atau menyiapkan pergantian kepengurusan.",
    features: [
      { title: "Mengisi evaluasi", href: "/portal/evaluasi", steps: ["Buka Evaluasi. Penilaian individual memerlukan izin khusus lewat F01.", "Isi nilai dan bukti, lalu ajukan. Pemeriksa harus orang lain dan bukan yang dinilai."], note: "Orang yang dinilai boleh mengajukan satu keberatan setelah disetujui." },
      { title: "Menyiapkan serah terima", href: "/portal/handover", steps: ["Buka Serah terima, buat paket, tunjuk penerima, dan tambahkan dokumen.", "Penerima memeriksa tiap item, lalu menyelesaikan paket."], note: "Menutup paket tidak mencabut akses. Pengakhiran akses memakai F05 di Kerahasiaan & akses." }
    ]
  },
  {
    key: "admin",
    title: "Administrator teknis",
    who: "Mengelola konfigurasi dan akun. Peran ini tidak otomatis boleh membaca kasus, keuangan, atau dokumen rahasia.",
    features: [
      { title: "Menyiapkan pengurus", href: "/portal/pengaturan", steps: ["Buka Organisasi & periode, pilih periode.", "Pada Pengaturan, tambah divisi dan jabatan, lalu buat penugasan dengan rujukan keputusan.", "Isi Catatan tindakan sebelum menyimpan."], note: "Penugasan tidak otomatis memberi izin. Izin diberikan lewat F01. Jangan memakai unit bertanda data contoh." },
      { title: "Mencatat mandat pejabat", href: "/portal/pengaturan", steps: ["Pada Pengaturan, pilih Ajukan pencatatan mandat.", "Pilih pejabat, klasifikasi, kewenangan, masa berlaku, dan rujukan.", "Pengurus lain yang punya mandat pengelolaan menyetujuinya."], note: "Mandat pertama dicatat lewat skrip resmi karena belum ada penyetuju." },
      { title: "Melaksanakan keputusan akses", href: "/portal/kebijakan", steps: ["Buka pengajuan berstatus Disetujui.", "Pilih Laksanakan keputusan akses dan isi rujukan.", "Kalau keputusan tidak jadi berlaku, pilih Batalkan keputusan yang belum dilaksanakan."], note: "Anda tidak bisa melaksanakan permohonan Anda sendiri." },
      { title: "Memantau sistem", href: "/portal/operasi", steps: ["Buka Operasi & audit untuk melihat kesiapan layanan dan jejak tindakan."] }
    ]
  },
  {
    key: "super",
    title: "Super admin",
    who: "Akun yang disetujui untuk membaca seluruh data KPI. Aturan independensi tetap berlaku.",
    features: [
      { title: "Mengaktifkan dan menutup periode", href: "/portal/pengaturan", steps: ["Simpan periode baru di Organisasi & periode. Statusnya Direncanakan.", "Pastikan data contoh sudah dihapus dan tidak ada periode lain yang berjalan.", "Isi Rujukan keputusan resmi, lalu tekan Aktifkan periode.", "Di akhir kepengurusan, isi rujukan dan tekan Tutup periode."], note: "Hanya satu periode yang bisa berjalan dalam satu organisasi. Semua perubahan tercatat di audit." },
      { title: "Membaca periode yang tidak berjalan", href: "/portal/rapat", steps: ["Periode yang belum aktif atau sudah berakhir ditandai Baca saja pada pilihan periode.", "Di periode itu Anda bisa membaca, tapi tidak bisa membuat atau mengubah data."] }
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
