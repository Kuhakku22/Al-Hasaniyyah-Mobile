import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import fs from "fs";
import path from "path";
import { getCloudPendingRegistrations, addCloudPendingRegistration } from "@/lib/cloudSync";

const TMP_FILE = path.join(process.cwd(), ".next", "pending_registrations.json");
const VERCEL_TMP_FILE = "/tmp/pending_registrations.json";

function getFilePath() {
  try {
    if (fs.existsSync("/tmp")) return VERCEL_TMP_FILE;
  } catch (e) {}
  return TMP_FILE;
}

function readStoredRegistrations(): any[] {
  try {
    const filePath = getFilePath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      if (content && content.trim()) {
        return JSON.parse(content);
      }
    }
  } catch (e) {}
  return [];
}

function saveStoredRegistrations(data: any[]) {
  try {
    const filePath = getFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data.slice(0, 100)), "utf-8");
  } catch (e) {}
}

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
  let cloudList: any[] = [];
  try {
    cloudList = await getCloudPendingRegistrations();
  } catch (err) {}

  let dbList: any[] = [];
  try {
    const { data } = await supabase
      .from("alumni")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) dbList = data;
  } catch (err) {}

  const fileStored = readStoredRegistrations();
  const mergedList: any[] = [];
  const seenPhones = new Set<string>();

  // 1. Pendaftar baru dari Global Cloud Store
  cloudList.forEach((item) => {
    if (item.nomor_hp && !seenPhones.has(item.nomor_hp)) {
      seenPhones.add(item.nomor_hp);
      mergedList.push(item);
    }
  });

  // 2. Pendaftar baru dari Admin Vercel File Storage
  fileStored.forEach((item) => {
    if (item.nomor_hp && !seenPhones.has(item.nomor_hp)) {
      seenPhones.add(item.nomor_hp);
      mergedList.push(item);
    }
  });

  // 3. Data DB Supabase
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

    // 1. Simpan ke Cloud Storage Global (Realtime 24/7)
    await addCloudPendingRegistration(newRecord).catch(() => {});

    // 2. Simpan ke file storage Vercel serverless
    const current = readStoredRegistrations();
    current.unshift(newRecord);
    saveStoredRegistrations(current);

    // 3. Simpan ke Supabase di background
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
