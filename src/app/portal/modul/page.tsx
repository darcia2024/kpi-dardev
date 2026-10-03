import Link from "next/link";
import {getHostedIdentity} from "@/platform/identity/hosted-auth";
import {visiblePortalNavigation} from "@/lib/portal-navigation";
import {PortalDemoPanel} from "@/components/portal/portal-demo-panel";
export default async function ModulePage({searchParams}:{searchParams:Promise<{module?:string}>}):Promise<React.JSX.Element>{
  const identity=await getHostedIdentity();
  if(!identity?.systemAdmin)return <div className="portal-shell"><h1>Akses administrator diperlukan</h1><Link href="/portal">Kembali ke portal</Link></div>;
  const path=(await searchParams).module;
  const module=visiblePortalNavigation(()=>true).find(item=>item.href===path);
  return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">Pengelolaan modul</p><h1>{module?.label || "Halaman tidak ditemukan"}</h1><p>Administrator memiliki izin pengelolaan modul ini.</p></header>{module ? <PortalDemoPanel href={module.href}/> : null}<section className="operations-panel"><h2>{module?"Penyimpanan online belum dihubungkan":"Periksa tujuan halaman"}</h2><p>{module?"Alur modul ini sudah tersedia dalam pengembangan lokal, tetapi belum terhubung ke database production. Contoh di atas tidak menjadi catatan operasional. Halaman ini belum menerima perubahan data operasional.":"Tujuan tidak terdaftar dalam navigasi portal KPI."}</p><Link className="button button--primary" href="/portal/tugas">Buka tugas yang sudah online</Link><Link className="button button--quiet" href="/portal/pengaturan">Kelola organisasi dan periode</Link></section></div>;
}
