// Seeds synthetic TEST data for UAT walkthroughs so portal pages are not empty.
// Runs only in local TEST mode and only once (a marker record prevents re-seeding).
// Usage: npm run seed:demo
import { getLocalRecordDatabase, PersistentRecords } from "@/platform/data/local-record-store";
import { getLocalAssetRepository } from "@/platform/storage/asset-repository";
import { getLocalPrivateBlobStore } from "@/platform/storage/local-private-blob-store";
import { getLocalTaskService } from "@/platform/work/task-service";
import { getLocalMeetingService } from "@/platform/work/meeting-service";
import { getLocalFinanceService } from "@/platform/governance/finance-service";
import { getLocalBudgetService } from "@/platform/governance/budget-service";
import { getLocalPerformanceSheetService } from "@/platform/governance/performance-sheet-service";
import { getLocalHandoverService } from "@/platform/governance/handover-service";
import { getLocalContentRepository } from "@/platform/content/content-repository";
import { transitionContent } from "@/platform/content/content-workflow";
import { isTestAuthEnabled, listTestIdentities } from "@/platform/identity/test-auth";

const admin = "00000000-0000-4000-8000-000000000101";
const pengurus = "00000000-0000-4000-8000-000000000102";
const ketua = "00000000-0000-4000-8000-000000000103";
const scope = { organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" };
const day = 86_400_000;
const inDays = (days: number, hour = 17) => { const date = new Date(Date.now() + days * day); date.setUTCHours(hour, 0, 0, 0); return date.toISOString(); };
const must = <T>(value: T | null | undefined, step: string): T => { if (value === null || value === undefined) throw new Error(`Seed step failed: ${step}`); return value; };

function pdfBytes(title: string): Uint8Array {
  const text = `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n4 0 obj<</Length 60>>stream\nBT /F1 18 Tf 60 780 Td (${title} - DATA CONTOH TEST) Tj ET\nendstream endobj\n5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n`;
  return new TextEncoder().encode(text);
}

async function main(): Promise<void> {
  if (!isTestAuthEnabled()) throw new Error("Seed hanya boleh dijalankan pada KPI_APP_ENV=local dengan KPI_TEST_AUTH_ENABLED=true.");
  if (!listTestIdentities().some((account) => account.accountId === ketua)) throw new Error("Akun ketua.test@kpi.local belum tersedia.");
  const database = getLocalRecordDatabase();
  const marker = new PersistentRecords<{ id: string; seededAt: string }>(database, "demo-seed", []);
  if (marker.get("uat-v1")) { console.log("Data contoh UAT sudah pernah dibuat. Tidak ada yang diubah."); return; }

  // Evidence files. No scanner exists locally, so the seed marks its own synthetic files as checked.
  const assets = getLocalAssetRepository();
  const blobs = getLocalPrivateBlobStore();
  async function evidence(fileName: string, documentKey: string, owner = pengurus) {
    const bytes = pdfBytes(fileName.replace(/_/g, " ").replace(/\.pdf$/, ""));
    const asset = await assets.register({ ...scope, fileName, mimeType: "application/pdf", sizeBytes: bytes.byteLength, documentKey, classification: "INTERNAL", ownerAccountId: owner });
    await assets.attachContent(asset.id, owner, await blobs.save(asset.id, bytes));
    await assets.completeScan(asset.id, "seed-demo");
    for (const reader of [admin, pengurus, ketua].filter((id) => id !== owner)) await assets.grantDownload(asset.id, reader, owner, inDays(180));
    return asset.id;
  }
  const report = await evidence("Laporan_Triwulan_Divisi_TEST.pdf", "laporan-triwulan-divisi-test");
  const minutesFile = await evidence("Notulen_Rapat_Pleno_TEST.pdf", "notulen-rapat-pleno-test");
  const quote = await evidence("Penawaran_Percetakan_TEST.pdf", "penawaran-percetakan-test");
  const receipt = await evidence("Kuitansi_Konsumsi_Rapat_TEST.pdf", "kuitansi-konsumsi-rapat-test");

  // Tasks spread across every board column.
  const tasks = getLocalTaskService();
  const task = (title: string, dueDays?: number) => tasks.create({ title: `${title} · TEST`, ...scope, ownerAccountId: pengurus, createdByAccountId: admin, ...(dueDays ? { dueAt: inDays(dueDays) } : {}) });
  task("Susun materi sosialisasi pencegahan", 9);
  task("Rancang poster edukasi interaksi", 12);
  const data = task("Kumpulkan data peserta webinar", 2);
  for (const title of ["Rekap formulir pendaftaran", "Cocokkan dengan daftar hadir", "Kirim ringkasan ke Sekretaris"]) tasks.addSubtask(data.id, admin, title);
  tasks.setSubtaskDone(data.id, pengurus, must(tasks.get(data.id)?.subtasks?.[0], "subtask").id, true);
  tasks.addComment(data.id, pengurus, "Formulir pendaftaran sudah terkumpul 42 peserta. Sisa pencocokan daftar hadir.");
  tasks.addComment(data.id, admin, "Baik, mohon selesaikan sebelum rapat evaluasi.");
  const press = task("Rilis pers buletin no. 4", 1);
  tasks.start(press.id, pengurus);
  tasks.setBlocked(press.id, pengurus, true, "Menunggu persetujuan naskah dari Media & Publikasi");
  const quarterly = task("Laporan triwulan divisi", 4);
  for (const title of ["Susun bab capaian", "Lampirkan grafik indikator", "Periksa ejaan"]) tasks.addSubtask(quarterly.id, admin, title);
  for (const subtask of must(tasks.get(quarterly.id)?.subtasks, "quarterly subtasks")) tasks.setSubtaskDone(quarterly.id, pengurus, subtask.id, true);
  must(tasks.submit(quarterly.id, pengurus, report, "Seluruh bab dan grafik indikator sudah direvisi sesuai notulen rapat."), "submit quarterly");
  const notes = task("Notulen rapat pleno bulan lalu", 3);
  tasks.start(notes.id, pengurus);
  must(tasks.submit(notes.id, pengurus, minutesFile), "submit notes");
  must(tasks.review(notes.id, admin, true), "accept notes");

  // Meetings: a finished plenary with a closed secret ballot, and an upcoming evaluation.
  const meetings = getLocalMeetingService();
  const plenary = meetings.create({ title: "Sidang Pleno Triwulan III KPI · TEST", ...scope, startsAt: inDays(1, 17), agenda: "Pengesahan SOP serah terima digital; evaluasi program triwulan.", participantAccountIds: [admin, pengurus, ketua], actorAccountId: admin });
  for (const accountId of [admin, pengurus, ketua]) meetings.recordAttendance(plenary.id, admin, accountId, "HADIR");
  meetings.setQuorum(plenary.id, admin, 2);
  const round = must(meetings.openMotion(plenary.id, admin, "Pengesahan SOP serah terima digital periode 2026/2027."), "open motion").motions!.at(-1)!.round;
  meetings.castVote({ meetingId: plenary.id, round, voterAccountId: admin, choice: "SETUJU" });
  meetings.castVote({ meetingId: plenary.id, round, voterAccountId: pengurus, choice: "SETUJU" });
  meetings.castVote({ meetingId: plenary.id, round, voterAccountId: ketua, choice: "ABSTAIN" });
  meetings.closeMotion(plenary.id, admin);
  meetings.reviseMinutes(plenary.id, "Rapat membahas pengesahan SOP serah terima digital. Mosi diterima. Sekretaris menerbitkan SK pengesahan; koordinator divisi melakukan sosialisasi.", admin);
  meetings.finalizeMinutes(plenary.id, admin);
  meetings.createFollowUp(plenary.id, tasks, admin, pengurus, "Sosialisasi SOP ke koordinator divisi · TEST");
  const upcoming = meetings.create({ title: "Rapat evaluasi bulanan divisi media · TEST", ...scope, startsAt: inDays(6, 16), agenda: "Evaluasi konten mingguan dan jadwal publikasi.", participantAccountIds: [admin, pengurus], actorAccountId: admin });
  meetings.respond(upcoming.id, pengurus, "HADIR");

  // Finance: approved budget, a chair threshold, and requests at every stage.
  const budgets = getLocalBudgetService();
  let plan = budgets.create({ ...scope, createdByAccountId: admin });
  for (const [name, amount] of [["Program kerja", 6_000_000], ["Publikasi & media", 2_500_000], ["Operasional", 1_500_000], ["Kegiatan insidental", 1_000_000]] as const) plan = must(budgets.addLine(plan.id, admin, plan.version, name, amount), `budget line ${name}`);
  plan = must(budgets.approve(plan.id, ketua, plan.version), "approve budget");
  const line = (name: string) => must(plan.lines.find((item) => item.name === name), name).id;
  const finance = getLocalFinanceService();
  finance.setFinalApprovalThreshold(scope.organizationCode, scope.periodCode, ketua, 500_000);
  const request = (title: string, amountMinor: number, lineName: string, file: string) => { const record = finance.create({ ...scope, title: `${title} · TEST`, currency: "TEST", amountMinor, budgetLineId: line(lineName), requesterAccountId: pengurus }); must(finance.submit(record.id, pengurus, file), `submit ${title}`); return record.id; };
  finance.approve(request("Cetak buletin edisi September", 750_000, "Publikasi & media", quote), admin, true);
  const meals = request("Konsumsi rapat pleno", 150_000, "Operasional", receipt);
  finance.approve(meals, admin, true);
  finance.markPaid(meals, admin);
  const room = request("Sewa ruang diskusi edukasi", 400_000, "Program kerja", receipt);
  finance.approve(room, admin, true);
  finance.markPaid(room, admin);
  finance.reconcile(room, admin);
  request("Transport kegiatan edukasi", 300_000, "Program kerja", receipt);

  // Performance: an active weighted scheme and some rubric scores.
  const sheets = getLocalPerformanceSheetService();
  const draft = must(sheets.createDraft(scope.organizationCode, scope.periodCode, admin), "scheme draft");
  for (const [name, weight] of [["Ketepatan waktu tugas", 30], ["Tugas selesai & diterima", 30], ["Kelengkapan bukti kerja", 25], ["Kehadiran rapat", 15]] as const) sheets.setIndicator(draft.id, admin, { name, weightPercent: weight });
  const scheme = must(sheets.activate(draft.id, admin), "activate scheme");
  const [timeliness, accepted, completeness, attendance] = scheme.indicators;
  sheets.assess({ ...scope, indicatorId: timeliness.id, subjectAccountId: pengurus, evaluatorAccountId: admin, score: 4, reason: "Sebagian besar tugas selesai sebelum tenggat.", evidenceAssetIds: [report] });
  sheets.assess({ ...scope, indicatorId: accepted.id, subjectAccountId: pengurus, evaluatorAccountId: admin, score: 3, reason: "Satu tugas perlu revisi sebelum diterima.", evidenceAssetIds: [minutesFile] });
  sheets.assess({ ...scope, indicatorId: completeness.id, subjectAccountId: pengurus, evaluatorAccountId: admin, score: 5, reason: "Setiap pengajuan disertai bukti yang lengkap.", evidenceAssetIds: [report] });
  sheets.assess({ ...scope, indicatorId: attendance.id, subjectAccountId: pengurus, evaluatorAccountId: admin, score: null, reason: "Presensi rapat periode ini belum lengkap.", evidenceAssetIds: [] });

  // Handover: a secretary package with items in every state.
  const handover = getLocalHandoverService();
  const bundle = must(handover.create({ ...scope, title: "Serah terima Sekretaris 2025/2026 ke 2026/2027 · TEST", outgoingOwnerAccountId: admin, successorAccountId: pengurus }), "handover package");
  const items = [["Arsip surat masuk & keluar", "142 berkas", true], ["Notulen rapat pleno", "18 dokumen", true], ["Daftar kontak mitra", "Buku alamat kelembagaan", false], ["Tugas yang masih berjalan", "6 tugas belum selesai", true], ["Akun dan hak akses", "Peralihan akses", true], ["Inventaris barang sekretariat", undefined, false]] as const;
  for (const [title, detail, mandatory] of items) handover.addItem(bundle.id, admin, { title, detail, mandatory });
  const ids = must(handover.get(bundle.id)?.items, "handover items").map((item) => item.id);
  for (const id of ids.slice(0, 4)) handover.markItemReady(bundle.id, admin, id);
  handover.reviewItem(bundle.id, pengurus, ids[0], "ACCEPT");
  handover.reviewItem(bundle.id, pengurus, ids[1], "ACCEPT");
  handover.reviewItem(bundle.id, pengurus, ids[3], "CLARIFY", "Siapa penanggung jawab dua tugas yang tenggatnya sudah lewat?");

  // Editorial: published ID + EN article, one in review, one draft.
  const content = getLocalContentRepository();
  const identities = Object.fromEntries(listTestIdentities().map((identity) => [identity.accountId, identity]));
  const draftContent = (slug: string, locale: "id" | "en", title: string, description: string, body: string, type = "Artikel") => content.createDraft({ ...scope, slug, locale, title, description, body, type, meta: "KPI pratinjau", href: "/publik/publikasi", accent: "red", authorAccountId: admin });
  const move = async (id: string, targetState: "IN_REVIEW" | "APPROVED" | "PUBLISHED", actor: string) => must((await transitionContent({ repository: content, contentId: id, targetState, actor: identities[actor] })).ok || null, `content ${targetState}`);
  const publish = async (id: string) => { await move(id, "IN_REVIEW", admin); await move(id, "APPROVED", pengurus); await move(id, "PUBLISHED", admin); };
  const idBody = "Bagi mahasiswa dan pelajar Indonesia di Mesir, kehidupan bersama berlangsung di ruang belajar, organisasi, dan pergaulan sehari-hari.\n\n## Apa peran KPI?\nKPI adalah **Badan Semi Otonom** PPMI Mesir yang berfokus pada persoalan *interaksi* Masisir.\n\n- Edukasi dan pencegahan\n- Pengawasan\n- Tindak lanjut sesuai kewenangan\n\n> Laporan bukanlah bukti bahwa seseorang bersalah.\n\n## Ketika ada persoalan interaksi\nSampaikan informasi dengan jelas melalui jalur resmi. Pelajari [layanan publik](/publik/layanan) sebelum menyampaikan aspirasi.";
  await publish((await draftContent("peran-kpi-bagi-masisir", "id", "Peran KPI bagi Masisir", "Mandat, prinsip kerja, dan jalur aman menyampaikan persoalan interaksi.", idBody, "Pedoman")).id);
  await publish((await draftContent("peran-kpi-bagi-masisir", "en", "The Role of KPI for Indonesian Students in Egypt", "Mandate, working principles, and safe channels to raise interaction concerns.", "Shared life among Indonesian students in Egypt happens in classrooms, organisations, and daily interactions.\n\n## What does KPI do?\nKPI is a **semi-autonomous body** of PPMI Egypt focusing on *interaction* issues.\n\n- Education and prevention\n- Oversight\n- Follow-up within its mandate\n\n> A report is not proof that someone is at fault.", "Pedoman")).id);
  await publish((await draftContent("menjaga-batas-dalam-berinteraksi", "id", "Menjaga Batas dalam Berinteraksi", "Lima kebiasaan sederhana untuk interaksi yang saling menghormati.", "Interaksi yang sehat dimulai dari kebiasaan kecil.\n\n## Lima kebiasaan\n1. Minta persetujuan sebelum membagikan foto orang lain.\n2. Dengarkan sebelum menyimpulkan.\n3. Hindari menyebarkan dugaan.\n4. Hormati batas pribadi.\n5. Gunakan jalur resmi ketika perlu bantuan.", "Edukasi")).id);
  const review = await draftContent("jadwal-kajian-oktober", "id", "Jadwal Kajian Interaksi Oktober", "Rangkaian kajian bulanan bersama divisi Pencegahan & Edukasi.", "Kajian bulan Oktober membahas etika bermedia sosial dan komunikasi lintas budaya di lingkungan kampus.", "Pengumuman");
  await move(review.id, "IN_REVIEW", admin);
  await draftContent("catatan-forum-dialog", "id", "Catatan Forum Dialog Masisir", "Ringkasan diskusi forum dialog bulan lalu.", "Forum dialog bulan lalu mempertemukan perwakilan kekeluargaan untuk membahas cara menjaga interaksi yang sehat.");

  marker.set("uat-v1", { id: "uat-v1", seededAt: new Date().toISOString() });
  console.log("Data contoh UAT selesai dibuat (semua bertanda TEST).");
}

main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
