# 🗺️ Peta Struktur Folder & File Proyek Al Hasaniyyah

Dokumen ini adalah panduan lengkap untuk memahami letak file, modul, dan alur kerja aplikasi **Al Hasaniyyah Mobile** & **Portal Admin Pusat**. Jika terjadi kendala/eror, gunakan dokumen ini sebagai rujukan utama.

---

## 📁 1. APLIKASI MOBILE ALUMNI (`/mobile`)
> **Fungsi**: Aplikasi HP (Android & iOS) berbasis **Expo / React Native** untuk Alumni Al Hasaniyyah.

### 📍 File-File Utama Mobile:
* 🔑 **`mobile/src/app/index.tsx`**: 
  * **Halaman Login Alumni**. Memeriksa Nama Alumni & Nomor Induk Anggota (NIA). Terkoneksi secara real-time ke *Cloud Sync Engine*.
* 📝 **`mobile/src/app/register.tsx`**: 
  * **Halaman Pendaftaran Alumni Baru**. Mengirimkan data pendaftar ke *Cloud Pending Storage* secara otomatis.
* 🏠 **`mobile/src/app/(tabs)/home.tsx`**: 
  * **Beranda Utama Alumni**. Menampilkan berita, pengumuman, dan fitur navigasi cepat.
* 💳 **`mobile/src/app/(tabs)/card.tsx`**: 
  * **Kartu Tanda Anggota Alumni Digital (KTA)**. Menampilkan profil resmi, foto, status terverifikasi, dan QR Code NIA Baku.
* 💰 **`mobile/src/app/(tabs)/iuran.tsx`**: 
  * **Menu Payment Iuran Wajib & Infak**. Fitur pembayaran dan riwayat donasi alumni.
* ⚙️ **`mobile/src/lib/cloudSync.ts`**: 
  * **Engine Cloud Sync Mobile**. Menghubungkan aplikasi HP ke penyimpanan cloud 24/7.
* ⚡ **`mobile/src/lib/nia.ts`**: 
  * **AI Generator NIA Baku**. Generator otomatis Nomor Induk Anggota format `X.YY.ZZZZ.AAAAA`.

---

## 📁 2. PORTAL ADMIN PUSAT WEB (`/admin` & `/src`)
> **Fungsi**: Dashboard Web berbasis **Next.js** untuk Pengurus Pusat Al Hasaniyyah (Verifikasi & Olah Data).

### 📍 File-File Utama Admin:
* 🖥️ **`admin/src/app/page.tsx`** & **`src/app/page.tsx`**:
  * **Dashboard Super Admin Utama**. Mengelola 6 fitur utama:
    1. **Verifikasi Pendaftaran**: Menyetujui pendaftaran baru & membuatkan NIA otomatis.
    2. **Alumni Terverifikasi**: Daftar alumni resmi terdaftar yang bisa login di HP.
    3. **✨ Import Bulk & Gen NIA AI**: Fitur copas data Word massal untuk di-generate NIA otomatis.
    4. **Iuran Wajib**: Laporan dan pemantauan pembayaran iuran alumni.
    5. **Infak Alumni**: Laporan transaksi infak sosial dan beasiswa.
    6. **Konsultasi & Masukan**: Membalas kritik/saran dari alumni.
* ☁️ **`admin/src/lib/cloudSync.ts`** & **`src/lib/cloudSync.ts`**:
  * **Engine Synchronizer Cloud Storage**. Memastikan pendaftaran dari HP langsung masuk ke Dashboard Admin tanpa delay.
* 💬 **`admin/src/lib/whatsapp.ts`**:
  * **Modul Notifikasi WhatsApp Otomatis**. Membuka pesan WA konfirmasi NIA saat Admin menekan tombol "Setujui & WA".

---

## 📁 3. DATABASE & SCHEMAS (`/supabase`)
> **Fungsi**: Skema Database SQL **PostgreSQL / Supabase** untuk penyimpanan jangka panjang.

### 📍 File Utama Database:
* 🗄️ **`supabase/schema.sql`**:
  * Skema tabel SQL untuk `alumni`, `iuran_wajib`, `infak`, dan `konsultasi_saran`.

---

## 🛠️ CARA MENJALANKAN SISTEM (CHEATSHEET)

### 1. Jalankan Aplikasi Mobile (HP Web / Emulator):
```bash
cd mobile
npm run web
# ATAU untuk HP Fisik / Expo Go:
npx expo start
```

### 2. Jalankan Portal Admin Web:
```bash
# Di folder utama (root) atau folder admin:
npm run dev
```

---

## 🚑 PANDUAN PENANGANAN EROR (TROUBLESHOOTING)

1. **Alumni tidak bisa login di HP?**
   * Cek apakah nama dan NIA yang dimasukkan sudah cocok dengan data di Tab **Alumni Terverifikasi** pada Portal Admin.
2. **Pendaftaran di HP belum masuk ke Admin?**
   * Pastikan koneksi internet aktif. Sistem menggunakan *Cloud Storage Sync Engine 24/7* yang akan menyelaraskan data secara otomatis setiap 3 detik.
3. **Pendaftaran baru belum diisi NIA?**
   * Di Portal Admin tab **Verifikasi Pendaftaran**, klik tombol **`⚡ Auto NIA (AI)`** untuk membuatkan NIA baku resmi otomatis, lalu klik **`Setujui & WA`**.
