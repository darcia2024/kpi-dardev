import {z} from 'zod';
import {createHostedAuthClient,resolveHostedAccess} from '@/platform/identity/hosted-auth';
import {errorResponse} from '@/platform/http/response';
import {getRequestId} from '@/platform/http/request-id';
import {managementKind,managementRecord,managementRequest,managementScope} from './hosted-management-contract';
export async function managementHttp(request:Request,mode:'management'|'workspace'|'operations'='management'):Promise<Response>{
 const requestId=getRequestId(request.headers.get('x-request-id'));
 try{
 const mutate=request.method==='POST';
 if(mutate&&request.headers.get('origin')!==new URL(request.url).origin)return errorResponse('AUTHORIZATION_DENIED',requestId,403);
 const client=await createHostedAuthClient();if(!client)return errorResponse('CONFIGURATION_INVALID',requestId,503);
 const {data:auth,error:authError}=await client.auth.getUser();if(authError||!await resolveHostedAccess(client,auth.user))return errorResponse('AUTHENTICATION_REQUIRED',requestId,401);
 let rpc:string;let args:Record<string,unknown>={};
 if(mutate){
 const raw=await request.text();if(raw.length>20000)return errorResponse('MANAGEMENT_INPUT_INVALID',requestId,413);
 const body=managementRequest.parse(JSON.parse(raw));
 if(body.operation==='RESERVE'){rpc='kpi_management_reserve';args={record_kind:body.kind,organization_code:body.organizationCode,period_code:body.periodCode,division_code:body.divisionCode};}
 else if(body.operation==='CREATE'){rpc=body.kind==='AI_DRAFT'&&body.input.sourceVersions?'kpi_ai_proposal_create':'kpi_management_create';args={...(rpc==='kpi_management_create'?{record_kind:body.kind}:{}),organization_code:body.organizationCode,period_code:body.periodCode,division_code:body.divisionCode,input:body.input,request_key:body.idempotencyKey};}
 else if(body.operation==='COMMIT'){rpc='kpi_ai_draft_commit';args={record_id:body.id,expected_version:body.expectedVersion,confirmation_note:body.note};}
 else{rpc='kpi_management_action';args={record_id:body.id,expected_version:body.expectedVersion,record_action:body.action,input:body.input};}
 }else if(mode==='operations')rpc='kpi_operations_snapshot';
 else{
 const url=new URL(request.url);const scope=managementScope.parse({organizationCode:url.searchParams.get('organizationCode'),periodCode:url.searchParams.get('periodCode'),divisionCode:url.searchParams.get('divisionCode')});
 args={organization_code:scope.organizationCode,period_code:scope.periodCode,division_code:scope.divisionCode};
 rpc=mode==='workspace'?'kpi_workspace_snapshot':url.searchParams.get('people')==='1'?'kpi_management_people':'kpi_management_list';
 if(rpc==='kpi_management_list')args.record_kind=managementKind.parse(url.searchParams.get('kind'));
 }
 const {data,error}=await client.rpc(rpc,args);
 if(error)return errorResponse(error.code==='42501'?'AUTHORIZATION_DENIED':error.code==='40001'?'MANAGEMENT_VERSION_CONFLICT':error.code==='22023'?'MANAGEMENT_INPUT_INVALID':'CONFIGURATION_INVALID',requestId,error.code==='42501'?403:error.code==='40001'?409:error.code==='22023'?400:503);
 const value=rpc==='kpi_management_list'?z.array(managementRecord).parse(data):['kpi_management_create','kpi_ai_proposal_create','kpi_management_action','kpi_ai_draft_commit'].includes(rpc)?managementRecord.parse(data):data;
 return Response.json({data:value},{headers:{'Cache-Control':'private, no-store','x-request-id':requestId}});
 }catch(e){return errorResponse(e instanceof z.ZodError||e instanceof SyntaxError?'MANAGEMENT_INPUT_INVALID':'CONFIGURATION_INVALID',requestId,e instanceof z.ZodError||e instanceof SyntaxError?400:503);}
}
