-- Isi DATA CONTOH (dummy) untuk demonstrasi website dan portal KPI PPMI Mesir.
-- Jalankan sebagai owner database di SQL Editor. Hapus lagi dengan contoh-hapus.sql.
--
-- Prinsip:
-- * Semua data contoh hidup di periode terpisah berkode CONTOH. Periode resmi 2026_2027 tidak disentuh.
-- * Enam akun contoh memakai email @contoh.invalid, tanpa kata sandi dan diblokir permanen di Auth,
--   jadi tidak bisa dipakai login. Mereka hanya "pelaku" agar alur persetujuan berlapis terlihat utuh.
-- * Izin akun contoh dibuat lewat rantai mandat -> keputusan F01 -> izin, sama seperti akun sungguhan.
-- * Data modul dibuat dengan fungsi aplikasi (kpi_*), bukan insert langsung, supaya aturan
--   pemisahan wewenang, audit, dan notifikasi tetap berlaku. Pengecualian kecil ditandai "langsung".
-- * Konten publik selalu berjudul "CONTOH · ..." dan bersumber "Data contoh".
-- * Kanal pengaduan publik TIDAK dibuka: dua laporan contoh dimasukkan dengan membuka penerimaan
--   sesaat di dalam transaksi ini lalu menutupnya lagi sebelum commit.
begin;

create or replace function pg_temp.kpi_contoh_as(account uuid) returns void language sql as $$
 select set_config('request.jwt.claim.sub',account::text,true),set_config('request.jwt.claims',json_build_object('sub',account,'role','authenticated')::text,true);
$$;

do $$
declare
 oid uuid; pid uuid; iod uuid; admin_acc uuid; pengurus_role uuid;
 k uuid:='c0a00000-0000-4000-8000-000000000001'; -- Ketua (pejabat pemberi keputusan)
 s uuid:='c0a00000-0000-4000-8000-000000000002'; -- Sekretaris (pejabat kedua, penerima pengaduan)
 b uuid:='c0a00000-0000-4000-8000-000000000003'; -- Bendahara
 p uuid:='c0a00000-0000-4000-8000-000000000004'; -- Koordinator Pencegahan & Edukasi
 m uuid:='c0a00000-0000-4000-8000-000000000005'; -- Anggota Media & Publikasi
 i uuid:='c0a00000-0000-4000-8000-000000000006'; -- Anggota Intelijen & Operasional
 auth_k uuid; auth_s uuid; starts timestamptz:=now()-interval '5 minutes'; expiry timestamptz;
 all_perms text[]:=array['WORKSPACE_READ','NOTIFICATION_READ','TASK_READ','TASK_CREATE','TASK_SUBMIT','TASK_REVIEW',
  'MEETING_READ','MEETING_MANAGE','FINANCE_READ','FINANCE_MANAGE','FINANCE_APPROVE_FINAL','EVALUATION_READ','EVALUATION_WRITE',
  'KNOWLEDGE_READ','KNOWLEDGE_WRITE','KNOWLEDGE_REVIEW','HANDOVER_READ','HANDOVER_ACCEPT','CONTENT_DRAFT_WRITE','CONTENT_REVIEW',
  'CONTENT_PUBLISH','ASSET_READ','ASPIRATION_TRIAGE','CASE_READ','CASE_MANAGE','CASE_REVIEW'];
 base text[]:=array['WORKSPACE_READ','NOTIFICATION_READ','TASK_READ','TASK_CREATE','TASK_SUBMIT','MEETING_READ','KNOWLEDGE_READ','HANDOVER_READ','HANDOVER_ACCEPT'];
 plan jsonb; entry record; perm text; decision uuid; authority uuid;
 t jsonb; t2 jsonb; mt jsonb; c jsonb; r jsonb; budget uuid; motion uuid;
 pub record;
begin
 select id into strict oid from org.organizations where code='KPI_PPMI_MESIR';
 select a.id into strict admin_acc from identity.accounts a join identity.system_administrators sa on sa.account_id=a.id
  where a.email='kpippmimesirofficial@gmail.com' and sa.revoked_at is null;
 if exists(select 1 from org.periods where organization_id=oid and code='CONTOH') then
  raise exception 'Data CONTOH sudah terpasang. Jalankan contoh-hapus.sql dulu kalau mau mengisi ulang.';
 end if;
 if exists(select 1 from org.periods where organization_id=oid and status in ('ACTIVE','CLOSING')) then
  raise exception 'Periode resmi sedang aktif. Data CONTOH hanya boleh dipasang sebelum periode resmi berjalan.';
 end if;

 -- Periode, unit, jabatan ------------------------------------------------------------------------
 insert into org.periods(organization_id,code,starts_on,ends_on,status)
  values(oid,'CONTOH',current_date-30,current_date+120,'ACTIVE') returning id into pid;
 expiry:=(current_date+121)::timestamptz;
 insert into org.divisions(organization_id,code,name) values(oid,'CONTOH_IOD','Intelijen & Operasional (CONTOH)') returning id into iod;
 insert into org.positions(organization_id,code,name,division_id) values
  (oid,'CONTOH_KETUA','Ketua (CONTOH)',null),(oid,'CONTOH_SEKRETARIS','Sekretaris (CONTOH)',null),
  (oid,'CONTOH_BENDAHARA','Bendahara (CONTOH)',null),(oid,'CONTOH_KOORDINATOR','Koordinator Pencegahan & Edukasi (CONTOH)',null),
  (oid,'CONTOH_MEDIA','Anggota Media & Publikasi (CONTOH)',null),(oid,'CONTOH_IOD_ANGGOTA','Anggota Intelijen & Operasional (CONTOH)',iod);

 -- Akun contoh: tanpa kata sandi, diblokir di Auth --------------------------------------------------
 insert into auth.users(id,email,email_confirmed_at,raw_app_meta_data,aud,role,banned_until)
  select x.id,x.email,now(),'{"kpi_access":true,"kpi_role":"PENGURUS","kpi_contoh":true}'::jsonb,'authenticated','authenticated','infinity'::timestamptz
  from (values(k,'ketua@contoh.invalid'),(s,'sekretaris@contoh.invalid'),(b,'bendahara@contoh.invalid'),
   (p,'koordinator@contoh.invalid'),(m,'media@contoh.invalid'),(i,'intelijen@contoh.invalid')) x(id,email);
 insert into identity.accounts(id,auth_user_id,email,display_name,status) values
  (k,k,'ketua@contoh.invalid','Ahmad Fauzan (CONTOH)','ACTIVE'),(s,s,'sekretaris@contoh.invalid','Nurul Aini (CONTOH)','ACTIVE'),
  (b,b,'bendahara@contoh.invalid','Rizki Maulana (CONTOH)','ACTIVE'),(p,p,'koordinator@contoh.invalid','Siti Rahmah (CONTOH)','ACTIVE'),
  (m,m,'media@contoh.invalid','Fikri Hidayat (CONTOH)','ACTIVE'),(i,i,'intelijen@contoh.invalid','Laila Kamila (CONTOH)','ACTIVE');
 insert into identity.roles(code,name,is_system_role) values('PENGURUS','PENGURUS',true) on conflict(code) do nothing;
 select id into pengurus_role from identity.roles where code='PENGURUS';
 insert into identity.account_roles(account_id,role_id) select x,pengurus_role from unnest(array[k,s,b,p,m,i]) x;
 insert into org.assignments(account_id,position_id,period_id,starts_on,ends_on,decision_reference)
  select x.acc,pos.id,pid,current_date-30,current_date+120,'CONTOH: penugasan fiktif untuk demonstrasi'
  from (values(k,'CONTOH_KETUA'),(s,'CONTOH_SEKRETARIS'),(b,'CONTOH_BENDAHARA'),(p,'CONTOH_KOORDINATOR'),(m,'CONTOH_MEDIA'),(i,'CONTOH_IOD_ANGGOTA')) x(acc,code)
  join org.positions pos on pos.organization_id=oid and pos.code=x.code;

 -- Mandat dua pejabat contoh, lalu keputusan F01 dan izin untuk setiap akun -----------------------------
 insert into governance.access_authorities(account_id,organization_id,period_id,classifications,permissions,mandate_reference,starts_at,expires_at)
  values(k,oid,pid,array['INTERNAL','TERBATAS','RAHASIA'],all_perms,'CONTOH: mandat fiktif Ketua',starts,expiry),
        (s,oid,pid,array['INTERNAL','TERBATAS','RAHASIA'],all_perms,'CONTOH: mandat fiktif Sekretaris',starts,expiry);
 plan:=jsonb_build_object(
  k::text,to_jsonb(all_perms),
  s::text,to_jsonb(all_perms),
  b::text,to_jsonb(base||array['FINANCE_READ','FINANCE_MANAGE','EVALUATION_READ','ASSET_READ']),
  p::text,to_jsonb(base||array['TASK_REVIEW','MEETING_MANAGE','FINANCE_READ','EVALUATION_READ','EVALUATION_WRITE','KNOWLEDGE_WRITE','KNOWLEDGE_REVIEW','CONTENT_DRAFT_WRITE','CONTENT_REVIEW','CONTENT_PUBLISH','ASSET_READ']),
  m::text,to_jsonb(base||array['KNOWLEDGE_WRITE','CONTENT_DRAFT_WRITE','ASSET_READ']),
  i::text,to_jsonb(base||array['CASE_READ']));
 for entry in select key::uuid as acc,value as perms from jsonb_each(plan) loop
  select a.id into authority from governance.access_authorities a where a.period_id=pid and a.account_id=case when entry.acc=k then s else k end;
  for perm in select jsonb_array_elements_text(entry.perms) loop
   insert into governance.access_decisions(authority_id,recipient_account_id,organization_id,period_id,permission,classification,form_reference,mandate_reference,
    purpose,information_scope,decision_reference,approved_by_account_id,approved_at,starts_at,expires_at,review_due_at,implemented_by_account_id,implemented_at)
   values(authority,entry.acc,oid,pid,perm,'TERBATAS','F01-CONTOH','CONTOH: mandat fiktif','Data contoh untuk demonstrasi portal','Seluruh data periode CONTOH',
    'CONTOH: keputusan fiktif',case when entry.acc=k then s else k end,starts,starts,expiry,now()+interval '30 days',admin_acc,now())
   returning access_decisions.id into decision;
   insert into identity.permission_grants(account_id,organization_id,period_id,permission,reason,decision_id,starts_at,expires_at,granted_by_account_id)
    values(entry.acc,oid,pid,perm,'CONTOH: izin fiktif',decision,starts,expiry,admin_acc);
  end loop;
 end loop;

 -- Tugas -------------------------------------------------------------------------------------------
 perform pg_temp.kpi_contoh_as(p);
 t:=public.kpi_task_create('KPI_PPMI_MESIR','CONTOH','CONTOH · Susun materi sosialisasi etika interaksi',
  'Naskah 10 slide untuk sesi sosialisasi mahasiswa baru: etika komunikasi, batas interaksi, dan cara menghubungi KPI.',m,gen_random_uuid(),now()+interval '6 days');
 perform pg_temp.kpi_contoh_as(m);
 t:=public.kpi_task_action((t->>'id')::uuid,1,'START','Mulai menyusun kerangka naskah.');
 t:=public.kpi_task_action((t->>'id')::uuid,2,'SUBMIT','Draf naskah selesai, mohon dicek.');
 perform pg_temp.kpi_contoh_as(k);
 t:=public.kpi_task_action((t->>'id')::uuid,3,'APPROVE','Naskah sudah sesuai pedoman, siap dipakai.');

 perform pg_temp.kpi_contoh_as(p);
 t:=public.kpi_task_create('KPI_PPMI_MESIR','CONTOH','CONTOH · Desain poster kampanye "Kenali Batas"',
  'Poster ukuran A3 dan versi Instagram. Wajib lewat Redaksi sebelum diunggah.',m,gen_random_uuid(),now()+interval '3 days');
 perform pg_temp.kpi_contoh_as(m);
 t:=public.kpi_task_action((t->>'id')::uuid,1,'START','Sketsa awal sudah dibuat.');
 t:=public.kpi_task_action((t->>'id')::uuid,2,'SUBMIT','Dua alternatif desain siap direview.');

 perform pg_temp.kpi_contoh_as(p);
 t:=public.kpi_task_create('KPI_PPMI_MESIR','CONTOH','CONTOH · Rekap kehadiran forum dialog kekeluargaan',
  'Rangkum daftar hadir dan catatan forum dialog bersama perwakilan kekeluargaan.',s,gen_random_uuid(),now()+interval '2 days');
 perform pg_temp.kpi_contoh_as(s);
 t:=public.kpi_task_action((t->>'id')::uuid,1,'START','Mulai merekap dari formulir hadir.');
 t:=public.kpi_task_action((t->>'id')::uuid,2,'SUBMIT','Rekap selesai.');
 perform pg_temp.kpi_contoh_as(k);
 t:=public.kpi_task_action((t->>'id')::uuid,3,'REQUEST_REVISION','Tambahkan jumlah peserta per kekeluargaan.');

 perform pg_temp.kpi_contoh_as(k);
 t:=public.kpi_task_create('KPI_PPMI_MESIR','CONTOH','CONTOH · Siapkan laporan pertanggungjawaban kegiatan',
  'Kumpulkan kuitansi dan rekap pengeluaran seminar edukasi interaksi.',b,gen_random_uuid(),now()+interval '10 days');
 perform pg_temp.kpi_contoh_as(b);
 t:=public.kpi_task_action((t->>'id')::uuid,1,'START','Kuitansi sedang dikumpulkan.');

 perform pg_temp.kpi_contoh_as(k);
 t:=public.kpi_task_create('KPI_PPMI_MESIR','CONTOH','CONTOH · Kajian pola interaksi di asrama',
  'Kajian singkat berbasis diskusi kelompok terarah. Belum dimulai.',p,gen_random_uuid(),now()+interval '21 days');
 t2:=public.kpi_task_extend((t->>'id')::uuid,1,'COMMENT',jsonb_build_object('note','Pakai format kajian periode lalu sebagai acuan.'));

 perform pg_temp.kpi_contoh_as(k);
 t:=public.kpi_task_create('KPI_PPMI_MESIR','CONTOH','CONTOH · Verifikasi informasi awal dari sekretariat',
  'Tindak lanjut catatan sekretariat. Data rinci ada di modul kasus, bukan di tugas ini.',i,gen_random_uuid(),now()+interval '1 day');

 -- Rapat -------------------------------------------------------------------------------------------
 perform pg_temp.kpi_contoh_as(s);
 mt:=public.kpi_meeting_create('KPI_PPMI_MESIR','CONTOH',jsonb_build_object('title','CONTOH · Rapat pleno bulanan KPI',
  'agenda','1. Evaluasi program bulan lalu. 2. Persiapan sosialisasi mahasiswa baru. 3. Laporan keuangan.',
  'startsAt',now()+interval '1 day','idempotencyKey',gen_random_uuid(),'participantAccountIds',jsonb_build_array(k,s,b,p,m,i)));
 for entry in select x as acc,y as answer from unnest(array[k,b,p,m],array['HADIR','HADIR','RAGU','HADIR']) as u(x,y) loop
  perform pg_temp.kpi_contoh_as(entry.acc);
  mt:=public.kpi_meeting_action((mt->>'id')::uuid,(mt->>'version')::int,'RSVP',jsonb_build_object('response',entry.answer,'note','Konfirmasi kehadiran.'));
 end loop;

 perform pg_temp.kpi_contoh_as(p);
 mt:=public.kpi_meeting_create('KPI_PPMI_MESIR','CONTOH',jsonb_build_object('title','CONTOH · Koordinasi materi sosialisasi',
  'agenda','Pembagian peran pemateri dan pembahasan naskah sosialisasi.','startsAt',now()+interval '1 hour','idempotencyKey',gen_random_uuid(),
  'participantAccountIds',jsonb_build_array(k,p,m)));
 for entry in select x as acc,y as state from unnest(array[k,p,m],array['HADIR','HADIR','HADIR']) as u(x,y) loop
  mt:=public.kpi_meeting_action((mt->>'id')::uuid,(mt->>'version')::int,'ATTENDANCE',jsonb_build_object('accountId',entry.acc,'attendance',entry.state,'note','Presensi dicatat.'));
 end loop;
 mt:=public.kpi_meeting_action((mt->>'id')::uuid,(mt->>'version')::int,'OPEN_MOTION',jsonb_build_object('text','Sosialisasi dibagi menjadi dua sesi.','quorum',2,'note','Usulan dibuka untuk voting.'));
 motion:=(mt->'motions'->0->>'id')::uuid;
 for entry in select x as acc,y as choice from unnest(array[k,p,m],array['SETUJU','SETUJU','ABSTAIN']) as u(x,y) loop
  perform pg_temp.kpi_contoh_as(entry.acc);
  mt:=public.kpi_meeting_action((mt->>'id')::uuid,(mt->>'version')::int,'VOTE',jsonb_build_object('motionId',motion,'choice',entry.choice,'note','Suara dicatat.'));
 end loop;
 perform pg_temp.kpi_contoh_as(p);
 mt:=public.kpi_meeting_action((mt->>'id')::uuid,(mt->>'version')::int,'CLOSE_MOTION',jsonb_build_object('motionId',motion,'note','Voting ditutup.'));
 mt:=public.kpi_meeting_action((mt->>'id')::uuid,(mt->>'version')::int,'SAVE_MINUTES',jsonb_build_object('summary',
  'Disepakati sosialisasi dibagi dua sesi. Fikri menyiapkan naskah, Siti memoderasi. Naskah dicek Ketua sebelum hari H.','note','Notulen disimpan.'));
 mt:=public.kpi_meeting_action((mt->>'id')::uuid,(mt->>'version')::int,'SUBMIT_MINUTES',jsonb_build_object('note','Notulen diajukan untuk disahkan.'));
 perform pg_temp.kpi_contoh_as(k);
 mt:=public.kpi_meeting_action((mt->>'id')::uuid,(mt->>'version')::int,'APPROVE_MINUTES',jsonb_build_object('note','Notulen disahkan.'));
 -- langsung: rapat yang sudah disahkan dipindah ke minggu lalu agar riwayatnya masuk akal.
 update work.meetings set starts_at=now()-interval '6 days' where id=(mt->>'id')::uuid;

 -- Publikasi dan konten situs publik (semua berlabel CONTOH) -------------------------------------------
 for pub in select * from (values
  ('PUBLICATION','contoh-mengenal-peran-kpi','CONTOH · Mengenal peran KPI dalam menjaga interaksi Masisir',
   'Artikel contoh: apa yang dikerjakan KPI dan apa yang bukan wewenangnya.',
   E'KPI PPMI Mesir bekerja di tiga wilayah: pencegahan dan edukasi, pengawasan dan penerimaan informasi, serta penanganan sesuai prosedur.\n\nTulisan ini adalah DATA CONTOH untuk memperlihatkan tampilan artikel di website.','{}'::jsonb),
  ('PUBLICATION','contoh-etika-komunikasi-daring','CONTOH · Lima kebiasaan baik dalam komunikasi daring',
   'Artikel contoh tentang adab berkomunikasi di grup percakapan.',
   E'Gunakan bahasa yang sopan, hindari menyebar tangkapan layar tanpa izin, dan bawa persoalan pribadi ke ruang yang tepat.\n\nTulisan ini adalah DATA CONTOH.','{}'::jsonb),
  ('NEWS','contoh-kabar-sosialisasi-mahasiswa-baru','CONTOH · KPI gelar sosialisasi untuk mahasiswa baru',
   'Kabar contoh tentang sesi pengenalan KPI bagi mahasiswa baru.',
   E'Sosialisasi diikuti perwakilan kekeluargaan dan membahas cara menyampaikan informasi kepada KPI.\n\nKabar ini adalah DATA CONTOH.','{}'::jsonb),
  ('NEWS','contoh-kabar-pembukaan-kajian','CONTOH · Pengumuman kajian bulanan dibuka untuk umum',
   'Pengumuman contoh untuk kajian interaksi bulanan.',
   E'Kajian bulanan terbuka untuk seluruh Masisir. Tempat dan waktu diumumkan lewat kanal resmi.\n\nPengumuman ini adalah DATA CONTOH.','{}'::jsonb),
  ('EVENT','contoh-agenda-seminar-edukasi','CONTOH · Seminar edukasi interaksi sehat',
   'Agenda contoh seminar edukasi interaksi.',
   E'Seminar membahas batas interaksi, persetujuan, dan cara saling menjaga.\n\nAgenda ini adalah DATA CONTOH.',
   jsonb_build_object('eventDate',(current_date+14)::text,'location','Aula Sekretariat PPMI Mesir (CONTOH)')),
  ('EVENT','contoh-agenda-forum-dialog','CONTOH · Forum dialog bersama kekeluargaan',
   'Agenda contoh forum dialog.',
   E'Forum terbuka untuk perwakilan kekeluargaan dan WIHDAH.\n\nAgenda ini adalah DATA CONTOH.',
   jsonb_build_object('eventDate',(current_date+28)::text,'location','Wisma Nusantara Kairo (CONTOH)')),
  ('ROSTER','contoh-pengurus-ketua','Ahmad Fauzan (CONTOH)','Ketua KPI pada data contoh.',E'Profil pengurus fiktif untuk memperlihatkan daftar pengurus.\n\nDATA CONTOH.',
   jsonb_build_object('position','Ketua (CONTOH)','periodLabel','Periode CONTOH','consentReference','CONTOH')),
  ('ROSTER','contoh-pengurus-sekretaris','Nurul Aini (CONTOH)','Sekretaris KPI pada data contoh.',E'Profil pengurus fiktif.\n\nDATA CONTOH.',
   jsonb_build_object('position','Sekretaris (CONTOH)','periodLabel','Periode CONTOH','consentReference','CONTOH')),
  ('ROSTER','contoh-pengurus-bendahara','Rizki Maulana (CONTOH)','Bendahara KPI pada data contoh.',E'Profil pengurus fiktif.\n\nDATA CONTOH.',
   jsonb_build_object('position','Bendahara (CONTOH)','periodLabel','Periode CONTOH','consentReference','CONTOH')),
  ('ROSTER','contoh-pengurus-koordinator','Siti Rahmah (CONTOH)','Koordinator Pencegahan & Edukasi pada data contoh.',E'Profil pengurus fiktif.\n\nDATA CONTOH.',
   jsonb_build_object('position','Koordinator Pencegahan & Edukasi (CONTOH)','periodLabel','Periode CONTOH','consentReference','CONTOH'))
 ) v(category,slug,title,summary,body,meta) loop
  perform pg_temp.kpi_contoh_as(m);
  c:=public.kpi_content_create('KPI_PPMI_MESIR','CONTOH','PUBLICATION',jsonb_build_object('idempotencyKey',gen_random_uuid(),
   'fields',jsonb_build_object('title',pub.title,'summary',pub.summary,'body',pub.body,'source','Data contoh KPI PPMI Mesir','locale','id','slug',pub.slug)));
  if pub.category<>'PUBLICATION' or pub.meta<>'{}'::jsonb then
   c:=public.kpi_content_metadata((c->>'id')::uuid,(c->>'version')::int,jsonb_build_object('category',pub.category,'metadata',pub.meta,'note','Kategori dan keterangan publik diisi.'));
  end if;
  c:=public.kpi_content_action((c->>'id')::uuid,(c->>'version')::int,'SUBMIT',jsonb_build_object('note','Siap diperiksa.'));
  -- langsung: klasifikasi TERBUKA biasanya ditetapkan lewat proses klasifikasi resmi.
  update governance.information_resources set classification='TERBUKA',classification_reference='CONTOH: konten demonstrasi' where information_resources.id=(c->>'id')::uuid;
  perform pg_temp.kpi_contoh_as(p);
  c:=public.kpi_content_action((c->>'id')::uuid,(c->>'version')::int,'APPROVE',jsonb_build_object('note','Isi dan privasi sudah dicek.','privacyReviewed',true));
  c:=public.kpi_content_action((c->>'id')::uuid,(c->>'version')::int,'PUBLISH',jsonb_build_object('note','Diterbitkan.','privacyReviewed',true));
 end loop;

 -- Satu draf yang sedang direview dan satu artikel bahasa Inggris.
 perform pg_temp.kpi_contoh_as(m);
 c:=public.kpi_content_create('KPI_PPMI_MESIR','CONTOH','PUBLICATION',jsonb_build_object('idempotencyKey',gen_random_uuid(),
  'fields',jsonb_build_object('title','CONTOH · Panduan menyampaikan aspirasi','summary','Draf contoh yang masih menunggu review.',
  'body','Draf ini memperlihatkan alur redaksi: ditulis, diajukan, lalu menunggu pemeriksaan orang lain. DATA CONTOH.',
  'source','Data contoh KPI PPMI Mesir','locale','id','slug','contoh-panduan-aspirasi')));
 c:=public.kpi_content_action((c->>'id')::uuid,(c->>'version')::int,'SUBMIT',jsonb_build_object('note','Mohon dicek sebelum terbit.'));
 c:=public.kpi_content_create('KPI_PPMI_MESIR','CONTOH','PUBLICATION',jsonb_build_object('idempotencyKey',gen_random_uuid(),
  'fields',jsonb_build_object('title','SAMPLE · What KPI does for Indonesian students in Egypt','summary','Sample English article.',
  'body','KPI works on prevention and education, monitoring, and case handling. This article is SAMPLE DATA.',
  'source','KPI PPMI Mesir sample data','locale','en','slug','sample-what-kpi-does')));
 c:=public.kpi_content_action((c->>'id')::uuid,(c->>'version')::int,'SUBMIT',jsonb_build_object('note','Ready for review.'));
 update governance.information_resources set classification='TERBUKA',classification_reference='CONTOH: konten demonstrasi' where information_resources.id=(c->>'id')::uuid;
 perform pg_temp.kpi_contoh_as(p);
 c:=public.kpi_content_action((c->>'id')::uuid,(c->>'version')::int,'APPROVE',jsonb_build_object('note','Checked.','privacyReviewed',true));
 c:=public.kpi_content_action((c->>'id')::uuid,(c->>'version')::int,'PUBLISH',jsonb_build_object('note','Published.','privacyReviewed',true));

 -- Rujukan internal (knowledge)
 perform pg_temp.kpi_contoh_as(m);
 c:=public.kpi_content_create('KPI_PPMI_MESIR','CONTOH','KNOWLEDGE',jsonb_build_object('idempotencyKey',gen_random_uuid(),
  'fields',jsonb_build_object('title','CONTOH · Cara menulis notulen yang bisa ditindaklanjuti','summary','Rujukan contoh untuk sekretariat.',
  'body','Pisahkan pembahasan, keputusan, penanggung jawab, dan tenggat. Setiap keputusan sebaiknya langsung jadi tugas. DATA CONTOH.',
  'source','Data contoh sekretariat','locale','id','slug','contoh-menulis-notulen')));
 c:=public.kpi_content_action((c->>'id')::uuid,(c->>'version')::int,'SUBMIT',jsonb_build_object('note','Mohon direview.'));
 perform pg_temp.kpi_contoh_as(p);
 c:=public.kpi_content_action((c->>'id')::uuid,(c->>'version')::int,'APPROVE',jsonb_build_object('note','Sudah sesuai.'));
 c:=public.kpi_content_action((c->>'id')::uuid,(c->>'version')::int,'PUBLISH',jsonb_build_object('note','Dipakai internal.'));

 -- Keuangan, evaluasi, serah terima -------------------------------------------------------------------
 -- Pengajuan transaksi dan evaluasi wajib bukti berkas yang lolos pemindai. Pemindai belum aktif di
 -- production, jadi contohnya berhenti di draf, sama seperti kondisi nyata.
 perform pg_temp.kpi_contoh_as(b);
 r:=public.kpi_management_create('BUDGET','KPI_PPMI_MESIR','CONTOH',null,jsonb_build_object('title','CONTOH · Anggaran program edukasi',
  'description','Pos anggaran untuk sosialisasi, seminar, dan cetak materi.','amountMinor','250000','currency','EGP'),gen_random_uuid());
 r:=public.kpi_management_action((r->>'id')::uuid,(r->>'version')::int,'SUBMIT',jsonb_build_object('note','Diajukan untuk disetujui.'));
 perform pg_temp.kpi_contoh_as(k);
 r:=public.kpi_management_action((r->>'id')::uuid,(r->>'version')::int,'APPROVE',jsonb_build_object('note','Disetujui sesuai rencana kerja.'));
 budget:=(r->>'id')::uuid;
 perform pg_temp.kpi_contoh_as(b);
 r:=public.kpi_management_create('BUDGET','KPI_PPMI_MESIR','CONTOH',null,jsonb_build_object('title','CONTOH · Anggaran operasional sekretariat',
  'description','Alat tulis, cetak dokumen, dan transportasi koordinasi.','amountMinor','150000000','currency','IDR'),gen_random_uuid());
 r:=public.kpi_management_action((r->>'id')::uuid,(r->>'version')::int,'SUBMIT',jsonb_build_object('note','Diajukan.'));
 r:=public.kpi_management_create('FINANCE','KPI_PPMI_MESIR','CONTOH',null,jsonb_build_object('title','CONTOH · Cetak 200 lembar materi sosialisasi',
  'description','Cetak hitam putih dua sisi untuk sesi sosialisasi.','amountMinor','40000','currency','EGP','budgetId',budget),gen_random_uuid());
 r:=public.kpi_management_create('FINANCE','KPI_PPMI_MESIR','CONTOH',null,jsonb_build_object('title','CONTOH · Konsumsi forum dialog',
  'description','Air mineral dan kudapan untuk 40 peserta.','amountMinor','60000','currency','EGP','budgetId',budget),gen_random_uuid());

 -- Evaluasi berklasifikasi RAHASIA: penilai butuh keputusan F01 khusus untuk catatan itu.
 perform pg_temp.kpi_contoh_as(p);
 r:=public.kpi_management_reserve('EVALUATION','KPI_PPMI_MESIR','CONTOH',null);
 select a.id into authority from governance.access_authorities a where a.period_id=pid and a.account_id=k;
 for perm in select unnest(array['EVALUATION_READ','EVALUATION_WRITE']) loop
  insert into governance.access_decisions(authority_id,recipient_account_id,organization_id,period_id,object_id,permission,classification,form_reference,mandate_reference,
   purpose,information_scope,decision_reference,approved_by_account_id,approved_at,starts_at,expires_at,review_due_at,implemented_by_account_id,implemented_at)
  values(authority,p,oid,pid,(r->>'id')::uuid,perm,'RAHASIA','F01-CONTOH','CONTOH: mandat fiktif','Penilai evaluasi contoh','Satu catatan evaluasi contoh',
   'CONTOH: keputusan fiktif',k,starts,starts,expiry,now()+interval '30 days',admin_acc,now()) returning access_decisions.id into decision;
  insert into identity.permission_grants(account_id,organization_id,period_id,object_id,permission,reason,decision_id,starts_at,expires_at,granted_by_account_id)
   values(p,oid,pid,(r->>'id')::uuid,perm,'CONTOH: izin fiktif',decision,starts,expiry,admin_acc);
 end loop;
 r:=public.kpi_management_create('EVALUATION','KPI_PPMI_MESIR','CONTOH',null,jsonb_build_object('reservedId',r->>'id','title','CONTOH · Evaluasi penyusunan materi sosialisasi',
  'description','Naskah selesai tepat waktu, revisi kecil di bagian contoh kasus.','subjectAccountId',m,'score','85',
  'criteriaReference','Kriteria evaluasi contoh: ketepatan waktu, kelengkapan, kesesuaian pedoman'),gen_random_uuid());

 perform pg_temp.kpi_contoh_as(m);
 r:=public.kpi_management_create('HANDOVER','KPI_PPMI_MESIR','CONTOH',null,jsonb_build_object('title','CONTOH · Serah terima arsip desain publikasi',
  'description','Arsip templat poster dan panduan warna untuk pengurus berikutnya.','subjectAccountId',p),gen_random_uuid());

 -- Pengaduan contoh (kanal publik tetap tertutup) -----------------------------------------------------
 insert into intake.routing values(oid,pid,s,iod,true,now(),admin_acc);
 perform public.kpi_intake_submit('KPI_PPMI_MESIR',jsonb_build_object('kind','SARAN','subject','CONTOH · Usul kajian tentang adab di grup percakapan',
  'description','Ini saran contoh: mohon KPI mengadakan kajian singkat tentang adab berkomunikasi di grup kekeluargaan.','contact','','consent','true','website','',
  'idempotencyKey',gen_random_uuid()),md5('contoh-saran-1')||md5('contoh-saran-2'),md5('kpi-contoh-sidik')||md5('kpi-contoh-sidik-2'));
 perform public.kpi_intake_submit('KPI_PPMI_MESIR',jsonb_build_object('kind','PENGADUAN','subject','CONTOH · Kesalahpahaman dalam kepanitiaan',
  'description','Ini pengaduan fiktif: terjadi kesalahpahaman komunikasi dalam kepanitiaan dan pelapor meminta pendampingan. Tidak ada nama asli.','contact','','consent','true','website','',
  'idempotencyKey',gen_random_uuid()),md5('contoh-aduan-1')||md5('contoh-aduan-2'),md5('kpi-contoh-sidik')||md5('kpi-contoh-sidik-2'));
 update intake.routing set enabled=false,updated_at=now() where organization_id=oid and period_id=pid;
 -- langsung: aturan baca kasus mensyaratkan penugasan per kasus, termasuk untuk super admin.
 -- Akun resmi KPI dicatat sebagai personel kedua kasus contoh supaya modul kasus bisa dilihat.
 insert into intake.case_personnel(case_id,account_id,active) select c.id,admin_acc,true from intake.cases c where c.period_id=pid;
 if public.kpi_intake_ready('KPI_PPMI_MESIR') then raise exception 'Kanal pengaduan publik tidak boleh terbuka oleh data CONTOH'; end if;

 perform set_config('request.jwt.claim.sub','',true);perform set_config('request.jwt.claims','',true);
 insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata)
  values('SAMPLE_DATA_INSTALLED','org','period',pid,'SUCCESS','manual:'||gen_random_uuid(),jsonb_build_object('actorAccountId',admin_acc,'note','Data CONTOH untuk demonstrasi; hapus dengan contoh-hapus.sql'));
end $$;

select 'periode' as bagian,count(*) jumlah from org.periods where code='CONTOH'
union all select 'akun contoh',count(*) from identity.accounts where email like '%@contoh.invalid'
union all select 'izin',count(*) from identity.permission_grants g join org.periods p on p.id=g.period_id where p.code='CONTOH'
union all select 'tugas',count(*) from work.tasks t join org.periods p on p.id=t.period_id where p.code='CONTOH'
union all select 'rapat',count(*) from work.meetings t join org.periods p on p.id=t.period_id where p.code='CONTOH'
union all select 'konten',count(*) from content.managed_items t join org.periods p on p.id=t.period_id where p.code='CONTOH'
union all select 'keuangan/evaluasi/serah terima',count(*) from management.records t join org.periods p on p.id=t.period_id where p.code='CONTOH'
union all select 'pengaduan',count(*) from intake.cases t join org.periods p on p.id=t.period_id where p.code='CONTOH'
union all select 'notifikasi',count(*) from notifications.inbox t join org.periods p on p.id=t.period_id where p.code='CONTOH';
commit;
