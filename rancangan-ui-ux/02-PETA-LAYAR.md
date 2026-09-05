# Peta dan spesifikasi layar

Semua ID merupakan usulan rancangan. Satu ID dapat memiliki sublayar daftar/detail/editor sebagaimana dijelaskan. Bukan hanya jumlah halaman statis. Sumber disingkat menurut README.

## Navigasi publik

Header: KPI/PPMI Mesir, Tentang, Program, Publikasi & Repository, Data & Transparansi, Layanan; pencarian, ID/EN, Portal Pengurus. Tentang memuat struktur dan profil divisi. Layanan memuat aspirasi/pengaduan. Footer: kontak resmi jika tersedia, aksesibilitas, kebijakan privasi, tautan relevan. Semua label/rute adalah usulan; isi hukum membutuhkan pemilik konten.

| ID / layar | Tujuan, susunan konten dan aksi | Akses, state atau relasi khusus | Sumber |
|---|---|---|---|
| P01 Beranda | Pengenalan singkat → layanan → kegiatan terbaru → publikasi pilihan → tautan akuntabilitas. CTA Kenali KPI/Sampaikan aspirasi | Hanya approved published; blok tanpa konten disembunyikan dengan sengaja, tanpa angka palsu | B2,U4,C3 |
| P02 Tentang | Profil, visi-misi, fungsi, kewenangan, sejarah, periode. Anchor navigasi lokal | Konten editorial versi publik; sejarah tidak membuka membership privat | U4,C3 |
| P03 Struktur | Pilih periode publik; pohon organisasi dan alternatif daftar; detail jabatan di panel | Keyboard/list setara; hanya projection publik. Intelligence/Operation tanpa anggota/metode | U4,C12 |
| P04 Divisi | Nama, fungsi dan tujuan umum, program/publikasi yang boleh dibuka | Informasi sensitif tidak muncul sebagai placeholder bernama | B2,C12 |
| P05 Program & kegiatan | Daftar/filter periode, tahun, jenis, divisi, status; detail tujuan, waktu, lokasi, dokumentasi dan hasil | Planned/ongoing/completed/cancelled/archive dijelaskan. Internal links tidak tampil | C11,U4 |
| P06 Berita/informasi | Daftar dan detail; tanggal, versi publik, sumber, related content | Tidak mencampur berita dan publikasi ilmiah tanpa label tipe | C3 |
| P07 Publikasi | Filter jenis, tahun, penulis, bahasa; detail abstract, metadata, sumber, file, sitasi | Identifier hanya bila tersedia; unduh asset publik yang disetujui | C10,U12 |
| P08 Repository | Pencarian metadata/keyword, kategori, sumber, filter; detail record dan citation copy | Record dapat menautkan P07; jangan menggandakan detail tanpa tujuan | M C,C10 |
| P09 Data & statistik | Pilih dataset/indikator; chart + tabel; unit, metode, sumber, tanggal versi | Hanya approved dataset fields; empty bukan angka nol; download mengikuti public export policy | C13 |
| P10 Transparansi | Laporan/capaian, periode, penjelasan sumber dan unduhan | Tidak membuat klaim capaian sebelum dataset tersedia | B2,U4 |
| P11 Layanan | Jenis layanan, cara mengakses, kanal resmi dan tautan formulir | Tidak mengarang jam layanan/SLA | U4 |
| P12 Kirim aspirasi/pengaduan | Penjelasan privasi → kategori/subjek/uraian → lampiran yang diperbolehkan → tinjau → kirim | Field identitas opsional/wajib menunggu policy; validasi, antiabuse, retry aman | D13,U14 |
| P13 Hasil & pelacakan | Nomor/token pelacakan, salin/simpan, buka tracking; safe status timeline | Tanpa akun umum; token invalid/expired tidak membocorkan kasus; catatan internal tidak pernah ada | B2,D13 |
| P14 Search publik | Query, filter tipe/bahasa/tahun, snippet aman, pagination | Published only; tidak ada draft dalam suggestion/result/count | C16 |
| P15 Preferensi & bantuan | Bahasa, tema, ukuran teks, reduce motion/transparency; bantuan tracking | Preferensi lokal tanpa menyimpan isi kasus; missing translation tidak memakai draft | U18–20,C4 |

## Navigasi internal

Topbar: breadcrumb, pencarian sesuai akses, Action Required, notifikasi, periode, profil. Sidebar berkelompok dan dapat collapse:

- Ruang kerja: Dashboard, My Workspace, Action Required.
- Operasional: Tugas, Kalender, Rapat, Dokumen.
- Pengetahuan: Knowledge Base, Arsip & Handover.
- Komunikasi: Pengumuman, Kontak & Relasi.
- Layanan & publikasi: CMS, Formulir, Pengaduan.
- Evaluasi: Laporan & Kinerja.
- AI Assistant.
- Pengelolaan: Pengguna & Hak Akses, Organisasi & Periode, Audit & Pengaturan.

Kelompok hanya tampil jika memiliki item yang bisa diakses. KETUA_KPI, SEKJEND, LEADERSHIP, koordinator, pengurus, reviewer, admin teknis dan auditor tetap mengikuti scope sumber. Role bisnis tidak disimpulkan dari kemampuan membuka Pengaturan.

## Akses dan fondasi

| ID / layar | Tujuan, konten dan aksi | Kontrol dan relasi | Sumber |
|---|---|---|---|
| A01 Login | Identifier email/username, password, bantuan reset; lanjut MFA | Pesan credential generik; pending/rate limit/blocked aman; tidak ada trusted-device bypass | A4–8 |
| A02 MFA | Enrollment, verifikasi faktor, challenge dan pengelolaan faktor | Faktor terverifikasi dahulu; MFA gagal tidak membuka portal; metode menunggu policy/provider | A5 |
| A03 Recovery | Minta reset → pesan generik → konsumsi token → password baru; jalur bantuan admin/perangkat hilang | Token used/expired; no secret pada layar/log; status pemulihan tidak mengungkap akun lain | A5–8 |
| A04 Profil & sesi | Profil yang diizinkan, sesi/perangkat, waktu login, revoke satu/logout-all, preferensi | Konfirmasi dampak; sesi saat ini ditandai; tidak menganggap device metadata sebagai izin | A6,U28 |
| A05 Users | Daftar/filter status; detail identitas, role, membership, sesi; aktivasi/blokir | Admin sesuai permission, perubahan beralasan sesuai policy; histori tetap | A13 |
| A06 Role & permission | Catalog action, matriks scope, assign/revoke, masa berlaku, ringkasan dampak | Tidak memberi ability melebihi kewenangan pelaku; VIEW beda EXPORT; review sebelum simpan | R4–6,A14 |
| A07 Organisasi | Divisi, jabatan, membership per periode; aktif/nonaktif dan public metadata | Multi-membership; deactivation tidak mengubah ownership historis | A9–12 |
| A08 Periode | Daftar planned/active/closing/closed, detail, transisi, tautan handover | Switch context tidak memberi akses baru; closed read-only sesuai keputusan koreksi | A11,D17 |
| A09 Akses khusus | Daftar grant, request, tujuan/resource/scope/start/end, approver, revoke | Temporary expiry jelas; special bukan implicit permanent access | R14 |
| A10 Akses darurat | Request/alasan → approver/backup → akses sementara → post-review | Banner aktif, countdown aman, revoke; tidak ada tombol bypass langsung | R14–15 |
| A11 Audit | Filter actor/action/resource/waktu/result, event detail, export terkontrol | AUDIT dan EXPORT terpisah; tidak bisa edit event; before/after redacted | A15–20 |
| A12 Pengaturan | Notification policy, task types, file policy, workflow policy, taxonomy reference, security settings sesuai scope | Ringkasan dampak + audit untuk perubahan; nilai organisasi belum ditentukan | D15,A22 |

## Workspace dan tugas

| ID / layar | Tujuan, konten dan aksi | Kontrol dan relasi | Sumber |
|---|---|---|---|
| W01 Dashboard | Personal/division/leadership sesuai akses: pekerjaan, beban, agenda, ringkasan aman | Tidak memaksa chart; data kinerja ditautkan ke laporan dengan konteks periode | U7 |
| W02 My Workspace | Pekerjaan saya, deadline dekat, agenda, dokumen terkait, aktivitas relevan | Urutkan kebutuhan kerja; hanya data accessible; selection periode terlihat | U8,TK15 |
| W03 Action Required | Antrean review, revisi, extension, reassignment, hambatan, handover; filter jenis/usia | Beda dari FYI; aksi mengarah ke resource/versi tepat; item stale diperbarui | U8,TK15 |
| W04 Global search | Result title/type/period/safe snippet, filters; navigasi ke sumber | Query kosong/zero/error/revoked; tidak ada metadata terlarang di counts atau suggestions | U21,K5 |
| W05 Notifications | Inbox, unread, kategori, mark read, preferensi kanal; target link | Read tidak menyelesaikan Action Required; preview minimal; recheck saat buka | U22,D14 |
| T01 Daftar/board | Search, filter, saved view, list/board, pagination, create | Drag/drop hanya transisi yang sah; alternatif menu keyboard; review tidak dilompati | U9,TK2 |
| T02 Buat/edit | Judul, deskripsi, tipe, assignees/roles, divisi/periode, priority, deadline, classification | Capability flags membuka field relevan; edit deadline/assignee diarahkan ke request | TK5–6 |
| T03 Detail tugas | Header status + overdue, metadata; tabs ringkasan/progress/bukti/subtasks/comments/history | Progress 100% bukan acceptance; visibility per tab; creator belum tentu approver | TK7–8 |
| T04 Progress & hambatan | Persentase/note; Laporkan Hambatan, detail blocker dan respons koordinator | Tidak mengubah prioritas; label progres terakhir; pelaporan hambatan masuk tindakan | TK7 |
| T05 Ajukan selesai | Evidence files/versi, catatan, ringkasan requirement, submit | Bukti belum Available tidak diterima; assignment/reviewer diperiksa server | TK8 |
| T06 Review bukti | Unduh versi bukti, catatan, terima atau minta revisi, evaluation note | Sesuai policy separation of duties; alasan revisi wajib; stale version conflict | TK8,20 |
| T07 Extension/delegasi | Nilai lama/baru, alasan, approver, submit; request history | Tidak overwrite langsung; approval baru memutakhirkan record | TK10 |
| T08 Subtask/dependency | Daftar berhierarki, prerequisite, blocked reason, add/link jika capability aktif | Parent siap diajukan setelah children; completion policy belum final; no cycle | TK11 |
| T09 Template/recurring | Catalog, editor/version/review, recurrence preview, next occurrences | Perubahan versi tidak mengubah instance lama; zona waktu schedule jelas | TK12 |
| T10 Workload | Per anggota dalam scope, count tugas/deadline; konflik sebagai warning | Tanpa auto-assignee recommendation atau penolakan otomatis | TK14 |
| T11 Cancellation/archive | Alasan, dampak, konfirmasi; archived list/restore | Tidak hard-delete normal; bukti dan history dipertahankan | TK13 |

## Kalender dan rapat

| ID / layar | Tujuan, konten dan aksi | Kontrol dan relasi | Sumber |
|---|---|---|---|
| M01 Kalender | Day/week/month/list, filter scope/type, task deadline dan meeting dibedakan | Mobile default agenda list; waktu Kairo/user eksplisit; judul restricted tidak bocor | ME10–11 |
| M02 Daftar/editor rapat | List; draft editor waktu/agenda/peserta/lokasi/link/classification; schedule/cancel | End > start; conflict warning tidak memindahkan rapat; cancellation reason | ME4–5 |
| M03 Detail/attendance | Agenda, participants, RSVP, kehadiran, dokumen, minutes, keputusan, follow-ups | Satu attendance per user; self response berbeda dari attendance recorder | ME9 |
| M04 Notulen | Structured editor, versions, draft/final, review/finalize/reopen | Final terkunci; revisi baru melalui alur; autosave sesuai sensitivity | ME8 |
| M05 Keputusan/voting | Statement/rationale, options, eligibility, round/open/closed/result, vote | Satu vote; snapshot pemilih; secret voting menunggu policy; tidak menampilkan pilihan individu pada audit umum | ME7 |
| M06 Follow-up | Create linked task, assignee/deadline/status; lihat detail accessible | Task creation idempotent; source meeting/decision tetap tersimpan | ME11 |
| M07 Arsip rapat | Index undangan, peserta, notulen, keputusan, dokumen, tindak lanjut; export | Paket logis; restricted item hanya ditandai jika keberadaannya boleh diketahui | ME15–16 |

## Dokumen dan knowledge

| ID / layar | Tujuan, konten dan aksi | Kontrol dan relasi | Sumber |
|---|---|---|---|
| F01 Library | Filter tipe/category/tags/period/division/classification/status, search, upload | Hasil sesuai akses termasuk versi; office diunduh, audio/video punya kontrol | DO11,D8 |
| F02 Upload | Pilih file → metadata/klasifikasi → upload → checking → available/quarantine/fail | Progress bukan bukti tersimpan; retry aman; executable/oversize ditolak | DO5,15 |
| F03 Detail/versi | Metadata, current version, previous versions, linked records, activity, unduh | Failed new version tidak mengganti versi aktif; klasifikasi selalu terlihat | DO9 |
| F04 Akses & sharing | User/role/division recipient, permission, expiry; daftar grants, revoke; share-link manager | Tidak share melampaui kewenangan; password/expiry; link revoked/expired state | DO7–8 |
| F05 Klasifikasi/watermark | Level lama/baru, alasan, review bila perlu, kebijakan watermark/output | Penurunan level tidak otomatis menerbitkan file; output tidak jadi public copy | DO7,12 |
| F06 Access log/arsip | Sensitive accesses, export jika berhak; archive/restore, linked-evidence warning | Hard-delete bukan aksi pengguna umum; retensi menunggu keputusan | DO15–17 |
| K01 Knowledge list | Tipe SOP/FAQ/brief/lesson/policy/analysis, filters, status, search | Keyword awal; semantic mode kemudian tanpa perubahan scope | K2–5 |
| K02 Detail/sumber | Body, metadata, citation/source panel, linked records, feedback, versi | Citation akses hilang tidak membocorkan judul; outdated banner | K3,12 |
| K03 Editor/review | Taxonomy/tags, isi, sumber, submit, approve/revise/reject, history | Revisi saat review membatalkan target versi lama; source permissions tidak diperluas | K4 |
| K04 Taxonomy/arsip | Kelola kategori/tag, tandai outdated, archive/restore, duplicate-topic guidance | Merge topic membutuhkan rancangan kebijakan; tidak otomatis menghapus record | K8,12 |

## Editorial, layanan dan komunikasi

| ID / layar | Tujuan, konten dan aksi | Kontrol dan relasi | Sumber |
|---|---|---|---|
| C01 Editorial dashboard | Queue draft/review/approval/scheduled/published; filters type/period/language | Save bukan publish; role editorial terpisah dari technical admin | C5–7 |
| C02 Bilingual editor | Logical item, ID/EN variants, judul/slug/summary/body/SEO/alt/caption; history | Status tiap bahasa/versi jelas; stale translation indicator usulan | C4 |
| C03 Review/approval | Preview isi versi, sumber, public-safe checks, reviewer notes; approve/revise/reject | Approval ke versi tepat; perubahan substantif menghasilkan versi baru | C7 |
| C04 Preview/publish | Preview private, immediate/scheduled, ringkasan versi/bahasa/assets, publish history | Recheck permission dan asset; failed job tidak ditampilkan published | C8,25 |
| C05 Publication/program manager | Metadata repository, authors/identifier/file versions; activity editor | Internal source link terlindungi; metadata publik curated | C10–11 |
| C06 Dataset/media manager | Dataset fields/unit/source/methodology, version approval; media/alt/caption | Public field allowlist; sensitive fields tidak ikut chart/export | C13–15 |
| C07 Taxonomy/URL/history | Tags/category, redirects, archive/restore, scheduled unpublish, audit | Archive removes discovery; 404/410/redirect policy; tidak menyajikan arsip publik diam-diam | C25 |
| S01 Form builder | List, field/section editor, validation, conditional rules, preview, version publish | Mapping hanya target yang diizinkan; tidak memberi arbitrary database write | D12 |
| S02 Submissions | Daftar/filter, detail per form-version, workflow/task/approval link | Existing submission stabil; redaksi/export mengikuti classification | D12 |
| S03 Complaint queue | Triage, category/priority/assignee/status, safe tracking reference | Akses per kasus; tidak menganggap semua pimpinan mendapat isi kasus | D13,R5 |
| S04 Complaint detail | Uraian/lampiran, internal notes terpisah jelas dari public update, assignment/action/close | Public preview sebelum kirim update; alasan penutupan sesuai policy | D13 |
| S05 Pengumuman | List/detail/editor, audience all/division/group, scheduled rules bila diputuskan | Preview recipient scope; tidak mengasumsikan semua pengumuman publik | B9,M E |
| S06 Kontak & Relasi | Usulan list/detail/search kategori organisasi/orang, owner dan scope | Field, consent/retention dan workflow belum ada dalam sumber; belum siap high-fidelity final | M D |

## Evaluasi, handover, AI

| ID / layar | Tujuan, konten dan aksi | Kontrol dan relasi | Sumber |
|---|---|---|---|
| E01 Kinerja personal/divisi | Timeliness/completion/evidence/responsiveness, trend, periode, metode skor, data asal | Missing data dibedakan dari skor 0; hanya scope yang benar | D18,TK21 |
| E02 Comparison/reports | Perbandingan divisi/period, summary, laporan otomatis, export | Baseline usulan Ketua/Sekjend sambil konflik R diselesaikan | U15,R9 |
| E03 Koreksi skor | Nilai kalkulasi, usulan koreksi, alasan, actor/history | Tidak menimpa nilai asli; formula version ditampilkan saat relevan | TK21 |
| H01 Arsip organisasi | Filter periode/type/division, source links, archive context | Pengurus baru tidak otomatis semua akses; closed bukan deleted | M O |
| H02 Handover package | From/to period, open work/documents/decisions/responsibilities/reports/knowledge, readiness | Permission per item; original period tidak diubah | D17 |
| H03 Acceptance | Incoming reviewer, checklist/item decision, alasan belum diterima, final acceptance | Outstanding tetap terlihat; tidak complete hanya karena paket dikirim | U23,D17 |
| I01 AI conversation | Chat + source panel + action panel, riwayat accessible, fakta/analisis/rekomendasi | AI tidak diberi global permission; source berubah/revoked diperiksa | U16,D19 |
| I02 R&A tools | Pilih comparison/gaps/hypotheses/ACH/bias/brief; sumber dan hasil terstruktur | Output analitis berlabel; manusia menentukan keputusan | B11 |
| I03 Review AI action | Target, perubahan diusulkan, source/version, konsekuensi, confirm/cancel/result | Reauthorize saat execute; stale payload meminta review baru; audit | M M,D19 |

## State kontrak seluruh layar

Setiap layar data memiliki loading, empty, error/retry, success, no-access, session-expired. Layar write menambah validation, submitting, duplicate retry, conflict/version changed, permission revoked, dan unsaved changes. List dengan filter membedakan “Belum ada data” dan “Tidak ada hasil filter”.

Tidak berhak mengetahui keberadaan resource: gunakan pesan generik dan tanpa title/snippet. Jika user tahu resource dari riwayat sah tetapi izin sudah hilang, cukup “Akses ke item ini sudah tidak tersedia” tanpa isi sebelumnya. Layanan internal memvalidasi lagi saat user membuka target dari notification/search/calendar/AI.
