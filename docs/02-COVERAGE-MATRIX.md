# Matriks Cakupan Awal

Status: E02 dimulai secara lokal TEST. Matriks ini memetakan setiap kelompok layar ke fase utama. Detail `requirement → task → test → evidence` dibuat saat backlog tiap fase siap.

| Kelompok layar | Jumlah | Fase utama | Dependency awal | Bukti penerimaan utama |
|---|---:|---|---|---|
| A01–A11: identitas, organisasi, izin, audit | 11 | E02 | E01 | Akses sah berhasil, akses tidak sah dan sesi dicabut ditolak |
| F01–F06: dokumen dan berkas | 6 | E03 | E02 | File 25 MB, executable, quarantine, versi, dan pencabutan akses teruji |
| P01–P15: publik | 15 | E04 | E02–E03 | Draft tidak bocor, ID/EN aman, aspirasi/tracking selesai end-to-end |
| C01–C07: CMS | 7 | E04 | E02–E03 | Draf → review → approve → publish dapat ditelusuri |
| W01–W05: workspace | 5 | E05 | E02–E03 | Action Required dan pencarian hanya menampilkan objek berizin |
| T01–T11: tugas | 11 | E05 | E03 | Bukti, review manusia, konflik versi, dan overdue lulus |
| M01–M07: rapat | 7 | E06 | E03, E05 | Voting rahasia, notulen final, follow-up ke tugas lulus |
| S01–S09: formulir, kasus, komunikasi | 9 | E07 | E04 | Versi formulir, triage, penutupan/reopen, pembaruan pelapor lulus |
| N01–N04: notifikasi | 4 | E07 | E03 | Target, retry, template, dan isi aman teruji |
| B01–B09: keuangan | 9 | E08 | E02–E03, OD-07 | Pengajuan → approval → pembayaran → rekonsiliasi lulus |
| E01–E08: evaluasi | 8 | E09 | E05, OD-06 | Missing bukan nol, formula berversi dan sanggah terlacak |
| K01–K04: knowledge | 4 | E09 | E03 | Sitasi dan pencarian menghormati izin |
| A12–A16: konfigurasi, retensi, backup | 5 | E10 | E01 | Konfigurasi/audit/restore dapat dibuktikan |
| H01–H06: handover | 6 | E10 | E02 | Penerimaan item dan peralihan akses lulus |
| I01–I06: AI | 6 | E11 | E09, OD-08 | Retrieval berizin, sitasi, review aksi manusia lulus |
| **Total** | **113** | E12 memverifikasi keseluruhan | | |

## Backlog E01 yang dapat disiapkan tanpa data nyata

1. Bootstrap runtime yang mengikuti ADR disetujui, dengan TypeScript strict, lint, test runner, dan build reproducible.
2. Konfigurasi lingkungan tervalidasi, tanpa secret di repo, dengan local dan staging hanya memakai data TEST.
3. Struktur modul publik/portal dan kontrak respons/error dasar.
4. Sistem desain dari `styles.css` diterjemahkan ke komponen aplikasi setelah arah visual disetujui untuk pekerjaan UI.
5. Migrasi awal: identitas, organisasi, periode, audit, konfigurasi lingkungan, dan seed TEST.
6. CI: typecheck, lint, unit test, integration test yang sesuai, pemeriksaan secret, dan build.
7. Health check, correlation ID, logging teredaksi, dan prosedur backup/restore staging.

Tidak ada item di atas yang boleh mengirim data institusi ke pihak ketiga atau membuat lingkungan produksi tanpa gerbang E00.
