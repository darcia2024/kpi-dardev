-- Extra sample records for tutorial screenshots, on top of contoh-isi.sql. In-memory database only.
begin;
do $$
declare
 k uuid:='c0a00000-0000-4000-8000-000000000001'; s uuid:='c0a00000-0000-4000-8000-000000000002'; b uuid:='c0a00000-0000-4000-8000-000000000003';
 p uuid:='c0a00000-0000-4000-8000-000000000004'; m uuid:='c0a00000-0000-4000-8000-000000000005'; i uuid:='c0a00000-0000-4000-8000-000000000006';
 admin uuid:='093b761f-d1c7-433c-8153-0f271e85664c';
 oid uuid; pid uuid; authority uuid; r jsonb; mt jsonb; asset uuid;
 starts text:=to_char(now() at time zone 'utc','YYYY-MM-DD"T"HH24:MI:SS"Z"'); ends text:=to_char((now()+interval '30 days') at time zone 'utc','YYYY-MM-DD"T"HH24:MI:SS"Z"');
begin
 select id into strict oid from org.organizations where code='KPI_PPMI_MESIR';
 select id into strict pid from org.periods where organization_id=oid and code='CONTOH';
 update governance.access_authorities set permissions=permissions||array['SOP_ACCESS_REVIEW','SOP_ACCESS_SUSPEND','SOP_SECRET_APPROVE','SOP_INCIDENT_HANDLE','SOP_INCIDENT_APPROVE','INFORMATION_CLASSIFY'] where period_id=pid;
 select id into strict authority from governance.access_authorities where period_id=pid and account_id=k;

 -- F01 waiting for a decision.
 perform pg_temp.kpi_contoh_as(p);
 perform public.kpi_governance_create('ACCESS',jsonb_build_object('organizationId',oid,'periodId',pid,'classification','INTERNAL','formReference','F01-CONTOH-014','requestType','GRANT','permissions',array['MEETING_READ','TASK_REVIEW'],'purpose','Menyiapkan rapat koordinasi sosialisasi','informationScope','Rapat dan tugas Divisi Pencegahan','mandateReference','Keputusan penugasan koordinator (CONTOH)','startsAt',starts,'expiresAt',ends),gen_random_uuid());
 -- F01 decided, waiting for the technical administrator.
 perform pg_temp.kpi_contoh_as(m);
 r:=public.kpi_governance_create('ACCESS',jsonb_build_object('organizationId',oid,'periodId',pid,'classification','INTERNAL','formReference','F01-CONTOH-015','requestType','GRANT','permissions',array['CONTENT_REVIEW'],'purpose','Membantu memeriksa naskah publikasi','informationScope','Naskah redaksi periode CONTOH','mandateReference','Keputusan penugasan Media (CONTOH)','startsAt',starts,'expiresAt',ends),gen_random_uuid());
 perform pg_temp.kpi_contoh_as(k);
 perform public.kpi_governance_action((r->>'id')::uuid,(r->>'version')::int,'DECIDE',jsonb_build_object('authorityId',authority,'outcome','APPROVED','approvedPermissions',array['CONTENT_REVIEW'],'reference','Keputusan Ketua (CONTOH)','needFinding','Dibutuhkan untuk tugas redaksi','note','Disetujui sampai akhir periode contoh'));
 -- Incident report and a review that has come due.
 perform pg_temp.kpi_contoh_as(m);
 perform public.kpi_governance_create('INCIDENT',jsonb_build_object('organizationId',oid,'periodId',pid,'formReference','F03-CONTOH-002','incidentType','MIS_SEND','description','Berkas contoh terkirim ke grup yang salah lalu segera dihapus.','system','Grup percakapan panitia','affectedClassification','INTERNAL','initialAction','Pesan dihapus dan admin grup diberi tahu.'),gen_random_uuid());
 update governance.access_decisions set review_due_at=now()-interval '2 days' where id=(select id from governance.access_decisions where period_id=pid and recipient_account_id=i and permission='TASK_READ' limit 1);
 -- A meeting whose minutes wait for review, with Ketua and Laila invited.
 perform pg_temp.kpi_contoh_as(p);
 mt:=public.kpi_meeting_create('KPI_PPMI_MESIR','CONTOH',jsonb_build_object('title','CONTOH · Evaluasi program sosialisasi','agenda','Hasil sosialisasi bulan lalu dan rencana bulan depan.','startsAt',to_char((now()+interval '3 days') at time zone 'utc','YYYY-MM-DD"T"HH24:MI:SS"Z"'),'participantAccountIds',array[k,s,p,i],'idempotencyKey',gen_random_uuid()));
 mt:=public.kpi_meeting_action((mt->>'id')::uuid,(mt->>'version')::int,'SAVE_MINUTES',jsonb_build_object('note','Draf notulen awal','summary','Peserta sepakat menambah satu sesi sosialisasi untuk mahasiswa baru.'));
 mt:=public.kpi_meeting_action((mt->>'id')::uuid,(mt->>'version')::int,'SUBMIT_MINUTES',jsonb_build_object('note','Mohon diperiksa'));
 -- Documents in each state.
 insert into files.managed_assets(organization_id,period_id,owner_account_id,original_name,mime_type,size_bytes,sha256,object_path,request_key,status)
  select oid,pid,x.owner,x.name,'application/pdf',x.size,repeat('a',64),'contoh/'||gen_random_uuid(),gen_random_uuid(),x.status
  from (values(admin,'CONTOH Notulen rapat pleno.pdf',184000,'AVAILABLE'),(p,'CONTOH Laporan kegiatan sosialisasi.pdf',412000,'AVAILABLE'),(admin,'CONTOH Surat keputusan panitia.pdf',96000,'PENDING_SCAN')) x(owner,name,size,status);
 update governance.information_resources r set classification='INTERNAL',classification_reference='Ditetapkan pengunggah' from files.managed_assets a where a.id=r.id and a.original_name in ('CONTOH Notulen rapat pleno.pdf','CONTOH Laporan kegiatan sosialisasi.pdf');
 select id into asset from files.managed_assets where original_name='CONTOH Laporan kegiatan sosialisasi.pdf';
 -- A declared conflict of interest.
 perform pg_temp.kpi_contoh_as(i);
 perform public.kpi_conflict_action('DECLARE',jsonb_build_object('organizationId',oid,'periodId',pid,'objectId',asset,'reference','Ikut menjadi panitia kegiatan yang dilaporkan (CONTOH)'));
 perform set_config('request.jwt.claim.sub','',true);
end $$;
commit;
