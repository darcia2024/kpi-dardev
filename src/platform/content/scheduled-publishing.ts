import { blockingFailures } from "@/lib/content-preflight";
import { publishChecksFor } from "@/platform/content/content-workflow";
import type { ContentRepository } from "@/platform/content/content-repository";
import { getLocalAssetRepository } from "@/platform/storage/asset-repository";

// Publishes approved content whose schedule has passed, re-running the blocking checks first.
// Production replaces this read-time trigger with the outbox + cron worker (ADR-005).
export async function publishDueContent(repository: ContentRepository, now = Date.now()): Promise<ContentRepository> {
  const assets = getLocalAssetRepository();
  const candidates = (await repository.listAll()).filter((record) => record.state === "APPROVED" && record.scheduledPublishAt && Date.parse(record.scheduledPublishAt) <= now);
  const allowed = new Set<string>();
  for (const record of candidates) {
    const checks = await publishChecksFor(repository, record, (assetId) => assets.getVisible(assetId, record.authorAccountId)?.status);
    if (!blockingFailures(checks).length) allowed.add(record.id);
  }
  await repository.publishDue(now, (record) => allowed.has(record.id));
  return repository;
}
