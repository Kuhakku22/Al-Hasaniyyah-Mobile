import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Global memory store
const pendingRegistrations: any[] = [];

// Header CORS Universal
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  let dbList: any[] = [];
  try {
    const { data } = await supabase
      .from("alumni")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) dbList = data;
  } catch (err) {}

  const mergedList: any[] = [];
  const seenPhones = new Set<string>();

  // 1. Pendaftar baru dari memori API di urutan PALING ATAS
  pendingRegistrations.forEach((item) => {
    if (item.nomor_hp && !seenPhones.has(item.nomor_hp)) {
      seenPhones.add(item.nomor_hp);
      mergedList.push(item);
    }
  });

  // 2. Data DB
  dbList.forEach((item) => {
    if (item.nomor_hp && !seenPhones.has(item.nomor_hp)) {
      seenPhones.add(item.nomor_hp);
      mergedList.push(item);
    }
  });

  return NextResponse.json({ success: true, data: mergedList }, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama, phone, domisili, tahunMasuk, tahunKeluar, tahunLulus } = body;

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

    // Unshift ke memori lokal agar menjadi yang PALING ATAS
    pendingRegistrations.unshift(newRecord);

    // Simpan ke Supabase di background
    try {
      await supabase.from("alumni").insert([{
        nama_lengkap: newRecord.nama_lengkap,
        nomor_id_unik: newRecord.nomor_id_unik,
        alamat_domisili: newRecord.alamat_domisili,
        angkatan: newRecord.angkatan,
        nomor_hp: newRecord.nomor_hp,
        status_verifikasi: "pending",
      }]);
    } catch (dbErr) {}

    return NextResponse.json({ success: true, tempId, data: newRecord }, { headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Gagal" }, { status: 400, headers: corsHeaders });
  }
}
