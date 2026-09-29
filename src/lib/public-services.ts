import { IconBook2, IconBuildingCommunity, IconCamera, IconMessageCircle, IconNews, IconShieldCheck, IconUsersGroup } from "@tabler/icons-react";

export const publicServices = [
  { title: "Tentang KPI", description: "Mandat, prinsip kerja, visi, dan misi Komisi Peduli Interaksi.", href: "/publik", category: "Organisasi", icon: IconBuildingCommunity },
  { title: "Struktur & divisi", description: "Kedudukan KPI di PPMI Mesir, tiga divisi, dan satu subbidang.", href: "/publik/struktur", category: "Organisasi", icon: IconUsersGroup },
  { title: "Publikasi & edukasi", description: "Materi pengantar tentang interaksi sehat, pencegahan, dan prinsip perlindungan.", href: "/publik/publikasi", category: "Pengetahuan", icon: IconBook2 },
  { title: "Kegiatan & dokumentasi", description: "Potret ruang dialog, koordinasi, pembelajaran, dan kebersamaan Masisir.", href: "/publik/kegiatan", category: "Informasi", icon: IconCamera },
  { title: "Kabar & catatan", description: "Pengantar informasi publik yang telah disusun untuk membantu memahami KPI.", href: "/publik/kabar", category: "Informasi", icon: IconNews },
  { title: "Alur aspirasi", description: "Pelajari simulasi penyampaian saran dan pertanyaan. Formulir belum menerima masukan resmi.", href: "/publik/aspirasi", category: "Layanan", icon: IconMessageCircle },
  { title: "Layanan pengaduan", description: "Pahami alur penanganan dan coba skenario fiktif. Pengaduan nyata belum dapat dikirim.", href: "/publik/pengaduan", category: "Layanan", icon: IconShieldCheck }
] as const;
