-- Hapus seluruh DATA CONTOH yang dipasang contoh-isi.sql.
-- Jalankan sebagai owner database di SQL Editor SEBELUM mengaktifkan periode resmi 2026_2027.
-- Semua baris di periode CONTOH ikut terhapus, termasuk data yang sempat dibuat lewat portal saat mencoba.
-- Catatan audit (audit.audit_events) sengaja dibiarkan sebagai jejak bahwa data contoh pernah ada.
begin;
do $$
declare oid uuid; pid uuid; contoh uuid[];
begin
 select id into strict oid from org.organizations where code='KPI_PPMI_MESIR';
 select id into pid from org.periods where organization_id=oid and code='CONTOH';
 select coalesce(array_agg(id),'{}') into contoh from identity.accounts where email like '%@contoh.invalid';
 if pid is null and cardinality(contoh)=0 then raise notice 'Tidak ada data CONTOH; tidak ada perubahan'; return; end if;
 -- Berhenti dengan pesan jelas, bukan galat foreign key di tengah jalan.
 if exists(select 1 from org.assignments a join org.positions p on p.id=a.position_id where p.organization_id=oid and p.code like 'CONTOH\_%' escape '\' and a.period_id is distinct from pid) then
  raise exception 'Ada penugasan di periode resmi yang memakai jabatan CONTOH_. Akhiri atau pindahkan dulu, lalu jalankan lagi';
 end if;
 if exists(select 1 from governance.information_resources where period_id=pid and hold_reference is not null) then
  raise exception 'Ada objek periode CONTOH yang dilindungi sebagai bukti. Lepaskan perlindungannya dulu lewat portal, lalu jalankan lagi';
 end if;
 -- Berkas fisik tidak terhapus oleh SQL. Hapus path berikut dari bucket kpi-private lewat dasbor Storage.
 if exists(select 1 from files.managed_assets where period_id=pid) then
  raise notice 'Berkas di Storage yang perlu dihapus manual: %',(select string_agg(object_path,', ') from files.managed_assets where period_id=pid);
 end if;

 if pid is not null then
  -- Pengaduan
  delete from intake.case_evidence_events where evidence_id in (select e.id from intake.case_evidence e join intake.cases c on c.id=e.case_id where c.period_id=pid);
  delete from intake.case_evidence where case_id in (select id from intake.cases where period_id=pid);
  delete from intake.case_form_events where form_id in (select f.id from intake.case_forms f join intake.cases c on c.id=f.case_id where c.period_id=pid);
  delete from intake.case_form_revisions where form_id in (select f.id from intake.case_forms f join intake.cases c on c.id=f.case_id where c.period_id=pid);
  delete from intake.case_forms where case_id in (select id from intake.cases where period_id=pid);
  delete from intake.case_events where case_id in (select id from intake.cases where period_id=pid);
  delete from intake.case_personnel where case_id in (select id from intake.cases where period_id=pid);
  delete from intake.cases where period_id=pid;
  delete from intake.form_templates where period_id=pid;
  delete from intake.routing where period_id=pid;
  delete from intake.rate_limits where fingerprint=md5('kpi-contoh-sidik')||md5('kpi-contoh-sidik-2');
  -- Notifikasi
  delete from notifications.outbox where notification_id in (select id from notifications.inbox where period_id=pid);
  delete from notifications.inbox where period_id=pid;
  -- Tugas dan rapat
  delete from work.meeting_followups where meeting_id in (select id from work.meetings where period_id=pid);
  delete from work.meeting_votes where motion_id in (select m.id from work.meeting_motions m join work.meetings t on t.id=m.meeting_id where t.period_id=pid);
  delete from work.meeting_motions where meeting_id in (select id from work.meetings where period_id=pid);
  delete from work.meeting_participants where meeting_id in (select id from work.meetings where period_id=pid);
  delete from work.meeting_events where meeting_id in (select id from work.meetings where period_id=pid);
  delete from work.task_templates where period_id=pid;
  delete from work.task_dependencies where task_id in (select id from work.tasks where period_id=pid) or prerequisite_id in (select id from work.tasks where period_id=pid);
  delete from work.task_events where task_id in (select id from work.tasks where period_id=pid);
  -- Lampiran modul menunjuk berkas; hapus dulu sebelum berkas.
  delete from files.module_attachments where asset_id in (select id from files.managed_assets where period_id=pid);
  delete from work.meetings where period_id=pid;
  update work.tasks set parent_task_id=null where period_id=pid;
  delete from work.tasks where period_id=pid;
  -- Konten
  delete from content.publication_schedule where item_id in (select id from content.managed_items where period_id=pid);
  delete from content.managed_revisions where item_id in (select id from content.managed_items where period_id=pid);
  delete from content.managed_items where period_id=pid;
  -- Keuangan, evaluasi, serah terima, AI
  delete from management.events where record_id in (select id from management.records where period_id=pid);
  delete from management.records where period_id=pid;
  delete from management.reservations where period_id=pid;
  -- Berkas (metadata saja; berkas fisik di Storage tidak dibuat oleh contoh-isi.sql)
  delete from files.managed_assets where period_id=pid;
  -- Tata kelola
  delete from governance.workflow_events where record_id in (select id from governance.workflow_records where period_id=pid);
  delete from governance.workflow_records where period_id=pid;
  delete from governance.access_reviews where decision_id in (select id from governance.access_decisions where period_id=pid);
  delete from identity.permission_grants where period_id=pid;
  delete from governance.access_decisions where period_id=pid;
  delete from governance.mandate_submissions where period_id=pid;
  delete from governance.access_authorities where period_id=pid;
  delete from governance.conflicts where period_id=pid;
  delete from governance.information_resources where period_id=pid;
  -- Organisasi
  delete from org.assignments where period_id=pid;
  delete from org.periods where id=pid;
 end if;
 delete from org.positions where organization_id=oid and code like 'CONTOH\_%' escape '\';
 delete from org.divisions where organization_id=oid and code like 'CONTOH\_%' escape '\';

 -- Akun contoh
 delete from notifications.delivery_preferences where account_id=any(contoh);
 delete from management.ai_usage where account_id=any(contoh);
 delete from identity.account_roles where account_id=any(contoh);
 delete from identity.accounts where id=any(contoh);
 delete from auth.users where email like '%@contoh.invalid' and raw_app_meta_data->>'kpi_contoh'='true';

 insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata)
  values('SAMPLE_DATA_REMOVED','org','period',pid,'SUCCESS','manual:'||gen_random_uuid(),jsonb_build_object('accounts',cardinality(contoh)));
end $$;
select o.code as organization,p.code as period,p.status from org.organizations o join org.periods p on p.organization_id=o.id where o.code='KPI_PPMI_MESIR';
commit;
