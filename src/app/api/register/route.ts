import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// In-memory fallback store for local development & cross-port testing
const pendingRegistrations: any[] = [];

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("alumni")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Gabungkan data DB dengan pending memory
      const mergedMap = new Map<string, any>();
      pendingRegistrations.forEach((p) => {
        if (p.nomor_hp) mergedMap.set(p.nomor_hp, p);
      });
      data.forEach((a) => {
        if (a.nomor_hp) mergedMap.set(a.nomor_hp, a);
      });
      return NextResponse.json({ success: true, data: Array.from(mergedMap.values()) });
    }
  } catch (err) {}

  return NextResponse.json({ success: true, data: pendingRegistrations });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama, phone, domisili, tahunMasuk, tahunKeluar, tahunLulus, tempatTanggalLahir, alamatKtp } = body;

    const cleanPhone = (phone || "").replace(/[^0-9]/g, "");
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const tempId = `REG-${cleanPhone.slice(-4) || "0000"}-${randomDigits}`;

    const newRecord = {
      id: `reg-${Date.now()}-${randomDigits}`,
      nama_lengkap: (nama || "").trim(),
      nomor_id_unik: tempId,
      alamat_domisili: (domisili || "").trim(),
      angkatan: parseInt(tahunLulus) || 2024,
      nomor_hp: (phone || "").trim(),
      status_verifikasi: "pending",
      tahun_masuk: parseInt(tahunMasuk) || null,
      tahun_keluar: parseInt(tahunKeluar) || null,
      created_at: new Date().toISOString(),
    };

    // 1. Simpan ke Memory lokal
    pendingRegistrations.unshift(newRecord);

    // 2. Simpan ke Supabase di background
    try {
      await supabase.from("alumni").insert([{
        nama_lengkap: newRecord.nama_lengkap,
        nomor_id_unik: newRecord.nomor_id_unik,
        alamat_domisili: newRecord.alamat_domisili,
        angkatan: newRecord.angkatan,
        nomor_hp: newRecord.nomor_hp,
        status_verifikasi: "pending",
      }]);
    } catch (dbErr) {
      console.warn("API Supabase insert fallback:", dbErr);
    }

    return NextResponse.json({ success: true, tempId, data: newRecord });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Gagal memproses pendaftaran" }, { status: 400 });
  }
}
