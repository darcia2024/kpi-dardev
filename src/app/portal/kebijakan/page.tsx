import Link from "next/link";

import {redirect} from "next/navigation";

import {GovernanceWorkspace} from "@/components/access/governance-workspace";

import {getHostedIdentity} from "@/platform/identity/hosted-auth";

const categories=[

 ["Terbuka","Informasi yang telah disetujui untuk publik. Dokumen tanpa klasifikasi tidak dianggap terbuka."],

 ["Internal","Informasi untuk kepentingan kerja internal sesuai fungsi dan penugasan."],

 ["Terbatas","Akses berdasarkan kebutuhan tugas dan keputusan pejabat yang berwenang."],

 ["Rahasia","Akses khusus dengan persetujuan Ketua atau pejabat yang memperoleh delegasi khusus. Identitas dan bukti kasus tidak dibuka otomatis."]

];

const forms=[

 ["F01","Permintaan atau perubahan hak akses","Catat pemohon, mandat, objek informasi, klasifikasi, tindakan yang diminta, tujuan, batas waktu, keputusan pejabat, dan pelaksanaan teknis. Persetujuan sebagian hanya memberikan tindakan yang disetujui."],

 ["F02","Register dan peninjauan hak akses","Catat penerima, dasar penugasan, ruang lingkup, pemberi persetujuan, masa berlaku, pelaksanaan, dan perubahan status. Tinjau paling lambat setiap tiga bulan serta ketika ada perubahan jabatan, insiden, atau konflik kepentingan. Jangan masukkan kata sandi atau isi bukti rahasia."],

 ["F03","Laporan dugaan insiden kerahasiaan","Laporkan segera, walaupun informasi belum lengkap. Catat waktu diketahui, sistem dan informasi terdampak, dampak yang diketahui, tindakan awal, penerima laporan, dan referensi bukti privat. Dugaan insiden bukan keputusan bersalah."],

 ["F04","Penanganan dan pemulihan insiden","Catat urutan tindakan, pelaksana, kewenangan, bukti, risiko tersisa, keputusan pemberitahuan, perbaikan, verifikasi, serta persetujuan pemulihan dan penutupan. Penutupan teknis tidak menutup pemeriksaan personel oleh BPI."],

 ["F05","Serah terima dan pengakhiran akses","Verifikasi akun, folder, tautan, dokumen, tanggung jawab, pencabutan akses, dan pengamanan bukti resmi. Pengecualian dan akses transisi memerlukan persetujuan serta batas waktu. Kewajiban kerahasiaan tetap berlaku setelah tugas berakhir."]

];

export default async function PolicyPage():Promise<React.JSX.Element>{

 const identity=await getHostedIdentity();if(!identity)redirect("/masuk");

 return <div className="portal-shell">

 <header className="page-heading"><p className="eyebrow">Tata kelola informasi · Internal</p><h1>Kerahasiaan dan hak akses</h1><p>Akses diberikan untuk menjalankan tugas, dalam ruang lingkup dan masa berlaku yang disetujui.</p><p>SOP 002/SOP/KPI/X/2026 · Versi 1.1 Final · Diterbitkan 2 Oktober 2026. Berlaku sejak pengesahan Dewan Penasehat.</p></header>

 <GovernanceWorkspace accountId={identity.accountId} technicalAdmin={identity.systemAdmin===true}/><details className="operations-panel"><summary>Acuan SOP dan klasifikasi informasi</summary>
 <section className="operations-panel"><h2>Hak akses mengikuti keputusan, bukan nama jabatan</h2><p>Admin sistem mengelola konfigurasi dan akun. Akses isi kasus, keuangan, dan dokumen tetap memerlukan penugasan serta keputusan akses. Membaca tidak otomatis memberi hak mengubah, mengunduh, menyalin, meneruskan, menerbitkan, atau memberikan akses kepada orang lain.</p><p>Komitmen kerahasiaan bukan izin akses. Pemohon tidak dapat menyetujui aksesnya sendiri. Pejabat yang memiliki konflik kepentingan tidak boleh mengendalikan persetujuan terkait.</p></section>

 <section className="operations-panel"><h2>Empat klasifikasi informasi</h2><dl>{categories.map(([name,description])=><div key={name}><dt><strong>{name}</strong></dt><dd>{description}</dd></div>)}</dl><p>Dokumen campuran mengikuti klasifikasi tertinggi. Penurunan klasifikasi rahasia harus mendapat persetujuan yang berwenang, disertai alasan dan catatan keputusan.</p></section>

 <section className="operations-panel"><h2>Formulir pendukung SOP</h2><p>Ringkasan berikut menjadi acuan pengisian formulir resmi. Pengajuan elektronik dan tindak lanjut tersedia di ruang kerja di atas; keputusan tetap memerlukan mandat resmi.</p>{forms.map(([code,title,description])=><details key={code}><summary>{code} · {title}</summary><p>{description}</p></details>)}</section>

 <section className="operations-panel"><h2>Insiden, layanan eksternal, dan pengakhiran tugas</h2><p>Laporkan dugaan insiden segera kepada pengelola teknis dan Sekjend. Dugaan pelanggaran personel diteruskan kepada BPI; gunakan jalur BPI langsung jika penerima laporan memiliki konflik kepentingan. Penangguhan akses untuk pengamanan bukan penetapan sanksi.</p><p>AI, pemindaian, dan transkripsi informasi nonpublik hanya boleh memakai layanan yang disetujui KPI untuk klasifikasi tersebut. API key tidak menggantikan persetujuan. Persetujuan pengambilan foto juga tidak otomatis menjadi persetujuan publikasi.</p><p>Dokumen resmi dan bukti tidak dihapus tanpa dasar tertulis. Jadwal retensi, jalur pelaporan resmi, dan pejabat pemberi persetujuan perlu ditetapkan KPI.</p></section>

 </details>
 <Link className="button button--quiet" href="/portal/akses">Lihat hak akses saya</Link>

 </div>;

}

