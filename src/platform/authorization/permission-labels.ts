// Display names only. Permission codes stay the values sent to the server.
export const permissionLabels: Record<string, string> = {
  SYSTEM_CONFIGURATION_READ: "Melihat konfigurasi sistem",
  IDENTITY_READ: "Melihat data pengurus dan akun",
  IDENTITY_MANAGE: "Mengelola pengurus dan akun",
  WORKSPACE_READ: "Membuka ruang kerja",
  TASK_READ: "Melihat tugas",
  TASK_CREATE: "Membuat tugas",
  TASK_SUBMIT: "Mengumpulkan hasil tugas",
  TASK_REVIEW: "Memeriksa hasil tugas",
  MEETING_READ: "Melihat rapat",
  MEETING_MANAGE: "Mengelola rapat dan notulen",
  FINANCE_READ: "Melihat keuangan",
  FINANCE_MANAGE: "Mengelola keuangan",
  FINANCE_APPROVE_FINAL: "Menyetujui keuangan tahap akhir",
  EVALUATION_READ: "Melihat evaluasi",
  EVALUATION_WRITE: "Menulis evaluasi",
  KNOWLEDGE_READ: "Melihat basis pengetahuan",
  KNOWLEDGE_WRITE: "Menulis basis pengetahuan",
  KNOWLEDGE_REVIEW: "Memeriksa basis pengetahuan",
  HANDOVER_READ: "Melihat serah terima",
  HANDOVER_ACCEPT: "Menerima serah terima",
  AI_READ: "Memakai asisten AI",
  AI_ACTION_CONFIRM: "Mengonfirmasi tindakan asisten AI",
  CONTENT_DRAFT_WRITE: "Menulis draf konten",
  CONTENT_REVIEW: "Memeriksa konten",
  CONTENT_PUBLISH: "Menerbitkan konten",
  ASSET_UPLOAD: "Mengunggah dokumen",
  ASSET_READ: "Melihat dokumen",
  ASSET_DOWNLOAD: "Mengunduh dokumen",
  ASPIRATION_TRIAGE: "Memilah aspirasi",
  CASE_READ: "Melihat kasus",
  CASE_MANAGE: "Menangani kasus",
  CASE_REVIEW: "Memeriksa kasus",
  NOTIFICATION_READ: "Melihat notifikasi",
  NOTIFICATION_TEMPLATE_REVIEW: "Memeriksa template notifikasi",
  SOP_ACCESS_REVIEW: "Meninjau hak akses",
  SOP_ACCESS_SUSPEND: "Menangguhkan hak akses",
  SOP_SECRET_APPROVE: "Menyetujui akses Rahasia",
  SOP_INCIDENT_HANDLE: "Menangani insiden",
  SOP_INCIDENT_APPROVE: "Menyetujui pemulihan insiden",
  SOP_BPI_REVIEW: "Menangani jalur BPI",
  SOP_OFFBOARD_MANAGE: "Mengelola serah terima",
  SOP_OFFBOARD_VERIFY: "Memverifikasi serah terima",
  SOP_TECHNICAL_OFFBOARD: "Mengakhiri mandat admin teknis",
  INFORMATION_CLASSIFY: "Menetapkan klasifikasi",
  INFORMATION_DECLASSIFY: "Menurunkan klasifikasi",
  INFORMATION_HOLD: "Melindungi bukti",
  INFORMATION_HOLD_RELEASE: "Melepas perlindungan bukti"
};

// Decision powers a mandate can carry on top of ordinary permissions. Same codes the database checks.
export const mandateCapabilities = ["SOP_ACCESS_REVIEW", "SOP_ACCESS_SUSPEND", "SOP_SECRET_APPROVE", "SOP_INCIDENT_HANDLE", "SOP_INCIDENT_APPROVE", "SOP_BPI_REVIEW", "SOP_OFFBOARD_MANAGE", "SOP_OFFBOARD_VERIFY", "SOP_TECHNICAL_OFFBOARD", "INFORMATION_CLASSIFY", "INFORMATION_DECLASSIFY", "INFORMATION_HOLD", "INFORMATION_HOLD_RELEASE"];

export function permissionLabel(code: string): string {
  return permissionLabels[code] ?? code.replaceAll("_", " ");
}
