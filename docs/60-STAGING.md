# Staging

Tanggal: 30 Oktober 2026.

Staging adalah salinan website dengan database sendiri, tempat perubahan dicoba sebelum masuk production. Tidak ada data pengurus sungguhan di staging.

| | Production | Staging |
|---|---|---|
| Alamat | https://kpi-dardev.vercel.app | Alamat Preview Vercel dari branch `staging` (`kpi-dardev-git-staging-darcia2024s-projects.vercel.app`) |
| Sumber kode | branch `main` | branch `staging`, juga setiap branch/PR lain |
| Database | Supabase `gtjzlkmwafyttevertho` | Project Supabase kedua, khusus staging |
| `KPI_APP_ENV` | `production` | `staging` |
| Target Vercel | Production | Preview |

`scripts/check-deployment.ts` menolak pasangan yang tertukar: `KPI_APP_ENV=staging` di target Production, atau `production` di target Preview. Variabel production hanya diberi scope Production, jadi deploy Preview yang belum diberi variabel staging gagal di validasi dan tidak pernah tersambung ke database production.

## Langkah pemasangan (sekali saja)

### 1. Buat project Supabase staging — pemilik akun Supabase

1. Supabase → organisasi **KPI PPMI Mesir** → New project. Nama: `KPI PPMI Mesir Staging`. Region sama dengan production: South Asia (Mumbai).
2. Buat kata sandi database sendiri lalu simpan di password manager. Paket Free mengizinkan dua project aktif per organisasi, dan project yang tidak dipakai 7 hari akan dijeda otomatis.
3. Pasang skema dengan menjalankan semua file `supabase/migrations/*.sql` **berurutan sesuai nama file**. Bisa lewat SQL Editor satu per satu, atau dengan Supabase CLI:

   ```bash
   npx supabase login
   npx supabase link --project-ref <ref-staging>
   npx supabase db push
   ```

4. Authentication → URL Configuration: Site URL `https://kpi-dardev-git-staging-darcia2024s-projects.vercel.app`, Redirect URLs `https://kpi-dardev-*-darcia2024s-projects.vercel.app/**`.

### 2. Isi variabel Preview di Vercel — pemilik project Vercel

Vercel → `kpi-dardev` → Settings → Environment Variables. Untuk setiap baris, pilih environment **Preview** saja:

| Nama | Nilai |
|---|---|
| `KPI_APP_ENV` | `staging` |
| `KPI_APP_NAME` | `kpi-ppmi-mesir` |
| `KPI_REQUEST_ID_HEADER` | `x-request-id` |
| `KPI_TEST_AUTH_ENABLED` | `false` |
| `KPI_AUTH_PROVIDER` | `supabase` |
| `KPI_SUPABASE_URL` | `https://<ref-staging>.supabase.co` |
| `KPI_SUPABASE_PUBLISHABLE_KEY` | publishable key project staging, tandai Sensitive |
| `KPI_SUPABASE_SERVICE_ROLE_KEY` | secret key project staging, tandai Sensitive |

Salin key memakai tombol Copy di Supabase, jangan memblok teksnya. Jangan pernah memakai key production di sini.

### 3. Buat branch `staging`

```bash
git switch -c staging
```

```bash
git push -u origin staging
```

Vercel otomatis membangun Preview untuk branch ini. Cek `https://kpi-dardev-git-staging-darcia2024s-projects.vercel.app/api/v1/health`: hasilnya harus `"environment":"staging"`.

## Alur kerja sehari-hari

1. Kerjakan perubahan di branch fitur, buka pull request ke `staging` atau langsung ke `main`.
2. Setiap PR mendapat alamat Preview sendiri yang memakai database staging. Coba di sana.
3. Migration baru dijalankan dulu di Supabase staging, baru di production.
4. Setelah lolos, merge ke `main`. Production ter-deploy otomatis.

## Data di staging

Isi staging dengan akun dan data latihan buatan tim, misalnya `uat.*@contoh` yang dikendalikan pengembang. Jangan menyalin backup production ke staging kecuali untuk latihan pemulihan, dan hapus lagi setelah selesai, karena backup production berisi data pengurus dan kasus sungguhan.
