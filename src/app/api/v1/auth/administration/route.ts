import { z } from "zod";
import { createHostedAuthClient,resolveHostedAccess } from "@/platform/identity/hosted-auth";
import { adminDirectorySchema,adminSetupSchema } from "@/platform/identity/hosted-admin-contract";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";

async function handle(request:Request):Promise<Response> {
  const requestId=getRequestId(request.headers.get("x-request-id"));
  try {
    if(request.method==="POST" && request.headers.get("origin")!==new URL(request.url).origin) return errorResponse("AUTHORIZATION_DENIED",requestId,403);
    const client=await createHostedAuthClient();
    if(!client) return errorResponse("CONFIGURATION_INVALID",requestId,503);
    const {data:auth,error:authError}=await client.auth.getUser();
    const identity=authError ? null : await resolveHostedAccess(client,auth.user);
    if(!identity) return errorResponse("AUTHENTICATION_REQUIRED",requestId,401);
    if(!identity.systemAdmin) return errorResponse("AUTHORIZATION_DENIED",requestId,403);
    let args:Record<string,unknown>={};
    if(request.method==="POST") {
      const raw=await request.text();
      if(raw.length>8000) return errorResponse("AUTHENTICATION_INVALID",requestId,413);
      const input=adminSetupSchema.parse(JSON.parse(raw));
      args={organization_code:input.organizationCode,organization_name:input.organizationName,period_code:input.periodCode,start_date:input.startsOn,end_date:input.endsOn};
    }
    const {data,error}=await client.rpc(request.method==="POST" ? "kpi_admin_setup" : "kpi_admin_directory",args);
    if(error) return errorResponse(error.code==="42501" ? "AUTHORIZATION_DENIED" : error.code==="40001" ? "ADMIN_SETUP_CONFLICT" : error.code==="22023" ? "AUTHENTICATION_INVALID" : "CONFIGURATION_INVALID",requestId,error.code==="42501" ? 403 : error.code==="40001" ? 409 : error.code==="22023" ? 400 : 503);
    return Response.json(adminDirectorySchema.parse(data),{headers:{"Cache-Control":"private, no-store","x-request-id":requestId}});
  }catch(error){return errorResponse(error instanceof z.ZodError || error instanceof SyntaxError ? "AUTHENTICATION_INVALID":"CONFIGURATION_INVALID",requestId,error instanceof z.ZodError || error instanceof SyntaxError ? 400:503);}
}
export const GET=handle;
export const POST=handle;
