-- Aktifkan beberapa akun pengurus sekaligus untuk uji peran (UAT).
-- 1. Undang setiap orang lewat Supabase Dashboard > Authentication > Users > Invite user.
--    Mereka membuat kata sandi sendiri dari email undangan; jangan kirim sandi lewat chat.
-- 2. Setelah email terverifikasi, isi daftar di bawah lalu jalankan sebagai owner database.
-- Skrip ini hanya membuka login portal (peran teknis PENGURUS). Jabatan diisi admin di /portal/pengaturan,
-- dan izin modul diberikan lewat formulir F01 di /portal/kebijakan. Tidak ada izin bisnis otomatis.
begin;
do $$
declare
  daftar jsonb := '[]'; -- contoh: '[{"email":"nama@domain.com","nama":"Nama Resmi"}]'
  entry jsonb;
  auth_id uuid;
  verified_email text;
  new_account uuid;
  pengurus_role uuid;
begin
  if jsonb_typeof(daftar)<>'array' or jsonb_array_length(daftar)=0 then raise exception 'Isi daftar akun terlebih dahulu'; end if;
  insert into identity.roles(code,name,is_system_role) values('PENGURUS','PENGURUS',true) on conflict(code) do nothing;
  select id into pengurus_role from identity.roles where code='PENGURUS';
  for entry in select * from jsonb_array_elements(daftar) loop
    if coalesce(length(trim(entry->>'nama')),0) < 2 then raise exception 'Nama resmi wajib untuk %', entry->>'email'; end if;
    select id,lower(email) into auth_id,verified_email from auth.users
      where lower(email)=lower(trim(entry->>'email')) and email_confirmed_at is not null;
    if auth_id is null then raise exception 'Akun Auth % belum ada atau email belum diverifikasi', entry->>'email'; end if;
    insert into identity.accounts(auth_user_id,email,display_name,status)
      values(auth_id,verified_email,trim(entry->>'nama'),'ACTIVE')
      on conflict(email) do update set auth_user_id=excluded.auth_user_id,display_name=excluded.display_name,status='ACTIVE',deactivated_at=null
      where identity.accounts.auth_user_id is null or identity.accounts.auth_user_id=excluded.auth_user_id
      returning id into new_account;
    if new_account is null then raise exception 'Akun % sudah terhubung ke pengguna Auth lain', verified_email; end if;
    insert into identity.account_roles(account_id,role_id)
      select new_account,pengurus_role where not exists(select 1 from identity.account_roles r where r.account_id=new_account
        and r.role_id=pengurus_role and r.starts_at<=now() and (r.ends_at is null or r.ends_at>now()));
    update auth.users set raw_app_meta_data=coalesce(raw_app_meta_data,'{}'::jsonb) || jsonb_build_object('kpi_access',true,'kpi_role','PENGURUS')
      where id=auth_id and coalesce(raw_app_meta_data->>'kpi_role','')<>'ADMIN_SISTEM';
    insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata)
      values('ACCOUNT_ACTIVATED','identity','account',new_account,'SUCCESS','manual:' || gen_random_uuid(),
        jsonb_build_object('authUserId',auth_id,'technicalRole','PENGURUS','purpose','UAT role check','operationalPermissionsGranted',false));
  end loop;
end $$;
select a.email,a.display_name,a.status from identity.accounts a order by a.email;
commit;
