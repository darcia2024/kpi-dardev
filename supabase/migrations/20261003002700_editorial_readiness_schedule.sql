begin;
alter table content.managed_items add column category text not null default 'PUBLICATION' check(category in ('PUBLICATION','NEWS','EVENT','ROSTER'));
alter table content.managed_items add column public_metadata jsonb not null default '{}'::jsonb;
create table content.publication_schedule(item_id uuid primary key references content.managed_items(id),expected_version integer not null,publish_at timestamptz not null,scheduled_by uuid not null references identity.accounts(id),status text not null default 'PENDING' check(status in ('PENDING','PUBLISHED','BLOCKED','CANCELLED')),reason text,updated_at timestamptz not null default now());
alter table content.publication_schedule enable row level security;
revoke all on content.publication_schedule from public,anon,authenticated;
create function governance.actor_permission(actor uuid,wanted text,oid uuid,pid uuid,did uuid,entity uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from identity.accounts a join auth.users u on u.id=a.auth_user_id where a.id=actor and a.status='ACTIVE' and a.deactivated_at is null and u.email_confirmed_at is not null and lower(u.email)=a.email and u.raw_app_meta_data->>'kpi_access'='true' and u.raw_app_meta_data->>'kpi_role' in ('PENGURUS','ADMIN_SISTEM'))
 and exists(select 1 from identity.permission_grants g join governance.access_decisions d on d.id=g.decision_id
 where g.account_id=actor and g.permission=wanted and g.organization_id=oid and g.period_id=pid and (g.division_id is null or g.division_id=did) and (g.object_id is null or g.object_id=entity)
 and g.starts_at<=now() and g.revoked_at is null and g.expires_at>now() and governance.grant_valid(g) and not governance.has_conflict(actor,oid,pid,entity)
 and governance.classification_rank(d.classification)>=coalesce((select governance.classification_rank(r.classification) from governance.information_resources r where r.id=entity),1)
 and exists(select 1 from org.assignments s join org.positions pos on pos.id=s.position_id join org.periods p on p.id=s.period_id where s.account_id=actor and s.period_id=pid and p.organization_id=oid and pos.organization_id=oid and (g.division_id is null or pos.division_id=g.division_id) and p.status in ('ACTIVE','CLOSING') and current_date between p.starts_on and p.ends_on and s.starts_on<=current_date and (s.ends_on is null or s.ends_on>=current_date)));
$$;
create function content.sensitive_markers(text_value text) returns text[] language sql immutable set search_path='' as $$
 select array_remove(array[
 case when text_value ~* '[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}' then 'EMAIL' end,
 case when text_value ~ '(\+[0-9][0-9 ()-]{7,}[0-9]|(^|[^0-9])[0-9]{10,16}([^0-9]|$))' then 'PHONE_OR_ID' end,
 case when text_value ~* '(paspor|passport|NIK|nomor identitas)[ :#-]+[A-Z0-9]{5,}' then 'IDENTITY_NUMBER' end
 ],null);
$$;
create function public.kpi_content_preflight(item_id uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare item content.managed_items;
begin
 select * into item from content.managed_items where id=item_id;
 if item.id is null or not content.can_read(item.kind,item.organization_id,item.period_id,item.division_id,item.id) then raise exception 'Access denied' using errcode='42501';end if;
 return jsonb_build_object('version',item.version,'markers',content.sensitive_markers(item.title||' '||item.summary||' '||item.body||' '||item.source||' '||item.public_metadata::text),
 'category',item.category,'metadata',item.public_metadata,'schedule',(select jsonb_build_object('publishAt',s.publish_at,'status',s.status,'reason',s.reason) from content.publication_schedule s where s.item_id=item.id),
 'classification',coalesce((select classification from governance.information_resources where id=item.id),'INTERNAL'));
end $$;
create function content.require_public_ready(item content.managed_items) returns void language plpgsql stable security definer set search_path='' as $$
begin
 if item.kind<>'PUBLICATION' then return;end if;
 if not exists(select 1 from governance.information_resources where id=item.id and classification='TERBUKA' and hold_reference is null) then raise exception 'Approved open classification required' using errcode='42501';end if;
 if cardinality(content.sensitive_markers(item.title||' '||item.summary||' '||item.body||' '||item.source||' '||item.public_metadata::text))>0 then raise exception 'Remove personal data markers before publication' using errcode='22023';end if;
 if exists(select 1 from files.module_attachments a join files.managed_assets f on f.id=a.asset_id left join governance.information_resources r on r.id=f.id where a.module='CONTENT' and a.entity_id=item.id and a.removed_at is null and (f.status<>'AVAILABLE' or r.classification is distinct from 'TERBUKA' or r.hold_reference is not null)) then raise exception 'Non-public attachment blocks publication' using errcode='42501';end if;
end $$;
alter function public.kpi_content_action(uuid,integer,text,jsonb) rename to kpi_content_action_before_editorial;
revoke all on function public.kpi_content_action_before_editorial(uuid,integer,text,jsonb) from public,anon,authenticated;
create function public.kpi_content_action(item_id uuid,expected_version integer,command text,input jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare item content.managed_items;result jsonb;
begin
 select * into item from content.managed_items where id=item_id for update;
 if item.id is null or not content.can_read(item.kind,item.organization_id,item.period_id,item.division_id,item.id) then raise exception 'Access denied' using errcode='42501';end if;
 if command in ('APPROVE','PUBLISH') and item.kind='PUBLICATION' then
  if coalesce((input->>'privacyReviewed')::boolean,false)=false then raise exception 'Human privacy review required' using errcode='22023';end if;
  perform content.require_public_ready(item);
 end if;
 result:=public.kpi_content_action_before_editorial(item_id,expected_version,command,input);
 if command<>'PUBLISH' then update content.publication_schedule s set status='CANCELLED',reason='Konten atau tahap berubah; jadwalkan kembali.',updated_at=now() where s.item_id=item.id and s.status='PENDING';end if;
 return result;
end $$;
create function public.kpi_content_metadata(item_id uuid,expected_version integer,input jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare item content.managed_items;actor uuid:=identity.current_account_id();category_value text:=input->>'category';meta jsonb:=input->'metadata';
begin
 select * into item from content.managed_items where id=item_id for update;
 if item.id is null or not content.can_read(item.kind,item.organization_id,item.period_id,item.division_id,item.id) or not identity.has_permission('CONTENT_DRAFT_WRITE',item.organization_id,item.period_id,item.division_id,item.id) or item.kind<>'PUBLICATION' then raise exception 'Access denied' using errcode='42501';end if;
 if item.version<>expected_version or expected_version is null then raise exception 'Content changed' using errcode='40001';end if;
 if item.status not in ('DRAFT','REVISION') or category_value is null or category_value not in ('PUBLICATION','NEWS','EVENT','ROSTER') or jsonb_typeof(meta) is distinct from 'object' or length(meta::text)>3000 or input->>'note' is null or length(trim(input->>'note')) not between 3 and 2000 then raise exception 'Invalid metadata' using errcode='22023';end if;
 if exists(select 1 from jsonb_object_keys(meta) k where k not in ('eventDate','location','position','periodLabel','consentReference')) then raise exception 'Unexpected public metadata' using errcode='22023';end if;
 if category_value='EVENT' and (meta->>'eventDate' is null or coalesce(length(trim(meta->>'location')),0)<3) then raise exception 'Event date and location required' using errcode='22023';end if;
 if category_value='EVENT' then perform (meta->>'eventDate')::date;end if;
 if category_value='ROSTER' and (coalesce(length(trim(meta->>'position')),0)<3 or coalesce(length(trim(meta->>'periodLabel')),0)<3 or coalesce(length(trim(meta->>'consentReference')),0)<3) then raise exception 'Position, period and consent reference required' using errcode='22023';end if;
 update content.managed_items set category=category_value,public_metadata=meta,version=version+1,updated_at=now(),author_account_id=actor,reviewer_account_id=null,status='DRAFT' where id=item.id returning * into item;
 insert into content.managed_revisions(item_id,version,snapshot,actor_account_id,action,note) values(item.id,item.version,jsonb_build_object('fields',jsonb_build_object('title',item.title,'summary',item.summary,'body',item.body,'source',item.source,'locale',item.locale,'slug',item.slug),'category',category_value,'metadata',meta,'status',item.status),actor,'SAVE_METADATA',trim(input->>'note'));
 insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata) values('CONTENT_METADATA_SAVED','content','PUBLICATION',item.id,'SUCCESS','hosted:'||gen_random_uuid(),jsonb_build_object('actorAccountId',actor,'version',item.version));
 return content.item_json(item);
end $$;
create function public.kpi_content_schedule(item_id uuid,expected_version integer,publish_at timestamptz) returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare item content.managed_items;actor uuid:=identity.current_account_id();
begin
 select * into item from content.managed_items where id=item_id for update;
 if item.id is null or not identity.has_permission('CONTENT_PUBLISH',item.organization_id,item.period_id,item.division_id,item.id) then raise exception 'Access denied' using errcode='42501';end if;
 if item.version<>expected_version or expected_version is null then raise exception 'Content changed' using errcode='40001';end if;
 if publish_at is null then update content.publication_schedule s set status='CANCELLED',reason='Dibatalkan penerbit.',updated_at=now() where s.item_id=item.id;
 else
  if item.kind<>'PUBLICATION' or item.status<>'APPROVED' or item.reviewer_account_id is null or publish_at<=now() or publish_at>now()+interval '1 year' then raise exception 'Invalid schedule' using errcode='22023';end if;
  perform content.require_public_ready(item);
  insert into content.publication_schedule values(item.id,item.version,publish_at,actor,'PENDING',null,now()) on conflict on constraint publication_schedule_pkey do update set expected_version=excluded.expected_version,publish_at=excluded.publish_at,scheduled_by=excluded.scheduled_by,status='PENDING',reason=null,updated_at=now();
 end if;
 insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata) values('CONTENT_SCHEDULE_UPDATED','content','PUBLICATION',item.id,'SUCCESS','hosted:'||gen_random_uuid(),jsonb_build_object('actorAccountId',actor,'publishAt',publish_at));
 return public.kpi_content_preflight(item.id);
end $$;
create function public.kpi_publish_due() returns integer language plpgsql security definer set search_path='' as $$
declare schedule content.publication_schedule;item content.managed_items;count integer:=0;
begin
 for schedule in select * from content.publication_schedule s where s.status='PENDING' and s.publish_at<=now() order by s.publish_at limit 50 for update skip locked loop
  select * into item from content.managed_items where id=schedule.item_id for update;
  if item.status<>'APPROVED' or item.version<>schedule.expected_version or item.reviewer_account_id is null or not governance.actor_permission(schedule.scheduled_by,'CONTENT_PUBLISH',item.organization_id,item.period_id,item.division_id,item.id) or not governance.actor_permission(item.reviewer_account_id,'CONTENT_REVIEW',item.organization_id,item.period_id,item.division_id,item.id) then
   update content.publication_schedule set status='BLOCKED',reason='Versi, persetujuan, periode atau izin sudah berubah.',updated_at=now() where item_id=item.id;continue;
  end if;
  begin perform content.require_public_ready(item);exception when others then update content.publication_schedule set status='BLOCKED',reason='Klasifikasi, lampiran atau pemeriksaan privasi memerlukan tinjauan.',updated_at=now() where item_id=item.id;continue;end;
  update content.managed_items set status='PUBLISHED',version=version+1,published_at=now(),updated_at=now() where id=item.id returning * into item;
  insert into content.managed_revisions(item_id,version,snapshot,actor_account_id,action,note) values(item.id,item.version,jsonb_build_object('fields',jsonb_build_object('title',item.title,'summary',item.summary,'body',item.body,'source',item.source,'locale',item.locale,'slug',item.slug),'status','PUBLISHED'),schedule.scheduled_by,'PUBLISH_SCHEDULED','Penerbitan terjadwal dengan pemeriksaan ulang kewenangan.');
  insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata) values('CONTENT_PUBLISHED_SCHEDULED','content','PUBLICATION',item.id,'SUCCESS','hosted:'||gen_random_uuid(),jsonb_build_object('actorAccountId',schedule.scheduled_by,'version',item.version));
  update content.publication_schedule set status='PUBLISHED',updated_at=now() where item_id=item.id;count:=count+1;
 end loop;return count;
end $$;
create function public.kpi_public_content(category_code text,locale_code text default 'id',organization_code text default 'KPI_PPMI_MESIR') returns jsonb language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object('id',m.id,'title',m.title,'summary',m.summary,'body',m.body,'source',m.source,'locale',m.locale,'slug',m.slug,'publishedAt',m.published_at,'category',m.category,'metadata',m.public_metadata-'consentReference') order by m.published_at desc),'[]'::jsonb)
 from (select c.* from content.managed_items c join governance.information_resources r on r.id=c.id where c.kind='PUBLICATION' and c.status='PUBLISHED' and c.category=category_code and c.locale=locale_code and c.organization_id=(select id from org.organizations where code=organization_code) and r.classification='TERBUKA' and r.hold_reference is null order by c.published_at desc limit 100) m;
$$;
create or replace function public.kpi_publications_list(locale_code text default 'id',article_slug text default null,organization_code text default 'KPI_PPMI_MESIR') returns jsonb language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object('id',m.id,'title',m.title,'summary',m.summary,'body',case when article_slug is null then null else m.body end,'source',m.source,'locale',m.locale,'slug',m.slug,'publishedAt',m.published_at) order by m.published_at desc,m.id),'[]'::jsonb)
 from (select c.* from content.managed_items c join governance.information_resources r on r.id=c.id where c.kind='PUBLICATION' and c.status='PUBLISHED' and c.category='PUBLICATION' and c.organization_id=(select id from org.organizations where code=organization_code) and c.locale=locale_code and (article_slug is null or c.slug=article_slug) and r.classification='TERBUKA' and r.hold_reference is null order by c.published_at desc,c.id limit 100) m;
$$;
create function governance.content_resource() returns trigger language plpgsql security definer set search_path='' as $$
begin insert into governance.information_resources(id,organization_id,period_id,kind,classification) values(new.id,new.organization_id,new.period_id,new.kind,'INTERNAL');return new;end $$;
insert into governance.information_resources(id,organization_id,period_id,kind,classification) select id,organization_id,period_id,kind,'INTERNAL' from content.managed_items on conflict do nothing;
create trigger content_classification after insert on content.managed_items for each row execute function governance.content_resource();
revoke all on function governance.actor_permission(uuid,text,uuid,uuid,uuid,uuid),content.sensitive_markers(text),content.require_public_ready(content.managed_items),governance.content_resource(),public.kpi_content_preflight(uuid),public.kpi_content_action(uuid,integer,text,jsonb),public.kpi_content_metadata(uuid,integer,jsonb),public.kpi_content_schedule(uuid,integer,timestamptz),public.kpi_publish_due(),public.kpi_public_content(text,text,text) from public,anon,authenticated;
grant execute on function public.kpi_content_preflight(uuid),public.kpi_content_action(uuid,integer,text,jsonb),public.kpi_content_metadata(uuid,integer,jsonb),public.kpi_content_schedule(uuid,integer,timestamptz) to authenticated;
grant execute on function public.kpi_publish_due() to service_role;
grant execute on function public.kpi_public_content(text,text,text) to anon,authenticated;
create function public.kpi_public_content_assets(item_id uuid,organization_code text) returns jsonb language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object('id',f.id,'name',f.original_name,'mimeType',f.mime_type) order by a.created_at),'[]'::jsonb) from content.managed_items c join org.organizations o on o.id=c.organization_id join governance.information_resources cr on cr.id=c.id join files.module_attachments a on a.entity_id=c.id and a.module='CONTENT' and a.removed_at is null join files.managed_assets f on f.id=a.asset_id join governance.information_resources fr on fr.id=f.id where c.id=item_id and o.code=organization_code and c.kind='PUBLICATION' and c.status='PUBLISHED' and cr.classification='TERBUKA' and cr.hold_reference is null and f.status='AVAILABLE' and fr.classification='TERBUKA' and fr.hold_reference is null;
$$;
create function public.kpi_public_asset_delivery(item_id uuid,asset_id uuid,organization_code text) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',f.id,'name',f.original_name,'mimeType',f.mime_type,'objectPath',f.object_path,'sha256',f.sha256) from content.managed_items c join org.organizations o on o.id=c.organization_id join governance.information_resources cr on cr.id=c.id join files.module_attachments a on a.entity_id=c.id and a.module='CONTENT' and a.removed_at is null join files.managed_assets f on f.id=a.asset_id join governance.information_resources fr on fr.id=f.id where c.id=item_id and f.id=asset_id and o.code=organization_code and c.kind='PUBLICATION' and c.status='PUBLISHED' and cr.classification='TERBUKA' and cr.hold_reference is null and f.status='AVAILABLE' and fr.classification='TERBUKA' and fr.hold_reference is null limit 1;
$$;
revoke all on function public.kpi_public_content_assets(uuid,text),public.kpi_public_asset_delivery(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.kpi_public_content_assets(uuid,text) to anon,authenticated;
grant execute on function public.kpi_public_asset_delivery(uuid,uuid,text) to service_role;
notify pgrst,'reload schema';
commit;
