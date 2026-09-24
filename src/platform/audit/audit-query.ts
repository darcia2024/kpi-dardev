import type { BusinessAuditRecord } from "@/platform/audit/local-business-audit-service";

export type AuditQuery = { module?: string; actor?: string; entity?: string; limit: number };

export function queryBusinessAudit(events: BusinessAuditRecord[], query: AuditQuery): BusinessAuditRecord[] {
  return events.filter((event) =>
    (!query.module || event.module === query.module)
    && (!query.actor || event.actorAccountId === query.actor)
    && (!query.entity || event.entityId === query.entity)
  ).slice(-query.limit).reverse();
}
