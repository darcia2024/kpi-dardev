import {z} from "zod";
import {createHostedAuthClient,resolveHostedAccess} from "@/platform/identity/hosted-auth";
import {errorResponse} from "@/platform/http/response";
import {getRequestId} from "@/platform/http/request-id";
export async function GET(request:Request):Promise<Response>{
 const id=getRequestId(request.headers.get("x-request-id"));
 try{if(request.method==="POST"&&request.headers.get("origin")!==new URL(request.url).origin)return errorResponse("AUTHORIZATION_DENIED",id,403);
 const client=await createHostedAuthClient();if(!client)return errorResponse("CONFIGURATION_INVALID",id,503);const {data:auth,error}=await client.auth.getUser();if(error||!await resolveHostedAccess(client,auth.user))return errorResponse("AUTHENTICATION_REQUIRED",id,401);
 let rpc="kpi_notifications_list",args={};if(request.method==="POST"){const raw=await request.text();if(raw.length>1000)return errorResponse("WORK_INPUT_INVALID",id,413);const body=z.object({id:z.string().uuid()}).strict().parse(JSON.parse(raw));rpc="kpi_notification_read";args={notification_id:body.id};}
 const {data,error:failure}=await client.rpc(rpc,args);if(failure)return errorResponse(failure.code==="42501"?"AUTHORIZATION_DENIED":"CONFIGURATION_INVALID",id,failure.code==="42501"?403:503);
 return Response.json(rpc==="kpi_notifications_list"?{notifications:data}:{saved:data},{headers:{"Cache-Control":"private, no-store"}});
 }catch(e){return errorResponse(e instanceof z.ZodError||e instanceof SyntaxError?"WORK_INPUT_INVALID":"CONFIGURATION_INVALID",id,e instanceof z.ZodError||e instanceof SyntaxError?400:503);}
}
export const POST=GET;
