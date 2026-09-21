# Backlog E08: Keuangan dan pertanggungjawaban

Status: UI TEST selesai awal. Buku transaksi, pembayaran bank, dan policy keuangan belum diaktifkan.

| Area | Status UI | Rute |
|---|---|---|
| B01–B03 | Selesai awal | `/portal/keuangan` menampilkan anggaran berversi, sisa simulasi, pengajuan, klaim, dan uang muka |
| B04–B06 | Selesai awal | Siklus Draft → Waiting approval → Approved → Paid → Reconciled dapat disimulasikan |
| B07–B09 | Selesai awal | Tab approval & audit menampilkan dua reviewer, masking, rekonsiliasi, dan histori perubahan |

Batas penerimaan berikutnya: periode/mata uang/kurs resmi, ambang nominal, separation of duties, dua approver, budget enforcement, idempotent payment, rekonsiliasi selisih, row-level access, audit immutable, dan keputusan OD-07.
