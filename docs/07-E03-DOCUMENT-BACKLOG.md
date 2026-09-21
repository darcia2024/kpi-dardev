# Backlog E03: Dokumen dan layanan bersama

Status: UI TEST selesai awal. Storage privat, pemeriksaan file, dan policy akses produksi belum diaktifkan.

| Task | Status UI | Bukti pada checkout | Batas berikutnya |
|---|---|---|---|
| E03-T01 | Selesai awal | Pustaka F01 dengan pencarian, filter klasifikasi, status Available/Checking, dan detail ringkas | Query backend hanya mengembalikan objek yang berizin |
| E03-T02 | Selesai awal | Upload F02 dengan file picker TEST, status checking, available, dan quarantine untuk executable | Private storage, batas 25 MB, allowlist, scanner, dan retry idempotent |
| E03-T03 | Selesai awal | Detail/versi F03 menampilkan versi aktif dan versi menunggu | Migrasi versi, optimistic concurrency, dan reference bukti |
| E03-T04 | Selesai awal | Preview F04–F05 menampilkan recipient, izin, expiry, klasifikasi, dan state revoke | OD-04, policy sharing, watermark, dan pemeriksaan server |
| E03-T05 | Selesai awal | Preview F06 menampilkan audit akses dan arsip sebagai state UI | Audit query, retention, legal hold, archive/restore, dan ekspor terkontrol |

UI ini sengaja memakai data sintetis TEST dan tidak mengklaim file sudah tersimpan. File executable/oversize, kegagalan pemeriksaan, pencabutan akses, dan expiry harus ditegakkan kembali oleh service dan database sebelum fitur diterima.
