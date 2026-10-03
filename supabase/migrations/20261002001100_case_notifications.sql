begin;
create or replace function notifications.source_access(wanted text,oid uuid,pid uuid,did uuid,entity uuid) returns boolean language sql stable security definer set search_path='' as $$
 select case when wanted='CASE_ACCESS' then exists(select 1 from intake.cases c where c.id=entity and c.organization_id=oid and c.period_id=pid and intake.can_read(c))
 when wanted='CONTENT_ACCESS' then content.can_read('PUBLICATION',oid,pid,did,entity)
 else identity.has_permission(wanted,oid,pid,did,entity) end;
$$;
create function notifications.case_event() returns trigger language plpgsql security definer set search_path='' as $$
declare item intake.cases; recipients uuid[];
begin
 select * into item from intake.cases where id=new.case_id;
 select coalesce(array_agg(account_id),'{}'::uuid[]) into recipients from intake.case_personnel where case_id=item.id and active;
 perform notifications.enqueue(recipients||array[item.secretary_account_id,item.owner_account_id,new.actor_account_id],item.organization_id,item.period_id,null,item.id,
 'CASE_ACCESS','case:'||new.id,'Ada pembaruan penanganan laporan','/portal/kasus');
 return new;
end $$;
create trigger case_inbox after insert on intake.case_events for each row execute function notifications.case_event();
revoke all on function notifications.case_event() from public,anon,authenticated;
notify pgrst,'reload schema';
commit;
