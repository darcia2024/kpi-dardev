import {z} from 'zod';
import {createHostedAuthClient,resolveHostedAccess} from '@/platform/identity/hosted-auth';
import {errorResponse} from '@/platform/http/response';
import {getRequestId} from '@/platform/http/request-id';
const scope=z.object({module:z.enum(['MEETING','CONTENT','CASE']),entityId:z.string().uuid()});
const mutation=scope.extend({command:z.enum(['ATTACH','REMOVE']),assetId:z.string().uuid(),expectedVersion:z.number().int().positive(),note:z.string().trim().min(3).max(2000)}).strict();
const attachmentList=z.array(z.object({id:z.string().uuid(),assetId:z.string().uuid(),name:z.string(),mimeType:z.string(),createdAt:z.string()}));
async function handle(request:Request){const requestId=getRequestId(request.headers.get('x-request-id'));try{
 const post=request.method==='POST';if(post&&request.headers.get('origin')!==new URL(request.url).origin)return errorResponse('AUTHORIZATION_DENIED',requestId,403);
 const client=await createHostedAuthClient();if(!client)return errorResponse('CONFIGURATION_INVALID',requestId,503);const {data:auth,error:failure}=await client.auth.getUser();if(failure||!await resolveHostedAccess(client,auth.user))return errorResponse('AUTHENTICATION_REQUIRED',requestId,401);
 let rpc:string,args:Record<string,unknown>;
 if(post){if(Number(request.headers.get('content-length'))>10000)return errorResponse('WORK_INPUT_INVALID',requestId,413);const text=await request.text();if(new TextEncoder().encode(text).length>10000)return errorResponse('WORK_INPUT_INVALID',requestId,413);const p=mutation.parse(JSON.parse(text));rpc='kpi_module_attachment_action';args={module:p.module,entity_id:p.entityId,command:p.command,asset_id:p.assetId,expected_version:p.expectedVersion,note:p.note};}
 else{const q=new URL(request.url).searchParams,p=scope.parse({module:q.get('module'),entityId:q.get('entityId')});rpc='kpi_module_attachments';args={module:p.module,entity_id:p.entityId};}
 const {data,error}=await client.rpc(rpc,args);if(error)return errorResponse(error.code==='42501'?'AUTHORIZATION_DENIED':error.code==='40001'?'WORK_VERSION_CONFLICT':error.code==='22023'?'WORK_INPUT_INVALID':'CONFIGURATION_INVALID',requestId,error.code==='42501'?403:error.code==='40001'?409:error.code==='22023'?400:503);
 return Response.json(post?z.object({version:z.number().int(),attachments:attachmentList}).parse(data):{attachments:attachmentList.parse(data)},{headers:{'Cache-Control':'private, no-store'}});
}catch(e){return errorResponse(e instanceof z.ZodError||e instanceof SyntaxError?'WORK_INPUT_INVALID':'CONFIGURATION_INVALID',requestId,e instanceof z.ZodError||e instanceof SyntaxError?400:503);}}
export const GET=handle;export const POST=handle;
