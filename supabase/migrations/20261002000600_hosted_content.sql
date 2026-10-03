begin;
create schema if not exists content;
revoke all on schema content from public,anon,authenticated;
create table content.managed_items (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references org.organizations(id), period_id uuid not null references org.periods(id), division_id uuid references org.divisions(id),
 kind text not null check(kind in ('KNOWLEDGE','PUBLICATION')), title text not null, summary text not null, body text not null, source text not null,
 locale text not null check(locale in ('id','en')), slug text not null,
 created_by_account_id uuid not null references identity.accounts(id), author_account_id uuid not null references identity.accounts(id), reviewer_account_id uuid references identity.accounts(id),
 status text not null default 'DRAFT' check(status in ('DRAFT','IN_REVIEW','REVISION','APPROVED','PUBLISHED','ARCHIVED')),
 version integer not null default 1, request_key uuid not null, published_at timestamptz, updated_at timestamptz not null default now(),
 unique(created_by_account_id,request_key), unique(organization_id,kind,locale,slug)
);
create table content.managed_revisions (
 item_id uuid references content.managed_items(id), version integer not null, snapshot jsonb not null,
 actor_account_id uuid not null references identity.accounts(id), action text not null, note text not null, created_at timestamptz not null default now(),primary key(item_id,version)
);
alter table content.managed_items enable row level security;
alter table content.managed_revisions enable row level security;
revoke all on content.managed_items,content.managed_revisions from public,anon,authenticated;
create index managed_content_scope on content.managed_items(organization_id,period_id,kind,updated_at desc);

create function content.can_read(kind text,oid uuid,pid uuid,did uuid,object_id uuid default null) returns boolean language sql stable security definer set search_path='' as $$
 select case when kind='KNOWLEDGE' then identity.has_permission('KNOWLEDGE_READ',oid,pid,did,object_id)
 when kind='PUBLICATION' then identity.has_permission('CONTENT_DRAFT_WRITE',oid,pid,did,object_id) or identity.has_permission('CONTENT_REVIEW',oid,pid,did,object_id) or identity.has_permission('CONTENT_PUBLISH',oid,pid,did,object_id) else false end;
$$;
revoke all on function content.can_read(text,uuid,uuid,uuid,uuid) from public,anon,authenticated;
create policy managed_content_read on content.managed_items for select to authenticated using(content.can_read(kind,organization_id,period_id,division_id,id));
create function content.item_json(item content.managed_items) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',item.id,'kind',item.kind,'title',item.title,'summary',item.summary,'body',item.body,'source',item.source,'locale',item.locale,'slug',item.slug,
 'divisionCode',(select code from org.divisions where id=item.division_id),'authorAccountId',item.author_account_id,'reviewerAccountId',item.reviewer_account_id,
 'status',item.status,'version',item.version,'updatedAt',item.updated_at,'publishedAt',item.published_at,
 'events',(select coalesce(jsonb_agg(jsonb_build_object('action',r.action,'note',r.note,'actorName',a.display_name,'version',r.version,'createdAt',r.created_at) order by r.version),'[]'::jsonb)
 from content.managed_revisions r join identity.accounts a on a.id=r.actor_account_id where r.item_id=item.id));
$$;
revoke all on function content.item_json(content.managed_items) from public,anon,authenticated;
create function content.validate_fields(input jsonb) returns boolean language sql immutable set search_path='' as $$
 select coalesce(jsonb_typeof(input)='object' and length(trim(input->>'title')) between 3 and 180 and length(trim(input->>'summary')) between 3 and 1000
 and length(trim(input->>'body')) between 10 and 30000 and length(trim(input->>'source')) between 3 and 1000 and input->>'locale' in ('id','en')
 and length(input->>'slug') between 1 and 150 and input->>'slug' ~ '^[a-z0-9]+(-[a-z0-9]+)*$',false);
$$;
revoke all on function content.validate_fields(jsonb) from public,anon,authenticated;

create function public.kpi_content_list(organization_code text,period_code text,item_kind text,division_code text default null) returns jsonb language plpgsql stable security definer set search_path='' as $$
#variable_conflict use_variable
declare oid uuid;pid uuid;did uuid;
begin
 select o.id,p.id into oid,pid from org.organizations o join org.periods p on p.organization_id=o.id where o.code=organization_code and p.code=period_code;
 if division_code is not null then select id into did from org.divisions where organization_id=oid and code=division_code; end if;
 if oid is null or (division_code is not null and did is null) or not content.can_read(item_kind,oid,pid,did) then raise exception 'Access denied' using errcode='42501';end if;
 return (select coalesce(jsonb_agg(content.item_json(i) order by i.updated_at desc,i.id),'[]'::jsonb) from (select * from content.managed_items m
 where m.organization_id=oid and m.period_id=pid and m.kind=item_kind and (division_code is null or m.division_id=did) and content.can_read(m.kind,oid,pid,m.division_id,m.id) order by m.updated_at desc,m.id limit 100) i);
end $$;
create function public.kpi_content_detail(item_id uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare item content.managed_items;
begin
 select * into item from content.managed_items where id=item_id;
 if item.id is null or not content.can_read(item.kind,item.organization_id,item.period_id,item.division_id,item.id) then raise exception 'Access denied' using errcode='42501';end if;
 return content.item_json(item);
end $$;
create function public.kpi_content_create(organization_code text,period_code text,item_kind text,input jsonb,division_code text default null) returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare oid uuid;pid uuid;did uuid;actor uuid:=identity.current_account_id();key uuid;item content.managed_items;f jsonb:=input->'fields';
begin
 select o.id,p.id into oid,pid from org.organizations o join org.periods p on p.organization_id=o.id where o.code=organization_code and p.code=period_code;
 if division_code is not null then select id into did from org.divisions where organization_id=oid and code=division_code;end if;
 if oid is null or (division_code is not null and did is null) or item_kind not in ('KNOWLEDGE','PUBLICATION') or item_kind is null
 or not content.can_read(item_kind,oid,pid,did) or not identity.has_permission(case when item_kind='KNOWLEDGE' then 'KNOWLEDGE_WRITE' else 'CONTENT_DRAFT_WRITE' end,oid,pid,did) then raise exception 'Access denied' using errcode='42501';end if;
 if not content.validate_fields(f) then raise exception 'Invalid content fields' using errcode='22023';end if;
 key:=(input->>'idempotencyKey')::uuid;if key is null then raise exception 'Request key required' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtextextended(actor::text||key::text,0));
 select * into item from content.managed_items where created_by_account_id=actor and request_key=key;
 if item.id is not null then
 if item.organization_id<>oid or item.period_id<>pid or item.division_id is distinct from did or item.kind<>item_kind
 or (select snapshot->'fields' from content.managed_revisions where item_id=item.id and version=1) is distinct from f then raise exception 'Request key already used' using errcode='40001';end if;
 return content.item_json(item);end if;
 insert into content.managed_items(organization_id,period_id,division_id,kind,title,summary,body,source,locale,slug,created_by_account_id,author_account_id,request_key)
 values(oid,pid,did,item_kind,trim(f->>'title'),trim(f->>'summary'),trim(f->>'body'),trim(f->>'source'),f->>'locale',f->>'slug',actor,actor,key) returning * into item;
 insert into content.managed_revisions(item_id,version,snapshot,actor_account_id,action,note) values(item.id,1,jsonb_build_object('fields',f,'status','DRAFT'),actor,'CREATE','Draf dibuat.');
 insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata) values('CONTENT_CREATED','content',item_kind,item.id,'SUCCESS',key::text,jsonb_build_object('actorAccountId',actor,'version',1));
 return content.item_json(item);
exception when invalid_text_representation then raise exception 'Invalid content values' using errcode='22023';
end $$;
create function public.kpi_content_action(item_id uuid,expected_version integer,command text,input jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare item content.managed_items;actor uuid:=identity.current_account_id();wanted text;f jsonb:=input->'fields';
begin
 select * into item from content.managed_items where id=item_id for update;
 if item.id is null or not content.can_read(item.kind,item.organization_id,item.period_id,item.division_id,item.id) then raise exception 'Access denied' using errcode='42501';end if;
 if expected_version is null or item.version<>expected_version then raise exception 'Content changed; reload first' using errcode='40001';end if;
 if coalesce(length(trim(input->>'note')),0) not between 3 and 2000 or item.status='ARCHIVED' then raise exception 'Invalid content action' using errcode='22023';end if;
 wanted:=case when command in ('SAVE','SUBMIT') then case when item.kind='KNOWLEDGE' then 'KNOWLEDGE_WRITE' else 'CONTENT_DRAFT_WRITE' end
 when command in ('APPROVE','REQUEST_REVISION') then case when item.kind='KNOWLEDGE' then 'KNOWLEDGE_REVIEW' else 'CONTENT_REVIEW' end
 when command in ('PUBLISH','WITHDRAW','ARCHIVE') then case when item.kind='KNOWLEDGE' then 'KNOWLEDGE_REVIEW' else 'CONTENT_PUBLISH' end end;
 if wanted is null or not identity.has_permission(wanted,item.organization_id,item.period_id,item.division_id,item.id) then raise exception 'Access denied' using errcode='42501';end if;
 if command='SAVE' then
 if item.status not in ('DRAFT','REVISION') or not content.validate_fields(f) then raise exception 'Invalid editable content' using errcode='22023';end if;
 item.title:=trim(f->>'title');item.summary:=trim(f->>'summary');item.body:=trim(f->>'body');item.source:=trim(f->>'source');item.locale:=f->>'locale';item.slug:=f->>'slug';item.author_account_id:=actor;item.reviewer_account_id:=null;item.status:='DRAFT';
 elsif command='SUBMIT' then
 if item.status not in ('DRAFT','REVISION') then raise exception 'Invalid submit transition' using errcode='22023';end if;item.status:='IN_REVIEW';
 elsif command in ('APPROVE','REQUEST_REVISION') then
 if actor in (item.created_by_account_id,item.author_account_id) then raise exception 'Independent reviewer required' using errcode='42501';end if;
 if item.status<>'IN_REVIEW' then raise exception 'Content not in review' using errcode='22023';end if;
 item.status:=case when command='APPROVE' then 'APPROVED' else 'REVISION' end;item.reviewer_account_id:=case when command='APPROVE' then actor else null end;
 elsif command='PUBLISH' then
 if item.status<>'APPROVED' or item.reviewer_account_id is null then raise exception 'Approved content required' using errcode='22023';end if;
 item.status:='PUBLISHED';item.published_at:=now();
 elsif command='WITHDRAW' then
 if item.status<>'PUBLISHED' then raise exception 'Content not published' using errcode='22023';end if;
 item.status:='DRAFT';item.reviewer_account_id:=null;item.published_at:=null;
 elsif command='ARCHIVE' then
 if item.status='IN_REVIEW' then raise exception 'Review pending' using errcode='22023';end if;item.status:='ARCHIVED';item.published_at:=null;
 end if;
 update content.managed_items set title=item.title,summary=item.summary,body=item.body,source=item.source,locale=item.locale,slug=item.slug,author_account_id=item.author_account_id,
 reviewer_account_id=item.reviewer_account_id,status=item.status,published_at=item.published_at,version=version+1,updated_at=now() where id=item.id returning * into item;
 insert into content.managed_revisions(item_id,version,snapshot,actor_account_id,action,note) values(item.id,item.version,jsonb_build_object('fields',jsonb_build_object('title',item.title,'summary',item.summary,'body',item.body,'source',item.source,'locale',item.locale,'slug',item.slug),'status',item.status),actor,command,trim(input->>'note'));
 insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata) values('CONTENT_'||command,'content',item.kind,item.id,'SUCCESS','hosted:'||gen_random_uuid(),jsonb_build_object('actorAccountId',actor,'version',item.version));
 return content.item_json(item);
end $$;

create function public.kpi_publications_list(locale_code text default 'id',article_slug text default null) returns jsonb language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object('id',m.id,'title',m.title,'summary',m.summary,'body',case when article_slug is null then null else m.body end,'source',m.source,'locale',m.locale,'slug',m.slug,'publishedAt',m.published_at) order by m.published_at desc,m.id),'[]'::jsonb)
 from (select * from content.managed_items where kind='PUBLICATION' and status='PUBLISHED' and organization_id=(select id from org.organizations where code='KPI') and locale=locale_code and (article_slug is null or slug=article_slug) order by published_at desc,id limit 100) m;
$$;
revoke all on function public.kpi_content_list(text,text,text,text),public.kpi_content_detail(uuid),public.kpi_content_create(text,text,text,jsonb,text),public.kpi_content_action(uuid,integer,text,jsonb),public.kpi_publications_list(text,text) from public,anon;
grant execute on function public.kpi_content_list(text,text,text,text),public.kpi_content_detail(uuid),public.kpi_content_create(text,text,text,jsonb,text),public.kpi_content_action(uuid,integer,text,jsonb) to authenticated;
grant execute on function public.kpi_publications_list(text,text) to anon,authenticated;
notify pgrst,'reload schema';
commit;
