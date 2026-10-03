import {validateOfficeFile} from "./office-file-validation";
import {createHash} from "node:crypto";
import {createClient} from "@supabase/supabase-js";
import {z} from "zod";
import {getSupabaseConfiguration} from "@/platform/config/integrations";
export {hostedAssetSchema} from "./hosted-asset-contract";
export function assetServiceClient(){const config=getSupabaseConfiguration(process.env);if(!config)throw new Error("Storage configuration unavailable");return createClient(config.url,config.serviceRoleKey,{auth:{persistSession:false,autoRefreshToken:false}});}
export function validateHostedFile(name:string,mime:string,bytes:Uint8Array):boolean{
 if(name.length<1||name.length>150||/[\\/\r\n]/.test(name)||bytes.length<1||bytes.length>4000000)return false;
 const lower=name.toLowerCase();
 if(mime==="application/pdf")return lower.endsWith(".pdf")&&Buffer.from(bytes.subarray(0,5)).toString("ascii")==="%PDF-";
 if(mime==="image/png")return lower.endsWith(".png")&&Buffer.from(bytes.subarray(0,8)).equals(Buffer.from([137,80,78,71,13,10,26,10]));
 if(mime==="image/jpeg")return /\.jpe?g$/.test(lower)&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
 if(mime==="text/plain"){if(!lower.endsWith(".txt")||bytes.includes(0))return false;try{new TextDecoder("utf-8",{fatal:true}).decode(bytes);return true;}catch{return false;}}
 return validateOfficeFile(name,mime,bytes);
}
export const assetHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
export async function approvedHostedScanner():Promise<boolean>{
 const endpoint=process.env.KPI_FILE_SCANNER_URL;
 if(!endpoint||!process.env.KPI_FILE_SCANNER_TOKEN)return false;
 try{const {data,error}=await assetServiceClient().rpc("kpi_processor_approved",{processor_purpose:"FILE_SCAN",processor_endpoint:endpoint,information_classification:"RAHASIA"});return !error&&data===true;}catch{return false;}
}
export async function scanHostedFile(bytes:Uint8Array,sha256:string,mime:string,request:typeof fetch=fetch,approved:()=>Promise<boolean>=approvedHostedScanner):Promise<"PENDING_SCAN"|"AVAILABLE"|"REJECTED">{
 const url=process.env.KPI_FILE_SCANNER_URL,token=process.env.KPI_FILE_SCANNER_TOKEN;
 if(!url||!token||!await approved())return "PENDING_SCAN";
 try{if(new URL(url).protocol!=="https:")return "PENDING_SCAN";const response=await request(url,{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":mime,"X-Content-SHA256":sha256},body:Buffer.from(bytes),redirect:"error",signal:AbortSignal.timeout(20000)});
 if(!response.ok)return "PENDING_SCAN";
 const parsed=z.object({sha256:z.literal(sha256),clean:z.boolean()}).safeParse(await response.json());return parsed.success&&await approved()?(parsed.data.clean?"AVAILABLE":"REJECTED"):"PENDING_SCAN";
 }catch{return "PENDING_SCAN";}
}
