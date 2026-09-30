// Kanban rules for the task board (T01). Cards may only move to a legal stage, and
// "Menunggu diperiksa" can never be skipped. The server enforces the same rules per action.

export type BoardColumn = "todo" | "doing" | "review" | "done";
export type BoardTask = { status: "IN_PROGRESS" | "BLOCKED" | "IN_REVIEW" | "ACCEPTED" | "ARCHIVED"; ownerAccountId: string; submittedByAccountId?: string; startedAt?: string; progress: number; subtasks?: { done: boolean }[] };
export type MoveContext = { accountId: string; canSubmit: boolean; canReview: boolean; dependenciesAccepted: boolean };
export type MoveIntent =
  | { ok: true; action: "START" | "ACCEPT" }
  | { ok: true; action: "SUBMIT"; needs: "evidence" }
  | { ok: true; action: "RETURN"; needs: "reason" }
  | { ok: false; reason: string };

export const boardColumns: Array<{ id: BoardColumn; label: string }> = [
  { id: "todo", label: "Belum dikerjakan" },
  { id: "doing", label: "Sedang dikerjakan" },
  { id: "review", label: "Menunggu diperiksa" },
  { id: "done", label: "Selesai" }
];

const order: Record<BoardColumn, number> = { todo: 0, doing: 1, review: 2, done: 3 };

// Older tasks have no startedAt; any progress or a blocked state also counts as started.
export function boardColumn(task: BoardTask): BoardColumn | null {
  if (task.status === "ARCHIVED") return null;
  if (task.status === "ACCEPTED") return "done";
  if (task.status === "IN_REVIEW") return "review";
  if (task.status === "BLOCKED" || task.startedAt || task.progress > 0) return "doing";
  return "todo";
}

export function moveIntent(task: BoardTask, target: BoardColumn, context: MoveContext): MoveIntent {
  const from = boardColumn(task);
  if (!from) return { ok: false, reason: "Tugas yang diarsipkan tidak dapat dipindahkan." };
  if (from === target) return { ok: false, reason: "Kartu sudah berada di tahap ini." };
  const owner = task.ownerAccountId === context.accountId;
  const reviewer = context.canReview && !owner && task.submittedByAccountId !== context.accountId;
  if (from === "todo" && target === "doing") return owner && context.canSubmit ? { ok: true, action: "START" } : { ok: false, reason: "Hanya pemilik tugas yang dapat mulai mengerjakannya." };
  if (from === "doing" && target === "review") {
    if (!owner || !context.canSubmit) return { ok: false, reason: "Hanya pemilik tugas yang dapat mengajukan hasil untuk diperiksa." };
    if (task.status === "BLOCKED") return { ok: false, reason: "Tugas sedang terhambat. Lanjutkan dulu sebelum mengajukan." };
    if (task.subtasks?.some((subtask) => !subtask.done)) return { ok: false, reason: "Selesaikan semua sub-tugas sebelum mengajukan." };
    if (!context.dependenciesAccepted) return { ok: false, reason: "Prasyarat harus diterima sebelum tugas diajukan." };
    return { ok: true, action: "SUBMIT", needs: "evidence" };
  }
  if (from === "review" && target === "done") return reviewer ? { ok: true, action: "ACCEPT" } : { ok: false, reason: "Hanya pemeriksa selain pemilik yang dapat menerima hasil." };
  if (from === "review" && target === "doing") return reviewer ? { ok: true, action: "RETURN", needs: "reason" } : { ok: false, reason: "Hanya pemeriksa yang dapat mengembalikan tugas." };
  if (order[target] > order[from]) return { ok: false, reason: "Tahap tidak bisa dilompati. Tugas harus melewati \"Menunggu diperiksa\"." };
  return { ok: false, reason: "Tugas tidak dapat dikembalikan ke tahap ini." };
}
