/**
 * Library Utility untuk Pembuatan Nomor Induk Anggota (NIA) Baku Al Hasaniyyah
 * Format Baku: X.YY.ZZZZ.AAAAA
 */

export interface ProvinceInfo {
  code: string;
  name: string;
  keywords: string[];
}

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

export function generateStandardNIA(params: {
  statusText?: string;
  statusCode?: string;
  domisiliText?: string;
  provinceCode?: string;
  tahunMasuk: string | number;
  tahunKeluar: string | number;
  sequenceNumber: number;
}): { nia: string; statusCode: string; provinceCode: string; provinceName: string } {
  const x = params.statusCode || "3"; // Default 3 = Alumni

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

  const masuk2Digit = formatTwoDigitYear(params.tahunMasuk);
  const keluar2Digit = formatTwoDigitYear(params.tahunKeluar);
  const zzzz = `${masuk2Digit}${keluar2Digit}`;

  const aaaaa = String(params.sequenceNumber).padStart(5, "0");

  const nia = `${x}.${yy}.${zzzz}.${aaaaa}`;
  return { nia, statusCode: x, provinceCode: yy, provinceName: provName };
}
