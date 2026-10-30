-- Jumlah baris persis per tabel aplikasi. Dipakai untuk membandingkan database sumber dan hasil restore.
select format('%s.%s', table_schema, table_name) as table_name,
  (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from %I.%I', table_schema, table_name), false, true, '')))[1]::text::bigint as row_count
from information_schema.tables
where table_type = 'BASE TABLE'
  and table_schema in ('public', 'platform', 'org', 'audit', 'identity', 'content', 'files', 'workflow', 'intake', 'work', 'governance', 'notifications', 'management')
order by 1;
