import { z } from "zod";
import { hostedTaskScopeSchema } from "@/platform/work/hosted-task-contract";
export const contentKindSchema=z.enum(["KNOWLEDGE","PUBLICATION"]);
export const contentFieldsSchema=z.object({title:z.string().trim().min(3).max(180),summary:z.string().trim().min(3).max(1000),body:z.string().trim().min(10).max(30000),source:z.string().trim().min(3).max(1000),locale:z.enum(["id","en"]),slug:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(150)}).strict();
export const contentCreateSchema=hostedTaskScopeSchema.extend({kind:contentKindSchema,fields:contentFieldsSchema,idempotencyKey:z.string().uuid()}).strict();
export const contentActionSchema=z.discriminatedUnion("action",[
 z.object({action:z.literal("SAVE"),expectedVersion:z.number().int().positive(),note:z.string().trim().min(3).max(2000),fields:contentFieldsSchema}).strict(),
 z.object({action:z.enum(["SUBMIT","APPROVE","REQUEST_REVISION","PUBLISH","WITHDRAW","ARCHIVE"]),privacyReviewed:z.boolean().optional(),expectedVersion:z.number().int().positive(),note:z.string().trim().min(3).max(2000)}).strict()
]);
export const hostedContentSchema=z.object({id:z.string().uuid(),kind:contentKindSchema,title:z.string(),summary:z.string(),body:z.string(),source:z.string(),locale:z.enum(["id","en"]),slug:z.string(),divisionCode:z.string().nullable(),authorAccountId:z.string().uuid(),reviewerAccountId:z.string().uuid().nullable(),status:z.enum(["DRAFT","IN_REVIEW","REVISION","APPROVED","PUBLISHED","ARCHIVED"]),version:z.number().int(),updatedAt:z.string(),publishedAt:z.string().nullable(),events:z.array(z.object({action:z.string(),note:z.string(),actorName:z.string(),version:z.number(),createdAt:z.string()}))});
export type HostedContent=z.infer<typeof hostedContentSchema>;
