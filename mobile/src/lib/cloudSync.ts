// Global Cloud Storage URLs for Al Hasaniyyah Alumni
const PENDING_BLOB_URL = "https://jsonblob.com/api/jsonBlob/019fe00e-dbca-77df-bb59-3e0344f53d24";
const VERIFIED_BLOB_URL = "https://jsonblob.com/api/jsonBlob/019fe039-291d-7afb-aea6-63faf6976ea7";

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

// 1. Ambil seluruh data pendaftaran pending dari Cloud
export async function getCloudPendingRegistrations(): Promise<PendingRegistration[]> {
  try {
    const res = await fetch(PENDING_BLOB_URL, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch (err) {
    console.warn("Error fetching cloud pending registrations:", err);
  }
  return [];
}

// 2. Tambahkan pendaftaran pending baru ke Cloud
export async function addCloudPendingRegistration(newReg: PendingRegistration): Promise<boolean> {
  try {
    const currentList = await getCloudPendingRegistrations();
    // Deduplikasi berdasarkan nomor_hp
    const filtered = currentList.filter((item) => item.nomor_hp !== newReg.nomor_hp);
    const updated = [newReg, ...filtered].slice(0, 100);

    const putRes = await fetch(PENDING_BLOB_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(updated),
    });

    return putRes.ok;
  } catch (err) {
    console.warn("Error adding cloud pending registration:", err);
    return false;
  }
}

// 3. Hapus pendaftaran pending setelah disetujui
export async function removeCloudPendingRegistration(phone: string): Promise<boolean> {
  try {
    const currentList = await getCloudPendingRegistrations();
    const updated = currentList.filter((item) => item.nomor_hp !== phone && item.id !== phone);

    const putRes = await fetch(PENDING_BLOB_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(updated),
    });

    return putRes.ok;
  } catch (err) {
    console.warn("Error removing cloud pending registration:", err);
    return false;
  }
}

// 4. Ambil seluruh alumni terverifikasi dari Cloud
export async function getCloudVerifiedAlumni(): Promise<PendingRegistration[]> {
  try {
    const res = await fetch(VERIFIED_BLOB_URL, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch (err) {
    console.warn("Error fetching cloud verified alumni:", err);
  }
  return [];
}

// 5. Tambahkan alumni terverifikasi baru ke Cloud
export async function addCloudVerifiedAlumni(verifiedItem: PendingRegistration): Promise<boolean> {
  try {
    const currentList = await getCloudVerifiedAlumni();
    const filtered = currentList.filter((item) => item.nomor_hp !== verifiedItem.nomor_hp && item.nomor_id_unik !== verifiedItem.nomor_id_unik);
    const updated = [verifiedItem, ...filtered].slice(0, 500);

    const putRes = await fetch(VERIFIED_BLOB_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(updated),
    });

    return putRes.ok;
  } catch (err) {
    console.warn("Error adding cloud verified alumni:", err);
    return false;
  }
}
