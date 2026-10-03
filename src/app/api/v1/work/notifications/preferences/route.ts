import {z} from 'zod';
import {createHostedAuthClient,resolveHostedAccess} from '@/platform/identity/hosted-auth';
import {errorResponse} from '@/platform/http/response';
import {getRequestId} from '@/platform/http/request-id';
const schema=z.object({emailEnabled:z.boolean(),whatsappEnabled:z.boolean(),whatsappNumber:z.string().regex(/^\+[1-9][0-9]{7,14}$/).nullable(),consentReference:z.string().max(500).nullable()}).strict();
async function handle(request:Request){const requestId=getRequestId(request.headers.get('x-request-id'));try{
 const post=request.method==='POST';if(post&&request.headers.get('origin')!==new URL(request.url).origin)return errorResponse('AUTHORIZATION_DENIED',requestId,403);const client=await createHostedAuthClient();if(!client)return errorResponse('CONFIGURATION_INVALID',requestId,503);const {data:auth,error:failure}=await client.auth.getUser();if(failure||!await resolveHostedAccess(client,auth.user))return errorResponse('AUTHENTICATION_REQUIRED',requestId,401);
 let input=null;if(post){if(Number(request.headers.get('content-length'))>4000)return errorResponse('WORK_INPUT_INVALID',requestId,413);const raw=await request.text();if(new TextEncoder().encode(raw).length>4000)return errorResponse('WORK_INPUT_INVALID',requestId,413);input=schema.parse(JSON.parse(raw));}
 const {data,error}=await client.rpc('kpi_delivery_preferences',{input});if(error)return errorResponse(error.code==='42501'?'AUTHORIZATION_DENIED':'WORK_INPUT_INVALID',requestId,error.code==='42501'?403:400);
 return Response.json({preferences:schema.parse(data)},{headers:{'Cache-Control':'private, no-store'}});
}catch(e){return errorResponse(e instanceof z.ZodError||e instanceof SyntaxError?'WORK_INPUT_INVALID':'CONFIGURATION_INVALID',requestId,e instanceof z.ZodError||e instanceof SyntaxError?400:503);}}
export const GET=handle;export const POST=handle;
