-- Catat mandat awal pejabat pemberi keputusan akses (F01) untuk periode 2026_2027.
-- Jalankan sebagai owner database setelah periode ACTIVE dan akun pejabat aktif (uji-peran-2).
-- Mandat pertama tidak bisa dibuat dari portal, karena persetujuan mandat di portal butuh mandat yang sudah ada.
-- Pejabat ini lalu memutuskan F01 untuk akun penguji di /portal/kebijakan; admin sistem melaksanakannya.
-- Izin yang tidak diberikan di sini tidak bisa diberikan pejabat lewat F01. IDENTITY_MANAGE sengaja tidak disertakan.
begin;
do $$
declare
  pejabat_email text := null;     -- email akun pejabat yang ditunjuk KPI
  mandate_reference text := null; -- contoh: 'Keputusan Ketua KPI No. .../2026 tentang kewenangan akses'
  izin text[] := array[
    'WORKSPACE_READ','NOTIFICATION_READ','TASK_READ','TASK_CREATE','TASK_SUBMIT','TASK_REVIEW',
    'MEETING_READ','MEETING_MANAGE','KNOWLEDGE_READ','KNOWLEDGE_WRITE','KNOWLEDGE_REVIEW',
    'CONTENT_DRAFT_WRITE','CONTENT_REVIEW','CONTENT_PUBLISH','ASSET_READ','ASSET_UPLOAD','ASSET_DOWNLOAD',
    'FINANCE_READ','FINANCE_MANAGE','FINANCE_APPROVE_FINAL','EVALUATION_READ','EVALUATION_WRITE',
    'HANDOVER_READ','HANDOVER_ACCEPT','ASPIRATION_TRIAGE','CASE_READ','CASE_MANAGE','CASE_REVIEW',
    'SOP_ACCESS_REVIEW','SOP_ACCESS_SUSPEND'];
  klasifikasi text[] := array['INTERNAL','TERBATAS','RAHASIA']; -- RAHASIA hanya bisa diberikan per objek
  target org.periods;
  pejabat uuid;
begin
  if pejabat_email is null or mandate_reference is null or length(trim(mandate_reference)) < 5 then
    raise exception 'Isi email pejabat dan rujukan mandat resmi terlebih dahulu';
  end if;
  select p.* into target from org.periods p join org.organizations o on o.id=p.organization_id
    where o.code='KPI_PPMI_MESIR' and p.code='2026_2027';
  if target.id is null or target.status<>'ACTIVE' then raise exception 'Aktifkan periode 2026_2027 terlebih dahulu'; end if;
  select id into pejabat from identity.accounts where email=lower(trim(pejabat_email)) and status='ACTIVE' and deactivated_at is null;
  if pejabat is null then raise exception 'Akun pejabat % belum aktif', pejabat_email; end if;
  if exists(select 1 from governance.access_authorities where account_id=pejabat and organization_id=target.organization_id
    and period_id=target.id and revoked_at is null and expires_at>now()) then
    raise notice 'Pejabat sudah memiliki mandat aktif; tidak ada perubahan'; return;
  end if;
  insert into governance.access_authorities(account_id,organization_id,period_id,classifications,permissions,mandate_reference,starts_at,expires_at)
    values(pejabat,target.organization_id,target.id,klasifikasi,izin,trim(mandate_reference),now(),(target.ends_on+1)::timestamptz);
  insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata)
    values('INITIAL_MANDATE_RECORDED','governance','account',pejabat,'SUCCESS','manual:' || gen_random_uuid(),
      jsonb_build_object('mandateReference',trim(mandate_reference),'periodId',target.id));
end $$;
select a.email,g.permissions,g.classifications,g.mandate_reference,g.expires_at
from governance.access_authorities g join identity.accounts a on a.id=g.account_id where g.revoked_at is null;
commit;
