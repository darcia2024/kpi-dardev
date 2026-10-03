import {redirect} from 'next/navigation';
import {getHostedIdentity} from '@/platform/identity/hosted-auth';
import {hostedScopes} from '@/platform/authorization/hosted-scopes';
import {HostedManagementWorkspace} from './hosted-management-workspace';
import {HostedWorkspaceDashboard,HostedOperationsPanel,HostedAiSurface,HostedScreenCatalog} from './hosted-group-one-panels';
const config={workspace:{title:'Ruang kerja',description:'Tugas, rapat, dan pemeriksaan yang dapat Anda akses dalam satu ringkasan.',permission:'WORKSPACE_READ'},keuangan:{title:'Keuangan',description:'Susun anggaran, ajukan transaksi, verifikasi bukti, dan catat pertanggungjawaban.',permission:'FINANCE_READ',kind:'FINANCE'},evaluasi:{title:'Evaluasi kinerja',description:'Penilaian menggunakan kriteria dan bukti yang dapat diperiksa, dengan ruang untuk keberatan.',permission:'EVALUATION_READ',kind:'EVALUATION'},handover:{title:'Serah terima',description:'Serahkan dokumen dan pekerjaan kepada penerima yang ditunjuk. Penerimaan dicatat per dokumen.',permission:'HANDOVER_READ',kind:'HANDOVER'},ai:{title:'Asisten internal',description:'Ceritakan kebutuhan Anda, periksa draf, lalu konfirmasikan penyimpanannya sesuai izin akun.',permission:'AI_READ',kind:'AI_DRAFT'},operasi:{title:'Operasi & audit',description:'Periksa kesiapan layanan, jejak tindakan, dan bukti uji pemulihan.',permission:'SYSTEM_CONFIGURATION_READ',kind:'RECOVERY_CHECK'},katalog:{title:'Katalog layar',description:'Rujukan layar dan tujuan modul. Status koneksi dibedakan dari kelengkapan rancangan.',permission:'SYSTEM_CONFIGURATION_READ'}} as const;
export type GroupOneModule=keyof typeof config;
export async function HostedGroupOne({module}:{module:GroupOneModule}){
 const identity=await getHostedIdentity();if(!identity)redirect('/masuk');const item=config[module];const scopes=hostedScopes(identity,item.permission);
 return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">Workspace KPI</p><h1>{item.title}</h1><p>{item.description}</p></header>
 {module==='workspace'?<HostedWorkspaceDashboard scopes={scopes}/>:module==='katalog'?<HostedScreenCatalog administrator={identity.systemAdmin===true}/>:module==='operasi'?<><HostedOperationsPanel administrator={identity.systemAdmin===true}/><HostedManagementWorkspace identity={identity} scopes={scopes} initialKind="RECOVERY_CHECK"/></>:module==='ai'?<HostedAiSurface identity={identity} scopes={scopes}/>:'kind' in item?<HostedManagementWorkspace identity={identity} scopes={scopes} initialKind={item.kind}/>:null}
 </div>;
}
