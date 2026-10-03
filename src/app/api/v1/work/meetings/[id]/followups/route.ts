import {z} from 'zod';
import {createHostedAuthClient,resolveHostedAccess} from '@/platform/identity/hosted-auth';
import {errorResponse} from '@/platform/http/response';
import {getRequestId} from '@/platform/http/request-id';
import {hostedTaskSchema} from '@/platform/work/hosted-task-contract';
const command=z.object({expectedVersion:z.number().int().positive(),title:z.string().trim().min(3).max(180),description:z.string().trim().max(4000),dueAt:z.string().datetime({offset:true}).nullable(),requestKey:z.string().uuid(),note:z.string().trim().min(3).max(2000)}).strict();
async function handle(request:Request,{params}:{params:Promise<{id:string}>}){const requestId=getRequestId(request.headers.get('x-request-id'));try{
 const post=request.method==='POST';if(post&&request.headers.get('origin')!==new URL(request.url).origin)return errorResponse('AUTHORIZATION_DENIED',requestId,403);
 const client=await createHostedAuthClient();if(!client)return errorResponse('CONFIGURATION_INVALID',requestId,503);const {data:auth,error:failure}=await client.auth.getUser();if(failure||!await resolveHostedAccess(client,auth.user))return errorResponse('AUTHENTICATION_REQUIRED',requestId,401);const id=z.string().uuid().parse((await params).id);
 let args:Record<string,unknown>={meeting_id:id};if(post){if(Number(request.headers.get('content-length'))>16000)return errorResponse('WORK_INPUT_INVALID',requestId,413);const text=await request.text();if(new TextEncoder().encode(text).length>16000)return errorResponse('WORK_INPUT_INVALID',requestId,413);const input=command.parse(JSON.parse(text));args={...args,expected_version:input.expectedVersion,input};}
 const {data,error}=await client.rpc(post?'kpi_meeting_followup_create':'kpi_meeting_followups',args);if(error)return errorResponse(error.code==='42501'?'AUTHORIZATION_DENIED':error.code==='40001'?'WORK_VERSION_CONFLICT':error.code==='22023'?'WORK_INPUT_INVALID':'CONFIGURATION_INVALID',requestId,error.code==='42501'?403:error.code==='40001'?409:error.code==='22023'?400:503);
 return Response.json(post?{task:hostedTaskSchema.parse(data)}:{tasks:z.array(hostedTaskSchema).parse(data)},{headers:{'Cache-Control':'private, no-store'}});
}catch(e){return errorResponse(e instanceof z.ZodError||e instanceof SyntaxError?'WORK_INPUT_INVALID':'CONFIGURATION_INVALID',requestId,e instanceof z.ZodError||e instanceof SyntaxError?400:503);}}
export const GET=handle;export const POST=handle;
