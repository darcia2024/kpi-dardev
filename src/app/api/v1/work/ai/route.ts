import {z} from 'zod';
import {createHostedAuthClient,resolveHostedAccess} from '@/platform/identity/hosted-auth';
import {assetServiceClient} from '@/platform/storage/hosted-assets';
import {managementScope} from '@/platform/work/hosted-management-contract';
import {requestAiAnswer} from '@/platform/work/hosted-ai-provider';
import {errorResponse} from '@/platform/http/response';
import {getRequestId} from '@/platform/http/request-id';
const inputSchema=managementScope.extend({question:z.string().trim().min(3).max(4000),sources:z.array(z.uuid()).max(5)});
export async function POST(request:Request){
 const id=getRequestId(request.headers.get('x-request-id'));
 try{
 if(request.headers.get('origin')!==new URL(request.url).origin)return errorResponse('AUTHORIZATION_DENIED',id,403);
 const client=await createHostedAuthClient();if(!client)return errorResponse('CONFIGURATION_INVALID',id,503);
 const {data:auth,error}=await client.auth.getUser();if(error||!await resolveHostedAccess(client,auth.user))return errorResponse('AUTHENTICATION_REQUIRED',id,401);
 const raw=await request.text();if(raw.length>18000)return errorResponse('AI_INPUT_INVALID',id,413);const body=inputSchema.parse(JSON.parse(raw));
 const args={organization_code:body.organizationCode,period_code:body.periodCode,division_code:body.divisionCode,source_ids:body.sources};
 const sources=await client.rpc('kpi_ai_sources',args);if(sources.error)return errorResponse('AUTHORIZATION_DENIED',id,403);
 const endpoint=process.env.KPI_AI_PROVIDER_URL,token=process.env.KPI_AI_PROVIDER_TOKEN,model=process.env.KPI_AI_PROVIDER_MODEL;
 if(!endpoint||!token||!model)return errorResponse('AI_PROVIDER_UNAVAILABLE',id,503);
 const service=assetServiceClient();const approved=()=>service.rpc('kpi_processor_approved',{processor_purpose:'AI',processor_endpoint:endpoint,information_classification:'RAHASIA'});
 if((await approved()).data!==true)return errorResponse('AI_PROCESSOR_NOT_APPROVED',id,503);
 const quota=await client.rpc('kpi_ai_consume_quota',{organization_code:body.organizationCode,period_code:body.periodCode,division_code:body.divisionCode});
 if(quota.error)return errorResponse('AUTHORIZATION_DENIED',id,403);if(quota.data!==true)return errorResponse('RATE_LIMITED',id,429);
 const answer=await requestAiAnswer(endpoint,token,model,body.question,sources.data,body.sources);
 const checked=await client.rpc('kpi_ai_sources',args);if(checked.error||JSON.stringify(checked.data)!==JSON.stringify(sources.data)||(await approved()).data!==true)return errorResponse('AUTHORIZATION_DENIED',id,403);
 const versions=Object.fromEntries((checked.data as {id:string;version:number}[]).map(source=>[source.id,source.version]));
 return Response.json({answer:{...answer,sourceVersions:versions}},{headers:{'Cache-Control':'private, no-store'}});
 }catch(e){return errorResponse(e instanceof z.ZodError||e instanceof SyntaxError?'AI_INPUT_INVALID':'AI_PROVIDER_UNAVAILABLE',id,e instanceof z.ZodError||e instanceof SyntaxError?400:503);}
}
