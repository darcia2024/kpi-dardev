import {z} from "zod";

export type CaseFormTemplate={code:string;name:string;source:string;sourceHash:string;sections:{key:string;title:string;guide:string;fields?:{key:string;label:string;kind:string}[]}[]};
export type SectionValues={format:"fields-v1";fields:Record<string,string|boolean>;notes:string;notApplicableReason:string};
export function sectionChoices(section:CaseFormTemplate['sections'][number]):Map<string,NonNullable<CaseFormTemplate['sections'][number]['fields']>>{
 const groups=new Map<string,NonNullable<CaseFormTemplate['sections'][number]['fields']>>();
 for(const field of section.fields||[]){const parts=field.label.split(' — ');if(field.kind==='checkbox'&&parts.length===2&&['Ya','Tidak','Sebagian'].includes(parts[1]))groups.set(parts[0],[...(groups.get(parts[0])||[]),field]);}
 return new Map([...groups].filter(([,fields])=>fields.length>=2));
}
export function readSection(value:string=""):SectionValues{
 try{const parsed=JSON.parse(value);if(parsed?.format==="fields-v1"&&parsed.fields&&typeof parsed.fields==='object'&&!Array.isArray(parsed.fields))return {format:"fields-v1",fields:parsed.fields,notes:typeof parsed.notes==='string'?parsed.notes:"",notApplicableReason:typeof parsed.notApplicableReason==='string'?parsed.notApplicableReason:""};}catch{}
 return {format:"fields-v1",fields:{},notes:value,notApplicableReason:""};
}
export function sectionFilled(value:string=""):boolean{const s=readSection(value);return !!s.notes.trim()||!!s.notApplicableReason.trim()||Object.values(s.fields).some(v=>typeof v==='string'?!!v.trim():v===true);}
export function sectionLines(section:CaseFormTemplate['sections'][number],value:string=""):string[]{const s=readSection(value);return [...(section.fields||[]).filter(f=>s.fields[f.key]!==undefined&&s.fields[f.key]!==false&&s.fields[f.key]!=="").map(f=>`${f.label}: ${s.fields[f.key]===true?"Ya / dicentang":s.fields[f.key]}`),...(s.notes?[`Catatan: ${s.notes}`]:[]),...(s.notApplicableReason?[`Tidak berlaku: ${s.notApplicableReason}`]:[])];}
export const formStageSchema=z.enum(["DRAFT","SUBMITTED","CHANGES_REQUESTED","REVIEWED","AUTHORIZATION_RECORDED"]);
export const caseFormInputSchema=z.object({
 id:z.string().uuid(),code:z.enum(["01","02","03","04","05","06","07"]),
 expectedVersion:z.number().int().nonnegative(),title:z.string().trim().min(3).max(180),
 answers:z.record(z.string().regex(/^(HEADER|[A-X])$/),z.string().max(6000))
}).strict();
export const caseFormSchema=z.object({id:z.string().uuid(),code:z.string(),title:z.string(),version:z.number().int().positive(),templateVersion:z.string(),stage:formStageSchema.default("DRAFT"),answers:z.record(z.string(),z.string()),updatedAt:z.string(),authorName:z.string(),history:z.array(z.object({version:z.number().int(),updatedAt:z.string(),authorName:z.string(),title:z.string(),answers:z.record(z.string(),z.string())}))});
export type CaseForm=z.infer<typeof caseFormSchema>;
