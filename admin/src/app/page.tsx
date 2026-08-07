"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  generateStandardNIA,
  parseAlumniTextBulk,
  detectProvinceCode,
  ParsedAlumniItem,
  STATUS_CODES,
} from "../lib/nia";

// Sample text from Word document for instant testing
const SAMPLE_WORD_TEXT = `1. Ahmad Baidlowi | Alumni | Pasuruan Jawa Timur | 2015 | 2018 | 081299991111
2. Ustadz Zarkasyi | Masyaikh | Medan Sumatera Utara | 2010 | 2014 | 081299992222
3. Syarifah Fatimah | Banat | Bandung Jawa Barat | 2021 | 2024 | 081233334444
4. Ustadz Abdullah | Musaidin | Jakarta Selatan DKI Jakarta | 2005 | 2008 | 081255556666
5. Habib Ali Assegaf | Ahlu Beit | Surabaya Jawa Timur | 2012 | 2015 | 081277778888`;

// Mock Data Fallbacks
const MOCK_ALUMNI = [
  { id: "1", nomor_id_unik: "3.35.1518.00001", nama_lengkap: "Ahmad Baidlowi", angkatan: 2018, alamat_domisili: "Pasuruan", status_verifikasi: "verified", nomor_hp: "081299991111" },
  { id: "2", nomor_id_unik: "2.12.1014.00002", nama_lengkap: "M. Zarkasyi", angkatan: 2014, alamat_domisili: "Pontianak", status_verifikasi: "verified", nomor_hp: "081299992222" },
  { id: "3", nomor_id_unik: "REG-08123333-5555", nama_lengkap: "Zainal Arifin", angkatan: 2022, alamat_domisili: "Malang", status_verifikasi: "pending", nomor_hp: "081233334444" },
  { id: "4", nomor_id_unik: "999999", nama_lengkap: "Syihabuddin", angkatan: 2024, alamat_domisili: "Jakarta", status_verifikasi: "rejected", nomor_hp: "081255556666" },
];

const MOCK_IURAN = [
  { id: "1", nama_lengkap: "Ahmad Ali", periode: "Agustus 2026", nominal: 25000, status: "belum_bayar", paid_at: null },
  { id: "2", nama_lengkap: "Ahmad Ali", periode: "Juli 2026", nominal: 25000, status: "lunas", paid_at: "2026-07-08T14:30:00Z" },
  { id: "3", nama_lengkap: "Ahmad Baidlowi", periode: "Agustus 2026", nominal: 25000, status: "lunas", paid_at: "2026-08-01T10:00:00Z" },
];

const MOCK_INFAK = [
  { id: "1", nama_lengkap: "Ahmad Ali", kategori: "beasiswa", nominal: 100000, anonim: false, pesan: "Semoga berkah", paid_at: "2026-07-05T10:00:00Z" },
  { id: "2", nama_lengkap: "Hamba Allah", kategori: "infak_umum", nominal: 50000, anonim: true, pesan: "Infak umum", paid_at: "2026-07-02T08:30:00Z" },
];

const MOCK_KONSULTASI = [
  { id: "1", nama_lengkap: "Ahmad Ali", isi_masukan: "Mohon agar aplikasi ini kedepannya bisa menambahkan fitur notifikasi adzan sesuai wilayah.", status: "Menunggu Tanggapan", tanggapan: null, created_at: "2026-07-10T12:00:00Z" },
  { id: "2", nama_lengkap: "Ahmad Ali", isi_masukan: "Bagaimana prosedur pergantian ketua Korda di wilayah Sumatera?", status: "Ditanggapi", tanggapan: "Prosedur pergantian Korda telah diatur dalam AD/ART Bab IV. Silakan cek menu AD/ART di beranda.", created_at: "2026-06-05T09:00:00Z" },
];

interface Alumni {
  id: string;
  nomor_id_unik: string;
  nama_lengkap: string;
  angkatan: number | null;
  alamat_domisili: string | null;
  status_verifikasi: string;
  nomor_hp: string | null;
  tahun_masuk?: number | null;
  tahun_keluar?: number | null;
}

interface Iuran {
  id: string;
  nama_lengkap: string;
  periode: string;
  nominal: number;
  status: string;
  paid_at: string | null;
  payment_ref?: string | null;
}

interface Infak {
  id: string;
  nama_lengkap: string;
  kategori: string;
  nominal: number;
  anonim: boolean;
  pesan: string | null;
  paid_at: string | null;
}

interface Konsultasi {
  id: string;
  nama_lengkap: string;
  isi_masukan: string;
  status: string;
  tanggapan: string | null;
  created_at: string;
}

export default function AdminPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [errorLogin, setErrorLogin] = useState("");

  const [activeTab, setActiveTab] = useState("verifikasi");
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [iuran, setIuran] = useState<Iuran[]>([]);
  const [infak, setInfak] = useState<Infak[]>([]);
  const [konsultasi, setKonsultasi] = useState<Konsultasi[]>([]);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [editingNia, setEditingNia] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Bulk Import State
  const [bulkInput, setBulkInput] = useState("");
  const [parsedItems, setParsedItems] = useState<ParsedAlumniItem[]>([]);
  const [isSavingBulk, setIsSavingBulk] = useState(false);
  const [bulkSaveMsg, setBulkSaveMsg] = useState("");

  // Check login state
  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = sessionStorage.getItem("adminAuth");
      if (auth === "true") {
        const timer = setTimeout(() => {
          setIsLoggedIn(true);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123" || password === "dalwa123") {
      setIsLoggedIn(true);
      sessionStorage.setItem("adminAuth", "true");
      setErrorLogin("");
    } else {
      setErrorLogin("Password salah. Silakan coba lagi.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem("adminAuth");
  };

  // Fetch data from Supabase
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Alumni
      const { data: alumniData, error: alumniErr } = await supabase
        .from("alumni")
        .select("*")
        .order("created_at", { ascending: false });

      if (alumniErr) throw alumniErr;
      setAlumni(alumniData || []);

      // 2. Fetch Iuran
      const { data: iuranData, error: iuranErr } = await supabase
        .from("iuran_wajib")
        .select("*, alumni(nama_lengkap)")
        .order("created_at", { ascending: false });

      if (iuranErr) throw iuranErr;
      setIuran(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (iuranData || []).map((i: any) => ({
          ...i,
          nama_lengkap: i.alumni?.nama_lengkap || "Alumni Tidak Dikenal",
        }))
      );

      // 3. Fetch Infak
      const { data: infakData, error: infakErr } = await supabase
        .from("transaksi_infak")
        .select("*, alumni(nama_lengkap)")
        .order("created_at", { ascending: false });

      if (infakErr) throw infakErr;
      setInfak(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (infakData || []).map((i: any) => ({
          ...i,
          nama_lengkap: i.anonim ? "Hamba Allah" : i.alumni?.nama_lengkap || "Alumni Tidak Dikenal",
        }))
      );

      // 4. Fetch Konsultasi
      const { data: consultData, error: consultErr } = await supabase
        .from("konsultasi_saran")
        .select("*, alumni(nama_lengkap)")
        .order("created_at", { ascending: false });

      if (consultErr) throw consultErr;
      setKonsultasi(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (consultData || []).map((c: any) => ({
          ...c,
          nama_lengkap: c.alumni?.nama_lengkap || "Alumni Tidak Dikenal",
        }))
      );
    } catch (e) {
      console.warn("Menggunakan data tiruan (mock data) karena kegagalan koneksi database:", e);
      setAlumni(MOCK_ALUMNI);
      setIuran(MOCK_IURAN);
      setInfak(MOCK_INFAK);
      setKonsultasi(MOCK_KONSULTASI);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      const timer = setTimeout(() => {
        fetchData();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn]);

  // Generate Auto NIA Baku (X.YY.ZZZZ.AAAAA) untuk Alumni Pending
  const handleAutoGenerateNiaSingle = (item: Alumni, index: number) => {
    const seq = (alumni.length || 0) + index + 1;
    const tahunMasuk = item.tahun_masuk || item.angkatan || 2018;
    const tahunKeluar = item.tahun_keluar || (item.angkatan ? item.angkatan + 3 : 2021);
    
    const result = generateStandardNIA({
      statusText: "Alumni",
      domisiliText: item.alamat_domisili || "Jawa Timur",
      tahunMasuk,
      tahunKeluar,
      sequenceNumber: seq,
    });

    setEditingNia((prev) => ({ ...prev, [item.id]: result.nia }));
  };

  // Action: Approve Alumni
  const handleApproveAlumni = async (id: string, phone?: string | null) => {
    const rawNia = editingNia[id] || "";
    if (!rawNia.trim()) {
      alert("Silakan masukkan Nomor Induk Anggota (NIA) atau klik '⚡ Auto NIA (AI)' terlebih dahulu.");
      return;
    }

    try {
      const { error } = await supabase
        .from("alumni")
        .update({
          nomor_id_unik: rawNia,
          status_verifikasi: "verified",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
      alert("Alumni berhasil disetujui!");
      fetchData();
    } catch (e) {
      // Mock update
      setAlumni(
        alumni.map((a) =>
          a.id === id ? { ...a, nomor_id_unik: rawNia, status_verifikasi: "verified" } : a
        )
      );
      alert("Mode Demo: Alumni berhasil disetujui secara lokal.");
    }
  };

  // Action: Reject Alumni
  const handleRejectAlumni = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menolak pendaftaran alumni ini?")) return;
    try {
      const { error } = await supabase
        .from("alumni")
        .update({
          status_verifikasi: "rejected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
      alert("Pendaftaran ditolak.");
      fetchData();
    } catch (e) {
      // Mock update
      setAlumni(
        alumni.map((a) => (a.id === id ? { ...a, status_verifikasi: "rejected" } : a))
      );
      alert("Mode Demo: Pendaftaran ditolak secara lokal.");
    }
  };

  // Action: Submit reply for Konsultasi
  const handleReplyConsultation = async (id: string) => {
    const text = replyText[id] || "";
    if (!text.trim()) {
      alert("Tanggapan tidak boleh kosong.");
      return;
    }

    try {
      const { error } = await supabase
        .from("konsultasi_saran")
        .update({
          tanggapan: text,
          status: "Ditanggapi",
        })
        .eq("id", id);

      if (error) throw error;
      alert("Tanggapan berhasil dikirim!");
      setReplyText((prev) => ({ ...prev, [id]: "" }));
      fetchData();
    } catch (e) {
      // Mock update
      setKonsultasi(
        konsultasi.map((c) =>
          c.id === id ? { ...c, status: "Ditanggapi", tanggapan: text } : c
        )
      );
      setReplyText((prev) => ({ ...prev, [id]: "" }));
      alert("Mode Demo: Tanggapan terkirim secara lokal.");
    }
  };

  // Handler: Process Bulk Input with AI Parser
  const handleProcessBulkInput = () => {
    if (!bulkInput.trim()) {
      alert("Silakan masukkan teks mentah data alumni dari dokumen Word atau file CSV terlebih dahulu.");
      return;
    }

    const startSeq = (alumni.length || 0) + 1;
    const parsed = parseAlumniTextBulk(bulkInput, startSeq);
    setParsedItems(parsed);
    setBulkSaveMsg("");
  };

  // Handler: Save Parsed Bulk Alumni to Supabase
  const handleSaveBulkToSupabase = async () => {
    if (parsedItems.length === 0) return;

    setIsSavingBulk(true);
    setBulkSaveMsg("Menyimpan seluruh data alumni ke database Supabase...");

    try {
      const payload = parsedItems.map((item) => ({
        nama_lengkap: item.nama_lengkap,
        nomor_id_unik: item.generated_nia,
        alamat_domisili: item.alamat_domisili,
        angkatan: item.tahun_keluar,
        nomor_hp: item.nomor_hp,
        status_verifikasi: "verified",
        created_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from("alumni").insert(payload);

      if (error) throw error;

      setBulkSaveMsg(`Sukses! ${parsedItems.length} data alumni berhasil disimpan ke database Supabase.`);
      alert(`Berhasil menyimpan ${parsedItems.length} alumni!`);
      setParsedItems([]);
      setBulkInput("");
      fetchData();
    } catch (err: any) {
      console.warn("Gagal menyimpan ke database Supabase, mengaktifkan mode demo lokal:", err);
      // Demo fallback update
      const newMockItems: Alumni[] = parsedItems.map((item, idx) => ({
        id: `bulk-${Date.now()}-${idx}`,
        nama_lengkap: item.nama_lengkap,
        nomor_id_unik: item.generated_nia,
        alamat_domisili: item.alamat_domisili,
        angkatan: item.tahun_keluar,
        nomor_hp: item.nomor_hp,
        status_verifikasi: "verified",
      }));

      setAlumni((prev) => [...newMockItems, ...prev]);
      setBulkSaveMsg(`Mode Demo: ${parsedItems.length} data alumni ditambahkan secara lokal.`);
      alert(`Mode Demo: ${parsedItems.length} alumni berhasil ditambahkan!`);
      setParsedItems([]);
      setBulkInput("");
    } finally {
      setIsSavingBulk(false);
    }
  };

  // UI: Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 p-6 text-white font-sans">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />

          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-emerald-800 rounded-full border-2 border-amber-500 flex items-center justify-center mb-4 shadow-lg">
              <svg className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black tracking-wider text-center text-white">PORTAL ADMIN</h2>
            <p className="text-emerald-300 text-xs text-center mt-1 font-medium">Ikatan Alumni Al Hasaniyyah Dalwa</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs uppercase font-bold tracking-wider text-emerald-300 mb-2">Kata Sandi Akses</label>
              <input
                type="password"
                placeholder="Masukkan password admin..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/60 border border-white/10 p-4 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors"
                required
              />
            </div>

            {errorLogin && <p className="text-red-400 text-xs font-semibold text-center">{errorLogin}</p>}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 p-4 rounded-xl font-bold tracking-wider hover:opacity-90 active:scale-98 transition-all shadow-lg shadow-amber-500/20"
            >
              MASUK KE DASHBOARD
            </button>
          </form>

          <p className="text-center text-[10px] text-slate-400 mt-8">
            Gunakan password <span className="font-mono text-amber-400">admin123</span> untuk masuk.
          </p>
        </div>
      </div>
    );
  }

  // UI: Stats calculations
  const pendingCount = alumni.filter((a) => a.status_verifikasi === "pending").length;
  const verifiedCount = alumni.filter((a) => a.status_verifikasi === "verified").length;
  const totalIuran = iuran.filter((i) => i.status === "lunas").reduce((sum, item) => sum + item.nominal, 0);
  const totalInfak = infak.reduce((sum, item) => sum + item.nominal, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Top Navigation */}
      <header className="bg-emerald-950/80 backdrop-blur border-b border-emerald-900 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-800 rounded-full border border-amber-500 flex items-center justify-center">
            <span className="text-amber-400 font-bold text-lg">AH</span>
          </div>
          <div>
            <h1 className="font-black text-white text-base tracking-wider">AL HASANIYYAH</h1>
            <p className="text-emerald-400 text-[10px] font-semibold tracking-widest uppercase">Admin Panel Pusat</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs text-white font-bold">Super Admin</span>
            <span className="text-[10px] text-emerald-400">Pusat Dakwa Raci</span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </header>

      {/* Main Dashboard Area */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Banner Welcome */}
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 p-6 rounded-3xl border border-emerald-800 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div>
            <h2 className="text-2xl font-black text-white">Ahlan wa Sahlan, Admin!</h2>
            <p className="text-emerald-300 text-xs mt-1">Kelola data pendaftaran alumni baru, masukan data Word massal dengan Generator NIA Baku AI.</p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="bg-amber-500 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-black tracking-wider shadow-lg hover:opacity-90 transition-all flex items-center gap-1.5"
          >
            {loading ? "MEMUAT..." : "MUAT ULANG DATA"}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stat 1 */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Pendaftaran Pending</p>
            <h3 className="text-3xl font-black text-amber-500 mt-2">{pendingCount} Alumni</h3>
            <p className="text-[10px] text-slate-500 mt-1">Perlu tindakan verifikasi segera</p>
          </div>

          {/* Stat 2 */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Alumni Terverifikasi</p>
            <h3 className="text-3xl font-black text-emerald-400 mt-2">{verifiedCount} Alumni</h3>
            <p className="text-[10px] text-slate-500 mt-1">Terdaftar aktif di direktori</p>
          </div>

          {/* Stat 3 */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Iuran Terkumpul</p>
            <h3 className="text-3xl font-black text-white mt-2">Rp {totalIuran.toLocaleString("id-ID")}</h3>
            <p className="text-[10px] text-emerald-400 mt-1">Status Keuangan: Sehat</p>
          </div>

          {/* Stat 4 */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Infak Sosial</p>
            <h3 className="text-3xl font-black text-blue-400 mt-2">Rp {totalInfak.toLocaleString("id-ID")}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Program Beasiswa & Fasilitas</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-900 p-1.5 rounded-xl border border-slate-800 max-w-3xl overflow-x-auto">
          {[
            { id: "verifikasi", label: "Verifikasi Pendaftaran", badge: pendingCount },
            { id: "bulk_import", label: "✨ Import Bulk & Gen NIA AI" },
            { id: "iuran", label: "Iuran Wajib" },
            { id: "infak", label: "Infak Alumni" },
            { id: "konsultasi", label: "Konsultasi & Masukan", badge: konsultasi.filter((c) => c.status === "Menunggu Tanggapan").length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap relative ${
                activeTab === tab.id
                  ? "bg-emerald-800 text-white shadow-md shadow-emerald-950/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden min-h-[450px]">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-xs font-semibold tracking-wider">MEMUAT DATA DARI DATABASE...</p>
            </div>
          ) : (
            <div className="p-6">
              {/* TAB 1: VERIFIKASI ALUMNI */}
              {activeTab === "verifikasi" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                    <div>
                      <h4 className="text-base font-black text-white">Verifikasi Pendaftaran Alumni Baru</h4>
                      <p className="text-slate-400 text-[11px] mt-0.5">Gunakan tombol &quot;⚡ Auto NIA (AI)&quot; untuk membuat NIA baku otomatis (X.YY.ZZZZ.AAAAA).</p>
                    </div>
                    <span className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-3 py-1 rounded-full text-[10px] font-bold">
                      {alumni.filter((a) => a.status_verifikasi === "pending").length} menunggu verifikasi
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-800">
                          <th className="py-3 px-4">Nama Lengkap</th>
                          <th className="py-3 px-4">Angkatan</th>
                          <th className="py-3 px-4">Domisili</th>
                          <th className="py-3 px-4">Nomor WA</th>
                          <th className="py-3 px-4">ID Registrasi</th>
                          <th className="py-3 px-4 text-center">Tindakan Persetujuan & NIA Baku</th>
                        </tr>
                      </thead>
                      <tbody>
                        {alumni.filter((a) => a.status_verifikasi === "pending").length > 0 ? (
                          alumni
                            .filter((a) => a.status_verifikasi === "pending")
                            .map((a, idx) => (
                              <tr key={a.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                                <td className="py-3 px-4 font-bold text-white">{a.nama_lengkap}</td>
                                <td className="py-3 px-4 text-slate-300">{a.angkatan || "-"}</td>
                                <td className="py-3 px-4 text-slate-300">{a.alamat_domisili || "-"}</td>
                                <td className="py-3 px-4 font-mono text-slate-300">{a.nomor_hp || "-"}</td>
                                <td className="py-3 px-4 text-slate-500 text-[10px] font-mono">{a.nomor_id_unik}</td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center justify-center gap-2">
                                    <input
                                      type="text"
                                      placeholder="Nomor NIA Baku..."
                                      value={editingNia[a.id] || ""}
                                      onChange={(e) =>
                                        setEditingNia((prev) => ({ ...prev, [a.id]: e.target.value }))
                                      }
                                      className="bg-slate-950 border border-slate-800 py-1.5 px-2.5 rounded-lg text-amber-400 font-mono text-[11px] focus:outline-none focus:border-amber-500 w-36"
                                    />
                                    <button
                                      onClick={() => handleAutoGenerateNiaSingle(a, idx)}
                                      className="bg-amber-500/20 border border-amber-500/40 text-amber-400 px-2.5 py-1.5 rounded-lg text-[10px] font-bold hover:bg-amber-500 hover:text-slate-950 transition-all whitespace-nowrap"
                                      title="Generate NIA Baku Otomatis Format X.YY.ZZZZ.AAAAA"
                                    >
                                      ⚡ Auto NIA (AI)
                                    </button>
                                    <button
                                      onClick={() => handleApproveAlumni(a.id, a.nomor_hp)}
                                      className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-emerald-500 transition-colors"
                                    >
                                      Setujui
                                    </button>
                                    <button
                                      onClick={() => handleRejectAlumni(a.id)}
                                      className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-red-600 hover:text-white transition-colors"
                                    >
                                      Tolak
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="text-center py-12 text-slate-500 font-semibold">
                              Tidak ada pengajuan pendaftaran baru yang tertunda.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: IMPORT BULK & GEN NIA AI */}
              {activeTab === "bulk_import" && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-slate-800 gap-3">
                    <div>
                      <h4 className="text-base font-black text-white flex items-center gap-2">
                        <span>✨ Import Bulk Data Alumni & AI Generator NIA Baku</span>
                      </h4>
                      <p className="text-slate-400 text-xs mt-1">
                        Salin teks langsung dari dokumen Word/CSV. Sistem AI akan mengurai bidang data dan menghasilkan NIA baku resmi <span className="font-mono text-amber-400 font-bold">X.YY.ZZZZ.AAAAA</span>.
                      </p>
                    </div>
                    <button
                      onClick={() => setBulkInput(SAMPLE_WORD_TEXT)}
                      className="bg-slate-800 border border-slate-700 hover:border-amber-500 text-amber-400 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all"
                    >
                      📋 Gunakan Contoh Teks Word
                    </button>
                  </div>

                  {/* Format Rule Infobox */}
                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-emerald-900/50 grid grid-cols-1 md:grid-cols-4 gap-3 text-[11px]">
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-amber-400 font-bold block">X = Status Anggota</span>
                      <span className="text-slate-400">1: Ahlu Beit, 2: Masyaikh, 3: Alumni, 4: Musaidin, 5: Banat</span>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-amber-400 font-bold block">YY = Kode Provinsi BPS</span>
                      <span className="text-slate-400">35: Jatim, 32: Jabar, 31: DKI, 12: Sumut, dll.</span>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-amber-400 font-bold block">ZZZZ = Thn Masuk & Keluar</span>
                      <span className="text-slate-400">2 Digit Masuk + 2 Digit Keluar (Contoh: 1518)</span>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-amber-400 font-bold block">AAAAA = No Urut (5 Digit)</span>
                      <span className="text-slate-400">Urutan otomatis 00001 s.d. 99999</span>
                    </div>
                  </div>

                  {/* Input Text Area */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-300">
                      Tempelkan (Paste) Teks Dokumen Word / File CSV Di Sini:
                    </label>
                    <textarea
                      rows={6}
                      placeholder={`Contoh baris teks dokumen Word:\n1. Ahmad Baidlowi | Alumni | Pasuruan Jawa Timur | 2015 | 2018 | 081299991111\n2. Ustadz Zarkasyi | Masyaikh | Medan Sumatera Utara | 2010 | 2014 | 081299992222`}
                      value={bulkInput}
                      onChange={(e) => setBulkInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500 leading-relaxed"
                    />

                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-500">
                        {bulkInput.split("\n").filter((l) => l.trim()).length} baris teks terdeteksi
                      </span>
                      <button
                        onClick={handleProcessBulkInput}
                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-emerald-950/40 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        PROSES AI PARSER & GENERATE NIA
                      </button>
                    </div>
                  </div>

                  {/* Preview Table Results */}
                  {parsedItems.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-slate-800">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-emerald-950/30 p-4 rounded-2xl border border-emerald-800/40">
                        <div>
                          <h5 className="font-bold text-white text-sm">Hasil Penguraian & Generator NIA ({parsedItems.length} Alumni)</h5>
                          <p className="text-emerald-400 text-xs mt-0.5">Periksa tabel di bawah ini sebelum disimpan secara resmi ke database Supabase.</p>
                        </div>
                        <button
                          onClick={handleSaveBulkToSupabase}
                          disabled={isSavingBulk}
                          className="bg-amber-500 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 whitespace-nowrap"
                        >
                          {isSavingBulk ? "MENYIMPAN..." : "SIMPAN SEMUA KE DATABASE"}
                        </button>
                      </div>

                      {bulkSaveMsg && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs rounded-xl font-semibold">
                          {bulkSaveMsg}
                        </div>
                      )}

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="text-slate-400 border-b border-slate-800">
                              <th className="py-3 px-3">No</th>
                              <th className="py-3 px-4">Nama Lengkap</th>
                              <th className="py-3 px-4">Status</th>
                              <th className="py-3 px-4">Domisili / Alamat</th>
                              <th className="py-3 px-3">Provinsi BPS</th>
                              <th className="py-3 px-3">Tahun</th>
                              <th className="py-3 px-4">Nomor WA</th>
                              <th className="py-3 px-4">Nomor Induk Anggota (NIA Hasil Generator)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {parsedItems.map((item, idx) => (
                              <tr key={item.idTemp} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                                <td className="py-3 px-3 font-mono text-slate-500">{idx + 1}</td>
                                <td className="py-3 px-4 font-bold text-white">
                                  <input
                                    type="text"
                                    value={item.nama_lengkap}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setParsedItems((prev) =>
                                        prev.map((p) => (p.idTemp === item.idTemp ? { ...p, nama_lengkap: val } : p))
                                      );
                                    }}
                                    className="bg-transparent border-b border-slate-700 text-white font-bold text-xs focus:outline-none focus:border-emerald-500 w-full"
                                  />
                                </td>
                                <td className="py-3 px-4">
                                  <span className="bg-slate-800 border border-slate-700 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded">
                                    {item.status_anggota}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-slate-300">{item.alamat_domisili}</td>
                                <td className="py-3 px-3">
                                  <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                                    {item.kode_provinsi} - {item.nama_provinsi}
                                  </span>
                                </td>
                                <td className="py-3 px-3 font-mono text-slate-300">{item.tahun_masuk} - {item.tahun_keluar}</td>
                                <td className="py-3 px-4 font-mono text-slate-400">{item.nomor_hp}</td>
                                <td className="py-3 px-4">
                                  <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold px-3 py-1 rounded-lg text-xs tracking-wider">
                                    {item.generated_nia}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: IURAN WAJIB */}
              {activeTab === "iuran" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                    <h4 className="text-base font-black text-white">Laporan & Pengumpulkan Iuran Wajib</h4>
                    <span className="text-emerald-400 font-bold text-xs">Target: Rp 25.000 / Bulan</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-800">
                          <th className="py-3 px-4">Nama Alumni</th>
                          <th className="py-3 px-4">Periode</th>
                          <th className="py-3 px-4">Nominal</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Waktu Bayar</th>
                          <th className="py-3 px-4">Referensi Pembayaran</th>
                        </tr>
                      </thead>
                      <tbody>
                        {iuran.length > 0 ? (
                          iuran.map((i) => (
                            <tr key={i.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                              <td className="py-3 px-4 font-bold text-white">{i.nama_lengkap}</td>
                              <td className="py-3 px-4 text-slate-300">{i.periode}</td>
                              <td className="py-3 px-4 font-mono font-bold text-white">Rp {(Number(i.nominal) || 0).toLocaleString("id-ID")}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  i.status === "lunas"
                                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                    : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                                }`}>
                                  {i.status === "lunas" ? "LUNAS" : "BELUM LUNAS"}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-400">
                                {i.paid_at ? new Date(i.paid_at).toLocaleString("id-ID") : "-"}
                              </td>
                              <td className="py-3 px-4 text-slate-500 font-mono text-[10px]">
                                {i.payment_ref || "-"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="text-center py-12 text-slate-500 font-semibold">
                              Tidak ada riwayat tagihan iuran wajib.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: INFAK ALUMNI */}
              {activeTab === "infak" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                    <h4 className="text-base font-black text-white">Riwayat Transaksi Infak Mandiri</h4>
                    <span className="text-blue-400 font-bold text-xs">Total Terkumpul: Rp {totalInfak.toLocaleString("id-ID")}</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-800">
                          <th className="py-3 px-4">Nama Donatur</th>
                          <th className="py-3 px-4">Kategori Infak</th>
                          <th className="py-3 px-4">Nominal</th>
                          <th className="py-3 px-4">Pesan / Doa</th>
                          <th className="py-3 px-4">Waktu Transaksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {infak.length > 0 ? (
                          infak.map((inf) => (
                            <tr key={inf.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                              <td className="py-3 px-4 font-bold text-white">
                                {inf.nama_lengkap}
                              </td>
                              <td className="py-3 px-4">
                                <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                  {inf.kategori ? inf.kategori.replace("_", " ") : "UMUM"}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-emerald-400">Rp {(Number(inf.nominal) || 0).toLocaleString("id-ID")}</td>
                              <td className="py-3 px-4 text-slate-300 italic font-medium">
                                &quot;{inf.pesan || "Tanpa pesan"}&quot;
                              </td>
                              <td className="py-3 px-4 text-slate-400">
                                {inf.paid_at ? new Date(inf.paid_at).toLocaleString("id-ID") : "-"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="text-center py-12 text-slate-500 font-semibold">
                              Tidak ada riwayat transaksi infak.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: KONSULTASI & MASUKAN */}
              {activeTab === "konsultasi" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                    <h4 className="text-base font-black text-white">Kelola Masukan, Kritik, & Konsultasi Alumni</h4>
                    <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold">
                      {konsultasi.filter((c) => c.status === "Menunggu Tanggapan").length} masukan baru
                    </span>
                  </div>

                  <div className="space-y-6 mt-4">
                    {konsultasi.length > 0 ? (
                      konsultasi.map((item) => (
                        <div key={item.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 relative">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-xs text-white font-bold">{item.nama_lengkap}</span>
                              <p className="text-[10px] text-slate-500 mt-0.5">Dikirim: {new Date(item.created_at).toLocaleDateString("id-ID")}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.status === "Ditanggapi"
                                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                            }`}>
                              {item.status}
                            </span>
                          </div>

                          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 text-xs text-slate-200 leading-5">
                            {item.isi_masukan}
                          </div>

                          {item.tanggapan ? (
                            <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-900/40 text-xs text-slate-300 space-y-1">
                              <div className="flex items-center gap-1 text-emerald-400 font-bold mb-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Tanggapan Admin Pusat:
                              </div>
                              <p className="italic">&quot;{item.tanggapan}&quot;</p>
                            </div>
                          ) : (
                            <div className="space-y-3 pt-2">
                              <textarea
                                placeholder="Tulis jawaban/tanggapan resmi dari pengurus pusat..."
                                value={replyText[item.id] || ""}
                                onChange={(e) =>
                                  setReplyText((prev) => ({ ...prev, [item.id]: e.target.value }))
                                }
                                className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 h-20 resize-none"
                              />
                              <button
                                onClick={() => handleReplyConsultation(item.id)}
                                className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-950/30"
                              >
                                Kirim Tanggapan Resmi
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-12 text-slate-500 font-semibold text-xs">
                        Belum ada data kritik atau saran dari alumni.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-emerald-950/30 border-t border-emerald-900/50 py-4 text-center text-[10px] text-slate-500">
        &copy; 2026 Ikatan Alumni Al Hasaniyyah Dalwa Pusat. All rights reserved.
      </footer>
    </div>
  );
}
