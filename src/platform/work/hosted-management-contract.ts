import {z} from 'zod';
export const managementKind=z.enum(['BUDGET','FINANCE','EVALUATION','HANDOVER','AI_DRAFT','RECOVERY_CHECK']);
export type ManagementKind=z.infer<typeof managementKind>;
export const managementScope=z.object({organizationCode:z.string().min(1).max(100),periodCode:z.string().min(1).max(100),divisionCode:z.string().max(100).nullable().default(null)});
export const managementRecord=z.object({id:z.uuid(),kind:managementKind,organizationCode:z.string(),periodCode:z.string(),divisionCode:z.string().nullable(),title:z.string(),status:z.string(),version:z.number().int(),creatorAccountId:z.uuid(),subjectAccountId:z.uuid().nullable(),reviewerAccountId:z.uuid().nullable(),payload:z.record(z.string(),z.unknown()),updatedAt:z.string(),events:z.array(z.object({id:z.uuid(),action:z.string(),note:z.string(),actorAccountId:z.uuid(),at:z.string(),version:z.number()}))});
export type ManagementRecord=z.infer<typeof managementRecord>;
export const managementRequest=z.discriminatedUnion('operation',[
 managementScope.extend({operation:z.literal('RESERVE'),kind:z.enum(['EVALUATION','AI_DRAFT'])}),
 managementScope.extend({operation:z.literal('CREATE'),kind:managementKind,idempotencyKey:z.uuid(),input:z.record(z.string(),z.unknown())}),
 z.object({operation:z.literal('ACTION'),id:z.uuid(),expectedVersion:z.number().int().positive(),action:z.enum(['SAVE','SUBMIT','CHECK','APPROVE','REQUEST_REVISION','REJECT','RECORD_PAYMENT','RECONCILE','APPEAL','ADD_ITEM','ACCEPT_ITEM','CLOSE']),input:z.record(z.string(),z.unknown())}),
 z.object({operation:z.literal('COMMIT'),id:z.uuid(),expectedVersion:z.number().int().positive(),note:z.string().trim().min(3).max(2000)})
]);
