# Design system usulan

## Arah

Adaptasi prinsip Apple Human Interface Guidelines untuk web KPI: hierarki jelas, konten mudah dibaca, kontrol familiar, dan material yang menjelaskan lapisan navigasi. Bukan salinan aplikasi Apple atau klaim bahwa web menggunakan komponen native Apple.

Rujukan: [Apple HIG](https://developer.apple.com/design/human-interface-guidelines), [Materials](https://developer.apple.com/design/human-interface-guidelines/materials), [Liquid Glass](https://developer.apple.com/documentation/TechnologyOverviews/liquid-glass). Dokumentasi materials menjelaskan penggunaan material pada kontrol/navigasi serta penyesuaian reduce transparency. Angka token di bawah adalah keputusan desain usulan KPI, bukan ukuran wajib dari Apple.

Antislop diterapkan selama desain sesuai pilihan pengguna. Tidak ada statistik buatan, logo baru, foto pengurus buatan, grid dekoratif, atau animasi yang menghambat pekerjaan.

## Karakter per area

| Area | Komposisi | Alasan |
|---|---|---|
| Publik | Tipografi lega, foto relevan saat aset tersedia, daftar publikasi editorial | Membantu orientasi dan kepercayaan pada sumber |
| Internal | Sidebar, toolbar, daftar/tabel, panel tindakan | Mendahulukan pekerjaan daripada dekorasi |
| Dokumen/pengetahuan | Metadata jelas, bacaan terfokus, panel sumber | Memudahkan verifikasi dan penelusuran |
| Aksi sensitif | Permukaan solid, klasifikasi terlihat, alasan dan konsekuensi | Keputusan dapat dipahami sebelum dikonfirmasi |

## Token warna

| Peran | Light | Dark |
|---|---|---|
| Canvas | #F5F5F7 | #161618 |
| Surface | #FFFFFF | #222225 |
| Teks utama | #1D1D1F | #F5F5F7 |
| Teks sekunder | #515158 | #B8B8C0 |
| Aksen/link | #005FCC | #78B7FF |
| Primary button | #005FCC dengan teks putih | #005FCC dengan teks putih |
| Garis dekoratif | #D2D2D7 | #48484F |
| Batas kontrol | #777780 | #93939B |
| Error/destructive | #B42318 | #FFB4AB |
| Success | #216E39 | #8CD9A6 |
| Warning | #805000 | #F2C66D |

Warna status selalu disertai teks/ikon. Overdue tidak hanya ditandai merah. Klasifikasi tidak dikodekan dengan warna saja. Batas dekoratif tidak dipakai sebagai satu-satunya batas input.

Token belum diuji pada render final. Target review: teks normal 4.5:1, teks besar 3:1, indikator fokus dan komponen penting 3:1; pengukuran dilakukan pada kombinasi aktual termasuk transparency, hover dan disabled.

## Typography dan spacing

- Font: system sans platform; SF jika tersedia melalui font sistem perangkat Apple, fallback sans sistem lain. Tidak mendistribusikan file font Apple sebagai webfont tanpa pemeriksaan lisensi.
- Body 16px/24px; isi panjang 17px/28px; label 14px/20px; metadata minimum 13px/18px.
- Judul portal 32px/40px desktop, 28px/36px mobile. Hero publik 56px/62px desktop, 36px/42px mobile, maksimal tiga baris pada ukuran minimum.
- Spacing: 4, 8, 12, 16, 24, 32, 48, 64, 96px. Antar label dan input 8; antar field 24; antar kelompok 32; antar bagian publik 64–96.
- Radius: input/button 10px, panel 16px, dialog 20px. Pill hanya segmented control atau status ringkas yang relevan.
- Ikon garis konsisten 20–24px; nama aksi tetap terlihat untuk aksi utama.
- Shadow hanya pada popover/dialog dan navigasi mengambang. Konten biasa memakai whitespace/separator.

## Material dan gerak

Liquid Glass diterjemahkan sebagai navigasi translusen ringan pada maksimal satu atau dua elemen dalam satu viewport. Tabel, formulir, dokumen dan panel review tetap solid. Sediakan tampilan solid saat reduce transparency/kontras tinggi dipilih. Transparansi tidak menjadi syarat memahami hierarki.

Gerak usulan 120–180ms untuk feedback, 180–240ms untuk drawer. Tanpa scroll-jacking, parallax wajib, atau animasi dekoratif berulang. Reduced motion meniadakan perpindahan besar; feedback state tetap tersedia. Mockup statis tidak membuktikan motion atau aksesibilitas sudah lulus.

## Layout responsif

| Lebar usulan | Navigasi dan konten |
|---|---|
| 320–767px | Drawer menu; satu kolom; padding 16px; toolbar bisa membungkus; list menggantikan tabel bila makna tetap terjaga |
| 768–1023px | Drawer/collapsed sidebar; padding 24px; detail dua kolom hanya jika teks tetap layak |
| ≥1024px | Sidebar 232px; toolbar 64px; padding 32px; detail 2/3 konten + 1/3 panel aksi |
| Wide | Konten publik maksimum 1200px; bacaan maksimum sekitar 72 karakter/baris; tabel kerja dapat lebih lebar |

Tidak semua tabel diubah menjadi kartu. Perbandingan data mempertahankan tabel dengan scroll lokal, petunjuk scroll, dan header jelas. Tidak ada overflow seluruh halaman. Target sentuh usulan 44×44px. Sticky action tidak boleh menutupi input, error, keyboard atau bar navigasi perangkat.

## Komponen dan kontrak interaksi

| Komponen | Perilaku wajib |
|---|---|
| AppShell | Breadcrumb, konteks periode, pencarian, akun/sesi; menu sesuai hak |
| Button | Primary, secondary, quiet, destructive; pending mencegah submit ganda; label menjelaskan hasil |
| FormField | Label permanen, helper, required jelas, inline error; error summary mengarah ke field |
| FilterBar | Filter aktif dapat dibaca/dihapus; reset; count hanya untuk data yang boleh dilihat |
| DataTable/List | Sort eksplisit, pagination, selection jelas, empty berbeda dari error |
| SegmentedControl/Tabs | Memisahkan mode/set konten; fokus dan selected state jelas |
| DateTimePicker | Zona waktu terlihat; nilai kanonik tidak ditebak dari lokasi perangkat |
| ClassificationBanner | Label teks; scope ringkas aman; expiry grant jika relevan |
| ApprovalPanel | Target dan versi, catatan, approve/reject/revision; alasan sesuai policy |
| FileUploader | Status upload/checking/available/failed/quarantined; retry aman |
| VersionPicker | Versi aktif/final dibedakan; aksi tidak menimpa versi lama diam-diam |
| SourceCitation | Sumber dan versi; buka setelah pengecekan akses; tidak membocorkan judul saat akses hilang |
| Dialog/Drawer | Judul dan konsekuensi; focus trap, Escape sesuai konteks, fokus kembali ke pemicu |
| Toast/Banner | Toast untuk hasil ringan; error penting menetap; status tersampaikan ke pembaca layar |
| Timeline | Actor/waktu/aksi yang aman; histori bisnis terpisah dari audit teknis |
| AIActionReview | Payload, target, konsekuensi, expiry proposal; konfirmasi baru jika payload berubah |

## Bahasa dan copy

Portal: Bahasa Indonesia. Pertahankan My Workspace/Action Required sebagai nama baseline dengan deskripsi Indonesia. Usulan padanan label dapat diputuskan bersama. Publik: ID/EN dengan switch yang mempertahankan halaman ekuivalen bila tersedia.

Contoh label: “Ajukan selesai”, “Terima hasil pekerjaan”, “Minta revisi”, “Ajukan perpanjangan”, “Cabut akses”, “Arsipkan”, “Terbitkan versi ini”. Hindari “OK” untuk konsekuensi penting. Tidak memakai klaim keamanan atau statistik tanpa sumber.

## Pemeriksaan lintas layar

Keyboard lengkap, visible focus, heading semantik, skip navigation, labels, error associations, status announcements, zoom 200%, reflow 320px, preferensi tema/motion/transparency, dan kesetaraan aksi mobile. Autocomplete mention harus membatasi daftar orang sesuai scope. Judul tab browser pada halaman sensitif generik: “Dokumen | KPI”, bukan judul rahasia.
