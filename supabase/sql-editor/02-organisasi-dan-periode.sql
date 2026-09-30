-- ===================================================================
-- LANGKAH 2 DARI 2: DATA ORGANISASI DAN PERIODE KPI
-- Jalankan SETELAH langkah 1 berhasil.
--
-- WAJIB DIISI DULU: ganti kedua tanggal periode kepengurusan di bawah
-- (format TTTT-BB-HH). Jika belum diganti, perintah ini sengaja gagal.
-- ===================================================================

insert into org.organizations (code, name)
values ('KPI_PPMI_MESIR', 'Komisi Peduli Interaksi PPMI Mesir')
on conflict (code) do nothing;

insert into org.periods (organization_id, code, starts_on, ends_on, status)
select id, '2026_2027', date 'ISI-TANGGAL-MULAI', date 'ISI-TANGGAL-SELESAI', 'ACTIVE'
from org.organizations
where code = 'KPI_PPMI_MESIR'
on conflict (organization_id, code) do nothing;

-- Periksa hasilnya: harus muncul satu baris periode 2026_2027 berstatus ACTIVE.
select o.code as organisasi, p.code as periode, p.starts_on as mulai, p.ends_on as selesai, p.status
from org.periods p
join org.organizations o on o.id = p.organization_id
where o.code = 'KPI_PPMI_MESIR';
