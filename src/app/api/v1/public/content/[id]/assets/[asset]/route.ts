import {z} from 'zod';
import {assetServiceClient,assetHash} from '@/platform/storage/hosted-assets';
export async function GET(_request:Request,{params}:{params:Promise<{id:string;asset:string}>}){
 try{
 const {id,asset}=z.object({id:z.string().uuid(),asset:z.string().uuid()}).parse(await params);const service=assetServiceClient();
 const args={item_id:id,asset_id:asset,organization_code:process.env.KPI_PUBLIC_ORGANIZATION_CODE||'KPI_PPMI_MESIR'};
 const approved=await service.rpc('kpi_public_asset_delivery',args);if(approved.error)throw new Error();if(!approved.data)return new Response(null,{status:404});
 const file=z.object({id:z.string().uuid(),name:z.string(),mimeType:z.string(),objectPath:z.string(),sha256:z.string().length(64)}).parse(approved.data);
 const downloaded=await service.storage.from('kpi-private').download(file.objectPath);if(downloaded.error||!downloaded.data||downloaded.data.size>4194304)throw new Error();const bytes=new Uint8Array(await downloaded.data.arrayBuffer());if(assetHash(bytes)!==file.sha256)throw new Error();
 const latest=await service.rpc('kpi_public_asset_delivery',args);if(latest.error||!latest.data)return new Response(null,{status:404});
 const inline=['image/jpeg','image/png'].includes(file.mimeType);return new Response(bytes,{headers:{'Content-Type':file.mimeType,'Content-Disposition':`${inline?'inline':'attachment'}; filename*=UTF-8''${encodeURIComponent(file.name)}`,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'"}});
 }catch{return Response.json({error:'Berkas tidak tersedia'},{status:503,headers:{'Cache-Control':'no-store'}});}
}
