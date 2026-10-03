import Link from "next/link";
import {getHostedIdentity} from "@/platform/identity/hosted-auth";
import {hostedScopes} from "@/platform/authorization/hosted-scopes";
import {HostedContentWorkspace} from "./hosted-content-workspace";
export async function HostedContentPage({kind}:{kind:"KNOWLEDGE"|"PUBLICATION"}):Promise<React.JSX.Element>{
 const identity=await getHostedIdentity();
 if(!identity)return <div className="portal-shell"><h1>Masuk diperlukan</h1><Link href="/masuk">Masuk ke portal</Link></div>;
 const scopes=kind==="KNOWLEDGE"?hostedScopes(identity,"KNOWLEDGE_READ"):[...new Map(["CONTENT_DRAFT_WRITE","CONTENT_REVIEW","CONTENT_PUBLISH"].flatMap(p=>hostedScopes(identity,p as "CONTENT_DRAFT_WRITE"|"CONTENT_REVIEW"|"CONTENT_PUBLISH")).map(s=>[JSON.stringify(s),s])).values()];
 return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">{kind==="KNOWLEDGE"?"Pengetahuan organisasi":"Publikasi KPI"}</p><h1>{kind==="KNOWLEDGE"?"Rujukan internal":"Redaksi dan penerbitan"}</h1><p>Tulis materi, cantumkan sumber dan jalankan review sebelum penerbitan. Setiap perubahan tersimpan dengan riwayat versi.</p></header>{scopes.length?<HostedContentWorkspace identity={identity} scopes={scopes} kind={kind}/>:<section className="operations-panel"><h2>Periode atau izin konten belum aktif</h2><p>Periksa penugasan dan periode kepengurusan yang sesuai.</p><Link href="/portal/akses">Lihat hak akses</Link></section>}</div>;
}
