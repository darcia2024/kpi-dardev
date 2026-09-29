# Backlog E05: Workspace dan manajemen tugas

Status: UI TEST selesai awal. Task persistence, assignment, approval, evidence storage, dan permission server belum diaktifkan.

| Area | Status UI | Rute |
|---|---|---|
| W01–W05 | Selesai awal | `/portal/workspace` menampilkan ringkasan pekerjaan, Action Required, hambatan, filter, dan konteks periode |
| T01–T04 | Selesai awal | `/portal/tugas` memiliki list, filter, status, progress, overdue/deadline, dan detail task |
| T05–T06 | Selesai awal | Detail task memiliki bukti, ajukan selesai TEST, review state, dan larangan auto-accept |
| T07–T08 | Selesai awal | Detail menampilkan extension/delegation dan subtask/dependency sebagai state yang belum terhubung |
| T09–T11 | Selesai awal | State template, workload, cancel/archive tercermin dalam struktur workspace dan status TEST |

Batas penerimaan berikutnya: status transition backend yang sama untuk form/board, optimistic locking versi bukti, separation of duties, idempotency, scope divisi/periode, overdue policy, dan audit setiap perubahan.
