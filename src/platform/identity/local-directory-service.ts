import { randomUUID } from "node:crypto";
import { getLocalRecordDatabase, PersistentRecords, type LocalRecordDatabase, type RecordCollection } from "@/platform/data/local-record-store";
import { LocalBusinessAuditService } from "@/platform/audit/local-business-audit-service";
import { testPeriods, type PeriodRecord } from "@/platform/data/organization-repository";
import { listTestIdentities } from "@/platform/identity/test-auth";
import type { DirectoryAssignment, DirectoryDivision, DirectoryPosition } from "@/platform/identity/directory-service";

const organizationCode = "KPI_TEST";

export class LocalDirectoryService {
  private readonly periods: RecordCollection<PeriodRecord>;
  private readonly positions: RecordCollection<DirectoryPosition>;
  private readonly divisions: RecordCollection<DirectoryDivision>;
  private readonly assignments: RecordCollection<DirectoryAssignment>;
  private readonly audit: LocalBusinessAuditService;

  constructor(database?: LocalRecordDatabase) {
    this.periods = database ? new PersistentRecords(database, "directory-periods", testPeriods.map((period) => [period.id, period])) : new Map(testPeriods.map((period) => [period.id, { ...period }]));
    this.positions = database ? new PersistentRecords(database, "directory-positions", []) : new Map();
    this.divisions = database ? new PersistentRecords(database, "directory-divisions", []) : new Map();
    this.assignments = database ? new PersistentRecords(database, "directory-assignments", []) : new Map();
    this.audit = new LocalBusinessAuditService(database);
  }

  listPeriods(): PeriodRecord[] { return Array.from(this.periods.values(), (period) => ({ ...period })).sort((a, b) => b.startsOn.localeCompare(a.startsOn)); }
  listPositions(): DirectoryPosition[] { return Array.from(this.positions.values(), (position) => ({ ...position })).sort((a, b) => a.name.localeCompare(b.name)); }
  listDivisions(): DirectoryDivision[] { return Array.from(this.divisions.values(), (division) => ({ ...division })).sort((a, b) => a.name.localeCompare(b.name)); }
  listAssignments(): DirectoryAssignment[] { return Array.from(this.assignments.values(), (assignment) => ({ ...assignment })).sort((a, b) => b.startsOn.localeCompare(a.startsOn)); }
  accountHistory(accountId: string) {
    if (!listTestIdentities().some((account) => account.accountId === accountId)) return null;
    const assignmentIds = new Set(this.listAssignments().filter((assignment) => assignment.accountId === accountId).map((assignment) => assignment.id));
    return this.audit.list().filter((event) => assignmentIds.has(event.entityId ?? "") || event.metadata?.accountId === accountId);
  }

  createPeriod(input: { code: string; startsOn: string; endsOn: string; actorAccountId: string }): PeriodRecord | null {
    const code = input.code.trim().toUpperCase();
    if (!/^[A-Z0-9_]{3,40}$/.test(code) || input.startsOn >= input.endsOn || this.listPeriods().some((period) => period.code === code)) return null;
    const period: PeriodRecord = { id: randomUUID(), organizationId: testPeriods[0].organizationId, code, startsOn: input.startsOn, endsOn: input.endsOn, status: "PLANNED" };
    this.periods.set(period.id, period);
    this.audit.record({ action: "PERIOD_CREATED", module: "identity", entityType: "period", entityId: period.id, actorAccountId: input.actorAccountId, result: "SUCCESS", requestId: `local:${period.id}`, metadata: { code, organizationCode } });
    return { ...period };
  }

  transitionPeriod(periodId: string, status: PeriodRecord["status"], actorAccountId: string): PeriodRecord | null {
    const period = this.periods.get(periodId);
    const transitions: Record<PeriodRecord["status"], PeriodRecord["status"] | null> = { PLANNED: "ACTIVE", ACTIVE: "CLOSING", CLOSING: "CLOSED", CLOSED: null };
    if (!period || transitions[period.status] !== status || status === "ACTIVE" && this.listPeriods().some((item) => item.id !== periodId && item.status === "ACTIVE")) return null;
    const updated = { ...period, status };
    this.periods.set(periodId, updated);
    this.audit.record({ action: "PERIOD_STATUS_CHANGED", module: "identity", entityType: "period", entityId: periodId, actorAccountId, result: "SUCCESS", requestId: `local:${periodId}`, metadata: { previousStatus: period.status, nextStatus: status } });
    return { ...updated };
  }

  createDivision(input: { code: string; name: string; actorAccountId: string }): DirectoryDivision | null {
    const code = input.code.trim().toUpperCase();
    const name = input.name.trim();
    if (!/^[A-Z0-9_]{2,40}$/.test(code) || name.length < 3 || name.length > 120 || this.listDivisions().some((division) => division.code === code)) return null;
    const division = { id: randomUUID(), code, name };
    this.divisions.set(division.id, division);
    this.audit.record({ action: "DIVISION_CREATED", module: "identity", entityType: "division", entityId: division.id, actorAccountId: input.actorAccountId, result: "SUCCESS", requestId: `local:${division.id}`, metadata: { code, organizationCode } });
    return { ...division };
  }

  createPosition(input: { code: string; name: string; divisionId?: string; actorAccountId: string }): DirectoryPosition | null {
    const code = input.code.trim().toUpperCase();
    const name = input.name.trim();
    if (!/^[A-Z0-9_]{2,40}$/.test(code) || name.length < 3 || name.length > 120 || this.listPositions().some((position) => position.code === code) || input.divisionId && !this.divisions.get(input.divisionId)) return null;
    const position = { id: randomUUID(), code, name, ...(input.divisionId ? { divisionId: input.divisionId } : {}) };
    this.positions.set(position.id, position);
    this.audit.record({ action: "POSITION_CREATED", module: "identity", entityType: "position", entityId: position.id, actorAccountId: input.actorAccountId, result: "SUCCESS", requestId: `local:${position.id}`, metadata: { code, organizationCode, divisionId: input.divisionId } });
    return { ...position };
  }

  assign(input: { accountId: string; positionId: string; periodId: string; startsOn: string; endsOn?: string; actorAccountId: string }): DirectoryAssignment | null {
    const period = this.periods.get(input.periodId);
    const position = this.positions.get(input.positionId);
    if (!listTestIdentities().some((account) => account.accountId === input.accountId) || !period || period.status === "CLOSED" || !position || input.startsOn < period.startsOn || input.startsOn > period.endsOn || input.endsOn && (input.endsOn < input.startsOn || input.endsOn > period.endsOn)) return null;
    const overlap = this.listAssignments().some((assignment) => assignment.accountId === input.accountId && assignment.positionId === input.positionId && assignment.periodId === input.periodId && input.startsOn <= (assignment.endsOn ?? period.endsOn) && assignment.startsOn <= (input.endsOn ?? period.endsOn));
    if (overlap) return null;
    const assignment = { id: randomUUID(), accountId: input.accountId, positionId: input.positionId, periodId: input.periodId, startsOn: input.startsOn, ...(input.endsOn ? { endsOn: input.endsOn } : {}) };
    this.assignments.set(assignment.id, assignment);
    this.audit.record({ action: "ASSIGNMENT_CREATED", module: "identity", entityType: "assignment", entityId: assignment.id, actorAccountId: input.actorAccountId, result: "SUCCESS", requestId: `local:${assignment.id}`, metadata: { positionId: input.positionId, periodId: input.periodId, accountId: input.accountId } });
    return { ...assignment };
  }

  endAssignment(id: string, endsOn: string, actorAccountId: string): DirectoryAssignment | null {
    const assignment = this.assignments.get(id);
    const period = assignment ? this.periods.get(assignment.periodId) : null;
    if (!assignment || !period || assignment.endsOn || endsOn < assignment.startsOn || endsOn > period.endsOn) return null;
    const updated = { ...assignment, endsOn };
    this.assignments.set(id, updated);
    this.audit.record({ action: "ASSIGNMENT_ENDED", module: "identity", entityType: "assignment", entityId: id, actorAccountId, result: "SUCCESS", requestId: `local:${id}`, metadata: { endsOn } });
    return { ...updated };
  }
}

export function getLocalDirectoryService(): LocalDirectoryService { return new LocalDirectoryService(getLocalRecordDatabase()); }
