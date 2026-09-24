# Sisa 40 layar internal — 24 September 2026

Katalog 98 layar saat ini mencatat **58 connected, 40 partial, 0 planned**. `Connected` berarti alur lokal pratinjau memenuhi penerimaan layar; istilah itu **bukan** persetujuan operasional atau kesiapan produksi. Empat puluh ID di bawah punya UI atau fondasi API, tetapi belum memenuhi penerimaan lengkap. Jangan menurunkan status hanya dengan menambah data contoh atau menyembunyikan batasan.

Pembagian pekerjaan **20 yang bisa dilanjutkan sekarang, 13 yang perlu kepastian KPI, dan 7 yang perlu layanan/akses operasional** tersedia di [rencana 40 layar](./34-RENCANA-40-LAYAR-DAN-KEPASTIAN.md).

| Area | ID parsial | Yang masih harus diselesaikan |
| --- | --- | --- |
| Akun dan akses | A07 | Riwayat perubahan status/role akun dan detail akun resmi. |
| Akun dan akses | A08–A09 | Struktur organisasi, jabatan, penugasan, dan periode resmi yang dipakai konsisten oleh setiap modul. |
| Akun dan akses | A12 | Konfigurasi produksi teredaksi yang benar-benar terhubung ke layanan aktif. |
| Akun dan akses | A14 | Jadwal retensi, kewenangan legal hold, dan enforcement lintas data sesuai kebijakan KPI. |
| Akun dan akses | A15 | Backup terjadwal serta uji restore pada infrastruktur produksi/staging. |
| Akun dan akses | A16 | Pemeriksaan kesehatan dependensi produksi, bukan hanya status konfigurasi lokal. |
| Dokumen | F02–F03 | Scanner malware nyata, kebijakan jenis/ukuran/retensi, promosi versi setelah lolos pemeriksaan. |
| Dokumen | F04–F06 | Preview/unduh privat dan berbagi yang memakai aset layak; audit akses, retensi, serta hold pada storage produksi. |
| Knowledge | K01–K04 | Sumber SOP/FAQ resmi, izin sumber, artikel bersitasi, editor-review, pencarian, dan pencabutan versi. |
| Redaksi | C05 | Aset media yang lolos scanner dan terikat ke versi konten. |
| Layanan kasus | S03 | Triage yang menetapkan urgensi serta petugas berdasar struktur resmi dan alasan keputusan. |
| Layanan kasus | S05–S06 | Otoritas persetujuan, target penerima resmi, dan kanal pengiriman untuk pengumuman/pesan terarah. |
| Layanan kasus | S07 | Jenis layanan, kolom, teks consent, dan tujuan pemrosesan yang disetujui. |
| Layanan kasus | S08–S09 | Aturan SLA, eskalasi, penutupan, dan buka kembali beserta kewenangan aktor. |
| Notifikasi | N02–N04 | Kanal pilihan vs wajib, template yang disetujui, provider nyata, antrean/retry dan hasil kirim yang dapat diaudit. |
| Keuangan | B01–B03 | Anggaran/pos/periode/mata uang resmi, jenis pengajuan, dan pemohon yang terhubung ke identitas resmi. |
| Evaluasi | E02, E04, E08 | Daftar subjek, indikator/formula berversi, kewenangan evaluator, serta laporan dari nilai final resmi. |
| Handover | H04, H06 | Keputusan pemindahan/pencabutan grant dan arsip final dengan aturan retensi/akses resmi. |
| AI | I01–I06 | Korpus berizin, sitasi hidup, kebijakan retensi, provider/model/wilayah/kelas data yang disetujui, dan gerbang konfirmasi aksi produksi. |

Urutan teknis berikutnya adalah memasukkan kebijakan dan data KPI yang sudah disahkan ke layanan identitas, storage, notifikasi, evaluasi, keuangan, dan AI. Ketergantungan yang telah diminta dari klien tetap ditunda sesuai arahan: tidak mengarang 28 dokumen, nominal anggaran, jabatan, SLA, izin, maupun kebijakan AI. Setelah integrasi nyata tersedia, setiap ID perlu diuji ulang dengan akun lintas role, periode, dan organisasi sebelum berubah menjadi connected produksi.
