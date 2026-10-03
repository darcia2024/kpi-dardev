import { createHostedAuthClient, resolveHostedAccess } from "@/platform/identity/hosted-auth";
import { hostedTaskScopeSchema } from "@/platform/work/hosted-task-contract";
import { errorResponse } from "@/platform/http/response";
import { getRequestId } from "@/platform/http/request-id";
export async function GET(request: Request): Promise<Response> {
 const id = getRequestId(request.headers.get("x-request-id"));
 const client = await createHostedAuthClient();
 if (!client) return errorResponse("CONFIGURATION_INVALID", id, 503);
 const { data: auth, error } = await client.auth.getUser();
 if (error || !await resolveHostedAccess(client, auth.user)) return errorResponse("AUTHENTICATION_REQUIRED", id, 401);
 const url = new URL(request.url);
 const parsed = hostedTaskScopeSchema.safeParse({ organizationCode:url.searchParams.get("organizationCode"), periodCode:url.searchParams.get("periodCode"), divisionCode:url.searchParams.get("divisionCode") });
 if (!parsed.success) return errorResponse("WORK_INPUT_INVALID",id,400);
 const { data, error: failure } = await client.rpc("kpi_meeting_members",{ organization_code:parsed.data.organizationCode,period_code:parsed.data.periodCode,division_code:parsed.data.divisionCode });
 if(failure) return errorResponse(failure.code==="42501"?"AUTHORIZATION_DENIED":"CONFIGURATION_INVALID",id,failure.code==="42501"?403:503);
 return Response.json({members:data},{headers:{"Cache-Control":"private, no-store"}});
}
