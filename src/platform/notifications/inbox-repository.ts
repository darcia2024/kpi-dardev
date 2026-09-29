import { getLocalRecordDatabase, PersistentRecords, type LocalRecordDatabase, type RecordCollection } from "@/platform/data/local-record-store";

export type InboxReceipt = { id: string; recipientAccountId: string; noticeId: string; readAt: string };

export class LocalInboxRepository {
  private readonly receipts: RecordCollection<InboxReceipt>;

  constructor(database?: LocalRecordDatabase) {
    this.receipts = database ? new PersistentRecords(database, "inbox-receipts", []) : new Map();
  }

  get(recipientAccountId: string, noticeId: string): InboxReceipt | null {
    const receipt = this.receipts.get(`${recipientAccountId}:${noticeId}`);
    return receipt ? { ...receipt } : null;
  }

  markRead(recipientAccountId: string, noticeId: string, now = new Date()): InboxReceipt {
    const id = `${recipientAccountId}:${noticeId}`;
    const existing = this.receipts.get(id);
    if (existing) return { ...existing };
    const receipt = { id, recipientAccountId, noticeId, readAt: now.toISOString() };
    this.receipts.set(id, receipt);
    return { ...receipt };
  }
}

export function getLocalInboxRepository(): LocalInboxRepository {
  return new LocalInboxRepository(getLocalRecordDatabase());
}
