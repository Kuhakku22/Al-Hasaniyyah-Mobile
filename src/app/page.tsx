"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  generateStandardNIA,
  parseAlumniTextBulk,
  ParsedAlumniItem,
} from "../lib/nia";
import { openWhatsAppMessage } from "../lib/whatsapp";
import {
  getCloudPendingRegistrations,
  getCloudVerifiedAlumni,
  addCloudVerifiedAlumni,
  updateCloudVerifiedAlumni,
  deleteCloudVerifiedAlumni,
  removeCloudPendingRegistration,
  PendingRegistration,
} from "../lib/cloudSync";

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
  { id: "5", nomor_id_unik: "3.35.1426.00007", nama_lengkap: "Ahmad Ali", angkatan: 2025, alamat_domisili: "Pasuruan", status_verifikasi: "verified", nomor_hp: "081394644981" },
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
  const [searchQuery, setSearchQuery] = useState("");

  // Modal Edit Alumni
  const [editModalItem, setEditModalItem] = useState<Alumni | null>(null);

  // Bulk Import State
  const [bulkInput, setBulkInput] = useState("");
  const [parsedItems, setParsedItems] = useState<ParsedAlumniItem[]>([]);
  const [isSavingBulk, setIsSavingBulk] = useState(false);
  const [bulkSaveMsg, setBulkSaveMsg] = useState("");

  // Modal Tambah Iuran
  const [showAddIuranModal, setShowAddIuranModal] = useState(false);
  const [newIuranNama, setNewIuranNama] = useState("");
  const [newIuranPeriode, setNewIuranPeriode] = useState("Agustus 2026");
  const [newIuranNominal, setNewIuranNominal] = useState("25000");

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

  // Fetch Data Super Cepat Non-Blocking
  const fetchData = async () => {
    try {
      const [cloudPendingsRes, cloudVerifiedRes, apiRes, dbRes] = await Promise.allSettled([
        getCloudPendingRegistrations(),
        getCloudVerifiedAlumni(),
        fetch("/api/register").then((r) => r.json()).catch(() => null),
        Promise.race([
          supabase.from("alumni").select("*").order("created_at", { ascending: false }),
          new Promise<{ data: any[] }>((resolve) => setTimeout(() => resolve({ data: [] }), 800)),
        ]),
      ]);

      const cloudPendings: Alumni[] = cloudPendingsRes.status === "fulfilled" ? (cloudPendingsRes.value as any) || [] : [];
      const cloudVerified: Alumni[] = cloudVerifiedRes.status === "fulfilled" ? (cloudVerifiedRes.value as any) || [] : [];
      
      let apiList: Alumni[] = [];
      if (apiRes.status === "fulfilled" && apiRes.value && apiRes.value.data && Array.isArray(apiRes.value.data)) {
        apiList = apiRes.value.data;
      }

      let dbList: Alumni[] = [];
      if (dbRes.status === "fulfilled" && dbRes.value && (dbRes.value as any).data && Array.isArray((dbRes.value as any).data)) {
        dbList = (dbRes.value as any).data;
      }

      let localPendings: Alumni[] = [];
      if (typeof window !== "undefined") {
        try {
          const stored = window.localStorage.getItem("@pending_registrations");
          if (stored) localPendings = JSON.parse(stored);
        } catch (e) {}
      }

      const verifiedPhones = new Set<string>();
      cloudVerified.forEach((v) => {
        if (v.nomor_hp) verifiedPhones.add(v.nomor_hp);
      });

      setAlumni((prevList) => {
        const alumniMap = new Map<string, Alumni>();

        MOCK_ALUMNI.forEach((a) => {
          if (a.nomor_hp) alumniMap.set(a.nomor_hp, a);
        });

        prevList.forEach((item) => {
          if (item.nomor_hp) alumniMap.set(item.nomor_hp, item);
        });

        dbList.forEach((a) => {
          if (a.nomor_hp) alumniMap.set(a.nomor_hp, a);
        });

        localPendings.forEach((p) => {
          if (p.nomor_hp && !verifiedPhones.has(p.nomor_hp)) {
            const existing = alumniMap.get(p.nomor_hp);
            if (!existing || existing.status_verifikasi !== "verified") {
              alumniMap.set(p.nomor_hp, p);
            }
          }
        });

        apiList.forEach((p) => {
          if (p.nomor_hp) {
            const existing = alumniMap.get(p.nomor_hp);
            if (!existing || existing.status_verifikasi !== "verified") {
              alumniMap.set(p.nomor_hp, p);
            }
          }
        });

        cloudPendings.forEach((p) => {
          if (p.nomor_hp && !verifiedPhones.has(p.nomor_hp)) {
            const existing = alumniMap.get(p.nomor_hp);
            if (!existing || existing.status_verifikasi !== "verified") {
              alumniMap.set(p.nomor_hp, p);
            }
          }
        });

        cloudVerified.forEach((v) => {
          if (v.nomor_hp) {
            alumniMap.set(v.nomor_hp, {
              ...v,
              status_verifikasi: "verified",
            });
          }
        });

        return Array.from(alumniMap.values());
      });

      setIuran((prev) => (prev.length > 0 ? prev : MOCK_IURAN));
      setInfak((prev) => (prev.length > 0 ? prev : MOCK_INFAK));
      setKonsultasi((prev) => (prev.length > 0 ? prev : MOCK_KONSULTASI));
    } catch (e) {
      console.warn("Error fetching admin data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;

    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [isLoggedIn]);

  // Generate Auto NIA Baku (X.YY.ZZZZ.AAAAA)
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
  const handleApproveAlumni = async (id: string, nama: string, phone?: string | null) => {
    const rawNia = editingNia[id] || "";
    if (!rawNia.trim()) {
      alert("Silakan masukkan Nomor Induk Anggota (NIA) atau klik '⚡ Auto NIA (AI)' terlebih dahulu.");
      return;
    }

    const targetItem = alumni.find((a) => a.id === id);
    const approvedObject: PendingRegistration = {
      id: id,
      nomor_id_unik: rawNia,
      nama_lengkap: nama,
      angkatan: targetItem?.angkatan || 2024,
      alamat_domisili: targetItem?.alamat_domisili || "Indonesia",
      status_verifikasi: "verified",
      nomor_hp: phone || null,
      created_at: new Date().toISOString(),
    };

    setAlumni((prev) =>
      prev.map((a) =>
        a.id === id || (phone && a.nomor_hp === phone)
          ? { ...a, nomor_id_unik: rawNia, status_verifikasi: "verified" }
          : a
      )
    );

    await addCloudVerifiedAlumni(approvedObject).catch(() => {});

    if (phone) {
      await removeCloudPendingRegistration(phone).catch(() => {});
    }

    try {
      await supabase
        .from("alumni")
        .update({
          nomor_id_unik: rawNia,
          status_verifikasi: "verified",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
    } catch (e) {}

    if (phone) {
      openWhatsAppMessage({ phone, nama, nia: rawNia });
    }

    alert(`Alumni ${nama} BERHASIL DISETUJUI & TERVERIFIKASI! Notifikasi WhatsApp dibuka.`);
    fetchData();
  };

  // Action: Reject Alumni
  const handleRejectAlumni = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menolak pendaftaran alumni ini?")) return;
    try {
      await supabase
        .from("alumni")
        .update({
          status_verifikasi: "rejected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
    } catch (e) {}

    setAlumni(
      alumni.map((a) => (a.id === id ? { ...a, status_verifikasi: "rejected" } : a))
    );
    alert("Pendaftaran ditolak.");
  };

  // Action: Edit & Save Alumni Modal
  const handleSaveEditAlumni = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalItem) return;

    const updated: PendingRegistration = {
      id: editModalItem.id,
      nomor_id_unik: editModalItem.nomor_id_unik,
      nama_lengkap: editModalItem.nama_lengkap,
      angkatan: editModalItem.angkatan,
      alamat_domisili: editModalItem.alamat_domisili,
      status_verifikasi: editModalItem.status_verifikasi,
      nomor_hp: editModalItem.nomor_hp,
      foto_profil: editModalItem.foto_profil || null,
      created_at: new Date().toISOString(),
    };

    setAlumni((prev) =>
      prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a))
    );

    await updateCloudVerifiedAlumni(updated).catch(() => {});

    try {
      await supabase
        .from("alumni")
        .update({
          nama_lengkap: updated.nama_lengkap,
          nomor_id_unik: updated.nomor_id_unik,
          angkatan: updated.angkatan,
          alamat_domisili: updated.alamat_domisili,
          status_verifikasi: updated.status_verifikasi,
          nomor_hp: updated.nomor_hp,
          foto_profil: updated.foto_profil,
          updated_at: new Date().toISOString(),
        })
        .eq("id", updated.id);
    } catch (e) {}

    setEditModalItem(null);
    alert("Data Alumni Berhasil Diperbarui!");
  };

  // Action: Delete Alumni Record
  const handleDeleteAlumni = async (item: Alumni) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus alumni ${item.nama_lengkap}?`)) return;

    setAlumni((prev) => prev.filter((a) => a.id !== item.id && a.nomor_hp !== item.nomor_hp));

    await deleteCloudVerifiedAlumni(item.id).catch(() => {});
    if (item.nomor_hp) {
      await deleteCloudVerifiedAlumni(item.nomor_hp).catch(() => {});
    }

    try {
      await supabase.from("alumni").delete().eq("id", item.id);
    } catch (e) {}

    alert("Data Alumni berhasil dihapus.");
  };

  // Action: Export Alumni to CSV (Excel Ready with UTF-8 BOM)
  const handleExportCSV = () => {
    const verifiedAlumni = alumni.filter((a) => a.status_verifikasi === "verified");
    if (verifiedAlumni.length === 0) {
      alert("Tidak ada data alumni terverifikasi untuk diekspor.");
      return;
    }

    const headers = ["No", "Nama Lengkap", "NIA Resmi", "Angkatan", "Domisili", "Nomor WhatsApp", "Status"];
    const rows = verifiedAlumni.map((a, idx) => [
      idx + 1,
      `"${(a.nama_lengkap || "").replace(/"/g, '""')}"`,
      `"${a.nomor_id_unik || ""}"`,
      a.angkatan || "",
      `"${(a.alamat_domisili || "").replace(/"/g, '""')}"`,
      `"${a.nomor_hp || ""}"`,
      "Terverifikasi",
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Data_Alumni_Al_Hasaniyyah_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Action: Submit reply for Konsultasi
  const handleReplyConsultation = async (id: string) => {
    const text = replyText[id] || "";
    if (!text.trim()) {
      alert("Tanggapan tidak boleh kosong.");
      return;
    }

    try {
      await supabase
        .from("konsultasi_saran")
        .update({
          tanggapan: text,
          status: "Ditanggapi",
        })
        .eq("id", id);
    } catch (e) {}

    setKonsultasi(
      konsultasi.map((c) =>
        c.id === id ? { ...c, status: "Ditanggapi", tanggapan: text } : c
      )
    );
    setReplyText((prev) => ({ ...prev, [id]: "" }));
    alert("Tanggapan berhasil dikirim!");
  };

  // Handler: Process Bulk Input
  const handleProcessBulkInput = () => {
    if (!bulkInput.trim()) {
      alert("Silakan masukkan teks mentah data alumni terlebih dahulu.");
      return;
    }

    const startSeq = (alumni.length || 0) + 1;
    const parsed = parseAlumniTextBulk(bulkInput, startSeq);
    setParsedItems(parsed);
    setBulkSaveMsg("");
  };

  // Handler: Save Parsed Bulk Alumni
  const handleSaveBulkToSupabase = async () => {
    if (parsedItems.length === 0) return;

    setIsSavingBulk(true);
    setBulkSaveMsg("Menyimpan seluruh data alumni ke database & Cloud Store...");

    for (const item of parsedItems) {
      await addCloudVerifiedAlumni({
        id: item.idTemp,
        nama_lengkap: item.nama_lengkap,
        nomor_id_unik: item.generated_nia,
        alamat_domisili: item.alamat_domisili,
        angkatan: item.tahun_keluar,
        nomor_hp: item.nomor_hp,
        status_verifikasi: "verified",
        created_at: new Date().toISOString(),
      }).catch(() => {});
    }

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

      await supabase.from("alumni").insert(payload);
    } catch (err: any) {}

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
    setBulkSaveMsg(`Sukses! ${parsedItems.length} data alumni berhasil ditambahkan.`);
    
    if (parsedItems.length > 0 && parsedItems[0].nomor_hp) {
      openWhatsAppMessage({
        phone: parsedItems[0].nomor_hp,
        nama: parsedItems[0].nama_lengkap,
        nia: parsedItems[0].generated_nia,
        statusText: parsedItems[0].status_anggota,
      });
    }

    alert(`Berhasil menyimpan ${parsedItems.length} alumni! Notifikasi WA alumni pertama dibuka.`);
    setIsSavingBulk(false);
  };

  // Handler: Add New Iuran Record
  const handleSaveAddIuran = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIuranNama.trim()) {
      alert("Nama Alumni harus diisi.");
      return;
    }

    const newItem: Iuran = {
      id: `iuran-${Date.now()}`,
      nama_lengkap: newIuranNama.trim(),
      periode: newIuranPeriode,
      nominal: parseInt(newIuranNominal, 10) || 25000,
      status: "lunas",
      paid_at: new Date().toISOString(),
      payment_ref: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    setIuran([newItem, ...iuran]);
    setShowAddIuranModal(false);
    setNewIuranNama("");
    alert("Catatan Pembayaran Iuran Berhasil Ditambahkan!");
  };

  // Filtered Alumni List
  const filterAlumniByQuery = (items: Alumni[]) => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (a) =>
        (a.nama_lengkap && a.nama_lengkap.toLowerCase().includes(q)) ||
        (a.nomor_id_unik && a.nomor_id_unik.toLowerCase().includes(q)) ||
        (a.alamat_domisili && a.alamat_domisili.toLowerCase().includes(q)) ||
        (a.nomor_hp && a.nomor_hp.toLowerCase().includes(q)) ||
        (a.angkatan && String(a.angkatan).includes(q))
    );
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
              <span className="text-amber-400 font-black text-2xl">AH</span>
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
            Gunakan password <span className="font-mono text-amber-400">admin123</span> atau <span className="font-mono text-amber-400">dalwa123</span>.
          </p>
        </div>
      </div>
    );
  }

  // UI: Stats calculations
  const pendingList = alumni.filter((a) => a.status_verifikasi === "pending");
  const verifiedList = alumni.filter((a) => a.status_verifikasi === "verified");

  const pendingCount = pendingList.length;
  const verifiedCount = verifiedList.length;
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
            Logout
          </button>
        </div>
      </header>

      {/* Main Dashboard Area */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Banner Welcome */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-slate-900 p-6 rounded-3xl border border-emerald-800 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div>
            <h2 className="text-2xl font-black text-white">Ahlan wa Sahlan, Admin Pusat!</h2>
            <p className="text-emerald-300 text-xs mt-1">Sistem Pengelolaan Data Alumni, Verifikasi NIA Otomatis, Laporan Iuran & Donasi Infak Real-time.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="bg-emerald-800 border border-emerald-700 text-emerald-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
            >
              📥 EKSPOR CSV
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              className="bg-amber-500 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-black tracking-wider shadow-lg hover:opacity-90 transition-all flex items-center gap-1.5"
            >
              {loading ? "MEMUAT..." : "MUAT ULANG DATA"}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Pendaftaran Pending</p>
            <h3 className="text-3xl font-black text-amber-500 mt-2">{pendingCount} Alumni</h3>
            <p className="text-[10px] text-slate-500 mt-1">Perlu verifikasi & pembuat NIA</p>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Alumni Terverifikasi</p>
            <h3 className="text-3xl font-black text-emerald-400 mt-2">{verifiedCount} Alumni</h3>
            <p className="text-[10px] text-slate-500 mt-1">Resmi terdaftar di direktori</p>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Iuran Terkumpul</p>
            <h3 className="text-3xl font-black text-white mt-2">Rp {totalIuran.toLocaleString("id-ID")}</h3>
            <p className="text-[10px] text-emerald-400 mt-1">Kas Operasional Alumni</p>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Infak Sosial</p>
            <h3 className="text-3xl font-black text-blue-400 mt-2">Rp {totalInfak.toLocaleString("id-ID")}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Beasiswa & Pembangunan</p>
          </div>
        </div>

        {/* Search Bar & Tab Controls Container */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div className="flex bg-slate-900 p-1.5 rounded-xl border border-slate-800 overflow-x-auto flex-1 max-w-4xl">
            {[
              { id: "verifikasi", label: "Verifikasi Pendaftaran", badge: pendingCount },
              { id: "verified_list", label: "Alumni Terverifikasi", badge: verifiedCount },
              { id: "bulk_import", label: "✨ Import Bulk & Gen NIA AI" },
              { id: "iuran", label: "Iuran Wajib" },
              { id: "infak", label: "Infak Alumni" },
              { id: "konsultasi", label: "Konsultasi & Masukan", badge: konsultasi.filter((c) => c.status === "Menunggu Tanggapan").length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 px-3.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap relative ${
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

          {(activeTab === "verifikasi" || activeTab === "verified_list") && (
            <div className="w-full md:w-64">
              <input
                type="text"
                placeholder="🔍 Cari nama, NIA, domisili..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          )}
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
              {/* TAB 1: VERIFIKASI ALUMNI (PENDING) */}
              {activeTab === "verifikasi" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                    <div>
                      <h4 className="text-base font-black text-white">Verifikasi Pendaftaran Alumni Baru</h4>
                      <p className="text-slate-400 text-[11px] mt-0.5">Gunakan &quot;⚡ Auto NIA (AI)&quot; lalu klik Setujui untuk membuatkan NIA resmi dan membuka WA konfirmasi.</p>
                    </div>
                    <span className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-3 py-1 rounded-full text-[10px] font-bold">
                      {filterAlumniByQuery(pendingList).length} pendaftaran
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
                        {filterAlumniByQuery(pendingList).length > 0 ? (
                          filterAlumniByQuery(pendingList).map((a, idx) => (
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
                                  >
                                    ⚡ Auto NIA (AI)
                                  </button>
                                  <button
                                    onClick={() => handleApproveAlumni(a.id, a.nama_lengkap, a.nomor_hp)}
                                    className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-900/30"
                                  >
                                    Setujui & WA
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
                              {searchQuery ? "Tidak ditemukan pendaftaran yang cocok." : "Tidak ada pendaftaran pending."}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: ALUMNI TERVERIFIKASI */}
              {activeTab === "verified_list" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                    <div>
                      <h4 className="text-base font-black text-white">Daftar Alumni Terverifikasi (Resmi Registered)</h4>
                      <p className="text-slate-400 text-[11px] mt-0.5">Seluruh Alumni aktif yang dapat menggunakan aplikasi mobile.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold">
                        {filterAlumniByQuery(verifiedList).length} Alumni
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-800">
                          <th className="py-3 px-4">Nama Lengkap</th>
                          <th className="py-3 px-4">Nomor Induk Anggota (NIA)</th>
                          <th className="py-3 px-4">Angkatan</th>
                          <th className="py-3 px-4">Domisili</th>
                          <th className="py-3 px-4">Nomor WA</th>
                          <th className="py-3 px-4 text-center">Kelola Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filterAlumniByQuery(verifiedList).length > 0 ? (
                          filterAlumniByQuery(verifiedList).map((a) => (
                            <tr key={a.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                              <td className="py-3 px-4 font-bold text-white">{a.nama_lengkap}</td>
                              <td className="py-3 px-4">
                                <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold px-3 py-1 rounded-lg text-xs tracking-wider">
                                  {a.nomor_id_unik}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-300">{a.angkatan || "-"}</td>
                              <td className="py-3 px-4 text-slate-300">{a.alamat_domisili || "-"}</td>
                              <td className="py-3 px-4 font-mono text-slate-300">{a.nomor_hp || "-"}</td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => setEditModalItem(a)}
                                    className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-900 px-2.5 py-1 rounded text-[10px] font-bold"
                                  >
                                    ✏️ Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAlumni(a)}
                                    className="bg-red-500/10 hover:bg-red-600 hover:text-white text-red-400 border border-red-500/20 px-2.5 py-1 rounded text-[10px] font-bold"
                                  >
                                    🗑️ Hapus
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="text-center py-12 text-slate-500 font-semibold">
                              {searchQuery ? "Tidak ada alumni yang sesuai pencarian." : "Belum ada alumni yang terverifikasi."}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: IMPORT BULK & GEN NIA AI */}
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
                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:opacity-90 transition-all shadow-lg flex items-center gap-2"
                      >
                        ⚡ PROSES AI PARSER & GENERATE NIA
                      </button>
                    </div>
                  </div>

                  {parsedItems.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-slate-800">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-emerald-950/30 p-4 rounded-2xl border border-emerald-800/40">
                        <div>
                          <h5 className="font-bold text-white text-sm">Hasil Penguraian & Generator NIA ({parsedItems.length} Alumni)</h5>
                          <p className="text-emerald-400 text-xs mt-0.5">Periksa tabel di bawah ini sebelum disimpan secara resmi.</p>
                        </div>
                        <button
                          onClick={handleSaveBulkToSupabase}
                          disabled={isSavingBulk}
                          className="bg-amber-500 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl hover:bg-amber-400 transition-all shadow-lg whitespace-nowrap"
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
                              <th className="py-3 px-4">Nomor Induk Anggota (NIA)</th>
                              <th className="py-3 px-3 text-center">Kirim WA</th>
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
                                <td className="py-3 px-3 text-center">
                                  <button
                                    onClick={() =>
                                      openWhatsAppMessage({
                                        phone: item.nomor_hp,
                                        nama: item.nama_lengkap,
                                        nia: item.generated_nia,
                                        statusText: item.status_anggota,
                                      })
                                    }
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 mx-auto"
                                  >
                                    💬 WA
                                  </button>
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

              {/* TAB 4: IURAN WAJIB */}
              {activeTab === "iuran" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                    <div>
                      <h4 className="text-base font-black text-white">Laporan & Catatan Iuran Wajib</h4>
                      <p className="text-slate-400 text-[11px] mt-0.5">Nominal Iuran Wajib Rp 25.000 / Bulan per Alumni.</p>
                    </div>
                    <button
                      onClick={() => setShowAddIuranModal(true)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all"
                    >
                      + Tambah Transaksi Iuran
                    </button>
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
                                <button
                                  onClick={() => {
                                    setIuran((prev) =>
                                      prev.map((item) =>
                                        item.id === i.id
                                          ? {
                                              ...item,
                                              status: item.status === "lunas" ? "belum_bayar" : "lunas",
                                              paid_at: item.status === "lunas" ? null : new Date().toISOString(),
                                            }
                                          : item
                                      )
                                    );
                                  }}
                                  className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-all ${
                                    i.status === "lunas"
                                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                                      : "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                                  }`}
                                >
                                  {i.status === "lunas" ? "✓ LUNAS" : "BELUM LUNAS"}
                                </button>
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

              {/* TAB 5: INFAK ALUMNI */}
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

              {/* TAB 6: KONSULTASI & MASUKAN */}
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
                                className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-500 transition-colors shadow-lg"
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

      {/* Modal Edit Alumni */}
      {editModalItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white">Edit Data Alumni</h3>
              <button
                onClick={() => setEditModalItem(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditAlumni} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={editModalItem.nama_lengkap}
                  onChange={(e) => setEditModalItem({ ...editModalItem, nama_lengkap: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">NIA Resmi</label>
                  <input
                    type="text"
                    value={editModalItem.nomor_id_unik}
                    onChange={(e) => setEditModalItem({ ...editModalItem, nomor_id_unik: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-amber-400 font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Angkatan (Tahun)</label>
                  <input
                    type="number"
                    value={editModalItem.angkatan || 2024}
                    onChange={(e) => setEditModalItem({ ...editModalItem, angkatan: parseInt(e.target.value) || 2024 })}
                    className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Nomor WhatsApp</label>
                  <input
                    type="text"
                    value={editModalItem.nomor_hp || ""}
                    onChange={(e) => setEditModalItem({ ...editModalItem, nomor_hp: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Domisili</label>
                  <input
                    type="text"
                    value={editModalItem.alamat_domisili || ""}
                    onChange={(e) => setEditModalItem({ ...editModalItem, alamat_domisili: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Status Verifikasi</label>
                <select
                  value={editModalItem.status_verifikasi}
                  onChange={(e) => setEditModalItem({ ...editModalItem, status_verifikasi: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="verified">Verified (Terdaftar Aktif)</option>
                  <option value="pending">Pending (Menunggu Verifikasi)</option>
                  <option value="rejected">Rejected (Ditolak)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditModalItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Iuran */}
      {showAddIuranModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white">Tambah Catatan Iuran</h3>
              <button
                onClick={() => setShowAddIuranModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAddIuran} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Nama Alumni</label>
                <input
                  type="text"
                  placeholder="Masukkan nama alumni..."
                  value={newIuranNama}
                  onChange={(e) => setNewIuranNama(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Periode</label>
                  <input
                    type="text"
                    value={newIuranPeriode}
                    onChange={(e) => setNewIuranPeriode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Nominal (Rp)</label>
                  <input
                    type="number"
                    value={newIuranNominal}
                    onChange={(e) => setNewIuranNominal(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddIuranModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-emerald-950/30 border-t border-emerald-900/50 py-4 text-center text-[10px] text-slate-500">
        &copy; 2026 Ikatan Alumni Al Hasaniyyah Dalwa Pusat. All rights reserved.
      </footer>
    </div>
  );
}
