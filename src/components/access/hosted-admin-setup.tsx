"use client";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {adminDirectorySchema,type AdminDirectory} from "@/platform/identity/hosted-admin-contract";

const statusLabels:Record<string,string>={PLANNED:"Direncanakan",ACTIVE:"Aktif",CLOSING:"Masa serah terima",CLOSED:"Ditutup"};
// Modules treat a period as working only between its dates, whatever the stored status says; show that here too.
export function periodState(p:{status:string;startsOn:string;endsOn:string}):string{
  const today=new Date().toISOString().slice(0,10),label=statusLabels[p.status]??p.status;
  if((p.status==="ACTIVE"||p.status==="CLOSING")&&p.endsOn<today)return `${label} · tanggal berakhir sudah lewat, modul tidak memakai periode ini`;
  if((p.status==="ACTIVE"||p.status==="CLOSING")&&p.startsOn>today)return `${label} · belum dimulai`;
  if(p.status==="PLANNED"&&p.startsOn<=today)return `${label} · menunggu aktivasi resmi`;
  return label;
}

export function HostedAdminSetup():React.JSX.Element {
  const router=useRouter();
  const [directory,setDirectory]=useState<AdminDirectory>({organizations:[],periods:[]});
  const [busy,setBusy]=useState(false);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const [code,setCode]=useState("KPI_PPMI_MESIR");
  const [name,setName]=useState("KPI PPMI Mesir");
  const [period,setPeriod]=useState("");
  const [start,setStart]=useState("");
  const [end,setEnd]=useState("");
  async function load(){setLoading(true);setError("");try{const r=await fetch("/api/v1/auth/administration",{cache:"no-store"});if(!r.ok)throw new Error("Pengaturan tidak dapat dibaca. Periksa akses administrator.");setDirectory(adminDirectorySchema.parse(await r.json()));}catch(e){setError(e instanceof Error?e.message:"Gagal membaca pengaturan.");}finally{setLoading(false);}}
  useEffect(()=>{void load();},[]);
  async function save(e:React.FormEvent<HTMLFormElement>){e.preventDefault();if(busy)return;setBusy(true);setError("");setNotice("");try{const r=await fetch("/api/v1/auth/administration",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({organizationCode:code,organizationName:name,periodCode:period,startsOn:start,endsOn:end})});if(!r.ok)throw new Error(r.status===409?"Kode sudah dipakai dengan nama atau tanggal berbeda. Periksa daftar yang tersimpan.":r.status===400?"Periksa kode dan tanggal resmi. Tanggal akhir tidak boleh sudah lewat.":"Pengaturan gagal disimpan. Periksa akses dan koneksi.");setDirectory(adminDirectorySchema.parse(await r.json()));setNotice("Organisasi dan periode tersimpan. Modul lain memakai periode terbaru setelah halamannya dibuka ulang.");setPeriod("");setStart("");setEnd("");router.refresh();}catch(e){setError(e instanceof Error?e.message:"Gagal menyimpan.");}finally{setBusy(false);}}
  return <><form className="portal-form-card" onSubmit={save}><header className="portal-form-card__head"><h2>Organisasi dan periode resmi</h2><p>Isi sesuai keputusan KPI. Periode baru yang tanggal mulainya hari ini atau sudah lewat langsung tersimpan sebagai aktif; periode mendatang dicatat sebagai rencana. Pastikan sudah ada keputusan resmi sebelum menyimpan periode yang sudah dimulai.</p></header><div className="portal-form-grid"><label>Kode organisasi<input required pattern="[A-Z][A-Z0-9_]{1,63}" maxLength={64} value={code} disabled={busy} onChange={e=>setCode(e.target.value.toUpperCase())}/></label><label>Nama organisasi<input required minLength={3} maxLength={180} value={name} disabled={busy} onChange={e=>setName(e.target.value)}/></label><label>Kode periode<input required pattern="[A-Z0-9][A-Z0-9_/\-]{1,63}" maxLength={64} value={period} disabled={busy} onChange={e=>setPeriod(e.target.value.toUpperCase())}/></label><label>Tanggal mulai<input required type="date" value={start} disabled={busy} onChange={e=>setStart(e.target.value)}/></label><label>Tanggal akhir<input required type="date" min={start || undefined} value={end} disabled={busy} onChange={e=>setEnd(e.target.value)}/></label></div><div className="portal-form-actions"><button className="button button--primary" type="submit" disabled={busy}>{busy?"Menyimpan…":"Simpan organisasi dan periode"}</button></div>{error?<p role="alert">{error}</p>:null}{notice?<p role="status">{notice}</p>:null}</form><section className="operations-panel"><h2>Data yang tersimpan</h2>{loading?<p role="status">Membaca data…</p>:directory.organizations.length?<ul>{directory.organizations.map(o=><li key={o.id}><strong>{o.name} · {o.code}</strong><ul>{directory.periods.filter(p=>p.organizationId===o.id).map(p=><li key={p.id}>{p.code} · {p.startsOn}–{p.endsOn} · {periodState(p)}</li>)}</ul></li>)}</ul>:<p>Belum ada organisasi atau periode.</p>}<button className="button button--quiet" type="button" disabled={busy || loading} onClick={()=>void load()}>Muat ulang daftar</button></section></>;
}

