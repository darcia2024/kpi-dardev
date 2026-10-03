import {z} from "zod";
import {createHostedAuthClient,resolveHostedAccess} from "@/platform/identity/hosted-auth";
import {hostedTaskScopeSchema} from "@/platform/work/hosted-task-contract";
import {hostedAssetSchema,assetServiceClient,validateHostedFile,assetHash,scanHostedFile,approvedHostedScanner} from "@/platform/storage/hosted-assets";
import {getRequestId} from "@/platform/http/request-id";
import {errorResponse} from "@/platform/http/response";
export const runtime="nodejs";
export async function GET(request:Request):Promise<Response>{
 const requestId=getRequestId(request.headers.get("x-request-id"));
 try{const client=await createHostedAuthClient();if(!client)return errorResponse("CONFIGURATION_INVALID",requestId,503);const {data:auth,error}=await client.auth.getUser();if(error||!await resolveHostedAccess(client,auth.user))return errorResponse("AUTHENTICATION_REQUIRED",requestId,401);
 const url=new URL(request.url);const scope=hostedTaskScopeSchema.parse({organizationCode:url.searchParams.get("organizationCode"),periodCode:url.searchParams.get("periodCode"),divisionCode:url.searchParams.get("divisionCode")});
 const {data,error:failure}=await client.rpc("kpi_assets_list",{organization_code:scope.organizationCode,period_code:scope.periodCode,division_code:scope.divisionCode});if(failure)return errorResponse(failure.code==="42501"?"AUTHORIZATION_DENIED":"CONFIGURATION_INVALID",requestId,failure.code==="42501"?403:503);
 return Response.json({assets:z.array(hostedAssetSchema).parse(data),scannerConfigured:await approvedHostedScanner()},{headers:{"Cache-Control":"private, no-store"}});
 }catch(error){return errorResponse(error instanceof z.ZodError?"WORK_INPUT_INVALID":"CONFIGURATION_INVALID",requestId,error instanceof z.ZodError?400:503);}
}
export async function POST(request:Request):Promise<Response>{
 const requestId=getRequestId(request.headers.get("x-request-id"));
 try{
 if(request.headers.get("origin")!==new URL(request.url).origin)return errorResponse("AUTHORIZATION_DENIED",requestId,403);
 const length=Number(request.headers.get("content-length"));if(!Number.isFinite(length)||length<1||length>4100000)return errorResponse("WORK_INPUT_INVALID",requestId,413);
 const client=await createHostedAuthClient();if(!client)return errorResponse("CONFIGURATION_INVALID",requestId,503);const {data:auth,error}=await client.auth.getUser();if(error||!await resolveHostedAccess(client,auth.user))return errorResponse("AUTHENTICATION_REQUIRED",requestId,401);
 const form=await request.formData(),file=form.get("file");if(!(file instanceof File)||file.size>4000000)return errorResponse("WORK_INPUT_INVALID",requestId,400);
 const scope=hostedTaskScopeSchema.parse({organizationCode:form.get("organizationCode"),periodCode:form.get("periodCode"),divisionCode:form.get("divisionCode")||null});const key=z.string().uuid().parse(form.get("idempotencyKey"));const previousAssetId=z.string().uuid().nullable().parse(form.get("previousAssetId")||null);
 const bytes=new Uint8Array(await file.arrayBuffer());if(!validateHostedFile(file.name,file.type,bytes))return errorResponse("WORK_INPUT_INVALID",requestId,400);const sha256=assetHash(bytes);
 const {data,error:failure}=await client.rpc("kpi_asset_register",{organization_code:scope.organizationCode,period_code:scope.periodCode,division_code:scope.divisionCode,input:{name:file.name,mimeType:file.type,sizeBytes:bytes.length,sha256,idempotencyKey:key,previousAssetId}});
 if(failure)return errorResponse(failure.code==="42501"?"AUTHORIZATION_DENIED":failure.code==="40001"?"WORK_VERSION_CONFLICT":"WORK_INPUT_INVALID",requestId,failure.code==="42501"?403:failure.code==="40001"?409:400);
 const registered=hostedAssetSchema.extend({objectPath:z.string(),sha256:z.literal(sha256)}).parse(data);
 if(registered.status==="AVAILABLE"||registered.status==="REJECTED")return Response.json({asset:registered},{headers:{"Cache-Control":"private, no-store"}});
 const service=assetServiceClient();const storage=service.storage.from("kpi-private");
 const upload=await storage.upload(registered.objectPath,bytes,{contentType:file.type,upsert:false});
 if(upload.error){const stored=await storage.download(registered.objectPath);if(stored.error||!stored.data||assetHash(new Uint8Array(await stored.data.arrayBuffer()))!==sha256)return errorResponse("CONFIGURATION_INVALID",requestId,503);}
 const result=await scanHostedFile(bytes,sha256,file.type);
 const completed=await service.rpc("kpi_asset_finish",{asset_id:registered.id,content_hash:sha256,scan_result:result});if(completed.error)return errorResponse("CONFIGURATION_INVALID",requestId,503);
 return Response.json({asset:hostedAssetSchema.parse(completed.data)},{status:201,headers:{"Cache-Control":"private, no-store"}});
 }catch(error){return errorResponse(error instanceof z.ZodError||error instanceof TypeError?"WORK_INPUT_INVALID":"CONFIGURATION_INVALID",requestId,error instanceof z.ZodError||error instanceof TypeError?400:503);}
}
