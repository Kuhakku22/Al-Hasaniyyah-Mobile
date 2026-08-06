-- Seed Data for Al Hasaniyyah Database

-- Clean existing data (optional, but good for clean seed)
TRUNCATE public.polling_votes CASCADE;
TRUNCATE public.polling_options CASCADE;
TRUNCATE public.polling_questions CASCADE;
TRUNCATE public.event_peserta CASCADE;
TRUNCATE public.event CASCADE;
TRUNCATE public.laporan_keuangan CASCADE;
TRUNCATE public.produk_marketplace CASCADE;
TRUNCATE public.transaksi_infak CASCADE;
TRUNCATE public.iuran_wajib CASCADE;
TRUNCATE public.konsultasi_saran CASCADE;
TRUNCATE public.alumni CASCADE;

-- Insert Alumni
-- 1. Ahmad Ali (Mode Uji Coba / Verified)
INSERT INTO public.alumni (id, nomor_id_unik, nama_lengkap, email, nomor_hp, angkatan, alamat_domisili, provinsi, kota, pekerjaan, bidang_usaha, status_verifikasi)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    '123456',
    'Ahmad Ali',
    'ahmad.ali@example.com',
    '081234567890',
    2020,
    'Pondok Pesantren Dalwa',
    'Jawa Timur',
    'Pasuruan',
    'Wiraswasta',
    'Perdagangan',
    'verified'
);

-- 2. Alumni Lain (Verified)
INSERT INTO public.alumni (id, nomor_id_unik, nama_lengkap, email, nomor_hp, angkatan, alamat_domisili, provinsi, kota, pekerjaan, bidang_usaha, status_verifikasi)
VALUES 
(
    '11111111-1111-1111-1111-111111111111',
    '1023001',
    'Ahmad Baidlowi',
    'baidlowi@example.com',
    '081299991111',
    2018,
    'Kec. Bangil',
    'Jawa Timur',
    'Pasuruan',
    'Guru / Pendidik',
    'Pendidikan',
    'verified'
),
(
    '22222222-2222-2222-2222-222222222222',
    '1023002',
    'M. Zarkasyi',
    'zarkasyi@example.com',
    '081299992222',
    2015,
    'Kec. Pontianak Selatan',
    'Kalimantan Barat',
    'Pontianak',
    'Pengusaha Kuliner',
    'F&B',
    'verified'
),
(
    '33333333-3333-3333-3333-333333333333',
    '1023003',
    'Fathur Rahman',
    'fathur@example.com',
    '081299993333',
    2020,
    'Kec. Bekasi Barat',
    'Jawa Barat',
    'Bekasi',
    'IT Engineer',
    'Teknologi',
    'verified'
),
(
    '44444444-4444-4444-4444-444444444444',
    '1023004',
    'Ali Zainal Abidin',
    'aliza@example.com',
    '081299994444',
    2017,
    'Desa Raci',
    'Jawa Timur',
    'Pasuruan',
    'Dosen',
    'Pendidikan',
    'verified'
);

-- 3. Alumni Pending (Menunggu Verifikasi)
INSERT INTO public.alumni (id, nomor_id_unik, nama_lengkap, email, nomor_hp, angkatan, alamat_domisili, provinsi, kota, pekerjaan, bidang_usaha, status_verifikasi)
VALUES (
    '55555555-5555-5555-5555-555555555555',
    '111111',
    'Zainal Arifin',
    'zainal.arifin@example.com',
    '081233334444',
    2022,
    'Kec. Sukun',
    'Jawa Timur',
    'Malang',
    'Wiraswasta',
    'Logistik',
    'pending'
);

-- 4. Alumni Rejected (Ditolak)
INSERT INTO public.alumni (id, nomor_id_unik, nama_lengkap, email, nomor_hp, angkatan, alamat_domisili, provinsi, kota, pekerjaan, bidang_usaha, status_verifikasi)
VALUES (
    '99999999-9999-9999-9999-999999999999',
    '999999',
    'Syihabuddin',
    'syihab@example.com',
    '081255556666',
    2024,
    'Kec. Grogol',
    'DKI Jakarta',
    'Jakarta Barat',
    'Karyawan Swasta',
    'Keuangan',
    'rejected'
);


-- Insert Iuran Wajib (untuk Ahmad Ali / 00000000-0000-0000-0000-000000000000)
INSERT INTO public.iuran_wajib (id, alumni_id, periode, nominal, status, jatuh_tempo, metode_bayar, paid_at, payment_ref)
VALUES 
(
    'a1b2c3d4-0001-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000000',
    'Agustus 2026',
    25000.00,
    'belum_bayar',
    '2026-08-10',
    NULL,
    NULL,
    NULL
),
(
    'a1b2c3d4-0002-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000000',
    'Juli 2026',
    25000.00,
    'lunas',
    '2026-07-10',
    'transfer_bank',
    '2026-07-08 14:30:00+07',
    'PAY-JULI2026A'
),
(
    'a1b2c3d4-0003-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000000',
    'Juni 2026',
    25000.00,
    'lunas',
    '2026-06-10',
    'qris',
    '2026-06-05 09:15:00+07',
    'PAY-JUNI2026B'
);


-- Insert Transaksi Infak (dari Ahmad Ali)
INSERT INTO public.transaksi_infak (id, alumni_id, kategori, nominal, metode_bayar, status, payment_ref, anonim, pesan, paid_at)
VALUES 
(
    'f1e2d3c4-0001-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000000',
    'beasiswa',
    100000.00,
    'qris',
    'success',
    'PAY-INFAKB1',
    false,
    'Semoga bermanfaat untuk adik-adik santri Dalwa.',
    '2026-07-05 10:00:00+07'
),
(
    'f1e2d3c4-0002-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000000',
    'infak_umum',
    50000.00,
    'transfer_bank',
    'success',
    'PAY-INFAKB2',
    true,
    'Infak umum hamba Allah.',
    '2026-07-02 08:30:00+07'
);


-- Insert Event / Kegiatan
INSERT INTO public.event (id, judul, deskripsi, tanggal, lokasi, max_peserta, created_by)
VALUES 
(
    'e1e1e1e1-1111-1111-1111-111111111111',
    'Silaturahmi Nasional Alumni Dalwa 2026',
    'Pertemuan akbar seluruh alumni lintas angkatan Pondok Pesantren Darullughah Wadda\'wah untuk mempererat ukhuwah dan sinergi dakwah.',
    '2026-10-15 08:00:00+07',
    'Gedung Serbaguna Dalwa 2, Raci, Pasuruan',
    1000,
    '00000000-0000-0000-0000-000000000000'
),
(
    'e2e2e2e2-2222-2222-2222-222222222222',
    'Kajian Kitab Kuning Korda Jabodetabek',
    'Kajian rutin bulanan membahas kitab Al-Hikam oleh para asatidzah alumni Dalwa di Jabodetabek.',
    '2026-08-06 19:30:00+07',
    'Masjid Raya Al-A\'zhom, Tangerang',
    150,
    '00000000-0000-0000-0000-000000000000'
);


-- Insert Polling / Musyawarah
INSERT INTO public.polling_questions (id, pertanyaan, is_active)
VALUES (
    'p1p1p1p1-1111-1111-1111-111111111111',
    'Di manakah lokasi yang paling tepat untuk menyelenggarakan Mubes Alumni Dalwa tahun depan?',
    true
);

INSERT INTO public.polling_options (id, question_id, pilihan_teks)
VALUES 
(
    '11111111-aaaa-1111-1111-111111111111',
    'p1p1p1p1-1111-1111-1111-111111111111',
    'Pondok Pesantren Dalwa Pusat (Bangil)'
),
(
    '22222222-bbbb-2222-2222-222222222222',
    'p1p1p1p1-1111-1111-1111-111111111111',
    'Kantor Korda Surabaya'
),
(
    '33333333-cccc-3333-3333-333333333333',
    'p1p1p1p1-1111-1111-1111-111111111111',
    'Kantor Korda Jabodetabek (Jakarta)'
);


-- Insert Konsultasi & Saran
INSERT INTO public.konsultasi_saran (id, alumni_id, isi_masukan, status, tanggapan, created_at)
VALUES
(
    'c1c1c1c1-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'Mohon agar aplikasi ini kedepannya bisa menambahkan fitur notifikasi adzan sesuai wilayah.',
    'Menunggu Tanggapan',
    NULL,
    NOW() - INTERVAL '4 days'
),
(
    'c2c2c2c2-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'Bagaimana prosedur pergantian ketua Korda di wilayah Sumatera?',
    'Ditanggapi',
    'Prosedur pergantian Korda telah diatur dalam AD/ART Bab IV. Silakan cek menu AD/ART di beranda.',
    NOW() - INTERVAL '10 days'
);

