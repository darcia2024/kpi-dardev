import {z} from 'zod';
import {createHostedAuthClient,resolveHostedAccess} from '@/platform/identity/hosted-auth';
import {errorResponse} from '@/platform/http/response';
import {getRequestId} from '@/platform/http/request-id';
import {hostedTaskScopeSchema} from '@/platform/work/hosted-task-contract';
import {taskTemplatesSchema} from '@/platform/work/hosted-task-extensions';
export async function GET(request:Request){const requestId=getRequestId(request.headers.get('x-request-id'));try{
 const client=await createHostedAuthClient();if(!client)return errorResponse('CONFIGURATION_INVALID',requestId,503);
 const {data:auth,error:failure}=await client.auth.getUser();if(failure||!await resolveHostedAccess(client,auth.user))return errorResponse('AUTHENTICATION_REQUIRED',requestId,401);
 const q=new URL(request.url).searchParams;const s=hostedTaskScopeSchema.parse({organizationCode:q.get('organizationCode'),periodCode:q.get('periodCode'),divisionCode:q.get('divisionCode')});
 const {data,error}=await client.rpc('kpi_task_templates',{organization_code:s.organizationCode,period_code:s.periodCode,division_code:s.divisionCode});if(error)return errorResponse(error.code==='42501'?'AUTHORIZATION_DENIED':'CONFIGURATION_INVALID',requestId,error.code==='42501'?403:503);
 return Response.json({templates:taskTemplatesSchema.parse(data)},{headers:{'Cache-Control':'private, no-store'}});
}catch(e){return errorResponse(e instanceof z.ZodError?'TASK_INPUT_INVALID':'CONFIGURATION_INVALID',requestId,e instanceof z.ZodError?400:503);}}
