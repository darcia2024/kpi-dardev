import {createClient} from '@supabase/supabase-js';
import {z} from 'zod';
import {getHostedAuthConfiguration} from '@/platform/identity/hosted-auth';
import {RichTextView} from '@/components/editor/rich-text-view';
const items=z.array(z.object({id:z.string().uuid(),title:z.string(),summary:z.string(),body:z.string(),source:z.string(),publishedAt:z.string(),metadata:z.record(z.string(),z.unknown())}));
export async function HostedPublicFeed({category,title}:{category:'NEWS'|'EVENT'|'ROSTER';title:string}){
 const config=getHostedAuthConfiguration();if(!config)return null;
 const client=createClient(config.url,config.key,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await client.rpc('kpi_public_content',{category_code:category,locale_code:'id',organization_code:process.env.KPI_PUBLIC_ORGANIZATION_CODE||'KPI_PPMI_MESIR'});
 if(error)return <section className="kp-wrap kp-news-empty" role="status"><h2>{title}</h2><p>Informasi resmi belum dapat dimuat. Silakan coba kembali.</p></section>;
 const records=items.parse(data);if(!records.length)return null;
 const attachments=new Map<string,{id:string;name:string;mimeType:string}[]>();await Promise.all(records.map(async r=>{const result=await client.rpc('kpi_public_content_assets',{item_id:r.id,organization_code:process.env.KPI_PUBLIC_ORGANIZATION_CODE||'KPI_PPMI_MESIR'});if(!result.error)attachments.set(r.id,z.array(z.object({id:z.string().uuid(),name:z.string(),mimeType:z.string()})).parse(result.data));}));
 return <section className="kp-wrap kp-hosted-feed" aria-label={title}><h2>{title}</h2><div>{records.map(r=><article id={r.id} key={r.id}><p className="kp-eyebrow">{category==='EVENT'?String(r.metadata.eventDate||''):category==='ROSTER'?String(r.metadata.periodLabel||''):new Date(r.publishedAt).toLocaleDateString('id-ID')}</p><h3>{r.title}</h3>{category==='ROSTER'&&<p>{String(r.metadata.position||'')}</p>}{category==='EVENT'&&<p>{String(r.metadata.location||'')}</p>}<p>{r.summary}</p><details><summary>Baca selengkapnya</summary><RichTextView source={r.body} className="kp-article-prose"/><p>Sumber: {r.source}</p>{attachments.get(r.id)?.map(a=><a key={a.id} href={`/api/v1/public/content/${r.id}/assets/${a.id}`}>Buka lampiran: {a.name}</a>)}</details></article>)}</div></section>;
}
