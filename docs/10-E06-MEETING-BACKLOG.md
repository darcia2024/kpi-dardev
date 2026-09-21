# Backlog E06: Rapat, voting, keputusan, dan tindak lanjut

Status: UI TEST selesai awal. Kalender, voting quorum, notulen final, dan task follow-up belum terhubung ke service produksi.

| Area | Status UI | Rute |
|---|---|---|
| M01–M03 | Selesai awal | `/portal/rapat` menampilkan agenda, zona waktu `Africa/Cairo`, daftar rapat, detail, dan RSVP |
| M04 | Selesai awal | Editor notulen TEST dapat dikunci sebagai versi final; revisi berikutnya harus menjadi versi baru |
| M05 | Selesai awal | Voting TEST dengan pilihan individu, status putaran, dan batas hasil agregat |
| M06–M07 | Selesai awal | Follow-up task dan arsip ditampilkan dengan tautan sumber rapat/keputusan |

Batas penerimaan berikutnya: validasi waktu/peserta, conflict warning, snapshot pemilih, quorum/koreksi, concurrency vote, separation of duties, final minutes policy, permission arsip, dan idempotency task follow-up.
