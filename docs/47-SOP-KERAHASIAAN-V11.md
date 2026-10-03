# Penyesuaian SOP kerahasiaan dan hak akses KPI v1.1



Tanggal pengerjaan: 2 Oktober 2026. Acuan baru mengubah asumsi admin penuh pada paket sebelumnya. Dokumen ini bukan pengesahan organisasi atau pengganti formulir resmi.



## Acuan



- KPI_SOP_Kerahasiaan_dan_Hak_Akses_v1.1-2.pdf: 13 halaman; nomor 002/SOP/KPI/X/2026; v1.1 Final; diterbitkan 2 Oktober 2026; berlaku sejak pengesahan Dewan Penasehat.

- KPI_Formulir_SOP_Kerahasiaan_dan_Hak_Akses_v1.1.pdf: 8 halaman; F01–F05.

- Kedua berkas berklasifikasi INTERNAL. PDF tidak disalin ke public/, galeri, atau katalog publik.



## Perubahan implementasi



| Ketentuan | Implementasi | Batas implementasi |

|---|---|---|

| Admin teknis bukan pembaca seluruh data | Migrasi 013 mengganti bypass izin bisnis; sisi TypeScript dan sidebar memakai pembatasan yang sama | Identitas ADMIN_SISTEM tetap aktif untuk pengelolaan teknis. Mandat bisnis harus terpisah |

| Mandat dan keputusan akses terdokumentasi | authority, access_decision, permission_grant terhubung; F01/reference/purpose/scope/expiry/implementer; API governance | Pendaftaran mandat pemberi persetujuan perlu surat dan identitas resmi; belum ada mandat yang diisi otomatis |

| Pemohon tidak menyetujui akses sendiri | RPC menolak keputusan untuk diri sendiri; pelaksanaan teknis terpisah | Bukan tanda tangan elektronik; decision_reference harus merujuk bukti persetujuan yang benar |

| Hak terpisah | ASSET_READ berbeda dari ASSET_DOWNLOAD; hak operasi lain tetap berupa kode terpisah | COPY/FORWARD/MANAGE_ACCESS dan delegasi seluruh matriks fungsi belum menjadi workflow UI lengkap |

| Masa berlaku dan kebutuhan tugas | Grant harus terhubung keputusan valid, berbatas waktu, penugasan aktif, organisasi/periode/divisi/objek sesuai | Kondisi pengakhiran selain tanggal masih perlu proses pencatatan resmi |

| Klasifikasi | Register empat kategori; objek kasus RAHASIA; berkas tanpa klasifikasi disahkan diperlakukan sebagai RAHASIA; layanan memerlukan persetujuan untuk kategori tersebut | Belum ada editor klasifikasi/deklasifikasi lengkap untuk semua jenis konten; penetapan atau penurunan klasifikasi harus dilakukan oleh pejabat berwenang dengan bukti tercatat |

| Konflik kepentingan | Register konflik dan pengecekan penerima/pemberi persetujuan; admin tidak menjadi sekretaris kasus otomatis | Pencatatan konflik dan delegasi khusus memerlukan keputusan nyata |

| F02 register akses | /portal/kebijakan dan API GET governance menampilkan keputusan terkait penerima/pemberi persetujuan/pelaksana; review_due_at paling lambat tiga bulan | Bukan register seluruh organisasi bagi semua pengurus; UI temuan review/PIC/verifikasi belum lengkap |

| Kerahasiaan Storage | Bucket private; download melalui sesi website, tanpa signed URL yang dibagikan ke browser; izin diperiksa saat permintaan | Pemeriksaan antivirus masih memerlukan penyedia resmi |

| AI/pemindai/transkripsi | Register persetujuan processor menurut purpose, endpoint, kategori, assessment, keputusan, expiry, pencabutan; pemindai tidak mengirim berkas jika persetujuan tidak tercatat | Penyedia/model AI belum ditentukan; AI hosted tetap nonaktif |

| Pencatatan aktivitas | Perekaman/pelaksanaan keputusan, otorisasi unduhan dan perubahan register governance diaudit tanpa isi dokumen/kredensial | Log otorisasi unduh bukan bukti bahwa pengguna selesai menerima seluruh berkas |

| F03 laporan dugaan insiden | Ringkasan kolom dan jalur pelaporan di halaman kebijakan; laporan segera, boleh belum lengkap, bukan penetapan bersalah | Belum ada penyimpanan/pengajuan elektronik F03 |

| F04 penanganan insiden | Ringkasan tahapan, bukti privat, risiko, notifikasi, perbaikan, pemulihan dan penutupan | Belum ada workflow elektronik F04 atau penyelesaian pemeriksaan BPI |

| F05 pengakhiran akses | Acuan akun/folder/tautan/dokumen/bukti/tanggung jawab/transisi dan kewajiban kerahasiaan | Checklist elektronik F05, pengecualian, penerimaan dan pencabutan otomatis belum lengkap |

| Foto dan publikasi | Ketentuan izin pengambilan versus izin publikasi dituliskan | Bukti persetujuan untuk galeri yang sudah ada belum diberikan; SOP tidak otomatis mengesahkan foto |

| Retensi | Tidak menambahkan penghapusan otomatis; hold_reference disediakan | Jadwal retensi dan dasar tertulis penghapusan belum diberikan |



## Dampak bagi akun saat ini



Admin sebelumnya memperoleh seluruh modul dari persetujuan teknis. SOP baru secara tegas tidak membenarkan akses isi bisnis otomatis. Identitas/login dan pengaturan organisasi/periode dipertahankan; akses isi bisnis menunggu mandat dan keputusan terpisah. Grant lama disimpan sebagai catatan, tetapi tanpa keputusan SOP yang valid tidak dipakai untuk memberikan izin.



Periode 17 Oktober 2026–17 Oktober 2027 tetap PLANNED; belum ada periode aktif resmi. Dokumen baru tidak menjadi dasar membuat periode aktif palsu, mengangkat Ketua/sekretaris, memberikan akses kasus kepada seluruh pengurus, atau menyatakan semua modul siap digunakan.



## Yang perlu disediakan KPI



1. Identitas Ketua, pejabat penerima delegasi, batas fungsi/kategori/tindakan yang boleh disetujui, surat mandat dan masa berlakunya. Nama jabatan saja tidak cukup.

2. Penugasan pengurus resmi dalam periode yang sah; sekretaris penerima pengaduan dan petugas I&O yang ditugaskan. Media/publikasi adalah fungsi di P&E, bukan divisi keempat.

3. F01/keputusan akses nyata dengan tujuan, objek/cakupan, hak yang disetujui, tanggal dan bukti persetujuan. Tidak perlu mengirim password.

4. Kanal resmi pelaporan insiden kepada pengelola teknis, Sekjend dan BPI; pejabat pengganti bila ada konflik.

5. Assessment dan persetujuan layanan AI/pemindai/transkripsi untuk kategori informasi yang boleh diproses, termasuk penyimpanan dan retensi penyedia.

6. Jadwal retensi, prosedur legal hold/deklasifikasi dan bukti persetujuan publikasi foto.



Formulir F01–F05 tidak menggantikan NDA, komitmen kerahasiaan, atau SOP penanganan kasus terpisah. Isi formulir mengikuti klasifikasi informasi yang dicatat.



## Verifikasi



Uji database terisolasi menjalankan seluruh migrasi 003–014: admin tanpa keputusan tidak membaca data bisnis; grant lama tidak otomatis berlaku; persetujuan mandiri dan akses RAHASIA tanpa objek ditolak; pelaksanaan idempoten; penangguhan, pencabutan dan konflik menutup izin; ASSET_READ dapat menampilkan berkas TERBATAS tanpa dapat mengunduhnya; peningkatan klasifikasi ke RAHASIA menutup akses tersebut. Uji pemindai memastikan konfigurasi environment saja tidak mengirim berkas.



Pengujian tersebut tidak menggunakan data atau mandat fiktif dalam production. UAT seluruh peran resmi belum dapat dilakukan sebelum identitas, mandat, penugasan, periode aktif dan penyedia disediakan.


## Pemasangan production

- Migrasi 013 dan 014 berhasil dijalankan pada Supabase KPI (`gtjzlkmwafyttevertho`). Pemeriksaan menunjukkan `kpi_operations_schema_ready() = true`, jalur `kpi_manage_grant` lama tidak dapat dijalankan oleh authenticated, dan belum ada mandat/keputusan fiktif yang dimasukkan.
- Deployment production Vercel `dpl_HjMbBUFJeDz9bUUNea7VYP3KcefH` berstatus READY; alias `https://kpi-ppmi-mesir-preview.vercel.app` diperbarui. Pemeriksaan tujuh koneksi deployment dan build Next.js berhasil.
- TypeScript lulus. Suite 170 tes lulus; pengujian SOP dijalankan ulang setelah penguatan klasifikasi, audit register, dan routing kasus.
- Halaman baru: `/portal/kebijakan` (memerlukan login). Tampilan dengan akun dan mandat resmi belum diuji end-to-end karena sesi browser audit tidak sedang login ke portal.
