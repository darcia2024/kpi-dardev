import { z } from "zod";

export const hostedTaskScopeSchema = z.object({ organizationCode: z.string().min(1).max(64), periodCode: z.string().min(1).max(64), divisionCode: z.string().min(1).max(64).nullable().default(null) });
export const hostedTaskCreateSchema = hostedTaskScopeSchema.extend({ title: z.string().trim().min(3).max(180), description: z.string().trim().max(4000), ownerAccountId: z.string().uuid(), idempotencyKey: z.string().uuid(), dueAt: z.string().datetime({ offset: true }).nullable().default(null) });
export const hostedTaskActionSchema = z.object({ expectedVersion: z.number().int().positive(), action: z.enum(["START", "SUBMIT", "APPROVE", "REQUEST_REVISION", "CANCEL"]), note: z.string().trim().min(3).max(2000) });
export const hostedTaskSchema = z.object({ id: z.string().uuid(), title: z.string(), description: z.string(), ownerAccountId: z.string().uuid(), ownerName: z.string(), createdByAccountId: z.string().uuid(), status: z.enum(["OPEN", "IN_PROGRESS", "IN_REVIEW", "REVISION", "DONE", "CANCELLED"]), dueAt: z.string().nullable(), version: z.number().int(), createdAt: z.string(), updatedAt: z.string(), divisionCode: z.string().nullable() });
export const hostedTaskDetailSchema = hostedTaskSchema.extend({ events: z.array(z.object({ id: z.string().uuid(), action: z.string(), note: z.string(), version: z.number(), createdAt: z.string(), actorName: z.string() })) });
export type HostedTask = z.infer<typeof hostedTaskSchema>;
export type HostedTaskDetail = z.infer<typeof hostedTaskDetailSchema>;
export type HostedTaskScope = z.infer<typeof hostedTaskScopeSchema>;
