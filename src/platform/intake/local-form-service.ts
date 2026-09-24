import { randomUUID } from "node:crypto";
import { LocalBusinessAuditService } from "@/platform/audit/local-business-audit-service";
import { getLocalRecordDatabase, PersistentRecords, type LocalRecordDatabase, type RecordCollection } from "@/platform/data/local-record-store";

export type FormField = { key: string; label: string; type: "text" | "email" | "textarea"; required: boolean };
export type FormDraft = { id: string; code: string; title: string; consentText: string; fields: FormField[]; version: number; status: "DRAFT"; authorAccountId: string; organizationCode: string; periodCode: string; updatedAt: string };
export type FormValidation = { valid: boolean; errors: Record<string, string> };

export class LocalFormService {
  private readonly records: RecordCollection<FormDraft>;
  private readonly audit: LocalBusinessAuditService;
  constructor(database?: LocalRecordDatabase) {
    this.records = database ? new PersistentRecords(database, "service-forms", []) : new Map();
    this.audit = new LocalBusinessAuditService(database);
  }
  list(organizationCode: string, periodCode: string): FormDraft[] {
    return Array.from(this.records.values()).filter((record) => record.organizationCode === organizationCode && record.periodCode === periodCode).map(clone).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
  get(id: string): FormDraft | null { const record = this.records.get(id); return record ? clone(record) : null; }
  save(input: Pick<FormDraft, "code" | "title" | "consentText" | "fields" | "authorAccountId" | "organizationCode" | "periodCode"> & { id?: string; expectedVersion?: number }): FormDraft | null {
    if (!validFields(input.fields) || input.title.trim().length < 3 || input.title.length > 180 || input.consentText.trim().length < 20 || input.consentText.length > 1000) return null;
    const existing = input.id ? this.records.get(input.id) : undefined;
    if (input.id && (!existing || existing.authorAccountId !== input.authorAccountId || existing.version !== input.expectedVersion || existing.status !== "DRAFT" || existing.organizationCode !== input.organizationCode || existing.periodCode !== input.periodCode)) return null;
    if (this.list(input.organizationCode, input.periodCode).some((form) => form.code === input.code && form.id !== existing?.id)) return null;
    const record: FormDraft = { id: existing?.id ?? randomUUID(), code: input.code, title: input.title, consentText: input.consentText, fields: input.fields.map((field) => ({ ...field })), version: (existing?.version ?? 0) + 1, status: "DRAFT", authorAccountId: input.authorAccountId, organizationCode: input.organizationCode, periodCode: input.periodCode, updatedAt: new Date().toISOString() };
    this.records.set(record.id, record);
    this.audit.record({ action: existing ? "SERVICE_FORM_REVISED" : "SERVICE_FORM_DRAFTED", module: "service_form", entityType: "form", entityId: record.id, actorAccountId: input.authorAccountId, result: "SUCCESS", requestId: `local:${record.id}`, metadata: { version: record.version, fieldCount: record.fields.length } });
    return clone(record);
  }
  validatePreview(id: string, values: Record<string, string>, consent: boolean): FormValidation | null {
    const form = this.records.get(id);
    if (!form) return null;
    const errors: Record<string, string> = {};
    if (!consent) errors.consent = "Persetujuan pemrosesan data diperlukan.";
    const allowed = new Set(form.fields.map((field) => field.key));
    for (const key of Object.keys(values)) if (!allowed.has(key)) errors[key] = "Kolom tidak dikenal.";
    for (const field of form.fields) {
      const value = values[field.key]?.trim() ?? "";
      if (field.required && !value) errors[field.key] = "Wajib diisi.";
      else if (value.length > (field.type === "textarea" ? 2000 : 240)) errors[field.key] = "Isian terlalu panjang.";
      else if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors[field.key] = "Alamat email tidak valid.";
    }
    return { valid: Object.keys(errors).length === 0, errors };
  }
  listAudit(entityId?: string) { return this.audit.list(entityId); }
}

function validFields(fields: FormField[]): boolean { return fields.length > 0 && fields.length <= 12 && new Set(fields.map((field) => field.key)).size === fields.length && fields.every((field) => /^[a-z][a-z0-9_]{1,39}$/.test(field.key) && field.label.trim().length >= 2 && field.label.length <= 120 && ["text", "email", "textarea"].includes(field.type)); }
function clone(form: FormDraft): FormDraft { return { ...form, fields: form.fields.map((field) => ({ ...field })) }; }
export function getLocalFormService(): LocalFormService { return new LocalFormService(getLocalRecordDatabase()); }
