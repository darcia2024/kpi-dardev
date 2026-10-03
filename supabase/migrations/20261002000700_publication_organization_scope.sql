begin;
drop function if exists public.kpi_publications_list(text,text);
create function public.kpi_publications_list(locale_code text default 'id',article_slug text default null,organization_code text default 'KPI_PPMI_MESIR') returns jsonb language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object('id',m.id,'title',m.title,'summary',m.summary,'body',case when article_slug is null then null else m.body end,'source',m.source,'locale',m.locale,'slug',m.slug,'publishedAt',m.published_at) order by m.published_at desc,m.id),'[]'::jsonb)
 from (select * from content.managed_items where kind='PUBLICATION' and status='PUBLISHED' and organization_id=(select id from org.organizations where code=organization_code)
 and locale=locale_code and (article_slug is null or slug=article_slug) order by published_at desc,id limit 100) m;
$$;
revoke all on function public.kpi_publications_list(text,text,text) from public,anon;
grant execute on function public.kpi_publications_list(text,text,text) to anon,authenticated;
notify pgrst,'reload schema';
commit;
