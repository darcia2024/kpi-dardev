import {z} from 'zod';
import {createHostedAuthClient,resolveHostedAccess} from '@/platform/identity/hosted-auth';
import {errorResponse} from '@/platform/http/response';
import {getRequestId} from '@/platform/http/request-id';
import {taskExtensionCommand,taskExtensionsSchema,taskPeopleSchema} from '@/platform/work/hosted-task-extensions';
import {hostedTaskSchema} from '@/platform/work/hosted-task-contract';
type Context={params:Promise<{id:string}>};
async function handle(request:Request,context:Context){
 const requestId=getRequestId(request.headers.get('x-request-id'));
 try{
  const mutate=request.method==='POST';
  if(mutate&&request.headers.get('origin')!==new URL(request.url).origin)return errorResponse('AUTHORIZATION_DENIED',requestId,403);
  const client=await createHostedAuthClient();if(!client)return errorResponse('CONFIGURATION_INVALID',requestId,503);
  const {data:auth,error:failure}=await client.auth.getUser();if(failure||!await resolveHostedAccess(client,auth.user))return errorResponse('AUTHENTICATION_REQUIRED',requestId,401);
  const id=z.string().uuid().parse((await context.params).id);let rpc:string,args:Record<string,unknown>;
  if(mutate){if(Number(request.headers.get('content-length'))>16000)return errorResponse('TASK_INPUT_INVALID',requestId,413);const raw=await request.text();if(new TextEncoder().encode(raw).length>16000)return errorResponse('TASK_INPUT_INVALID',requestId,413);const input=taskExtensionCommand.parse(JSON.parse(raw));rpc='kpi_task_extend';args={task_id:id,expected_version:input.expectedVersion,command:input.command,input};}
  else{rpc=new URL(request.url).searchParams.get('people')==='1'?'kpi_task_people':'kpi_task_extensions';args={task_id:id};}
  const {data,error}=await client.rpc(rpc,args);if(error)return errorResponse(error.code==='42501'?'AUTHORIZATION_DENIED':error.code==='40001'?'TASK_VERSION_CONFLICT':error.code==='22023'?'TASK_INPUT_INVALID':'CONFIGURATION_INVALID',requestId,error.code==='42501'?403:error.code==='40001'?409:error.code==='22023'?400:503);
  const result=mutate?{task:hostedTaskSchema.parse(data)}:rpc==='kpi_task_people'?{people:taskPeopleSchema.parse(data)}:{extensions:taskExtensionsSchema.parse(data)};
  return Response.json(result,{headers:{'Cache-Control':'private, no-store','x-request-id':requestId}});
 }catch(e){return errorResponse(e instanceof z.ZodError||e instanceof SyntaxError?'TASK_INPUT_INVALID':'CONFIGURATION_INVALID',requestId,e instanceof z.ZodError||e instanceof SyntaxError?400:503);}
}
export const GET=handle;
export const POST=handle;
