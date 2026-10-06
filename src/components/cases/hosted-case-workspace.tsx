"use client";
import {HostedCaseForms} from "./hosted-case-forms";
import type {CaseFormTemplate} from "@/platform/intake/case-form-contract";
import {HostedAttachments} from "@/components/documents/hosted-attachments";
import {useCallback,useEffect,useRef,useState} from "react";
import {z} from "zod";
import {hostedCaseSchema,hostedCaseSummarySchema,type HostedCase} from "@/platform/intake/hosted-case-contract";
import type {HostedTaskScope} from "@/platform/work/hosted-task-contract";
const statusLabel:Record<HostedCase['status'],string>={RECEIVED:"Diterima",TRIAGED:"Ditugaskan",IN_PROGRESS:"Ditindaklanjuti",IN_REVIEW:"Menunggu review",CLOSED:"Ditutup"};
type Summary=z.infer<typeof hostedCaseSummarySchema>;
export function HostedCaseWorkspace({scopes,accountId,templates}:{scopes:HostedTaskScope[];accountId:string;templates:CaseFormTemplate[]}):React.JSX.Element{
 const [scopeIndex,setScopeIndex]=useState(0),scope=scopes[scopeIndex];
 const [items,setItems]=useState<Summary[]>([]),[selected,setSelected]=useState<HostedCase|null>(null),[note,setNote]=useState(""),[owner,setOwner]=useState(""),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");
 const generation=useRef(0),detailGeneration=useRef(0);
 const reload=useCallback(async()=>{
  const current=++generation.current;setLoading(true);setError("");
  try{const query=new URLSearchParams({organizationCode:scope.organizationCode,periodCode:scope.periodCode});const response=await fetch(`/api/v1/work/cases?${query}`,{cache:"no-store"});if(!response.ok)throw new Error("Kasus belum dapat dibaca. Periksa sesi dan izin Anda.");const result=z.object({items:z.array(hostedCaseSummarySchema)}).parse(await response.json());if(current===generation.current)setItems(result.items);}
  catch(e){if(current===generation.current){setItems([]);setError(e instanceof Error?e.message:"Gagal membaca kasus.");}}
  finally{if(current===generation.current)setLoading(false);}
 },[scope.organizationCode,scope.periodCode]);
 useEffect(()=>{setSelected(null);setNote("");setOwner("");setNotice("");detailGeneration.current++;void reload();return()=>{generation.current++;detailGeneration.current++;};},[reload]);
 async function open(id:string){if(busy)return;const current=++detailGeneration.current;setBusy(true);setError("");setSelected(null);try{const response=await fetch(`/api/v1/work/cases/${id}`,{cache:"no-store"});if(!response.ok)throw new Error("Kasus tidak tersedia atau akses Anda telah berubah.");const result=z.object({item:hostedCaseSchema}).parse(await response.json());if(current===detailGeneration.current){setSelected(result.item);setNote("");setOwner(result.item.ownerAccountId||"");}}catch(e){if(current===detailGeneration.current)setError(e instanceof Error?e.message:"Gagal membuka kasus.");}finally{setBusy(false);}}
 async function act(action:string){if(!selected||busy)return;setBusy(true);setError("");setNotice("");try{
  const response=await fetch(`/api/v1/work/cases/${selected.id}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,expectedVersion:selected.version,note,...(action==="ASSIGN"?{ownerAccountId:owner}:{})})});
  if(!response.ok)throw new Error(response.status===409?"Kasus telah berubah. Muat ulang detail sebelum melanjutkan.":response.status===403?"Tindakan ini tidak diizinkan. Penutupan membutuhkan reviewer berbeda.":response.status===400?"Periksa catatan dan tahap kasus sebelum melanjutkan.":"Perubahan belum tersimpan. Coba kembali.");
  const result=z.object({item:hostedCaseSchema}).parse(await response.json());setSelected(result.item);setNote("");await reload();setNotice("Tindak lanjut tersimpan.");
 }catch(e){setError(e instanceof Error?e.message:"Gagal menyimpan.");}finally{setBusy(false);}}
 const enabled=!!selected&&!busy&&note.trim().length>=3;
 const officer=selected?.ownerAccountId===accountId;
 return <div className="hosted-task-workspace">
  <section className="portal-form-card"><label>Periode<select disabled={busy} value={scopeIndex} onChange={e=>setScopeIndex(Number(e.target.value))}>{scopes.map((s,i)=><option key={`${s.organizationCode}:${s.periodCode}`} value={i}>{s.organizationCode} · {s.periodCode}</option>)}</select></label><p>Isi kasus bersifat rahasia. Daftar hanya menampilkan laporan yang dapat Anda akses.</p></section>
  {error?<p role="alert">{error}</p>:null}{notice?<p role="status">{notice}</p>:null}
  <section className="portal-form-card"><h2>Laporan dan pengaduan</h2>{loading?<p role="status">Membaca laporan…</p>:items.length?<ul className="hosted-task-list">{items.map(item=><li key={item.id}><button className="hosted-task-list__row" type="button" disabled={busy} onClick={()=>void open(item.id)}><span><strong>{item.subject}</strong><small>{item.kind} · {statusLabel[item.status]}</small></span><span>Buka detail</span></button></li>)}</ul>:<p>Belum ada laporan yang dapat Anda akses dalam periode ini.</p>}<button className="button button--quiet" type="button" disabled={busy||loading} onClick={()=>void reload()}>Muat ulang daftar</button></section>
  {selected?<section className="portal-form-card"><div className="intro-panel__topline"><p className="eyebrow">{statusLabel[selected.status]} · Versi {selected.version}</p><button className="button button--quiet" type="button" disabled={busy} onClick={()=>void open(selected.id)}>Muat ulang detail</button></div><h2>{selected.subject}</h2><p className="hosted-meeting-text">{selected.description}</p><p>Kontak pelapor: {selected.contact||"Tidak diberikan"}</p>
   {selected.canManage||selected.canReview?<><label>Catatan tindak lanjut<textarea rows={4} maxLength={2000} value={note} disabled={busy} onChange={e=>setNote(e.target.value)}/></label><p>Catatan tindakan bersifat internal. Gunakan “Kirim pembaruan ke pelapor” hanya untuk informasi yang aman ditampilkan pada pelacakan publik.</p><div className="button-row">
    {selected.canAssign&&["RECEIVED","TRIAGED","IN_PROGRESS"].includes(selected.status)?<><label>Petugas IOD<select disabled={busy} value={owner} onChange={e=>setOwner(e.target.value)}><option value="">Pilih petugas berizin</option>{selected.eligibleOwners.map(a=><option key={a.accountId} value={a.accountId}>{a.name}</option>)}</select></label><button type="button" className="button button--quiet" disabled={!enabled||!owner} onClick={()=>void act("ASSIGN")}>Tugaskan</button></>:null}
    {selected.canManage&&selected.status!=="CLOSED"?<><button type="button" className="button button--quiet" disabled={!enabled} onClick={()=>void act("ADD_NOTE")}>Simpan catatan internal</button><button type="button" className="button button--quiet" disabled={!enabled} onClick={()=>void act("PUBLIC_UPDATE")}>Kirim pembaruan ke pelapor</button></>:null}
    {selected.canManage&&officer&&selected.status==="TRIAGED"?<button type="button" className="button button--primary" disabled={!enabled} onClick={()=>void act("START")}>Mulai tindak lanjut</button>:null}
    {selected.canManage&&officer&&selected.status==="IN_PROGRESS"?<button type="button" className="button button--primary" disabled={!enabled} onClick={()=>void act("REQUEST_CLOSE")}>Ajukan penutupan</button>:null}
    {selected.canReview&&selected.status==="IN_REVIEW"?<><button type="button" className="button button--primary" disabled={!enabled} onClick={()=>void act("APPROVE_CLOSE")}>Setujui penutupan</button><button type="button" className="button button--quiet" disabled={!enabled} onClick={()=>void act("REQUEST_REVISION")}>Minta revisi</button></>:null}
    {selected.canReview&&selected.status==="CLOSED"?<button type="button" className="button button--quiet" disabled={!enabled} onClick={()=>void act("REOPEN")}>Buka kembali</button>:null}
   </div></>:null}<HostedAttachments module="CASE" entityId={selected.id} version={selected.version} scope={scope} editable={selected.canManage&&["RECEIVED","TRIAGED","IN_PROGRESS"].includes(selected.status)} onChanged={async()=>{await reload();await open(selected.id);}}/><HostedCaseForms key={selected.id} caseId={selected.id} canReview={selected.canReview} editable={selected.canManage&&["RECEIVED","TRIAGED","IN_PROGRESS"].includes(selected.status)} templates={templates}/><h3>Riwayat tindak lanjut</h3><ul className="hosted-task-list">{selected.events.map((event,i)=><li key={`${event.createdAt}:${i}`}><strong>{event.actorName} · {event.visibility==="PUBLIC"?"Pembaruan pelapor":"Internal"}</strong><p className="hosted-meeting-text">{event.note}</p><small>{new Intl.DateTimeFormat("id-ID",{dateStyle:"medium",timeStyle:"short",timeZone:"Africa/Cairo"}).format(new Date(event.createdAt))} · {event.action}</small></li>)}</ul>
  </section>:null}
 </div>;
}
