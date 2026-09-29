import { hasTestPermission } from "@/platform/authorization/permissions";
import type { TestIdentity } from "@/platform/identity/test-auth";
import { canApproveContent, canTransitionContent, type ContentState } from "@/platform/workflow/content-lifecycle";
import type { ContentRecord, ContentRepository } from "@/platform/content/content-repository";

export type ContentWorkflowResult =
  | { ok: true; record: ContentRecord }
  | { ok: false; reason: "NOT_FOUND" | "INVALID_TRANSITION" | "AUTHORIZATION_DENIED" | "SELF_REVIEW_DENIED" };

export async function transitionContent(input: {
  repository: ContentRepository;
  contentId: string;
  targetState: ContentState;
  actor: TestIdentity;
  reason?: string;
}): Promise<ContentWorkflowResult> {
  const record = await input.repository.getById(input.contentId);
  if (!record) return { ok: false, reason: "NOT_FOUND" };
  if (!canTransitionContent(record.state, input.targetState)) return { ok: false, reason: "INVALID_TRANSITION" };
  if (input.targetState === "IN_REVIEW" && (!record.body || record.body.trim().length < 30)) return { ok: false, reason: "INVALID_TRANSITION" };
  if (["CHANGES_REQUESTED", "ARCHIVED"].includes(input.targetState) && !input.reason?.trim()) return { ok: false, reason: "INVALID_TRANSITION" };

  const scope = { organizationCode: record.organizationCode, periodCode: record.periodCode };
  if (input.targetState === "DRAFT" || input.targetState === "IN_REVIEW" || input.targetState === "ARCHIVED") {
    if (!hasTestPermission(input.actor, "CONTENT_DRAFT_WRITE", scope)) return { ok: false, reason: "AUTHORIZATION_DENIED" };
  }
  if (input.targetState === "APPROVED" || input.targetState === "CHANGES_REQUESTED") {
    if (!hasTestPermission(input.actor, "CONTENT_REVIEW", scope)) return { ok: false, reason: "AUTHORIZATION_DENIED" };
    if (!canApproveContent({ authorAccountId: record.authorAccountId, reviewerAccountId: input.actor.accountId, hasReviewPermission: true })) return { ok: false, reason: "SELF_REVIEW_DENIED" };
  }
  if (input.targetState === "PUBLISHED" && !hasTestPermission(input.actor, "CONTENT_PUBLISH", scope)) return { ok: false, reason: "AUTHORIZATION_DENIED" };

  const updated = await input.repository.setState(record.id, input.targetState, input.actor.accountId, input.reason);
  return updated ? { ok: true, record: updated } : { ok: false, reason: "NOT_FOUND" };
}
