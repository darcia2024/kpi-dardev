import {z} from "zod";
import {createSchema,workflowActionSchema,reviewSchema,governanceContextSchema,governanceRecordSchema} from "@/platform/governance/contract";
import {createHostedAuthClient,resolveHostedAccess} from "@/platform/identity/hosted-auth";
import {getRequestId} from "@/platform/http/request-id";
import {errorResponse} from "@/platform/http/response";
const envelope=z.discriminatedUnion("operation",[
 z.object({operation:z.literal("CREATE"),requestKey:z.string().uuid(),input:createSchema}),
 z.object({operation:z.literal("ACTION"),input:workflowActionSchema}),
 z.object({operation:z.literal("REVIEW"),input:reviewSchema})
]);
async function handle(request:Request):Promise<Response>{
 const requestId=getRequestId(request.headers.get("x-request-id"));
 try{
 const mutate=request.method==="POST";
 if(mutate&&request.headers.get("origin")!==new URL(request.url).origin)return errorResponse("AUTHORIZATION_DENIED",requestId,403);
 const client=await createHostedAuthClient();if(!client)return errorResponse("CONFIGURATION_INVALID",requestId,503);
 const {data,error}=await client.auth.getUser();if(error||!await resolveHostedAccess(client,data.user))return errorResponse("AUTHENTICATION_REQUIRED",requestId,401);
 let rpc="kpi_governance_context",args:Record<string,unknown>={};
 if(mutate){const raw=await request.text();if(new TextEncoder().encode(raw).length>24000)return errorResponse("WORK_INPUT_INVALID",requestId,413);const body=envelope.parse(JSON.parse(raw));
 if(body.operation==="CREATE"){const {kind,...input}=body.input;rpc="kpi_governance_create";args={record_kind:kind,input,request_key:body.requestKey};}
 else if(body.operation==="ACTION"){rpc="kpi_governance_action";args={record_id:body.input.id,expected_version:body.input.expectedVersion,workflow_action:body.input.action,input:body.input.input};}
 else{const {action,...input}=body.input;rpc="kpi_access_review_action";args={review_action:action,input};}
 }
 const result=await client.rpc(rpc,args);if(result.error){const status=result.error.code==="42501"?403:result.error.code==="40001"?409:result.error.code==="22023"?400:503;return errorResponse(status===403?"AUTHORIZATION_DENIED":status===409?"WORK_VERSION_CONFLICT":status===400?"WORK_INPUT_INVALID":"CONFIGURATION_INVALID",requestId,status);}
 const response=rpc==="kpi_governance_context"?{context:governanceContextSchema.parse(result.data)}:rpc==="kpi_access_review_action"?{id:z.string().uuid().parse(result.data)}:{record:governanceRecordSchema.parse(result.data)};
 return Response.json(response,{status:rpc==="kpi_governance_create"?201:200,headers:{"Cache-Control":"private, no-store","x-request-id":requestId}});
 }catch(error){return errorResponse(error instanceof z.ZodError||error instanceof SyntaxError?"WORK_INPUT_INVALID":"CONFIGURATION_INVALID",requestId,error instanceof z.ZodError||error instanceof SyntaxError?400:503);}
}
export const GET=handle;
export const POST=handle;
