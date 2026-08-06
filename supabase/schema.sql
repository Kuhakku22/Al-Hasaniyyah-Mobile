-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: alumni
CREATE TABLE public.alumni (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nomor_id_unik VARCHAR(50) UNIQUE NOT NULL,
    nama_lengkap VARCHAR(200) NOT NULL,
    email VARCHAR(255) UNIQUE,
    nomor_hp VARCHAR(20),
    angkatan INT,
    alamat_domisili TEXT,
    provinsi VARCHAR(100),
    kota VARCHAR(100),
    pekerjaan VARCHAR(200),
    bidang_usaha VARCHAR(200),
    foto_profil VARCHAR(500),
    status_verifikasi VARCHAR(20) DEFAULT 'pending' CHECK (status_verifikasi IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: iuran_wajib
CREATE TABLE public.iuran_wajib (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    alumni_id UUID REFERENCES public.alumni(id) ON DELETE CASCADE,
    periode VARCHAR(20) NOT NULL,
    nominal DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'belum_bayar' CHECK (status IN ('belum_bayar', 'lunas', 'menunggak')),
    jatuh_tempo DATE,
    metode_bayar VARCHAR(50),
    paid_at TIMESTAMP WITH TIME ZONE,
    payment_ref VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: transaksi_infak
CREATE TABLE public.transaksi_infak (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    alumni_id UUID REFERENCES public.alumni(id) ON DELETE SET NULL,
    kategori VARCHAR(50) CHECK (kategori IN ('infak_umum', 'beasiswa', 'pembangunan', 'bansos')),
    nominal DECIMAL(12,2) NOT NULL,
    metode_bayar VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
    payment_ref VARCHAR(255),
    anonim BOOLEAN DEFAULT false,
    pesan TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: produk_marketplace
CREATE TABLE public.produk_marketplace (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    alumni_id UUID REFERENCES public.alumni(id) ON DELETE CASCADE,
    nama_produk VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    kategori VARCHAR(100),
    harga DECIMAL(12,2) DEFAULT 0,
    stok INT,
    gambar JSONB,
    status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif', 'terjual')),
    kontak_whatsapp VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: log_aktivitas
CREATE TABLE public.log_aktivitas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    alumni_id UUID REFERENCES public.alumni(id) ON DELETE SET NULL,
    aksi VARCHAR(100) NOT NULL,
    detail JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    immutable BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: laporan_keuangan
CREATE TABLE public.laporan_keuangan (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tipe VARCHAR(20) CHECK (tipe IN ('pemasukan', 'pengeluaran')),
    kategori VARCHAR(100),
    nominal DECIMAL(12,2) NOT NULL,
    deskripsi TEXT,
    bukti_url VARCHAR(500),
    approved_by UUID REFERENCES public.alumni(id) ON DELETE SET NULL,
    periode VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: event
CREATE TABLE public.event (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    tanggal TIMESTAMP WITH TIME ZONE NOT NULL,
    lokasi TEXT,
    qr_code VARCHAR(500),
    max_peserta INT,
    created_by UUID REFERENCES public.alumni(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: event_peserta
CREATE TABLE public.event_peserta (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES public.event(id) ON DELETE CASCADE,
    alumni_id UUID REFERENCES public.alumni(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'terdaftar' CHECK (status IN ('terdaftar', 'hadir', 'batal')),
    check_in_at TIMESTAMP WITH TIME ZONE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for all tables
ALTER TABLE public.alumni ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iuran_wajib ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaksi_infak ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produk_marketplace ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_aktivitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laporan_keuangan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_peserta ENABLE ROW LEVEL SECURITY;

-- Table: polling_questions
CREATE TABLE public.polling_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    pertanyaan TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: polling_options
CREATE TABLE public.polling_options (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question_id UUID REFERENCES public.polling_questions(id) ON DELETE CASCADE,
    pilihan_teks VARCHAR(255) NOT NULL
);

-- Table: polling_votes
CREATE TABLE public.polling_votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question_id UUID REFERENCES public.polling_questions(id) ON DELETE CASCADE,
    option_id UUID REFERENCES public.polling_options(id) ON DELETE CASCADE,
    alumni_id UUID REFERENCES public.alumni(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(question_id, alumni_id)
);

ALTER TABLE public.polling_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polling_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polling_votes ENABLE ROW LEVEL SECURITY;

-- Table: konsultasi_saran
CREATE TABLE public.konsultasi_saran (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    alumni_id UUID REFERENCES public.alumni(id) ON DELETE CASCADE,
    isi_masukan TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'Menunggu Tanggapan' CHECK (status IN ('Menunggu Tanggapan', 'Ditanggapi')),
    tanggapan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.konsultasi_saran ENABLE ROW LEVEL SECURITY;

-- Note: Proper RLS policies need to be added based on Supabase Auth integration.
