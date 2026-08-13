import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const TMP_FILE = path.join(process.cwd(), ".next", "verified_alumni.json");
const VERCEL_TMP_FILE = "/tmp/verified_alumni.json";

function getFilePath() {
  try {
    if (fs.existsSync("/tmp")) return VERCEL_TMP_FILE;
  } catch (e) {}
  return TMP_FILE;
}

const DEFAULT_VERIFIED = [
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

function readStoredVerified(): any[] {
  try {
    const filePath = getFilePath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      if (content && content.trim()) {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch (e) {}
  return DEFAULT_VERIFIED;
}

function saveStoredVerified(data: any[]) {
  try {
    const filePath = getFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data.slice(0, 500)), "utf-8");
  } catch (e) {}
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  const verifiedList = readStoredVerified();
  return NextResponse.json({ success: true, data: verifiedList }, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const current = readStoredVerified();
    
    // Deduplikasi
    const filtered = current.filter(
      (item) => item.nomor_hp !== body.nomor_hp && item.nomor_id_unik !== body.nomor_id_unik
    );

    const newItem = {
      id: body.id || `ver-${Date.now()}`,
      nama_lengkap: (body.nama_lengkap || body.nama || "").trim(),
      nomor_id_unik: (body.nomor_id_unik || body.nia || "").trim(),
      nomor_hp: (body.nomor_hp || body.phone || "").trim(),
      angkatan: parseInt(body.angkatan) || 2024,
      alamat_domisili: (body.alamat_domisili || body.domisili || "").trim(),
      status_verifikasi: "verified",
      created_at: new Date().toISOString(),
    };

    const updated = [newItem, ...filtered];
    saveStoredVerified(updated);

    return NextResponse.json({ success: true, data: newItem }, { headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400, headers: corsHeaders });
  }
}
