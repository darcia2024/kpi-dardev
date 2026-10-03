import {HostedRosterAdministration} from "@/components/access/hosted-roster-administration";
import Link from "next/link";
import {getHostedIdentity} from "@/platform/identity/hosted-auth";
import {HostedAdminSetup} from "@/components/access/hosted-admin-setup";
export default async function AdminSetupPage():Promise<React.JSX.Element>{
  const identity=await getHostedIdentity();
  if(!identity?.systemAdmin)return <div className="portal-shell"><h1>Akses administrator diperlukan</h1><Link href="/portal">Kembali ke portal</Link></div>;
  return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">Administrasi KPI</p><h1>Organisasi dan periode</h1><p>Siapkan konteks resmi untuk pekerjaan KPI. Perubahan dicatat dalam audit database.</p></header><HostedAdminSetup/><HostedRosterAdministration/></div>;
}
