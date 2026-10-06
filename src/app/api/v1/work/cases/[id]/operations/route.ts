import {z} from "zod";
import {createHostedAuthClient,resolveHostedAccess} from "@/platform/identity/hosted-auth";
import {errorResponse} from "@/platform/http/response";
import {getRequestId} from "@/platform/http/request-id";
import {caseOperationInputSchema,caseOperationsSchema} from "@/platform/intake/case-operations-contract";
type Context={params:Promise<{id:string}>};
async function handle(request:Request,context:Context):Promise<Response>{
 const requestId=getRequestId(request.headers.get("x-request-id"));
 try{
  const {id}=await context.params;z.string().uuid().parse(id);const mutate=request.method==='POST';
  if(mutate&&request.headers.get('origin')!==new URL(request.url).origin)return errorResponse('AUTHORIZATION_DENIED',requestId,403);
  const client=await createHostedAuthClient();if(!client)return errorResponse('CONFIGURATION_INVALID',requestId,503);
  const {data,error}=await client.auth.getUser();if(error||!await resolveHostedAccess(client,data.user))return errorResponse('AUTHENTICATION_REQUIRED',requestId,401);
  let args:Record<string,unknown>={case_id:id};if(mutate){const raw=await request.text();if(new TextEncoder().encode(raw).length>22000)return errorResponse('WORK_INPUT_INVALID',requestId,413);args.input=caseOperationInputSchema.parse(JSON.parse(raw));}
  const {data:result,error:failure}=await client.rpc(mutate?'kpi_case_operation':'kpi_case_operations',args);
  if(failure){const status=failure.code==='42501'?403:failure.code==='40001'?409:failure.code==='22023'?400:503;return errorResponse(status===403?'AUTHORIZATION_DENIED':status===409?'WORK_VERSION_CONFLICT':status===400?'WORK_INPUT_INVALID':'CONFIGURATION_INVALID',requestId,status);}
  return Response.json({item:caseOperationsSchema.parse(result)},{headers:{'Cache-Control':'private, no-store'}});
 }catch(e){const invalid=e instanceof z.ZodError||e instanceof SyntaxError;return errorResponse(invalid?'WORK_INPUT_INVALID':'CONFIGURATION_INVALID',requestId,invalid?400:503);}
}
export const GET=handle;export const POST=handle;
