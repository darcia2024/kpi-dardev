// Preview-only "Ketua" persona: final approver and evaluator, separate from the admin who manages finance.
// Kept dependency-free so both the permission catalog and the local grant store can import it.
export const ketuaScopedPermissions = ["WORKSPACE_READ", "TASK_READ", "TASK_REVIEW", "MEETING_READ", "FINANCE_READ", "FINANCE_APPROVE_FINAL", "EVALUATION_READ", "EVALUATION_WRITE", "NOTIFICATION_READ", "HANDOVER_READ", "HANDOVER_ACCEPT", "CONTENT_REVIEW", "ASSET_DOWNLOAD"] as const;
