export type AuditResult = "SUCCESS" | "FAILURE" | "DENIED";

export type AuditEvent = {
  action: string;
  module: string;
  entityType: string;
  entityId?: string;
  result: AuditResult;
  requestId: string;
  metadata?: Record<string, unknown>;
};

const sensitiveKeys = /authorization|cookie|password|secret|token|api.?key|service.?role.?key/i;

function sanitize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).filter(([key]) => !sensitiveKeys.test(key)).map(([key, item]) => [key, sanitize(item)]));
  }
  return value;
}

export function createAuditEvent(event: AuditEvent): AuditEvent {
  return { ...event, metadata: sanitize(event.metadata ?? {}) as Record<string, unknown> };
}
