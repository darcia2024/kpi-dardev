import {z} from "zod";
import {createHostedAuthClient,resolveHostedAccess} from "@/platform/identity/hosted-auth";
import {assetServiceClient} from "@/platform/storage/hosted-assets";
import {getRequestId} from "@/platform/http/request-id";
import {errorResponse} from "@/platform/http/response";
export async function GET(request:Request,context:{params:Promise<{id:string}>}):Promise<Response>{
 const requestId=getRequestId(request.headers.get("x-request-id"));
 try{const id=z.string().uuid().parse((await context.params).id);const client=await createHostedAuthClient();if(!client)return errorResponse("CONFIGURATION_INVALID",requestId,503);const {data:auth,error}=await client.auth.getUser();if(error||!await resolveHostedAccess(client,auth.user))return errorResponse("AUTHENTICATION_REQUIRED",requestId,401);
 const {data,error:failure}=await client.rpc("kpi_asset_download",{asset_id:id});if(failure)return errorResponse(failure.code==="42501"?"AUTHORIZATION_DENIED":failure.code==="22023"?"SCANNER_UNAVAILABLE":"CONFIGURATION_INVALID",requestId,failure.code==="42501"?403:failure.code==="22023"?409:503);
 const item=z.object({objectPath:z.string(),name:z.string()}).parse(data);
 const {data:blob,error:downloadError}=await assetServiceClient().storage.from("kpi-private").download(item.objectPath);if(downloadError||!blob)return errorResponse("CONFIGURATION_INVALID",requestId,503);
 return new Response(blob,{headers:{"Content-Type":"application/octet-stream","Content-Disposition":`attachment; filename*=UTF-8''${encodeURIComponent(item.name)}`,"Cache-Control":"private, no-store","Referrer-Policy":"no-referrer","X-Content-Type-Options":"nosniff","x-request-id":requestId}});
 }catch{return errorResponse("CONFIGURATION_INVALID",requestId,503);}
}
