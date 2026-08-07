/**
 * Library Utility untuk Pembuatan Nomor Induk Anggota (NIA) Baku Al Hasaniyyah
 * Format Baku: X.YY.ZZZZ.AAAAA
 * 
 * - X     : Kode Status (1 = Ahlu Beit, 2 = Masyaikh, 3 = Alumni, 4 = Musaidin, 5 = Banat)
 * - YY    : Kode Provinsi BPS (2 Digit)
 * - ZZZZ  : 2 Digit Tahun Masuk + 2 Digit Tahun Keluar (Contoh: 2015 - 2018 -> 1518)
 * - AAAAA : Nomor Urut Pendaftaran (5 Digit Pad, e.g. 00008, 12050)
 */

export interface ProvinceInfo {
  code: string;
  name: string;
  keywords: string[];
}

// Data Resmi Kode Provinsi BPS (Badan Pusat Statistik) Indonesia & Kata Kunci Kota/Kabupaten
export const BPS_PROVINCES: ProvinceInfo[] = [
  { code: "11", name: "Aceh", keywords: ["aceh", "banda aceh", "lhokseumawe", "langsa", "sabang", "meulaboh"] },
  { code: "12", name: "Sumatera Utara", keywords: ["sumut", "sumatera utara", "medan", "deli serdang", "pematangsiantar", "binjai", "tebing tinggi", "asahan", "kabanjahe"] },
  { code: "13", name: "Sumatera Barat", keywords: ["sumbar", "sumatera barat", "padang", "bukittinggi", "payakumbuh", "pariaman", "solok", "padang panjang"] },
  { code: "14", name: "Riau", keywords: ["riau", "pekanbaru", "dumai", "kampar", "bengkalis", "rokan", "siak", "indragiri"] },
  { code: "15", name: "Jambi", keywords: ["jambi", "sungai penuh", "muaro jambi", "merangin", "sarolangun", "kerinci"] },
  { code: "16", name: "Sumatera Selatan", keywords: ["sumsel", "sumatera selatan", "palembang", "lubuklinggau", "prabumulih", "pagar alam", "ogan ilir", "lahat"] },
  { code: "17", name: "Bengkulu", keywords: ["bengkulu", "rejang lebong", "curup", "bengkulu utara"] },
  { code: "18", name: "Lampung", keywords: ["lampung", "bandar lampung", "metro", "lampung selatan", "pringsewu", "tanggamus"] },
  { code: "19", name: "Bangka Belitung", keywords: ["babel", "bangka belitung", "pangkalpinang", "bangka", "belitung", "tanjung pandan"] },
  { code: "21", name: "Kepulauan Riau", keywords: ["kepri", "kepulauan riau", "batam", "tanjungpinang", "bintan", "karimun", "natuna"] },
  { code: "31", name: "DKI Jakarta", keywords: ["dki", "jakarta", "jakarta selatan", "jakarta timur", "jakarta barat", "jakarta pusat", "jakarta utara", "kepulauan seribu"] },
  { code: "32", name: "Jawa Barat", keywords: ["jabar", "jawa barat", "bandung", "bogor", "depok", "bekasi", "cirebon", "tasikmalaya", "sukabumi", "cimahi", "sumedang", "garut", "cianjur", "purwakarta", "karawang", "subang", "indramayu", "majalengka", "kuningan", "banjar"] },
  { code: "33", name: "Jawa Tengah", keywords: ["jateng", "jawa tengah", "semarang", "surakarta", "solo", "magelang", "pekalongan", "salatiga", "tegal", "kudus", "boyolali", "klaten", "wonogiri", "sragen", "karanganyar", "sukoharjo", "banyumas", "purwokerto", "cilacap", "brebes", "kendal", "demak", "grobogan", "pati", "jepara", "rembang", "blora", "temanggung", "wonosobo", "purworejo", "kebumen"] },
  { code: "34", name: "DI Yogyakarta", keywords: ["diy", "yogyakarta", "jogja", "jogjakarta", "sleman", "bantul", "kulon progo", "gunungkidul"] },
  { code: "35", name: "Jawa Timur", keywords: ["jatim", "jawa timur", "surabaya", "pasuruan", "malang", "kediri", "blitar", "madiun", "probolinggo", "mojokerto", "batu", "sidoarjo", "gresik", "bangka", "lamongan", "tuban", "jombang", "nganjuk", "magetan", "ngawi", "ponorogo", "pacitan", "trenggalek", "tulungagung", "lumajang", "jember", "banyuwangi", "bondowoso", "situbondo", "bangkalan", "sampang", "pamekasan", "sumenep"] },
  { code: "36", name: "Banten", keywords: ["banten", "tangerang", "tangerang selatan", "tangsel", "serang", "cilegon", "pandeglang", "lebak"] },
  { code: "51", name: "Bali", keywords: ["bali", "denpasar", "badung", "gianyar", "buleleng", "tabanan", "klungkung", "karangasem", "bangli", "jembrana"] },
  { code: "52", name: "Nusa Tenggara Barat", keywords: ["ntb", "nusa tenggara barat", "mataram", "bima", "lombok", "sumbawa", "dompu"] },
  { code: "53", name: "Nusa Tenggara Timur", keywords: ["ntt", "nusa tenggara timur", "kupang", "ende", "flores", "sumba", "alor", "manggarai", "belu", "sikha"] },
  { code: "61", name: "Kalimantan Barat", keywords: ["kalbar", "kalimantan barat", "pontianak", "singkawang", "mewah", "sambas", "ketapang", "kubu raya", "sanggau"] },
  { code: "62", name: "Kalimantan Tengah", keywords: ["kalteng", "kalimantan tengah", "palangkaraya", "kotawaringin", "kapuas", "barito"] },
  { code: "63", name: "Kalimantan Selatan", keywords: ["kalsel", "kalimantan selatan", "banjarmasin", "banjarbaru", "martapura", "tabalong", "tanah laut", "kotabaru"] },
  { code: "64", name: "Kalimantan Timur", keywords: ["kaltim", "kalimantan timur", "samarinda", "balikpapan", "bontang", "kuta", "kutai kartanegara", "berau", "pasre"] },
  { code: "65", name: "Kalimantan Utara", keywords: ["kaltara", "kalimantan utara", "tarakan", "bulungan", "nunukan", "malinau"] },
  { code: "71", name: "Sulawesi Utara", keywords: ["sulut", "sulawesi utara", "manado", "bitung", "tomohon", "kotamobagu", "minahasa", "bolaang mongondow"] },
  { code: "72", name: "Sulawesi Tengah", keywords: ["sulteng", "sulawesi tengah", "palu", "poso", "luwuk", "toli-toli", "donggala", "parigi moutong"] },
  { code: "73", name: "Sulawesi Selatan", keywords: ["sulsel", "sulawesi selatan", "makassar", "parepare", "palopo", "bone", "gowa", "bulukumba", "maros", "pangkep", "sinjai", "tana toraja", "wajo"] },
  { code: "74", name: "Sulawesi Tenggara", keywords: ["sultra", "sulawesi tenggara", "kendari", "bau-bau", "muna", "kolaka", "konawe"] },
  { code: "75", name: "Gorontalo", keywords: ["gorontalo", "boalemo", "bone bolango", "pohuwato"] },
  { code: "76", name: "Sulawesi Barat", keywords: ["sulbar", "sulawesi barat", "mamuju", "majene", "polewali mandar", "polman", "mamasa"] },
  { code: "81", name: "Maluku", keywords: ["maluku", "ambon", "tual", "maluku tengah", "seram", "buru"] },
  { code: "82", name: "Maluku Utara", keywords: ["malut", "maluku utara", "ternate", "tidore", "halmahera"] },
  { code: "91", name: "Papua", keywords: ["papua", "jayapura", "biak", "merauke", "mimika", "timika"] },
  { code: "92", name: "Papua Barat", keywords: ["papua barat", "manokwari", "sorong", "fakfak", "kaimana"] }
];

export const STATUS_CODES: Record<string, string> = {
  "Ahlu Beit": "1",
  "Masyaikh": "2",
  "Alumni": "3",
  "Musaidin": "4",
  "Banat": "5"
};

/**
 * Deteksi Kode Provinsi BPS otomatis dari Teks Alamat/Domisili
 */
export function detectProvinceCode(locationText: string): { code: string; name: string } {
  if (!locationText || !locationText.trim()) {
    return { code: "35", name: "Jawa Timur (Default)" };
  }

  const cleanText = locationText.toLowerCase();

  for (const prov of BPS_PROVINCES) {
    if (prov.name.toLowerCase() === cleanText) {
      return { code: prov.code, name: prov.name };
    }
    for (const kw of prov.keywords) {
      if (cleanText.includes(kw)) {
        return { code: prov.code, name: prov.name };
      }
    }
  }

  return { code: "35", name: "Jawa Timur (Default)" };
}

/**
 * Mendapatkan Kode Status 1 digit
 */
export function getStatusCode(statusText: string): string {
  if (!statusText) return "3";
  const matched = Object.keys(STATUS_CODES).find(
    (k) => k.toLowerCase() === statusText.trim().toLowerCase()
  );
  return matched ? STATUS_CODES[matched] : "3";
}

/**
 * Format 2 Digit Tahun (misal: 2018 -> "18", 98 -> "98", 2002 -> "02")
 */
export function formatTwoDigitYear(yearInput: string | number): string {
  if (!yearInput) return "00";
  const str = String(yearInput).trim();
  const digits = str.replace(/\D/g, "");
  if (digits.length >= 4) {
    return digits.substring(digits.length - 2);
  }
  if (digits.length === 2) {
    return digits;
  }
  return digits.padStart(2, "0").substring(0, 2);
}

/**
 * Menghasilkan Nomor Induk Anggota (NIA) Baku Resmi: X.YY.ZZZZ.AAAAA
 */
export function generateStandardNIA(params: {
  statusText?: string;
  statusCode?: string;
  domisiliText?: string;
  provinceCode?: string;
  tahunMasuk: string | number;
  tahunKeluar: string | number;
  sequenceNumber: number;
}): { nia: string; statusCode: string; provinceCode: string; provinceName: string } {
  // 1. Status Code X (1 digit)
  const x = params.statusCode || getStatusCode(params.statusText || "Alumni");

  // 2. Province Code YY (2 digit)
  let yy = params.provinceCode || "";
  let provName = "";
  if (!yy) {
    const detected = detectProvinceCode(params.domisiliText || "");
    yy = detected.code;
    provName = detected.name;
  } else {
    const found = BPS_PROVINCES.find((p) => p.code === yy);
    provName = found ? found.name : `Provinsi ${yy}`;
  }

  // 3. Year ZZZZ (4 digit)
  const masuk2Digit = formatTwoDigitYear(params.tahunMasuk);
  const keluar2Digit = formatTwoDigitYear(params.tahunKeluar);
  const zzzz = `${masuk2Digit}${keluar2Digit}`;

  // 4. Sequence Number AAAAA (5 digit pad)
  const aaaaa = String(params.sequenceNumber).padStart(5, "0");

  const nia = `${x}.${yy}.${zzzz}.${aaaaa}`;
  return { nia, statusCode: x, provinceCode: yy, provinceName: provName };
}

export interface ParsedAlumniItem {
  idTemp: string;
  nama_lengkap: string;
  status_anggota: string;
  alamat_domisili: string;
  kode_provinsi: string;
  nama_provinsi: string;
  tahun_masuk: number;
  tahun_keluar: number;
  nomor_hp: string;
  generated_nia: string;
  status_validasi: "valid" | "warning";
  catatan?: string;
}

/**
 * Smart AI Parser: Membaca teks mentah dari dokumen Word/CSV/Pasted text
 * Mengubah baris-baris teks alumni menjadi array terstruktur + Auto NIA
 */
export function parseAlumniTextBulk(rawText: string, startSequence: number = 1): ParsedAlumniItem[] {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const results: ParsedAlumniItem[] = [];
  let seq = startSequence;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Lewati baris header jika ada
    if (line.toLowerCase().startsWith("nama") && line.toLowerCase().includes("alamat")) {
      continue;
    }

    // Deteksi pemisah (koma, tab, titik koma, atau strip |)
    let parts: string[] = [];
    if (line.includes("\t")) {
      parts = line.split("\t");
    } else if (line.includes(";")) {
      parts = line.split(";");
    } else if (line.includes("|")) {
      parts = line.split("|");
    } else if (line.includes(",")) {
      parts = line.split(",");
    } else {
      // Jika teks format baris biasa tanpa pemisah khusus
      parts = [line];
    }

    parts = parts.map((p) => p.trim()).filter((p) => p.length > 0);

    let nama = "";
    let statusAnggota = "Alumni";
    let domisili = "Jawa Timur";
    let tahunMasuk = 2018;
    let tahunKeluar = 2021;
    let noHp = "";

    if (parts.length >= 5) {
      // Format Lengkap CSV / Tabel: [Nama, Status, Domisili, ThnMasuk, ThnKeluar, NoHp]
      nama = parts[0];
      statusAnggota = parts[1] || "Alumni";
      domisili = parts[2] || "Jawa Timur";
      tahunMasuk = parseInt(parts[3], 10) || 2018;
      tahunKeluar = parseInt(parts[4], 10) || 2021;
      noHp = parts[5] || "";
    } else if (parts.length >= 3) {
      // Format 3 Kolom: [Nama, Domisili, Tahun (misal: 2015-2018)]
      nama = parts[0];
      domisili = parts[1] || "Jawa Timur";

      // Ekstrak Tahun dari bagian ke-3
      const years = parts[2].match(/\d{4}/g);
      if (years && years.length >= 2) {
        tahunMasuk = parseInt(years[0], 10);
        tahunKeluar = parseInt(years[1], 10);
      } else if (years && years.length === 1) {
        tahunMasuk = parseInt(years[0], 10);
        tahunKeluar = tahunMasuk + 3;
      }
    } else {
      // Baris Tunggal Teks Bebas: e.g. "1. Ahmad Baidlowi - Pasuruan Jatim (Masuk 2015 Keluar 2018) 08123456789"
      const cleanLine = line.replace(/^\d+[\.\)-]\s*/, ""); // Hapus nomor urut di awal jika ada

      // Ekstrak No HP (10-14 digit)
      const hpMatch = cleanLine.match(/08\d{8,12}/);
      if (hpMatch) {
        noHp = hpMatch[0];
      }

      // Ekstrak Tahun Masuk & Keluar (4 digit angka)
      const yearsMatch = cleanLine.match(/\b(19\d{2}|20\d{2})\b/g);
      if (yearsMatch && yearsMatch.length >= 2) {
        tahunMasuk = parseInt(yearsMatch[0], 10);
        tahunKeluar = parseInt(yearsMatch[1], 10);
      } else if (yearsMatch && yearsMatch.length === 1) {
        tahunMasuk = parseInt(yearsMatch[0], 10);
        tahunKeluar = tahunMasuk + 3;
      }

      // Ekstrak Status Anggota
      const statusFound = ["Ahlu Beit", "Masyaikh", "Alumni", "Musaidin", "Banat"].find(
        (s) => cleanLine.toLowerCase().includes(s.toLowerCase())
      );
      if (statusFound) {
        statusAnggota = statusFound;
      }

      // Ambil Nama dari kata-kata awal
      const cleanWithoutNumbers = cleanLine
        .replace(/08\d{8,12}/, "")
        .replace(/\b(19\d{2}|20\d{2})\b/g, "")
        .replace(/(masuk|keluar|alumni|banat|masyaikh|ahlu beit|musaidin)/gi, "")
        .trim();

      const namePart = cleanWithoutNumbers.split(/[-–,\(]/)[0].trim();
      nama = namePart || `Alumni Pendaftar #${seq}`;
      domisili = cleanWithoutNumbers || "Jawa Timur";
    }

    // Deteksi Provinsi BPS
    const provInfo = detectProvinceCode(domisili);

    // Generate NIA Baku X.YY.ZZZZ.AAAAA
    const niaResult = generateStandardNIA({
      statusText: statusAnggota,
      provinceCode: provInfo.code,
      tahunMasuk,
      tahunKeluar,
      sequenceNumber: seq,
    });

    results.push({
      idTemp: `temp-${Date.now()}-${i}`,
      nama_lengkap: nama,
      status_anggota: statusAnggota,
      alamat_domisili: domisili,
      kode_provinsi: provInfo.code,
      nama_provinsi: provInfo.name,
      tahun_masuk: tahunMasuk,
      tahun_keluar: tahunKeluar,
      nomor_hp: noHp || "08123456789",
      generated_nia: niaResult.nia,
      status_validasi: nama.length > 2 ? "valid" : "warning",
      catatan: nama.length <= 2 ? "Nama terlalu pendek" : undefined,
    });

    seq++;
  }

  return results;
}
