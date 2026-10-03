import {z} from 'zod';
import {assetServiceClient} from '@/platform/storage/hosted-assets';
export async function GET(request:Request){try{
 const kind=z.enum(['SARAN','PERTANYAAN','PENGADUAN']).parse(new URL(request.url).searchParams.get('kind'));
 const {data,error}=await assetServiceClient().rpc('kpi_public_intake_template',{organization_code:process.env.KPI_PUBLIC_ORGANIZATION_CODE||'KPI_PPMI_MESIR',form_kind:kind});if(error)throw new Error('Template unavailable');
 return Response.json({template:data},{headers:{'Cache-Control':'no-store'}});
}catch(e){return Response.json({error:'Template unavailable'},{status:e instanceof z.ZodError?400:503,headers:{'Cache-Control':'no-store'}});}}
