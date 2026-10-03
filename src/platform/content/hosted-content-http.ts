import { z } from "zod";
import { createHostedAuthClient, resolveHostedAccess } from "@/platform/identity/hosted-auth";
import { errorResponse } from "@/platform/http/response";
import { getRequestId } from "@/platform/http/request-id";
import { hostedTaskScopeSchema } from "@/platform/work/hosted-task-contract";
import { contentActionSchema,contentCreateSchema,contentKindSchema,hostedContentSchema } from "./hosted-content-contract";
export async function hostedContentRequest(request:Request,id?:string):Promise<Response>{
 const requestId=getRequestId(request.headers.get("x-request-id"));
 try{
  const mutate=request.method==="POST";
  if(mutate&&request.headers.get("origin")!==new URL(request.url).origin)return errorResponse("AUTHORIZATION_DENIED",requestId,403);
  const client=await createHostedAuthClient();if(!client)return errorResponse("CONFIGURATION_INVALID",requestId,503);
  const {data:auth,error}=await client.auth.getUser();if(error||!await resolveHostedAccess(client,auth.user))return errorResponse("AUTHENTICATION_REQUIRED",requestId,401);
  if(id)z.string().uuid().parse(id);
  let body:unknown;if(mutate){if(Number(request.headers.get("content-length")||0)>160000)return errorResponse("WORK_INPUT_INVALID",requestId,413);const raw=await request.text();if(new TextEncoder().encode(raw).length>160000)return errorResponse("WORK_INPUT_INVALID",requestId,413);body=JSON.parse(raw);}
  let rpc:string,args:Record<string,unknown>;
  if(id&&mutate){const input=contentActionSchema.parse(body);rpc="kpi_content_action";args={item_id:id,expected_version:input.expectedVersion,command:input.action,input};}
  else if(id){rpc="kpi_content_detail";args={item_id:id};}
  else if(mutate){const input=contentCreateSchema.parse(body);rpc="kpi_content_create";args={organization_code:input.organizationCode,period_code:input.periodCode,division_code:input.divisionCode,item_kind:input.kind,input};}
  else{const url=new URL(request.url);const scope=hostedTaskScopeSchema.parse({organizationCode:url.searchParams.get("organizationCode"),periodCode:url.searchParams.get("periodCode"),divisionCode:url.searchParams.get("divisionCode")});rpc="kpi_content_list";args={organization_code:scope.organizationCode,period_code:scope.periodCode,division_code:scope.divisionCode,item_kind:contentKindSchema.parse(url.searchParams.get("kind"))};}
  const {data,error:failure}=await client.rpc(rpc,args);
  if(failure)return errorResponse(failure.code==="42501"?"AUTHORIZATION_DENIED":failure.code==="40001"?"WORK_VERSION_CONFLICT":failure.code==="22023"||failure.code==="23505"?"WORK_INPUT_INVALID":"CONFIGURATION_INVALID",requestId,failure.code==="42501"?403:failure.code==="40001"?409:failure.code==="22023"||failure.code==="23505"?400:503);
  return Response.json(rpc==="kpi_content_list"?{items:z.array(hostedContentSchema).parse(data)}:{item:hostedContentSchema.parse(data)},{status:rpc==="kpi_content_create"?201:200,headers:{"Cache-Control":"private, no-store","x-request-id":requestId}});
 }catch(failure){return errorResponse(failure instanceof z.ZodError||failure instanceof SyntaxError?"WORK_INPUT_INVALID":"CONFIGURATION_INVALID",requestId,failure instanceof z.ZodError||failure instanceof SyntaxError?400:503);}
}
