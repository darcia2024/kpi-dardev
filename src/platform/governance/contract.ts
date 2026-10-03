import {z} from "zod";
import {permissions} from "@/platform/authorization/permission-catalog";
const uuid=z.string().uuid();
const note=z.string().trim().min(3).max(2000);
const reference=z.string().trim().min(3).max(500);
const date=z.string().datetime({offset:true});
const optionalText=z.string().trim().max(2000).default("");
const base={organizationId:uuid,periodId:uuid,divisionId:uuid.nullable().default(null),classification:z.enum(["INTERNAL","TERBATAS","RAHASIA"]).default("INTERNAL"),formReference:z.string().trim().min(3).max(150)};
export const createSchema=z.discriminatedUnion("kind",[
 z.object({kind:z.literal("ACCESS"),...base,requestType:z.enum(["GRANT","CHANGE","REVOKE","RESTORE"]),permissions:z.array(z.enum(permissions)).min(1).max(40).refine(v=>new Set(v).size===v.length),purpose:note,informationScope:note,mandateReference:reference,startsAt:date,expiresAt:date,objectId:uuid.nullable().default(null),targetDecisionId:uuid.nullable().default(null),endCondition:z.string().max(500).default("")}),
 z.object({kind:z.literal("INCIDENT"),...base,incidentType:z.enum(["MIS_SEND","LOST","UNAUTH_ACCESS","ACCOUNT_TAKEOVER","OTHER"]),description:z.string().trim().min(3).max(6000),system:z.string().max(500).default("Belum diketahui"),impact:optionalText,eventAt:date.nullable().default(null),discoveredAt:date.nullable().default(null),initialAction:optionalText,notifiedParties:z.string().max(500).default(""),contact:z.string().max(254).default(""),evidenceReference:z.string().max(500).default(""),unknownDetails:optionalText,affectedClassification:z.enum(["TERBUKA","INTERNAL","TERBATAS","RAHASIA","UNKNOWN"]).default("UNKNOWN"),personnelConcern:z.boolean().default(false)}),
 z.object({kind:z.literal("OFFBOARD"),...base,subjectAccountId:uuid,successorAccountId:uuid,verifierAccountId:uuid,effectiveAt:date,basis:note,function:z.string().min(3).max(200),revokeTechnical:z.boolean().default(false)}),
 z.object({kind:z.literal("CLASSIFICATION"),...base,mode:z.enum(["CLASSIFY","HOLD","RELEASE"]),objectId:uuid,newClassification:z.enum(["TERBUKA","INTERNAL","TERBATAS","RAHASIA"]),reason:note,basis:reference})
]);
const actionInputs={
 DECIDE:z.object({authorityId:uuid,outcome:z.enum(["APPROVED","PARTIAL","DENIED"]),approvedPermissions:z.array(z.enum(permissions)).max(40).default([]),needFinding:note,note,reference}),
 IMPLEMENT:z.object({reference,note:optionalText}),ASSIGN:z.object({handlerAccountId:uuid,note,reference}),ACTION:z.object({phase:z.enum(["SECURITY","RECOVERY","INVESTIGATION","MONITORING"]),note,reference,residualRisk:note}),
 CORRECTION:z.object({picAccountId:uuid,dueAt:date,note}),VERIFY_CORRECTION:z.object({entryId:uuid,reference}),REQUEST_RECOVERY:z.object({reviewerAccountId:uuid,reference,residualRisk:note}),
 NOTICE_DECISION:z.object({outcome:z.enum(["REQUIRED","NOT_REQUIRED","PENDING"]),note,reference}),APPROVE_RECOVERY:z.object({reference}),BPI_RESULT:z.object({reference}),CLOSE:z.object({reference,note:optionalText}),
 CHECK:z.object({check:z.enum(["basis","inventory","access","documents","responsibilities","accounts","evidence","copies","transition","confidentiality"]),checkStatus:z.enum(["DONE","PENDING","NA"]),note}),
 DETAIL:z.object({note,reference}),EXCEPTION:z.object({picAccountId:uuid,dueAt:date,note,reference}),TRANSITION:z.object({decisionIds:z.array(uuid).min(1).max(40),expiresAt:date,revokerAccountId:uuid,reference}),SUBMIT:z.object({}),RECEIVE:z.object({reference}),
 APPROVE:z.object({reference,note:optionalText}),VERIFY_EXCEPTION:z.object({entryId:uuid,reference}),DENY:z.object({reference,note})
};
export const workflowActionSchema=z.object({id:uuid,expectedVersion:z.number().int().positive(),action:z.enum(Object.keys(actionInputs) as [keyof typeof actionInputs,...(keyof typeof actionInputs)[]]),input:z.unknown()}).transform(v=>({...v,input:actionInputs[v.action].parse(v.input)}));
export const reviewSchema=z.discriminatedUnion("action",[
 z.object({action:z.literal("RECORD"),decisionId:uuid,trigger:z.enum(["PERIODIC","ASSIGNMENT_CHANGE","OFFBOARD","CONFLICT","INCIDENT"]),finding:note,followUp:note,picAccountId:uuid,dueAt:date}),
 z.object({action:z.literal("VERIFY"),reviewId:uuid,reference}),z.object({action:z.literal("SUSPEND"),reviewId:uuid,reference,finding:note})
]);
export const governanceRecordSchema=z.object({id:uuid,kind:z.enum(["ACCESS","INCIDENT","OFFBOARD","CLASSIFICATION"]),organizationId:uuid,periodId:uuid,divisionId:uuid.nullable(),creatorAccountId:uuid,handlerAccountId:uuid.nullable(),reviewerAccountId:uuid.nullable(),classification:z.string(),status:z.string(),version:z.number(),createdAt:z.string(),updatedAt:z.string(),canRead:z.boolean(),payload:z.record(z.string(),z.unknown()),events:z.array(z.object({id:uuid,action:z.string(),note:z.string(),reference:z.string().nullable(),actorAccountId:uuid,at:z.string(),version:z.number()}))});
export const governanceContextSchema=z.object({scopes:z.array(z.object({organizationId:uuid,organizationCode:z.string(),periodId:uuid,periodCode:z.string(),startsOn:z.string(),endsOn:z.string(),status:z.string()})),authorities:z.array(z.object({id:uuid,accountId:uuid,organizationId:uuid,periodId:uuid,divisionId:uuid.nullable(),permissions:z.array(z.string()),classifications:z.array(z.string()),mandateReference:z.string().nullable(),expiresAt:z.string()})),accounts:z.array(z.object({id:uuid,name:z.string()})),records:z.array(governanceRecordSchema),register:z.array(z.record(z.string(),z.unknown())),reviews:z.array(z.record(z.string(),z.unknown())),resources:z.array(z.object({id:uuid,organizationId:uuid,periodId:uuid,kind:z.string(),classification:z.string(),version:z.number(),held:z.boolean()}))});
export type GovernanceContext=z.infer<typeof governanceContextSchema>;
export type GovernanceRecord=z.infer<typeof governanceRecordSchema>;
