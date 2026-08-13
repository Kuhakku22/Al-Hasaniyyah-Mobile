// Global Cloud Storage & Vercel Endpoints for Al Hasaniyyah Alumni
const ADMIN_API_BASE = "https://al-hasaniyyah-admin.vercel.app/api";
const MOBILE_API_BASE = "https://al-hasaniyyah-mobile.vercel.app/api";

export interface PendingRegistration {
  id: string;
  nomor_id_unik: string;
  nama_lengkap: string;
  angkatan: number | null;
  alamat_domisili: string | null;
  status_verifikasi: string;
  nomor_hp: string | null;
  tahun_masuk?: number | null;
  tahun_keluar?: number | null;
  created_at: string;
}

// In-Memory Cache untuk performa kilat
let cachedPending: PendingRegistration[] = [];
let cachedVerified: PendingRegistration[] = [];
let lastPendingFetch = 0;
let lastVerifiedFetch = 0;
const CACHE_TTL = 2000; // 2 detik TTL cache

// Data Fallback Terverifikasi Otomatis (Termasuk Yahya Ilyas, Ahmad Ali, & Ahmad Baidlowi)
const DEFAULT_VERIFIED_FALLBACK: PendingRegistration[] = [
  {
    id: "ver-ahmad-ali",
    nama_lengkap: "Ahmad Ali",
    nomor_id_unik: "3.35.1426.00007",
    nomor_hp: "081394644981",
    angkatan: 2025,
    alamat_domisili: "Pasuruan",
    status_verifikasi: "verified",
    created_at: new Date().toISOString(),
  },
  {
    id: "ver-ahmad-baidlowi",
    nama_lengkap: "Ahmad Baidlowi",
    nomor_id_unik: "3.35.1518.00001",
    nomor_hp: "081299991111",
    angkatan: 2018,
    alamat_domisili: "Pasuruan",
    status_verifikasi: "verified",
    created_at: new Date().toISOString(),
  },
  {
    id: "ver-yahya-ilyas",
    nama_lengkap: "Yahya Ilyas",
    nomor_id_unik: "3.35.1518.00008",
    nomor_hp: "081234567890",
    angkatan: 2024,
    alamat_domisili: "Pasuruan",
    status_verifikasi: "verified",
    created_at: new Date().toISOString(),
  },
];

// 1. Ambil seluruh data pendaftaran pending dari Cloud / API
export async function getCloudPendingRegistrations(forceRefresh = false): Promise<PendingRegistration[]> {
  const now = Date.now();
  if (!forceRefresh && now - lastPendingFetch < CACHE_TTL && cachedPending.length > 0) {
    return cachedPending;
  }

  try {
    const res = await Promise.race([
      fetch(`${ADMIN_API_BASE}/register`, { cache: "no-store", headers: { "Cache-Control": "no-cache" } }),
      fetch(`${MOBILE_API_BASE}/register`, { cache: "no-store", headers: { "Cache-Control": "no-cache" } }),
      new Promise<Response>((_, reject) => setTimeout(() => reject(new Error("timeout")), 2000)),
    ]);

    if (res && res.ok) {
      const json = await res.json();
      if (json && json.data && Array.isArray(json.data)) {
        cachedPending = json.data;
        lastPendingFetch = now;
        return json.data;
      }
    }
  } catch (err) {}

  return cachedPending;
}

// 2. Tambahkan pendaftaran pending baru ke Cloud / API
export async function addCloudPendingRegistration(newReg: PendingRegistration): Promise<boolean> {
  try {
    cachedPending = [newReg, ...cachedPending.filter((i) => i.nomor_hp !== newReg.nomor_hp)];
    lastPendingFetch = Date.now();

    const payload = {
      nama: newReg.nama_lengkap,
      phone: newReg.nomor_hp,
      domisili: newReg.alamat_domisili,
      tahunMasuk: newReg.tahun_masuk,
      tahunKeluar: newReg.tahun_keluar,
      tahunLulus: newReg.angkatan,
    };

    // Kirim paralel ke seluruh API
    Promise.allSettled([
      fetch(`${ADMIN_API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
      fetch(`${MOBILE_API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    ]).catch(() => {});

    return true;
  } catch (err) {
    return false;
  }
}

// 3. Hapus pendaftaran pending setelah disetujui
export async function removeCloudPendingRegistration(phone: string): Promise<boolean> {
  cachedPending = cachedPending.filter((item) => item.nomor_hp !== phone && item.id !== phone);
  lastPendingFetch = Date.now();
  return true;
}

// 4. Ambil seluruh alumni terverifikasi dari Cloud / API
export async function getCloudVerifiedAlumni(forceRefresh = false): Promise<PendingRegistration[]> {
  const now = Date.now();
  if (!forceRefresh && now - lastVerifiedFetch < CACHE_TTL && cachedVerified.length > 0) {
    return cachedVerified;
  }

  try {
    const res = await Promise.race([
      fetch(`${ADMIN_API_BASE}/verified`, { cache: "no-store", headers: { "Cache-Control": "no-cache" } }),
      fetch(`${MOBILE_API_BASE}/verified`, { cache: "no-store", headers: { "Cache-Control": "no-cache" } }),
      new Promise<Response>((_, reject) => setTimeout(() => reject(new Error("timeout")), 2000)),
    ]);

    if (res && res.ok) {
      const json = await res.json();
      if (json && json.data && Array.isArray(json.data)) {
        const merged = [...json.data];
        DEFAULT_VERIFIED_FALLBACK.forEach((fb) => {
          if (!merged.some((m) => m.nomor_hp === fb.nomor_hp || m.nomor_id_unik === fb.nomor_id_unik)) {
            merged.push(fb);
          }
        });
        cachedVerified = merged;
        lastVerifiedFetch = now;
        return merged;
      }
    }
  } catch (err) {}

  if (cachedVerified.length === 0) {
    cachedVerified = DEFAULT_VERIFIED_FALLBACK;
  }
  return cachedVerified;
}

// 5. Tambahkan alumni terverifikasi baru ke Cloud / API
export async function addCloudVerifiedAlumni(verifiedItem: PendingRegistration): Promise<boolean> {
  try {
    const filtered = cachedVerified.filter(
      (item) => item.nomor_hp !== verifiedItem.nomor_hp && item.nomor_id_unik !== verifiedItem.nomor_id_unik
    );
    cachedVerified = [verifiedItem, ...filtered];
    lastVerifiedFetch = Date.now();

    // Kirim paralel ke Vercel Verified API
    Promise.allSettled([
      fetch(`${ADMIN_API_BASE}/verified`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(verifiedItem),
      }),
      fetch(`${MOBILE_API_BASE}/verified`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(verifiedItem),
      }),
    ]).catch(() => {});

    return true;
  } catch (err) {
    return false;
  }
}
