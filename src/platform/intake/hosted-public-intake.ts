import {createHash,createHmac} from "node:crypto";
import {isIP} from "node:net";
import {z} from "zod";
import {assetServiceClient} from "@/platform/storage/hosted-assets";
import {getSupabaseConfiguration} from "@/platform/config/integrations";
import {getRequestId} from "@/platform/http/request-id";
import {errorResponse} from "@/platform/http/response";
import {hostedIntakeSchema} from "./hosted-case-contract";
const organization=()=>process.env.KPI_PUBLIC_ORGANIZATION_CODE?.trim()||"KPI_PPMI_MESIR";
const trackingSchema=z.object({trackingToken:z.string().regex(/^[a-f0-9]{64}$/)}).strict();
export const intakeTokenHash=(token:string)=>createHash("sha256").update(token).digest("hex");
export function intakeFingerprint(request:Request,values:NodeJS.ProcessEnv=process.env):string|null{
 const config=getSupabaseConfiguration(values);
 const ip=request.headers.get("x-vercel-forwarded-for")?.trim();
 // Trust the deployment ingress header only on Vercel; never accept a client-supplied address on other hosts.
 if(values.VERCEL!=="1"||!config||!ip||!isIP(ip))return null;
 return createHmac("sha256",config.serviceRoleKey).update(`kpi-intake-rate:v1:${ip}`).digest("hex");
}
export async function hostedIntakeReady():Promise<boolean>{try{const {data,error}=await assetServiceClient().rpc("kpi_intake_ready",{organization_code:organization()});return !error&&data===true;}catch{return false;}}
export async function hostedPublicIntakeRequest(request:Request,tracking=false):Promise<Response>{
 const requestId=getRequestId(request.headers.get("x-request-id"));
 try{
  if(request.headers.get("origin")!==new URL(request.url).origin)return errorResponse("AUTHORIZATION_DENIED",requestId,403);
  if(Number(request.headers.get("content-length")||0)>28000)return errorResponse("WORK_INPUT_INVALID",requestId,413);
  const raw=await request.text();if(new TextEncoder().encode(raw).length>28000)return errorResponse("WORK_INPUT_INVALID",requestId,413);
  const input=tracking?trackingSchema.parse(JSON.parse(raw)):hostedIntakeSchema.parse(JSON.parse(raw));
  const client=assetServiceClient();
  if(!tracking){const {data,error}=await client.rpc("kpi_intake_ready",{organization_code:organization()});if(error||data!==true)return errorResponse("INTAKE_UNAVAILABLE",requestId,503);}
  const fingerprint=intakeFingerprint(request);if(!fingerprint)return errorResponse("CONFIGURATION_INVALID",requestId,503);
  const {trackingToken,...fields}=input;
  const {data,error}=await client.rpc(tracking?"kpi_intake_track":"kpi_intake_submit",tracking?{token_hash:intakeTokenHash(trackingToken),fingerprint}:{organization_code:organization(),input:fields,token_hash:intakeTokenHash(trackingToken),fingerprint});
  if(error)return errorResponse(error.code==="P0003"?"RATE_LIMITED":error.code==="55000"?"INTAKE_UNAVAILABLE":error.code==="40001"?"WORK_VERSION_CONFLICT":error.code==="22023"?"WORK_INPUT_INVALID":"CONFIGURATION_INVALID",requestId,error.code==="P0003"?429:error.code==="40001"?409:error.code==="22023"?400:503);
  if(tracking){if(!data)return errorResponse("AUTHORIZATION_DENIED",requestId,404);const result=z.object({status:z.enum(["RECEIVED","TRIAGED","IN_PROGRESS","IN_REVIEW","CLOSED"]),submittedAt:z.string(),latestUpdate:z.string()}).parse(data);return Response.json({tracking:result},{headers:{"Cache-Control":"no-store","x-request-id":requestId}});}
  const result=z.object({created:z.boolean(),submittedAt:z.string()}).parse(data);return Response.json({...result,trackingToken},{status:result.created?201:200,headers:{"Cache-Control":"no-store","x-request-id":requestId}});
 }catch(error){const invalid=error instanceof z.ZodError||error instanceof SyntaxError;return errorResponse(invalid?"WORK_INPUT_INVALID":"CONFIGURATION_INVALID",requestId,invalid?400:503);}
}
