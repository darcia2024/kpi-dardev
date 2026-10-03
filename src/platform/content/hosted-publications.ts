import {createClient} from "@supabase/supabase-js";
import {z} from "zod";
import {getHostedAuthConfiguration} from "@/platform/identity/hosted-auth";
const publishedSchema=z.object({id:z.string().uuid(),title:z.string(),summary:z.string(),body:z.string().nullable(),source:z.string(),locale:z.enum(["id","en"]),slug:z.string(),publishedAt:z.string()});
export type PublicArticle={id:string;title:string;description:string;body?:string;meta:string;type:string;locale:"id"|"en";slug:string;accent:"red";publishedAt:string;href:string};
export async function hostedPublications(locale:"id"|"en",slug?:string):Promise<PublicArticle[]>{
 const config=getHostedAuthConfiguration();if(!config)return [];
 const client=createClient(config.url,config.key,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await client.rpc("kpi_publications_list",{locale_code:locale,article_slug:slug||null,organization_code:process.env.KPI_PUBLIC_ORGANIZATION_CODE||"KPI_PPMI_MESIR"});
 if(error)throw new Error("Publikasi resmi belum dapat dibaca dari database.");
 return z.array(publishedSchema).parse(data).map(i=>({id:i.id,title:i.title,description:i.summary,body:i.body||undefined,meta:i.source,type:locale==="id"?"Publikasi":"Publication",locale:i.locale,slug:i.slug,accent:"red",publishedAt:i.publishedAt,href:i.locale==="id"?`/publik/publikasi/${i.slug}`:`/en/publications/${i.slug}`}));
}
