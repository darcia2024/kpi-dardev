import {z} from 'zod';
import {createHostedAuthClient,resolveHostedAccess} from '@/platform/identity/hosted-auth';
import {hostedAssetSchema} from '@/platform/storage/hosted-asset-contract';
import {errorResponse} from '@/platform/http/response';
import {getRequestId} from '@/platform/http/request-id';
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){const requestId=getRequestId(request.headers.get('x-request-id'));try{
 const client=await createHostedAuthClient();if(!client)return errorResponse('CONFIGURATION_INVALID',requestId,503);const {data:auth,error:failure}=await client.auth.getUser();if(failure||!await resolveHostedAccess(client,auth.user))return errorResponse('AUTHENTICATION_REQUIRED',requestId,401);
 const id=z.string().uuid().parse((await params).id);const {data,error}=await client.rpc('kpi_asset_versions',{asset_id:id});if(error)return errorResponse(error.code==='42501'?'AUTHORIZATION_DENIED':'CONFIGURATION_INVALID',requestId,error.code==='42501'?403:503);
 return Response.json({versions:z.array(hostedAssetSchema).parse(data)},{headers:{'Cache-Control':'private, no-store'}});
}catch{return errorResponse('CONFIGURATION_INVALID',requestId,503);}}
