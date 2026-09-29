import type { Permission } from "@/platform/authorization/permissions";

export type ScreenState = "planned" | "partial" | "connected";
export type InternalScreen = {
  id: string;
  title: string;
  group: string;
  phase: string;
  route: string;
  permission: Permission | null;
  api: string[];
  acceptance: string;
  state: ScreenState;
};

type ScreenDefinition = readonly [title: string, acceptance: string];
type GroupDefinition = {
  code: string;
  label: string;
  phase: string;
  route: string;
  permission: Permission | null;
  api: string[];
  screens: ScreenDefinition[];
  connected?: number[];
  partial?: number[];
};

const groups: GroupDefinition[] = [
  {
    code: "A", label: "Akun & akses", phase: "E02/E10", route: "/portal/akses", permission: "IDENTITY_READ", api: ["/api/v1/admin/authorization", "/api/v1/admin/identity", "/api/v1/admin/directory", "/api/v1/admin/holds", "/api/v1/admin/backup"], connected: [1, 2, 3, 4, 5, 6, 10, 11, 13], partial: [7, 8, 9, 12, 14, 15, 16],
    screens: [
      ["Masuk", "Akun pratinjau yang sah membuka tantangan verifikasi; kegagalan tidak membuat sesi."],
      ["Verifikasi MFA", "Kode sah membuka sesi; kode salah dan kedaluwarsa ditolak."],
      ["Sesi dan keluar", "Sesi kedaluwarsa atau dicabut tidak dapat membuka API portal."],
      ["Profil akun saya", "Akun dapat membaca profilnya tanpa melihat data akun lain."],
      ["Preferensi akun", "Preferensi tampilan tersimpan dan berlaku setelah reload."],
      ["Daftar akun", "Daftar hanya menampilkan akun dalam scope pengelola."],
      ["Detail akun", "Role, status, dan perubahan akun dapat ditelusuri."],
      ["Organisasi dan jabatan", "Membership mengikuti organisasi, divisi, jabatan, dan periode."],
      ["Periode dan penugasan", "Periode aktif terlihat dan data lintas periode tidak tercampur."],
      ["Matriks permission", "Hak aksi dan scope dapat diperiksa sebelum grant diubah."],
      ["Grant akses", "Grant, expiry, dan pencabutan berlaku pada API setelah reload."],
      ["Konfigurasi sistem", "Hanya pengelola berizin dapat melihat konfigurasi teredaksi."],
      ["Audit aktivitas", "Aktor, aksi, objek, hasil, dan waktu dapat ditelusuri tanpa secret."],
      ["Retensi dan legal hold", "Retensi dan hold mencegah tindakan yang bertentangan dengan kebijakan."],
      ["Backup dan restore", "Hasil backup serta restore drill dapat dibuktikan."],
      ["Kesehatan integrasi", "Status dependensi dan kegagalan tampil tanpa membocorkan kredensial."]
    ]
  },
  {
    code: "W", label: "Workspace", phase: "E05", route: "/portal/workspace", permission: "WORKSPACE_READ", api: ["/api/v1/portal/context", "/api/v1/portal/feed", "/api/v1/tasks", "/api/v1/meetings", "/api/v1/documents"], connected: [1, 2, 3, 4, 5],
    screens: [
      ["Beranda kerja personal", "Pekerjaan dan konteks yang tampil sesuai akun serta periode."],
      ["Action Required", "Antrean tindakan menaut ke objek dan hanya memuat aksi berizin."],
      ["Aktivitas kerja", "Linimasa berasal dari kejadian tersimpan, bukan data contoh statis."],
      ["Pencarian lintas objek", "Hasil hanya mencakup objek yang dapat dibaca akun."],
      ["Ringkasan tim", "Ringkasan periode memakai sumber data yang sama dengan daftar detail."]
    ]
  },
  {
    code: "T", label: "Tugas", phase: "E05", route: "/portal/tugas", permission: "TASK_READ", api: ["/api/v1/tasks", "/api/v1/tasks/action", "/api/v1/tasks/templates", "/api/v1/portal/activity"], connected: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    screens: [
      ["Daftar tugas", "Filter dan jumlah tugas sesuai hasil API serta scope akun."],
      ["Detail tugas", "Progres, status, pemilik, dan bukti tetap sama setelah reload."],
      ["Buat tugas", "Tugas baru tervalidasi, tersimpan, dan langsung muncul pada daftar."],
      ["Tugas saya dan review", "Antrean memisahkan tugas milik akun dari keputusan reviewer."],
      ["Ajukan selesai", "Pemilik hanya dapat mengajukan dengan bukti tersedia dan dependency selesai."],
      ["Keputusan review", "Reviewer terpisah menerima atau mengembalikan dengan histori keputusan."],
      ["Perpanjangan tenggat", "Perubahan tenggat memerlukan alasan dan tercatat dalam histori."],
      ["Delegasi dan dependency", "Delegasi serta prasyarat mengubah izin dan kelayakan submit."],
      ["Template tugas", "Tugas hasil template menyimpan asal dan versi template."],
      ["Workload dan overdue", "Jumlah dan daftar overdue memakai tanggal serta zona waktu yang sama."],
      ["Pembatalan dan arsip", "Tugas tertutup tidak menerima mutasi biasa dan tetap dapat diaudit."]
    ]
  },
  {
    code: "M", label: "Rapat", phase: "E06", route: "/portal/rapat", permission: "MEETING_READ", api: ["/api/v1/meetings", "/api/v1/meetings/action", "/api/v1/portal/activity"], connected: [1, 2, 3, 4, 5, 6, 7],
    screens: [
      ["Kalender rapat", "Agenda tampil pada tanggal dan zona waktu yang tepat."],
      ["Daftar dan detail rapat", "Rapat berizin dapat dibuka dengan peserta dan status terbaru."],
      ["Agenda dan RSVP", "Undangan serta respons peserta tersimpan dan dapat diperbarui sesuai aturan."],
      ["Notulen", "Draf dapat direvisi; final terkunci dengan nomor versi."],
      ["Voting", "Hanya peserta sah dapat memilih sekali per putaran."],
      ["Keputusan dan tindak lanjut", "Tugas turunan menaut ke keputusan dan notulen final."],
      ["Arsip rapat", "Rapat selesai dapat dicari tanpa dapat diubah sembarangan."]
    ]
  },
  {
    code: "F", label: "Dokumen", phase: "E03", route: "/portal/dokumen", permission: "ASSET_DOWNLOAD", api: ["/api/v1/documents", "/api/v1/documents/upload", "/api/v1/documents/file", "/api/v1/documents/access", "/api/v1/portal/activity"], connected: [1], partial: [2, 3, 4, 5, 6],
    screens: [
      ["Pustaka dokumen", "Daftar dan filter hanya menampilkan metadata yang berizin."],
      ["Unggah dan pemeriksaan", "Byte tersimpan privat dan hanya tersedia setelah scanner nyata lulus."],
      ["Detail dan versi", "Versi baru tidak menggantikan versi aktif sebelum layak digunakan."],
      ["Preview dan unduh", "Akses sumber dicek ulang saat membuka atau mengunduh file."],
      ["Berbagi dan pencabutan", "Penerima, expiry, dan revoke segera mengubah akses."],
      ["Audit dan arsip", "Akses file, retensi, dan hold tercatat dengan benar."]
    ]
  },
  {
    code: "K", label: "Knowledge", phase: "E09", route: "/portal/knowledge", permission: "KNOWLEDGE_READ", api: ["/api/v1/knowledge", "/api/v1/knowledge/action", "/api/v1/portal/activity"], partial: [1, 2, 3, 4],
    screens: [
      ["Daftar knowledge", "Daftar SOP, FAQ, dan brief hanya memuat sumber yang dapat diakses."],
      ["Artikel dan sitasi", "Sitasi mengarah ke versi sumber yang benar dan dapat dibuka."],
      ["Editor knowledge", "Penulis dan reviewer mengikuti workflow sebelum publikasi."],
      ["Versi dan arsip", "Perubahan dan pencabutan sumber tercermin pada hasil pencarian."]
    ]
  },
  {
    code: "C", label: "Redaksi/CMS", phase: "E04", route: "/portal/editor", permission: "CONTENT_REVIEW", api: ["/api/v1/editor/publications", "/api/v1/editor/publications/update", "/api/v1/editor/publications/transition", "/api/v1/editor/publications/media", "/api/v1/portal/activity"], connected: [1, 2, 3, 4, 6, 7], partial: [5],
    screens: [
      ["Daftar konten", "Status dan antrean konten sesuai API dan izin editorial."],
      ["Editor draf", "Draf dapat dibuat, diedit, dan divalidasi per bahasa."],
      ["Review konten", "Reviewer berbeda dapat meminta revisi dengan alasan tercatat."],
      ["Approval dan publish", "Hanya konten approved yang tampil pada situs publik."],
      ["Aset media", "Media terhubung ke aset berizin dan versi konten."],
      ["Preview ID/EN", "Preview sesuai bahasa dan tidak membuka draf secara publik."],
      ["Riwayat dan arsip", "Transisi serta versi konten dapat ditelusuri dan diarsip."]
    ]
  },
  {
    code: "S", label: "Layanan & kasus", phase: "E07", route: "/portal/kasus", permission: "ASPIRATION_TRIAGE", api: ["/api/v1/cases", "/api/v1/cases/detail", "/api/v1/cases/triage", "/api/v1/cases/action", "/api/v1/cases/communications", "/api/v1/cases/forms"], connected: [1, 2, 4], partial: [3, 5, 6, 7, 8, 9],
    screens: [
      ["Kotak masuk kasus", "Antrean hanya memuat kasus dalam scope petugas."],
      ["Detail kasus", "Status dan linimasa sesuai catatan backend."],
      ["Triage kasus", "Urgensi, owner, dan alasan keputusan tersimpan."],
      ["Update dan catatan internal", "Pelapor hanya melihat update publik, bukan catatan internal."],
      ["Pengumuman", "Target penerima dan isi disetujui sebelum dikirim."],
      ["Komunikasi terarah", "Pesan hanya mencapai penerima berizin dan tercatat."],
      ["Form layanan", "Form berversi memvalidasi input dan consent."],
      ["Status dan SLA", "Perubahan status serta tenggat mengikuti kebijakan yang aktif."],
      ["Tutup dan buka kembali", "Alasan dan aktor keputusan dapat ditelusuri."]
    ]
  },
  {
    code: "N", label: "Notifikasi", phase: "E07", route: "/portal/notifikasi", permission: "NOTIFICATION_READ", api: ["/api/v1/notifications/inbox", "/api/v1/notifications/settings", "/api/v1/notifications"], connected: [1], partial: [2, 3, 4],
    screens: [
      ["Kotak notifikasi", "Penerima hanya melihat notifikasi miliknya."],
      ["Preferensi kanal", "Preferensi tersimpan tanpa melewati pesan wajib."],
      ["Template notifikasi", "Template berversi menjaga isi sensitif dan bahasa."],
      ["Monitor pengiriman", "Antrean, retry, gagal, dan terkirim mengikuti hasil provider nyata."]
    ]
  },
  {
    code: "B", label: "Keuangan", phase: "E08", route: "/portal/keuangan", permission: "FINANCE_READ", api: ["/api/v1/finance", "/api/v1/finance/action", "/api/v1/finance/events", "/api/v1/finance/budget"], connected: [4, 5, 6, 7, 8, 9], partial: [1, 2, 3],
    screens: [
      ["Ringkasan anggaran", "Nilai merujuk anggaran dan periode resmi yang berversi."],
      ["Pos anggaran", "Sisa dan revisi pos dapat ditelusuri ke transaksi."],
      ["Pengajuan dan klaim", "Jenis pengajuan, nominal, mata uang, dan pemohon tervalidasi."],
      ["Detail transaksi", "Status, bukti, aktor, dan tanggal tetap konsisten setelah reload."],
      ["Antrean approval", "Reviewer hanya melihat transaksi yang dapat diputuskan."],
      ["Keputusan approval", "Requester tidak menyetujui sendiri dan alasan tersimpan."],
      ["Pembayaran", "Hanya transaksi approved dapat ditandai dibayar oleh aktor sah."],
      ["Rekonsiliasi", "Rekonsiliasi mengikat bukti dan pemeriksa yang berbeda."],
      ["Ledger dan audit", "Setiap perubahan state menghasilkan jejak yang dapat diperiksa."]
    ]
  },
  {
    code: "E", label: "Evaluasi", phase: "E09", route: "/portal/evaluasi", permission: "EVALUATION_READ", api: ["/api/v1/evaluations", "/api/v1/evaluations/review", "/api/v1/evaluations/appeals", "/api/v1/evaluations/revisions"], connected: [1, 3, 5, 6, 7], partial: [2, 4, 8],
    screens: [
      ["Ringkasan evaluasi", "Ringkasan mengambil nilai dan status dari record berizin."],
      ["Subjek dan indikator", "Daftar terikat periode, evaluator, dan versi indikator."],
      ["Detail capaian", "Bukti dan nilai dapat ditelusuri tanpa menyamakan kosong dengan nol."],
      ["Input nilai", "Nilai, bukti, dan komentar tervalidasi sebelum diajukan."],
      ["Review evaluator", "Evaluator berbeda memberi keputusan dan alasan."],
      ["Koreksi dan formula", "Revisi menyimpan nilai sebelum/sesudah dan versi formula."],
      ["Sanggah", "Subjek mengajukan satu sanggah terbuka yang diselesaikan reviewer sah."],
      ["Riwayat dan laporan", "Laporan hanya memakai nilai final dengan asal data jelas."]
    ]
  },
  {
    code: "H", label: "Handover", phase: "E10", route: "/portal/handover", permission: "HANDOVER_READ", api: ["/api/v1/handover", "/api/v1/handover/accept", "/api/v1/handover/access-plan", "/api/v1/handover/checklist", "/api/v1/portal/activity"], connected: [1, 2, 3, 5], partial: [4, 6],
    screens: [
      ["Daftar paket handover", "Paket berizin dan statusnya dimuat dari backend."],
      ["Detail item", "Sumber, owner lama, penerus, dan outstanding terlihat."],
      ["Penerimaan penerus", "Hanya penerus yang ditunjuk dapat menerima sumber yang dapat diakses."],
      ["Peralihan akses", "Grant berpindah sesuai keputusan dan dicabut sesuai kebijakan."],
      ["Checklist operasi", "Runbook serta outstanding memiliki owner dan tanggal tindak lanjut."],
      ["Arsip handover", "Paket final tetap dapat ditelusuri tanpa mutasi tak sah."]
    ]
  },
  {
    code: "I", label: "AI terkendali", phase: "E11", route: "/portal/ai", permission: "AI_READ", api: ["/api/v1/ai/ask", "/api/v1/ai/actions", "/api/v1/ai/governance"], partial: [1, 2, 3, 4, 5, 6],
    screens: [
      ["Tanya jawab berizin", "Jawaban menolak klaim tanpa sumber dan tidak membocorkan objek terlarang."],
      ["Sitasi sumber", "Sitasi dicek ulang saat dibuka dan hilang setelah akses dicabut."],
      ["Histori dan feedback", "Riwayat mengikuti kebijakan retensi dan dapat dikoreksi."],
      ["Registry provider", "Model, prompt, versi, dan status provider disetujui sebelum aktif."],
      ["Kebijakan AI", "Kelas data, retensi, dan wilayah pemrosesan ditegakkan."],
      ["Konfirmasi tindakan", "Usulan berversi dan kedaluwarsa perlu persetujuan manusia sebelum eksekusi."]
    ]
  }
];

export const internalGroups = groups.map(({ code, label, phase, route }) => ({ code, label, phase, route }));

export const internalScreens: InternalScreen[] = groups.flatMap((group) => group.screens.map(([title, acceptance], index) => {
  const number = index + 1;
  const state: ScreenState = group.connected?.includes(number) ? "connected" : group.partial?.includes(number) ? "partial" : "planned";
  return {
    id: `${group.code}${String(number).padStart(2, "0")}`,
    title,
    group: group.label,
    phase: group.phase,
    route: group.code === "A" && number <= 2 ? "/masuk" : group.code === "A" && number <= 5 ? "/portal/profil" : group.code === "A" && number >= 12 ? "/portal/operasi" : group.route,
    permission: group.code === "A" && number <= 5 ? null : group.code === "A" && number >= 12 ? "SYSTEM_CONFIGURATION_READ" : group.permission,
    api: state === "planned" ? [] : group.code === "A" && number <= 3 ? ["/api/v1/auth/sign-in", "/api/v1/auth/verify-mfa", "/api/v1/auth/logout"] : group.code === "A" && number <= 5 ? ["/api/v1/auth/session"] : group.code === "A" && number >= 12 ? ["/api/v1/admin/operations"] : group.api,
    acceptance,
    state
  };
}));

export const internalScreenTotals = {
  total: internalScreens.length,
  connected: internalScreens.filter((screen) => screen.state === "connected").length,
  partial: internalScreens.filter((screen) => screen.state === "partial").length,
  planned: internalScreens.filter((screen) => screen.state === "planned").length
};
