"use client";

import {usePathname} from "next/navigation";
import {PortalDemoPanel} from "@/components/portal/portal-demo-panel";

const operationalPages = new Set(["/portal", "/portal/tugas", "/portal/profil", "/portal/akses", "/portal/pengaturan"]);

export function PortalDemoForRoute(): React.JSX.Element | null {
  const pathname = usePathname();
  if (!operationalPages.has(pathname)) return null;
  return <div className="portal-demo-appendix"><PortalDemoPanel href={pathname}/></div>;
}
