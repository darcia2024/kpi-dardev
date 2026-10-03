import {createClient} from '@supabase/supabase-js';
import {z} from 'zod';
import {getHostedAuthConfiguration} from '@/platform/identity/hosted-auth';
export async function HostedPublicAttachments({itemId}:{itemId:string}){
 const config=getHostedAuthConfiguration();if(!config)return null;
 const client=createClient(config.url,config.key,{auth:{persistSession:false,autoRefreshToken:false}});
 const result=await client.rpc('kpi_public_content_assets',{item_id:itemId,organization_code:process.env.KPI_PUBLIC_ORGANIZATION_CODE||'KPI_PPMI_MESIR'});if(result.error)return <p role="status">Lampiran belum dapat dimuat.</p>;
 const rows=z.array(z.object({id:z.string().uuid(),name:z.string(),mimeType:z.string()})).parse(result.data);if(!rows.length)return null;
 return <section aria-label="Lampiran publik"><h2>Lampiran</h2><ul>{rows.map(r=><li key={r.id}><a href={`/api/v1/public/content/${itemId}/assets/${r.id}`}>{r.name}</a></li>)}</ul></section>;
}
