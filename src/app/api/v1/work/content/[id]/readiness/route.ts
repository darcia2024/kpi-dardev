import {z} from 'zod';
import {createHostedAuthClient,resolveHostedAccess} from '@/platform/identity/hosted-auth';
import {errorResponse} from '@/platform/http/response';
import {getRequestId} from '@/platform/http/request-id';
const note=z.string().trim().min(3).max(2000),version=z.number().int().positive();
const command=z.discriminatedUnion('command',[
 z.object({command:z.literal('METADATA'),expectedVersion:version,note,category:z.enum(['PUBLICATION','NEWS','EVENT','ROSTER']),metadata:z.object({eventDate:z.string().date().optional(),location:z.string().max(200).optional(),position:z.string().max(180).optional(),periodLabel:z.string().max(100).optional(),consentReference:z.string().max(500).optional()}).strict()}).strict(),
 z.object({command:z.literal('SCHEDULE'),expectedVersion:version,publishAt:z.string().datetime({offset:true}).nullable()}).strict()
]);
async function handle(request:Request,{params}:{params:Promise<{id:string}>}){const requestId=getRequestId(request.headers.get('x-request-id'));try{
 const post=request.method==='POST';if(post&&request.headers.get('origin')!==new URL(request.url).origin)return errorResponse('AUTHORIZATION_DENIED',requestId,403);
 const client=await createHostedAuthClient();if(!client)return errorResponse('CONFIGURATION_INVALID',requestId,503);const {data:auth,error:failure}=await client.auth.getUser();if(failure||!await resolveHostedAccess(client,auth.user))return errorResponse('AUTHENTICATION_REQUIRED',requestId,401);const id=z.string().uuid().parse((await params).id);
 let rpc='kpi_content_preflight',args:Record<string,unknown>={item_id:id};if(post){if(Number(request.headers.get('content-length'))>12000)return errorResponse('WORK_INPUT_INVALID',requestId,413);const raw=await request.text();if(new TextEncoder().encode(raw).length>12000)return errorResponse('WORK_INPUT_INVALID',requestId,413);const input=command.parse(JSON.parse(raw));rpc=input.command==='METADATA'?'kpi_content_metadata':'kpi_content_schedule';args={item_id:id,expected_version:input.expectedVersion,...(input.command==='METADATA'?{input}:{publish_at:input.publishAt})};}
 const {data,error}=await client.rpc(rpc,args);if(error)return errorResponse(error.code==='42501'?'AUTHORIZATION_DENIED':error.code==='40001'?'WORK_VERSION_CONFLICT':error.code==='22023'?'WORK_INPUT_INVALID':'CONFIGURATION_INVALID',requestId,error.code==='42501'?403:error.code==='40001'?409:error.code==='22023'?400:503);
 return Response.json({data},{headers:{'Cache-Control':'private, no-store'}});
}catch(e){return errorResponse(e instanceof z.ZodError||e instanceof SyntaxError?'WORK_INPUT_INVALID':'CONFIGURATION_INVALID',requestId,e instanceof z.ZodError||e instanceof SyntaxError?400:503);}}
export const GET=handle;export const POST=handle;
