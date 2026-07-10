export interface Alumni {
  id: string;
  name: string;
  avatar: string;
  batch: string;
  korda: string;
  job: string;
  contact: string;
  business?: string;
}

export interface News {
  id: string;
  title: string;
  image: string;
  date: string;
  author: string;
  category: 'Pusat' | 'Korda' | 'Prestasi' | 'Pengumuman';
  content: string;
}

export interface Activity {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  organizer: string;
  registered: boolean;
}

export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  ownerId: string;
  ownerName: string;
  location: string;
  description: string;
}

export interface Job {
  id: string;
  position: string;
  company: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
}

export interface LibraryItem {
  id: string;
  title: string;
  author: string;
  year: string;
  category: 'Buku' | 'Artikel' | 'Makalah' | 'Penelitian' | 'Puisi';
  description: string;
}

export interface Kajian {
  id: string;
  theme: string;
  speaker: string;
  time: string;
  location: string;
  description: string;
}

export interface Korda {
  id: string;
  name: string;
  leader: string;
  memberCount: number;
  documentUrl: string;
}

export const mockAlumni: Alumni[] = [
  { id: '1', name: 'Ahmad Fadillah', avatar: 'https://i.pravatar.cc/150?u=1', batch: '2015', korda: 'Jakarta', job: 'Software Engineer', contact: '081234567890' },
  { id: '2', name: 'Budi Santoso', avatar: 'https://i.pravatar.cc/150?u=2', batch: '2010', korda: 'Surabaya', job: 'Pengusaha', contact: '081234567891', business: 'Toko Budi Jaya' },
  { id: '3', name: 'Citra Kirana', avatar: 'https://i.pravatar.cc/150?u=3', batch: '2018', korda: 'Bandung', job: 'Guru', contact: '081234567892' },
  { id: '4', name: 'Deni Setiawan', avatar: 'https://i.pravatar.cc/150?u=4', batch: '2012', korda: 'Malang', job: 'PNS', contact: '081234567893' },
  { id: '5', name: 'Eka Putra', avatar: 'https://i.pravatar.cc/150?u=5', batch: '2020', korda: 'Yogyakarta', job: 'Mahasiswa S2', contact: '081234567894' },
  { id: '6', name: 'Fahri Hamzah', avatar: 'https://i.pravatar.cc/150?u=6', batch: '2008', korda: 'Makassar', job: 'Dosen', contact: '081234567895' },
  { id: '7', name: 'Gita Savitri', avatar: 'https://i.pravatar.cc/150?u=7', batch: '2017', korda: 'Jakarta', job: 'Content Creator', contact: '081234567896' },
  { id: '8', name: 'Hadi Mulyadi', avatar: 'https://i.pravatar.cc/150?u=8', batch: '2005', korda: 'Banjarmasin', job: 'Ustadz', contact: '081234567897' },
  { id: '9', name: 'Indah Permata', avatar: 'https://i.pravatar.cc/150?u=9', batch: '2019', korda: 'Medan', job: 'Desainer Grafis', contact: '081234567898' },
  { id: '10', name: 'Joko Anwar', avatar: 'https://i.pravatar.cc/150?u=10', batch: '2014', korda: 'Semarang', job: 'Arsitek', contact: '081234567899' },
  { id: '11', name: 'Kiki Amalia', avatar: 'https://i.pravatar.cc/150?u=11', batch: '2021', korda: 'Bali', job: 'Perawat', contact: '081234567800' },
  { id: '12', name: 'Lukman Hakim', avatar: 'https://i.pravatar.cc/150?u=12', batch: '2011', korda: 'Palembang', job: 'Wiraswasta', contact: '081234567801', business: 'Kopi Lukman' },
];

export const mockNews: News[] = [
  { id: '1', title: 'Silaturahmi Akbar Alumni 2026', image: 'https://picsum.photos/seed/news1/400/200', date: '10 Juli 2026', author: 'Admin Pusat', category: 'Pusat', content: 'Silaturahmi akbar tahun ini akan diadakan dengan meriah...' },
  { id: '2', title: 'Pemilihan Ketua Korda Jakarta Baru', image: 'https://picsum.photos/seed/news2/400/200', date: '05 Juli 2026', author: 'Korda Jakarta', category: 'Korda', content: 'Telah terpilih ketua korda baru untuk wilayah Jakarta...' },
  { id: '3', title: 'Alumni Raih Beasiswa S3 di Mesir', image: 'https://picsum.photos/seed/news3/400/200', date: '01 Juli 2026', author: 'Humas', category: 'Prestasi', content: 'Selamat kepada ananda Eka Putra yang meraih beasiswa penuh...' },
  { id: '4', title: 'Pendaftaran Iuran Tahunan Dibuka', image: 'https://picsum.photos/seed/news4/400/200', date: '28 Juni 2026', author: 'Bendahara', category: 'Pengumuman', content: 'Diberitahukan kepada seluruh alumni bahwa pembayaran iuran...' },
  { id: '5', title: 'Kunjungan Korda Surabaya ke Ponpes', image: 'https://picsum.photos/seed/news5/400/200', date: '20 Juni 2026', author: 'Korda Surabaya', category: 'Korda', content: 'Rombongan dari Surabaya melakukan kunjungan silaturahmi...' },
  { id: '6', title: 'Lomba Menulis Artikel Islami', image: 'https://picsum.photos/seed/news6/400/200', date: '15 Juni 2026', author: 'Panitia Lomba', category: 'Pengumuman', content: 'Dalam rangka menyambut tahun baru Hijriyah, kami mengadakan...' },
  { id: '7', title: 'Peluncuran Aplikasi Al Hasaniyyah Connect', image: 'https://picsum.photos/seed/news7/400/200', date: '10 Juni 2026', author: 'IT Dev Team', category: 'Pusat', content: 'Alhamdulillah, aplikasi yang ditunggu-tunggu telah rilis...' },
  { id: '8', title: 'Kisah Sukses Pengusaha Alumni', image: 'https://picsum.photos/seed/news8/400/200', date: '01 Juni 2026', author: 'Redaksi', category: 'Prestasi', content: 'Budi Santoso berbagi kisah jatuh bangun membangun usahanya...' },
];

export const mockActivities: Activity[] = [
  { id: '1', title: 'Kajian Rutin Bulanan', date: '15 Agustus 2026', location: 'Masjid Istiqlal / Zoom', description: 'Kajian kitab kuning bersama Ustadz Hadi.', organizer: 'Pusat', registered: true },
  { id: '2', title: 'Baksos Ramadhan Korda Jabar', date: '20 Ramadhan 1447 H', location: 'Panti Asuhan Al-Kautsar, Bandung', description: 'Berbagi sembako dan santunan anak yatim.', organizer: 'Korda Bandung', registered: false },
  { id: '3', title: 'Mubes Alumni Ke-5', date: '10-12 November 2026', location: 'Hotel Santika, Surabaya', description: 'Musyawarah besar membahas AD/ART dan pemilihan ketua umum baru.', organizer: 'Pusat', registered: false },
  { id: '4', title: 'Webinar Entrepreneurship Islami', date: '05 September 2026', location: 'Zoom Meeting', description: 'Cara memulai bisnis yang halal dan berkah.', organizer: 'Pusat', registered: true },
  { id: '5', title: 'Reuni Akbar Angkatan 2010', date: '12 Desember 2026', location: 'Gedung Serbaguna Ponpes', description: 'Kumpul kangen dan silaturahmi alumni 2010.', organizer: 'Angkatan 2010', registered: false },
  { id: '6', title: 'Pelatihan Jurnalistik Alumni', date: '25 September 2026', location: 'Aula Korda Jakarta', description: 'Belajar menulis berita dan artikel yang baik.', organizer: 'Korda Jakarta', registered: false },
  { id: '7', title: 'Turnamen Futsal Antar Korda', date: '17 Agustus 2026', location: 'Lapangan Futsal Senayan', description: 'Memeriahkan HUT RI dengan olahraga bersama.', organizer: 'Pusat', registered: true },
  { id: '8', title: 'Pengajian Akbar dan Doa Bersama', date: '31 Desember 2026', location: 'Halaman Utama Ponpes', description: 'Muhasabah akhir tahun.', organizer: 'Pusat', registered: false },
];

export const mockProducts: Product[] = [
  { id: '1', name: 'Madu Hutan Asli Sialang', image: 'https://picsum.photos/seed/prod1/200/200', price: 150000, ownerId: '2', ownerName: 'Budi Santoso', location: 'Surabaya', description: 'Madu murni tanpa campuran.' },
  { id: '2', name: 'Baju Koko Modern', image: 'https://picsum.photos/seed/prod2/200/200', price: 200000, ownerId: '12', ownerName: 'Lukman Hakim', location: 'Palembang', description: 'Bahan katun premium, nyaman dipakai.' },
  { id: '3', name: 'Buku "Meniti Jalan Salaf"', image: 'https://picsum.photos/seed/prod3/200/200', price: 75000, ownerId: '8', ownerName: 'Hadi Mulyadi', location: 'Banjarmasin', description: 'Karya asli alumni.' },
  { id: '4', name: 'Jasa Desain Grafis Islami', image: 'https://picsum.photos/seed/prod4/200/200', price: 500000, ownerId: '9', ownerName: 'Indah Permata', location: 'Medan', description: 'Menerima pembuatan logo, poster, banner.' },
  { id: '5', name: 'Kurma Ajwa Premium 500g', image: 'https://picsum.photos/seed/prod5/200/200', price: 120000, ownerId: '1', ownerName: 'Ahmad Fadillah', location: 'Jakarta', description: 'Kurma ajwa fresh dari Madinah.' },
  { id: '6', name: 'Minyak Wangi Kasturi', image: 'https://picsum.photos/seed/prod6/200/200', price: 50000, ownerId: '3', ownerName: 'Citra Kirana', location: 'Bandung', description: 'Non-alkohol, tahan lama.' },
  { id: '7', name: 'Sarung BHS Kualitas 1', image: 'https://picsum.photos/seed/prod7/200/200', price: 750000, ownerId: '4', ownerName: 'Deni Setiawan', location: 'Malang', description: 'Baru, masih ada box.' },
  { id: '8', name: 'Jasa Pembuatan Website', image: 'https://picsum.photos/seed/prod8/200/200', price: 1500000, ownerId: '1', ownerName: 'Ahmad Fadillah', location: 'Jakarta', description: 'Website company profile atau toko online.' },
];

export const mockJobs: Job[] = [
  { id: '1', position: 'Guru Agama / Ustadz', company: 'SD Islam Terpadu Al-Hikmah', location: 'Jakarta Selatan', type: 'Full-time', description: 'Dibutuhkan guru PAI untuk tingkat SD.', requirements: ['Lulusan Ponpes', 'S1 PAI (nilai plus)', 'Hafal juz 30'] },
  { id: '2', position: 'Admin Media Sosial', company: 'Toko Baju Budi Jaya', location: 'Surabaya', type: 'Part-time', description: 'Mengelola IG dan TikTok toko.', requirements: ['Kreatif', 'Bisa CapCut/Canva', 'Alumni diutamakan'] },
  { id: '3', position: 'Desainer Grafis', company: 'Percetakan Berkah', location: 'Bandung', type: 'Full-time', description: 'Membuat layout buku dan poster.', requirements: ['Menguasai Corel/Adobe', 'Pengalaman 1 tahun'] },
  { id: '4', position: 'Staff Keuangan', company: 'Koperasi Pondok', location: 'Pusat', type: 'Full-time', description: 'Membantu pembukuan keuangan.', requirements: ['Jujur dan teliti', 'Bisa Excel'] },
  { id: '5', position: 'Programmer React Native', company: 'PT. Teknologi Islami', location: 'Remote', type: 'Contract', description: 'Mengembangkan aplikasi komunitas.', requirements: ['Bisa Expo', 'TypeScript', 'Tailwind'] },
  { id: '6', position: 'Penjaga Toko', company: 'Kopi Lukman', location: 'Palembang', type: 'Shift', description: 'Melayani pelanggan kopi.', requirements: ['Ramah', 'Rajin sholat'] },
];

export const mockLibrary: LibraryItem[] = [
  { id: '1', title: 'Adab Penuntut Ilmu', author: 'KH. Abdullah', year: '2015', category: 'Buku', description: 'Buku panduan santri dalam menuntut ilmu.' },
  { id: '2', title: 'Sejarah Perkembangan Pesantren di Jawa', author: 'Ahmad Fadillah', year: '2020', category: 'Penelitian', description: 'Tesis S2 mengenai sejarah pesantren.' },
  { id: '3', title: 'Syailendra: Antologi Puisi Islami', author: 'Citra Kirana', year: '2018', category: 'Puisi', description: 'Kumpulan puisi cinta kepada Ilahi.' },
  { id: '4', title: 'Peran Alumni dalam Ekonomi Syariah', author: 'Budi Santoso', year: '2022', category: 'Artikel', description: 'Dimuat di majalah ekonomi.' },
  { id: '5', title: 'Makalah Fiqih Kontemporer', author: 'Hadi Mulyadi', year: '2023', category: 'Makalah', description: 'Membahas hukum-hukum muamalah modern.' },
  { id: '6', title: 'Terjemah Kitab Safinatun Najah', author: 'Tim Penerjemah Korda Jatim', year: '2019', category: 'Buku', description: 'Dilengkapi dengan penjelasan tambahan.' },
];

export const mockKajian: Kajian[] = [
  { id: '1', theme: 'Tafsir Jalalain Surat Al-Baqarah', speaker: 'KH. Musthofa', time: 'Jumat, 20:00 WIB', location: 'Masjid Jami / Zoom', description: 'Kajian rutin mingguan kitab tafsir.' },
  { id: '2', theme: 'Fiqih Jual Beli (Muamalah)', speaker: 'Ustadz Hadi Mulyadi', time: 'Sabtu, 16:00 WIB', location: 'Live YouTube', description: 'Penting bagi pengusaha alumni.' },
  { id: '3', theme: 'Membangun Keluarga Sakinah', speaker: 'Ustadzah Halimah', time: 'Ahad, 09:00 WIB', location: 'Gedung Korda Jakarta', description: 'Kajian khusus muslimah.' },
  { id: '4', theme: 'Kajian Hadits Arbain Nawawi', speaker: 'Ust. Fahri Hamzah', time: 'Senin, 18:30 WIB', location: 'Masjid Al-Falah, Makassar', description: 'Membahas hadits-hadits pokok agama.' },
  { id: '5', theme: 'Sejarah Perjuangan Ulama Nusantara', speaker: 'Ust. Abdul Somad (Tamu)', time: 'Rabu, 20:00 WIB', location: 'Zoom Webinar', description: 'Kajian spesial mengundang pemateri luar.' },
  { id: '6', theme: 'Tahsin Al-Quran Bersanad', speaker: 'Ust. Zaid', time: 'Kamis, 05:30 WIB (Ba\'da Subuh)', location: 'Google Meet', description: 'Memperbaiki bacaan Al-Quran.' },
];

export const mockKorda: Korda[] = [
  { id: '1', name: 'DKI Jakarta', leader: 'Ahmad Fadillah', memberCount: 1500, documentUrl: '#' },
  { id: '2', name: 'Jawa Barat (Bandung)', leader: 'Citra Kirana', memberCount: 1200, documentUrl: '#' },
  { id: '3', name: 'Jawa Tengah (Semarang)', leader: 'Joko Anwar', memberCount: 800, documentUrl: '#' },
  { id: '4', name: 'Jawa Timur (Surabaya)', leader: 'Budi Santoso', memberCount: 2500, documentUrl: '#' },
  { id: '5', name: 'Banten', leader: 'Tubagus', memberCount: 900, documentUrl: '#' },
  { id: '6', name: 'Sumatera Utara (Medan)', leader: 'Indah Permata', memberCount: 500, documentUrl: '#' },
  { id: '7', name: 'Sumatera Selatan (Palembang)', leader: 'Lukman Hakim', memberCount: 450, documentUrl: '#' },
  { id: '8', name: 'Kalimantan Selatan (Banjarmasin)', leader: 'Hadi Mulyadi', memberCount: 700, documentUrl: '#' },
  { id: '9', name: 'Sulawesi Selatan (Makassar)', leader: 'Fahri Hamzah', memberCount: 650, documentUrl: '#' },
  { id: '10', name: 'Bali & NTB', leader: 'Kiki Amalia', memberCount: 300, documentUrl: '#' },
];
