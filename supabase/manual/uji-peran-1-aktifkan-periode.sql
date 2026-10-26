-- Aktifkan periode resmi 2026_2027 (PLANNED -> ACTIVE).
-- Jalankan sebagai owner database di SQL Editor HANYA setelah KPI menerbitkan keputusan resmi.
-- Tidak ada RPC aplikasi yang mengubah status periode; status tidak berubah sendiri saat tanggal mulai lewat.
begin;
do $$
declare
  decision_reference text := null; -- contoh: 'Keputusan Ketua KPI No. .../2026 tanggal ...'
  target org.periods;
begin
  if decision_reference is null or length(trim(decision_reference)) < 5 then
    raise exception 'Isi rujukan keputusan resmi pengaktifan periode terlebih dahulu';
  end if;
  select p.* into target from org.periods p join org.organizations o on o.id=p.organization_id
    where o.code='KPI_PPMI_MESIR' and p.code='2026_2027' for update of p;
  if target.id is null then raise exception 'Periode KPI_PPMI_MESIR / 2026_2027 belum terdaftar'; end if;
  if target.status='ACTIVE' then raise notice 'Periode sudah ACTIVE; tidak ada perubahan'; return; end if;
  if target.status<>'PLANNED' or current_date not between target.starts_on and target.ends_on then
    raise exception 'Periode harus PLANNED dan hari ini harus berada di dalam masa periode';
  end if;
  update org.periods set status='ACTIVE' where id=target.id;
  insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata)
    values('OFFICIAL_PERIOD_ACTIVATED','org','period',target.id,'SUCCESS','manual:' || gen_random_uuid(),
      jsonb_build_object('decisionReference',trim(decision_reference)));
end $$;
select o.code as organization,p.code as period,p.starts_on,p.ends_on,p.status
from org.organizations o join org.periods p on p.organization_id=o.id where o.code='KPI_PPMI_MESIR';
commit;
