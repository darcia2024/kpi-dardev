export type ContentState = "DRAFT" | "IN_REVIEW" | "CHANGES_REQUESTED" | "APPROVED" | "PUBLISHED" | "ARCHIVED";

const transitions: Record<ContentState, readonly ContentState[]> = {
  DRAFT: ["IN_REVIEW", "ARCHIVED"],
  IN_REVIEW: ["CHANGES_REQUESTED", "APPROVED"],
  CHANGES_REQUESTED: ["DRAFT", "ARCHIVED"],
  APPROVED: ["PUBLISHED", "DRAFT", "ARCHIVED"],
  PUBLISHED: ["ARCHIVED"],
  ARCHIVED: []
};

export function canTransitionContent(from: ContentState, to: ContentState): boolean {
  return transitions[from].includes(to);
}

export function canApproveContent(input: { authorAccountId: string; reviewerAccountId: string; hasReviewPermission: boolean }): boolean {
  return input.hasReviewPermission && input.authorAccountId !== input.reviewerAccountId;
}
