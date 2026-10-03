'use client';
import {useRef} from 'react';
import Image from 'next/image';
export function HostedFloatingAssistant({children}:{children:React.ReactNode}){
 const dialog=useRef<HTMLDialogElement>(null);
 return <><button type="button" className="hm-assistant" aria-label="Buka asisten KPI" onClick={()=>dialog.current?.showModal()}><Image src="/brand/kpi-ppmi-mesir-logo.png" alt="" width={34} height={34}/></button><dialog ref={dialog} className="hm-assistant-dialog"><header><h2>Asisten KPI</h2><button autoFocus type="button" aria-label="Tutup asisten" onClick={()=>dialog.current?.close()}>Tutup</button></header><div>{children}</div></dialog></>;
}
