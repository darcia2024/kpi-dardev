begin;
create table intake.case_forms (
 id uuid primary key,case_id uuid not null references intake.cases(id),
 code text not null check(code in ('01','02','03','04','05','06','07')),
 title text not null check(length(trim(title)) between 3 and 180),
 template_version text not null default 'KPI-CASE-20261005-v1',
 answers jsonb not null check(jsonb_typeof(answers)='object' and octet_length(answers::text)<=140000),
 version integer not null default 1,updated_at timestamptz not null default now(),
 author_account_id uuid not null references identity.accounts(id)
);
create index on intake.case_forms(case_id,updated_at);
create table intake.case_form_revisions (
 form_id uuid not null references intake.case_forms(id),version integer not null,
 title text not null,answers jsonb not null,author_account_id uuid not null references identity.accounts(id),
 updated_at timestamptz not null default now(),primary key(form_id,version)
);
alter table intake.case_forms enable row level security;
alter table intake.case_form_revisions enable row level security;
revoke all on intake.case_forms,intake.case_form_revisions from public,anon,authenticated;

create function intake.form_json(item intake.case_forms) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',item.id,'code',item.code,'title',item.title,'version',item.version,
 'templateVersion',item.template_version,'answers',item.answers,'updatedAt',item.updated_at,
 'authorName',(select display_name from identity.accounts where id=item.author_account_id),
 'history',(select coalesce(jsonb_agg(jsonb_build_object('version',r.version,'title',r.title,'answers',r.answers,
 'authorName',a.display_name,'updatedAt',r.updated_at) order by r.version desc),'[]'::jsonb)
 from intake.case_form_revisions r join identity.accounts a on a.id=r.author_account_id where r.form_id=item.id))
$$;
create function public.kpi_case_forms(case_id uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare item intake.cases;
begin
 select * into item from intake.cases where id=case_id;
 if item.id is null or not intake.can_read(item) then raise exception 'Case access denied' using errcode='42501';end if;
 return (select coalesce(jsonb_agg(intake.form_json(f) order by f.code,f.updated_at),'[]'::jsonb) from intake.case_forms f where f.case_id=item.id);
end $$;
create function public.kpi_case_form_save(case_id uuid,input jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare item intake.cases;form intake.case_forms;fid uuid;expected integer;actor uuid:=identity.current_account_id();code text;section_limit integer;
begin
 select * into item from intake.cases where id=case_id for update;
 if item.id is null or not intake.can_read(item) or not intake.permission('CASE_MANAGE',item) then raise exception 'Case management denied' using errcode='42501';end if;
 if item.status not in ('RECEIVED','TRIAGED','IN_PROGRESS') then raise exception 'Case is under review or closed' using errcode='22023';end if;
 if input is null or jsonb_typeof(input)<>'object' or input->>'id' is null or input->>'expectedVersion' is null then raise exception 'Invalid form' using errcode='22023';end if;
 fid:=(input->>'id')::uuid;expected:=(input->>'expectedVersion')::integer;code:=input->>'code';
 section_limit:=case code when '01' then 10 when '02' then 13 when '03' then 17 when '04' then 17 when '05' then 24 when '06' then 23 when '07' then 20 else 0 end;
 if section_limit=0 or expected<0 or length(trim(coalesce(input->>'title',''))) not between 3 and 180
 or jsonb_typeof(input->'answers') is distinct from 'object' or octet_length((input->'answers')::text)>140000 then raise exception 'Invalid form fields' using errcode='22023';end if;
 if exists(select 1 from jsonb_each(input->'answers') v where jsonb_typeof(v.value)<>'string' or length(v.value#>>'{}')>6000 or (v.key<>'HEADER' and (v.key !~ '^[A-X]$' or ascii(v.key)-64>section_limit))) then raise exception 'Invalid form section' using errcode='22023';end if;
 select * into form from intake.case_forms where id=fid for update;
 if form.id is not null then
  if form.case_id<>item.id then raise exception 'Case access denied' using errcode='42501';end if;
  if form.code<>code then raise exception 'Template cannot change' using errcode='22023';end if;
  if expected=0 and form.version=1 and form.author_account_id=actor and form.title=trim(input->>'title') and form.answers=input->'answers' then return intake.form_json(form);end if;
  if form.version<>expected then raise exception 'Form changed' using errcode='40001';end if;
  update intake.case_forms set title=trim(input->>'title'),answers=input->'answers',version=version+1,updated_at=now(),author_account_id=actor where id=fid returning * into form;
 else
  if expected<>0 then raise exception 'Form changed' using errcode='40001';end if;
  insert into intake.case_forms(id,case_id,code,title,answers,author_account_id) values(fid,item.id,code,trim(input->>'title'),input->'answers',actor) returning * into form;
 end if;
 insert into intake.case_form_revisions(form_id,version,title,answers,author_account_id) values(form.id,form.version,form.title,form.answers,actor);
 insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata)
 values('CASE_FORM_DRAFT_SAVED','intake','case',item.id,'SUCCESS','hosted:'||gen_random_uuid(),jsonb_build_object('actorAccountId',actor,'formId',form.id,'formCode',code,'formVersion',form.version));
 return intake.form_json(form);
end $$;
revoke all on function intake.form_json(intake.case_forms),public.kpi_case_forms(uuid),public.kpi_case_form_save(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.kpi_case_forms(uuid),public.kpi_case_form_save(uuid,jsonb) to authenticated;
commit;
