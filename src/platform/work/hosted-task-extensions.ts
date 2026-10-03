import {z} from 'zod';
import {hostedTaskSchema} from './hosted-task-contract';
export const taskExtensionsSchema=z.object({parentTaskId:z.string().uuid().nullable(),subtasks:z.array(hostedTaskSchema),dependencies:z.array(hostedTaskSchema),blocked:z.boolean()});
export const taskPeopleSchema=z.array(z.object({accountId:z.string().uuid(),name:z.string()}));
export const taskTemplatesSchema=z.array(z.object({id:z.string().uuid(),title:z.string(),description:z.string()}));
const base={expectedVersion:z.number().int().positive(),note:z.string().trim().min(3).max(2000)};
export const taskExtensionCommand=z.discriminatedUnion('command',[
 z.object({...base,command:z.literal('DELEGATE'),ownerAccountId:z.string().uuid()}).strict(),
 z.object({...base,command:z.literal('DEADLINE'),dueAt:z.string().datetime({offset:true}).nullable()}).strict(),
 z.object({...base,command:z.literal('SUBTASK'),title:z.string().trim().min(3).max(180),description:z.string().trim().max(4000),ownerAccountId:z.string().uuid(),requestKey:z.string().uuid()}).strict(),
 z.object({...base,command:z.enum(['DEPENDENCY_ADD','DEPENDENCY_REMOVE']),prerequisiteId:z.string().uuid()}).strict(),
 z.object({...base,command:z.enum(['COMMENT','TEMPLATE'])}).strict()
]);
