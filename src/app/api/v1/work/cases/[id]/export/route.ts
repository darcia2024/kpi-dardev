import {z} from "zod";
import catalog from "@/platform/intake/case-sop-catalog.json";
import {caseFormSchema} from "@/platform/intake/case-form-contract";
import {renderCaseFormHtml} from "@/platform/intake/case-form-export";
import {createHostedAuthClient,resolveHostedAccess} from "@/platform/identity/hosted-auth";
export async function GET(request:Request,context:{params:Promise<{id:string}>}):Promise<Response>{
 try{const {id}=await context.params;z.string().uuid().parse(id);const url=new URL(request.url),formId=z.string().uuid().parse(url.searchParams.get('formId'));
 const client=await createHostedAuthClient();if(!client)return new Response('Layanan belum tersedia',{status:503});const {data,error}=await client.auth.getUser();if(error||!await resolveHostedAccess(client,data.user))return new Response('Masuk diperlukan',{status:401});
 const {data:result,error:failure}=await client.rpc('kpi_case_forms',{case_id:id});if(failure)return new Response('Dokumen tidak tersedia',{status:failure.code==='42501'?403:503});const form=z.array(caseFormSchema).parse(result).find(f=>f.id===formId);if(!form)return new Response('Dokumen tidak ditemukan',{status:404});const template=catalog.forms.find(f=>f.code===form.code)!;const nonce=crypto.randomUUID();
 return new Response(renderCaseFormHtml(form,template,nonce),{headers:{'Content-Type':'text/html; charset=utf-8','Content-Disposition':`${url.searchParams.get('download')==='1'?'attachment':'inline'}; filename="KPI-formulir-${form.code}-${form.id}-v${form.version}-DRAF.html"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':`default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`}});
 }catch{return new Response('Permintaan dokumen tidak valid',{status:400});}
}
