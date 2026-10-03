# Audit workspace internal — 2 Oktober 2026

## Temuan kode

1. Header portal masih memakai dekorasi lingkaran dan ukuran display hingga 2.7rem; pekerjaan operasional memerlukan judul ringkas, deskripsi, dan tindakan yang jelas.
2. Beranda admin menampilkan tujuan navigasi sebagai banyak tombol dengan prioritas serupa. Status layanan, kesiapan periode dan tujuan kerja belum dikelompokkan secara informatif.
3. PortalDemoPanel menggunakan portal-context (grid auto/1fr/auto/1fr untuk pasangan metadata pendek) dengan div berisi dt/dd dan paragraf panjang; tata letak rincian tidak memiliki ukuran kolom yang tepat.
4. PortalDemoForRoute menambahkan portal-shell kedua. Kedua shell memiliki padding atas/bawah sehingga jarak antara fitur asli dan contoh berlebihan.
5. portal-topbar__period berupa teks nowrap tanpa pembatasan ukuran untuk daftar periode hosted; pada desktop sempit dan mobile dapat mendesak breadcrumb atau tombol tema.
6. Sidebar mobile dapat ditutup dengan Escape, tetapi belum memindahkan fokus ke menu, membatasi fokus selama overlay terbuka, atau mengembalikan fokus ke tombol pembuka.
7. Status tugas online menggunakan daftar ul/li dan tombol generik; informasi judul, pemilik, status dan tenggat belum memiliki hierarki baris yang konsisten.
8. CSS portal tersebar di globals, portal-ui, design-system, portal-shell dan portal-forms dengan nilai warna berulang. Perbaikan perlu dibatasi pada subtree portal agar landing page tetap mengikuti tema yang disetujui.

## Arah perbaikan

Tetap menggunakan Plus Jakarta Sans, logo KPI, aksen merah dan tema terang/gelap. Workspace mengutamakan kejelasan informasi, panel ringkas, ukuran teks yang terbaca, serta kontrol minimal 44px di mobile. Tidak menambahkan statistik palsu atau mengganti batas backend dengan UI yang seolah operasional.

Prioritas: header/beranda, metadata demo, jarak panel, navbar/responsif, fokus menu mobile, daftar tugas. Pemeriksaan visual admin production belum dilakukan karena sesi browser otomasi belum login. Audit kode tidak dianggap sebagai verifikasi visual.

## Perbaikan dan pemeriksaan visual

Pengguna memilih antislop diterapkan selama audit/perbaikan. Arah: workspace operasional KPI, ENERGY 1 / RHYTHM 2 / MOTION 1. Hierarki mengikuti langkah kerja: periode resmi, tugas, lalu direktori modul. Logo dan Plus Jakarta Sans dipertahankan; aksen merah menandai tindakan utama/tujuan aktif. Panel memakai permukaan netral, tanpa pola dekoratif atau animasi terus-menerus.

- Header diperkecil dan dekorasi lingkaran/gradient internal dihapus pada kedua tema.
- Beranda admin diganti dengan langkah berikutnya, status akun/periode, akses cepat, serta direktori modul per kelompok; tidak membuat angka aktivitas palsu.
- Data demo memakai metadata berlabel dan alur terpisah, dengan penanda baca saja yang terlihat. Katalog contoh memiliki indeks navigasi yang responsif.
- Lampiran demo tidak lagi menambah portal-shell kedua dengan padding ganda.
- Teks periode panjang dibatasi dengan ellipsis dan title; navbar menyusun ulang pencarian pada lebar sempit.
- Menu mobile mengunci scroll, memindahkan fokus, membatasi Tab, menutup melalui Escape, mengembalikan fokus, dan menjadikan latar inert. Sidebar/drawer berada di atas bottom navigation.
- Tombol keluar tersedia di sidebar. Daftar tugas memakai baris dengan judul, pemilik/tenggat, status, serta selected state.

Visual QA memakai komponen asli dalam halaman development sementara dengan identitas fiktif. Halaman tersebut dihapus sebelum build/deploy; tidak mengubah autentikasi atau data Supabase. Diperiksa pada desktop 1280px serta mobile 390px dan 320px: tidak ada horizontal page overflow pada halaman yang diperiksa. Mode terang/gelap, disclosure demo dan fokus menu mobile diperiksa melalui browser. Form tugas memerlihatkan keadaan layanan tidak tersedia dalam harness lokal; ini bukan UAT backend production.

Kontras terhitung: teks muted terang 5.61:1; teks aksen terang 7.73:1; putih pada tombol merah 6.51:1; teks muted gelap 8.33:1; teks/fokus aksen gelap 7.60:1; border input terang 3.52:1 dan gelap 4.30:1 pada latar field yang dipakai. Catatan ini bukan klaim semua warna lama di seluruh modul sudah diaudit.

Screenshot QA lokal disimpan di .vercel/workspace-desktop-light.jpg, workspace-desktop-dark.jpg dan workspace-mobile-dark.jpg. UAT dengan sesi akun admin production pengguna belum dilakukan.

## Validasi dan deployment

Seluruh 160 tes lulus. Build production Vercel berhasil, termasuk pemeriksaan TypeScript dan generasi halaman. Enam pemeriksaan koneksi deployment (auth, database API, skema organisasi, identity RPC, tasks RPC, admin RPC) lulus sebelum deployment.

Deployment production `dpl_GKLcivMJJ4Kx9dGFwjmcVcw2GhEA` berstatus READY dan terpasang pada https://kpi-ppmi-mesir-preview.vercel.app. Pemeriksaan setelah deployment: `/api/v1/health` HTTP 200; API administration dan tasks HTTP 401 tanpa sesi; `/portal/demo` mengarahkan pengguna tanpa sesi ke `/masuk` melalui HTTP 307. Pemeriksaan anonim ini memastikan pembatasan akses tetap berlaku, bukan pengujian seluruh alur akun admin.
