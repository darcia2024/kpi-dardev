# Backlog E04: Website publik, CMS, dan aspirasi

Status: UI TEST selesai awal. Konten resmi, storage publik, workflow approval, dan triage produksi belum diaktifkan.

| Area | Status UI | Rute |
|---|---|---|
| P01–P11 | Selesai awal | `/publik` dan `/publik/publikasi` menyediakan landing publik, area informasi, katalog, filter, dan state konten TEST |
| P12–P13 | Selesai awal | `/publik/aspirasi` memiliki formulir, validasi browser, consent, hasil simulasi, dan token tracking TEST |
| C01–C04 | Selesai awal | `/portal/editor` memetakan draft → review → approved → published dan checklist bilingual |
| C05–C07 | Selesai awal | Struktur UI asset, preview publik, dan arsip tercermin dalam checklist/editor state |

Batas penerimaan berikutnya: hanya versi approved yang boleh dibaca publik; antiabuse, idempotency, catatan internal vs update pelapor, token expiry/recovery, indeks pencarian, metadata halaman, bahasa ID/EN, dan izin server harus tersedia sebelum E04 dianggap operasional.
