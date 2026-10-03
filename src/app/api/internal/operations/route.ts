import {timingSafeEqual} from 'node:crypto';
import {z} from 'zod';
import {assetServiceClient} from '@/platform/storage/hosted-assets';
export const maxDuration=60;
const claim=z.object({id:z.string().uuid(),claimToken:z.string().uuid(),channel:z.enum(['EMAIL','WHATSAPP']),recipient:z.string(),message:z.string(),href:z.literal('/portal/notifikasi')});
export async function GET(request:Request){
 const expected=process.env.CRON_SECRET,actual=request.headers.get('authorization')||'';
 if(!expected)return Response.json({error:'Scheduler not configured'},{status:503,headers:{'Cache-Control':'no-store'}});
 const a=Buffer.from(actual),b=Buffer.from(`Bearer ${expected}`);if(a.length!==b.length||!timingSafeEqual(a,b))return Response.json({error:'Unauthorized'},{status:401,headers:{'Cache-Control':'no-store'}});
 try{
  const service=assetServiceClient();const publication=await service.rpc('kpi_publish_due'),reminders=await service.rpc('kpi_enqueue_reminders');if(publication.error||reminders.error)throw new Error('Worker unavailable');
  let sent=0,failed=0;const started=Date.now();
  for(const channel of ['EMAIL','WHATSAPP'] as const){
   const endpoint=process.env[`KPI_${channel}_DELIVERY_URL`],token=process.env[`KPI_${channel}_DELIVERY_TOKEN`];if(!endpoint||!token||new URL(endpoint).protocol!=='https:')continue;
   for(let i=0;i<5&&Date.now()-started<35000;i++){
    const approved=await service.rpc('kpi_processor_approved',{processor_purpose:channel,processor_endpoint:endpoint,information_classification:'INTERNAL'});if(approved.error||approved.data!==true)break;
    const next=await service.rpc('kpi_delivery_claim',{delivery_channel:channel});if(next.error)throw new Error('Queue unavailable');if(next.data===null)break;const item=claim.parse(next.data);let accepted=false;
    try{const valid=await service.rpc('kpi_delivery_validate',{delivery_id:item.id,token:item.claimToken});const stillApproved=await service.rpc('kpi_processor_approved',{processor_purpose:channel,processor_endpoint:endpoint,information_classification:'INTERNAL'});if(valid.error||valid.data!==true||stillApproved.error||stillApproved.data!==true)throw new Error('Delivery no longer authorized');const r=await fetch(endpoint,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json','Idempotency-Key':item.id},body:JSON.stringify({id:item.id,channel,recipient:item.recipient,message:item.message,href:item.href}),redirect:'error',signal:AbortSignal.timeout(10000)});if(r.ok){const text=await r.text();if(text.length<4000)accepted=z.object({id:z.literal(item.id),accepted:z.literal(true)}).safeParse(JSON.parse(text)).success;}}catch{}
    const completed=await service.rpc('kpi_delivery_finish',{delivery_id:item.id,token:item.claimToken,sent:accepted});if(completed.error)throw new Error('Queue receipt unavailable');if(accepted)sent++;else failed++;
   }
  }
  return Response.json({published:publication.data,reminders:reminders.data,sent,failed},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Worker could not complete; retry later'},{status:503,headers:{'Cache-Control':'no-store'}});}
}
