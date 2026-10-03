import {z} from 'zod';
import {createHostedAuthClient,resolveHostedAccess} from '@/platform/identity/hosted-auth';
import {assetServiceClient,approvedHostedScanner,scanHostedFile,assetHash,hostedAssetSchema} from '@/platform/storage/hosted-assets';
import {errorResponse} from '@/platform/http/response';
import {getRequestId} from '@/platform/http/request-id';
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){const requestId=getRequestId(request.headers.get('x-request-id'));try{
 if(request.headers.get('origin')!==new URL(request.url).origin)return errorResponse('AUTHORIZATION_DENIED',requestId,403);
 const client=await createHostedAuthClient();if(!client)return errorResponse('CONFIGURATION_INVALID',requestId,503);const {data:auth,error:failure}=await client.auth.getUser();if(failure||!await resolveHostedAccess(client,auth.user))return errorResponse('AUTHENTICATION_REQUIRED',requestId,401);
 const id=z.string().uuid().parse((await params).id);const {data,error}=await client.rpc('kpi_asset_scan_request',{asset_id:id});if(error)return errorResponse(error.code==='42501'?'AUTHORIZATION_DENIED':'WORK_INPUT_INVALID',requestId,error.code==='42501'?403:400);
 if(!await approvedHostedScanner())return errorResponse('SCANNER_UNAVAILABLE',requestId,503);
 const item=hostedAssetSchema.extend({objectPath:z.string(),sha256:z.string()}).parse(data),service=assetServiceClient();const {data:blob,error:downloadError}=await service.storage.from('kpi-private').download(item.objectPath);if(downloadError||!blob||blob.size>4000000)return errorResponse('CONFIGURATION_INVALID',requestId,503);
 const bytes=new Uint8Array(await blob.arrayBuffer());if(assetHash(bytes)!==item.sha256)return errorResponse('CONFIGURATION_INVALID',requestId,503);
 const status=await scanHostedFile(bytes,item.sha256,item.mimeType);if(!await approvedHostedScanner())return errorResponse('SCANNER_UNAVAILABLE',requestId,503);
 const result=await service.rpc('kpi_asset_finish',{asset_id:id,content_hash:item.sha256,scan_result:status});if(result.error)return errorResponse('CONFIGURATION_INVALID',requestId,503);
 return Response.json({asset:hostedAssetSchema.parse(result.data)},{headers:{'Cache-Control':'private, no-store'}});
}catch{return errorResponse('CONFIGURATION_INVALID',requestId,503);}}
