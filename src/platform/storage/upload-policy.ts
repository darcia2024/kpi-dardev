export type UploadCandidate = {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
};

export type UploadPolicy = {
  maxBytes: number;
  allowedMimeTypes: readonly string[] | null;
};

export type UploadDecision = { allowed: true } | { allowed: false; reason: "POLICY_REQUIRED" | "FILE_TOO_LARGE" | "TYPE_NOT_ALLOWED" | "UNSAFE_EXTENSION" };

const unsafeExtensions = [".bat", ".cmd", ".com", ".exe", ".js", ".msi", ".ps1", ".sh"];

export function evaluateUpload(candidate: UploadCandidate, policy: UploadPolicy): UploadDecision {
  if (!policy.allowedMimeTypes || policy.allowedMimeTypes.length === 0) return { allowed: false, reason: "POLICY_REQUIRED" };
  if (candidate.sizeBytes <= 0 || candidate.sizeBytes > policy.maxBytes) return { allowed: false, reason: "FILE_TOO_LARGE" };
  if (unsafeExtensions.some((extension) => candidate.fileName.toLowerCase().endsWith(extension))) return { allowed: false, reason: "UNSAFE_EXTENSION" };
  if (!policy.allowedMimeTypes.includes(candidate.mimeType)) return { allowed: false, reason: "TYPE_NOT_ALLOWED" };
  return { allowed: true };
}
