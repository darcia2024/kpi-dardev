import {z} from "zod";
import {createHostedAuthClient,resolveHostedAccess} from "@/platform/identity/hosted-auth";
import {errorResponse} from "@/platform/http/response";
import {getRequestId} from "@/platform/http/request-id";
import {hostedTaskScopeSchema} from "@/platform/work/hosted-task-contract";
import {hostedCaseActionSchema,hostedCaseSchema,hostedCaseSummarySchema} from "./hosted-case-contract";

export async function hostedCaseRequest(request:Request,id?:string):Promise<Response>{
 const requestId=getRequestId(request.headers.get("x-request-id"));
 try{
  const mutate=request.method==="POST";
  if(mutate&&request.headers.get("origin")!==new URL(request.url).origin)return errorResponse("AUTHORIZATION_DENIED",requestId,403);
  const client=await createHostedAuthClient();if(!client)return errorResponse("CONFIGURATION_INVALID",requestId,503);
  const {data,error}=await client.auth.getUser();if(error||!await resolveHostedAccess(client,data.user))return errorResponse("AUTHENTICATION_REQUIRED",requestId,401);
  let rpc:string,args:Record<string,unknown>;
  if(id){
   z.string().uuid().parse(id);
   if(mutate){
    if(Number(request.headers.get("content-length")||0)>12000)return errorResponse("WORK_INPUT_INVALID",requestId,413);
    const raw=await request.text();if(new TextEncoder().encode(raw).length>12000)return errorResponse("WORK_INPUT_INVALID",requestId,413);
    const input=hostedCaseActionSchema.parse(JSON.parse(raw));rpc="kpi_case_action";args={case_id:id,expected_version:input.expectedVersion,command:input.action,input};
   }else{rpc="kpi_case_detail";args={case_id:id};}
  }else{
   const url=new URL(request.url);const scope=hostedTaskScopeSchema.parse({organizationCode:url.searchParams.get("organizationCode"),periodCode:url.searchParams.get("periodCode"),divisionCode:null});
   rpc="kpi_cases_list";args={organization_code:scope.organizationCode,period_code:scope.periodCode};
  }
  const {data:item,error:failure}=await client.rpc(rpc,args);
  if(failure)return errorResponse(failure.code==="42501"?"AUTHORIZATION_DENIED":failure.code==="40001"?"WORK_VERSION_CONFLICT":failure.code==="22023"?"WORK_INPUT_INVALID":"CONFIGURATION_INVALID",requestId,failure.code==="42501"?403:failure.code==="40001"?409:failure.code==="22023"?400:503);
  return Response.json(id?{item:hostedCaseSchema.parse(item)}:{items:z.array(hostedCaseSummarySchema).parse(item)},{headers:{"Cache-Control":"private, no-store","x-request-id":requestId}});
 }catch(error){const invalid=error instanceof z.ZodError||error instanceof SyntaxError;return errorResponse(invalid?"WORK_INPUT_INVALID":"CONFIGURATION_INVALID",requestId,invalid?400:503);}
}
