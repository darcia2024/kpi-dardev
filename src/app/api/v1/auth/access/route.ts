import { getHostedIdentity } from "@/platform/identity/hosted-auth";
import { errorResponse } from "@/platform/http/response";
import { getRequestId } from "@/platform/http/request-id";

const responseHeaders = (requestId: string) => ({ "x-request-id": requestId, "Cache-Control": "private, no-store" });

export async function GET(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  const identity = await getHostedIdentity();
  return identity ? Response.json({ identity }, { headers: responseHeaders(requestId) }) : errorResponse("AUTHENTICATION_REQUIRED", requestId, 401);
}

export async function POST(request: Request): Promise<Response> {
 const requestId=getRequestId(request.headers.get("x-request-id"));
 if(request.headers.get("origin")!==new URL(request.url).origin)return errorResponse("AUTHORIZATION_DENIED",requestId,403);
 if(!await getHostedIdentity())return errorResponse("AUTHENTICATION_REQUIRED",requestId,401);
 return Response.json({error:{code:"ACCESS_DECISION_REQUIRED",message:"Gunakan keputusan F01 dari pejabat yang memiliki mandat tertulis, lalu pelaksanaan teknis yang tercatat pada F02."}},{status:409,headers:responseHeaders(requestId)});
}
