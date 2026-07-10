import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';

interface Transaksi {
  id: number;
  tipe: 'pemasukan' | 'pengeluaran';
  kategori: string;
  nominal: number;
  deskripsi: string;
  tanggal: string;
}

interface LaporanBulanan {
  periode: string;
  saldoAwal: number;
  totalPemasukan: number;
  totalPengeluaran: number;
  alokasi: { kategori: string; nominal: number }[];
  transaksi: Transaksi[];
}

const LAPORAN_DATA: LaporanBulanan[] = [
  {
    periode: 'Agustus 2026',
    saldoAwal: 15488500,
    totalPemasukan: 20250000,
    totalPengeluaran: 2500000,
    alokasi: [
      { kategori: 'Iuran Anggota', nominal: 15250000 },
      { kategori: 'Infak Umum', nominal: 5000000 },
      { kategori: 'Operasional', nominal: 1500000 },
      { kategori: 'Bantuan Sosial (Bansos)', nominal: 1000000 },
    ],
    transaksi: [
      { id: 1, tipe: 'pemasukan', kategori: 'Iuran Anggota', nominal: 15250000, deskripsi: 'Akumulasi iuran wajib anggota periode Agustus', tanggal: '08 Agu 2026' },
      { id: 2, tipe: 'pemasukan', kategori: 'Infak Umum', nominal: 5000000, deskripsi: 'Infak hamba Allah untuk pembangunan sekretariat', tanggal: '06 Agu 2026' },
      { id: 3, tipe: 'pengeluaran', kategori: 'Operasional', nominal: 1500000, deskripsi: 'Biaya Wifi & Listrik sekretariat pusat', tanggal: '04 Agu 2026' },
      { id: 4, tipe: 'pengeluaran', kategori: 'Bansos', nominal: 1000000, deskripsi: 'Santunan sakit alumni Korda Jatim (Ahmad B.)', tanggal: '02 Agu 2026' }
    ]
  },
  {
    periode: 'Juli 2026',
    saldoAwal: 13000000,
    totalPemasukan: 18300000,
    totalPengeluaran: 5300000,
    alokasi: [
      { kategori: 'Iuran Anggota', nominal: 14800000 },
      { kategori: 'Infak Beasiswa', nominal: 3500000 },
      { kategori: 'Beasiswa Pendidikan', nominal: 4500000 },
      { kategori: 'Operasional', nominal: 800000 }
    ],
    transaksi: [
      { id: 11, tipe: 'pemasukan', kategori: 'Iuran Anggota', nominal: 14800000, deskripsi: 'Akumulasi iuran wajib anggota periode Juli', tanggal: '30 Jul 2026' },
      { id: 12, tipe: 'pemasukan', kategori: 'Infak Beasiswa', nominal: 3500000, deskripsi: 'Infak program beasiswa santri berprestasi', tanggal: '25 Jul 2026' },
      { id: 13, tipe: 'pengeluaran', kategori: 'Beasiswa Pendidikan', nominal: 4500000, deskripsi: 'Penyaluran dana beasiswa S1 Mesir (Eka P.)', tanggal: '20 Jul 2026' },
      { id: 14, tipe: 'pengeluaran', kategori: 'Operasional', nominal: 800000, deskripsi: 'Pembelian tinta & kertas inventaris kantor', tanggal: '15 Jul 2026' }
    ]
  }
];

export default function LaporanScreen() {
  const router = useRouter();
  const [selectedPeriodIdx, setSelectedPeriodIdx] = useState(0);

  const activeLaporan = LAPORAN_DATA[selectedPeriodIdx];
  const totalSaldoAkhir = activeLaporan.saldoAwal + activeLaporan.totalPemasukan - activeLaporan.totalPengeluaran;

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#166534" />
      <AppHeader title="Laporan Keuangan" showBack />

      {/* Period Selection Selector */}
      <View className="flex-row bg-slate-950 p-2 border-b border-slate-800">
        {LAPORAN_DATA.map((item, idx) => {
          const isActive = idx === selectedPeriodIdx;
          return (
            <TouchableOpacity
              key={item.periode}
              onPress={() => setSelectedPeriodIdx(idx)}
              className={`flex-1 py-3 items-center rounded-xl ${isActive ? 'bg-primary' : 'bg-transparent'}`}
            >
              <Text className={`font-bold text-xs ${isActive ? 'text-white' : 'text-slate-400'}`}>
                {item.periode}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* Main Card (Saldo Kas) */}
        <View className="bg-gradient-to-r from-emerald-900 to-slate-800 p-5 rounded-2xl border border-slate-700 mb-6">
          <Text className="text-slate-400 text-xs uppercase tracking-wider mb-1 font-bold">Total Saldo Kas Akhir</Text>
          <Text className="text-white font-black text-3xl mb-4">
            Rp {totalSaldoAkhir.toLocaleString('id-ID')}
          </Text>

          <View className="h-px bg-slate-700/50 mb-4" />

          <View className="flex-row justify-between">
            <View>
              <View className="flex-row items-center gap-1 mb-1">
                <Ionicons name="arrow-down-circle" size={14} color="#10b981" />
                <Text className="text-slate-400 text-[10px]">Total Pemasukan</Text>
              </View>
              <Text className="text-emerald-400 font-bold text-sm">
                +Rp {activeLaporan.totalPemasukan.toLocaleString('id-ID')}
              </Text>
            </View>

            <View className="items-end">
              <View className="flex-row items-center gap-1 mb-1">
                <Ionicons name="arrow-up-circle" size={14} color="#f43f5e" />
                <Text className="text-slate-400 text-[10px]">Total Pengeluaran</Text>
              </View>
              <Text className="text-rose-400 font-bold text-sm">
                -Rp {activeLaporan.totalPengeluaran.toLocaleString('id-ID')}
              </Text>
            </View>
          </View>
        </View>

        {/* Visualized Category Allocation Charts */}
        <View className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 mb-6">
          <Text className="text-white font-bold text-sm mb-4">Alokasi & Kategori Dana</Text>
          
          <View className="space-y-4">
            {activeLaporan.alokasi.map((item, idx) => {
              // Hitung persentase terhadap total pemasukan/pengeluaran untuk visual progress
              const totalReference = item.kategori.includes('Iuran') || item.kategori.includes('Infak') 
                ? activeLaporan.totalPemasukan 
                : activeLaporan.totalPengeluaran;
              const pct = totalReference > 0 ? Math.min(100, Math.round((item.nominal / totalReference) * 100)) : 0;
              const isIncome = item.kategori.includes('Iuran') || item.kategori.includes('Infak');

              return (
                <View key={idx} className="mb-3">
                  <View className="flex-row justify-between items-center mb-1.5">
                    <Text className="text-slate-300 text-xs font-semibold">{item.kategori}</Text>
                    <Text className={`text-xs font-bold ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                      Rp {item.nominal.toLocaleString('id-ID')}
                    </Text>
                  </View>
                  {/* Progress Bar Container */}
                  <View className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                    <View 
                      className={`h-full rounded-full ${isIncome ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                      style={{ width: `${pct}%` }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Transaction History list */}
        <View className="mb-8">
          <Text className="text-white font-bold text-sm mb-4">Riwayat Aliran Transaksi</Text>

          {activeLaporan.transaksi.map((trans) => (
            <View 
              key={trans.id} 
              className="bg-slate-800 p-4 rounded-xl border border-slate-700/60 mb-3 flex-row justify-between items-center"
            >
              <View className="flex-1 pr-4">
                <View className="flex-row items-center gap-2 mb-1.5">
                  <View className={`px-2 py-0.5 rounded ${trans.tipe === 'pemasukan' ? 'bg-emerald-950 border border-emerald-800' : 'bg-rose-950 border border-rose-800'}`}>
                    <Text className={`text-[9px] font-bold uppercase ${trans.tipe === 'pemasukan' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {trans.tipe}
                    </Text>
                  </View>
                  <Text className="text-[10px] text-slate-500">{trans.tanggal}</Text>
                </View>
                <Text className="text-white font-bold text-xs mb-1">{trans.deskripsi}</Text>
                <Text className="text-slate-400 text-[10px]">Kategori: {trans.kategori}</Text>
              </View>

              <Text className={`font-black text-sm ${trans.tipe === 'pemasukan' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {trans.tipe === 'pemasukan' ? '+' : '-'}Rp {trans.nominal.toLocaleString('id-ID')}
              </Text>
            </View>
          ))}
        </View>

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
