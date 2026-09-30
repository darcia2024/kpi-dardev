// Permission sets for the preview personas. Kept dependency-free so both the
// permission catalog and the local grant store can import them.

// Preview-only "Ketua" persona: final approver and evaluator, separate from the admin who manages finance.
export const ketuaScopedPermissions = ["WORKSPACE_READ", "TASK_READ", "TASK_REVIEW", "MEETING_READ", "FINANCE_READ", "FINANCE_APPROVE_FINAL", "EVALUATION_READ", "EVALUATION_WRITE", "NOTIFICATION_READ", "HANDOVER_READ", "HANDOVER_ACCEPT", "CONTENT_REVIEW", "ASSET_DOWNLOAD"] as const;

// Admin Sistem: system-wide identity and configuration, plus organization/period-scoped work permissions.
export const adminUnrestrictedPermissions = ["SYSTEM_CONFIGURATION_READ", "IDENTITY_READ", "IDENTITY_MANAGE"] as const;
export const adminScopedPermissions = ["WORKSPACE_READ", "CONTENT_DRAFT_WRITE", "CONTENT_PUBLISH", "ASSET_UPLOAD", "ASSET_DOWNLOAD", "ASPIRATION_TRIAGE", "NOTIFICATION_READ", "TASK_READ", "TASK_CREATE", "TASK_REVIEW", "MEETING_READ", "MEETING_MANAGE", "FINANCE_READ", "FINANCE_MANAGE", "EVALUATION_READ", "EVALUATION_WRITE", "KNOWLEDGE_READ", "KNOWLEDGE_WRITE", "HANDOVER_READ", "HANDOVER_ACCEPT", "AI_READ", "AI_ACTION_CONFIRM"] as const;

// Pengurus: organization/period-scoped work permissions.
export const pengurusScopedPermissions = ["WORKSPACE_READ", "TASK_READ", "TASK_SUBMIT", "NOTIFICATION_READ", "NOTIFICATION_TEMPLATE_REVIEW", "MEETING_READ", "FINANCE_READ", "EVALUATION_READ", "KNOWLEDGE_READ", "KNOWLEDGE_REVIEW", "HANDOVER_READ", "HANDOVER_ACCEPT", "AI_READ", "CONTENT_REVIEW", "ASSET_DOWNLOAD"] as const;
