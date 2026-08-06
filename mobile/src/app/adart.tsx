import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';

interface Pasal {
  id: string;
  nomor: number;
  judul: string;
  isi: string;
}

interface Bab {
  id: string;
  nomor: string;
  judul: string;
  pasalList: Pasal[];
}

const ADART_DATA: Bab[] = [
  {
    id: 'bab1',
    nomor: 'I',
    judul: 'NAMA, KEDUDUKAN, DAN WAKTU',
    pasalList: [
      { id: 'p1', nomor: 1, judul: 'Nama Organisasi', isi: 'Organisasi ini bernama Ikatan Alumni Al Hasaniyyah, disingkat AL HASANIYYAH.' },
      { id: 'p2', nomor: 2, judul: 'Kedudukan', isi: 'AL HASANIYYAH berkedudukan di tingkat pusat di Pondok Pesantren Darullughah Wadda\'wah, Bangil, Pasuruan, Jawa Timur, dengan cabang-cabang (Korda) di berbagai wilayah Indonesia dan luar negeri.' },
      { id: 'p3', nomor: 3, judul: 'Waktu Pendirian', isi: 'AL HASANIYYAH didirikan untuk jangka waktu yang tidak ditentukan dan berazaskan kekeluargaan serta pengabdian.' }
    ]
  },
  {
    id: 'bab2',
    nomor: 'II',
    judul: 'ASAS, LANDASAN, DAN TUJUAN',
    pasalList: [
      { id: 'p4', nomor: 4, judul: 'Asas', isi: 'AL HASANIYYAH berasaskan Islam Ahlussunnah wal Jama\'ah.' },
      { id: 'p5', nomor: 5, judul: 'Landasan', isi: 'AL HASANIYYAH berlandaskan Pancasila, UUD 1945, serta nilai-nilai ketakwaan dan amanah.' },
      { id: 'p6', nomor: 6, judul: 'Tujuan', isi: 'Tujuan organisasi adalah: \n1. Mempererat ukhuwah islamiyah dan silaturahmi antar alumni.\n2. Menjaga dan mengamalkan nilai-nilai dakwah pesantren.\n3. Berkontribusi positif bagi pengembangan pesantren, umat, dan bangsa.' }
    ]
  },
  {
    id: 'bab3',
    nomor: 'III',
    judul: 'KEANGGOTAAN DAN KETENTUAN IURAN',
    pasalList: [
      { id: 'p7', nomor: 7, judul: 'Kualifikasi Anggota', isi: 'Anggota AL HASANIYYAH adalah seluruh individu yang pernah menempuh pendidikan di Pondok Pesantren Darullughah Wadda\'wah dan terdaftar secara resmi di database alumni.' },
      { id: 'p8', nomor: 8, judul: 'Hak & Kewajiban', isi: 'Setiap anggota berhak berpartisipasi dalam musyawarah, mendapatkan informasi perkembangan organisasi, serta berkewajiban menjaga nama baik almamater.' },
      { id: 'p9', nomor: 9, judul: 'Iuran Wajib Anggota', isi: 'Setiap alumni yang terverifikasi wajib membayar iuran rutin bulanan sebesar Rp 25.000 (dua puluh lima ribu rupiah) guna menopang operasional kesekretariatan dan pendanaan bantuan sosial alumni.' }
    ]
  },
  {
    id: 'bab4',
    nomor: 'IV',
    judul: 'PERMUSYAWARATAN DAN STRUKTUR',
    pasalList: [
      { id: 'p10', nomor: 10, judul: 'Musyawarah Besar', isi: 'Musyawarah Besar (Mubes) merupakan pemegang kekuasaan tertinggi organisasi yang diselenggarakan sekali dalam 5 (lima) tahun untuk memilih Ketua Umum dan menyempurnakan AD/ART.' },
      { id: 'p11', nomor: 11, judul: 'Kepengurusan Korda', isi: 'Koordinator Daerah (Korda) dibentuk di tingkat kota/kabupaten atau wilayah provinsi/luar negeri atas rekomendasi Pengurus Pusat.' }
    ]
  }
];

export default function AdArtScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBab, setExpandedBab] = useState<Record<string, boolean>>({
    bab1: true, // Default buka bab I
  });
  const [expandedPasal, setExpandedPasal] = useState<Record<string, boolean>>({});

  const toggleBab = (id: string) => {
    setExpandedBab(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const togglePasal = (id: string) => {
    setExpandedPasal(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter AD/ART berdasarkan query pencarian
  const filteredData = ADART_DATA.map(bab => {
    const matchingPasal = bab.pasalList.filter(pasal => 
      pasal.judul.toLowerCase().includes(searchQuery.toLowerCase()) || 
      pasal.isi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bab.judul.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return {
      ...bab,
      pasalList: matchingPasal
    };
  }).filter(bab => bab.pasalList.length > 0);

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#166534" />
      <AppHeader title="AD / ART Organisasi" showBack />

      {/* Search Bar */}
      <View className="p-4 border-b border-slate-800">
        <View className="relative justify-center">
          <Ionicons name="search" size={18} color="#94a3b8" style={{ position: 'absolute', left: 16, zIndex: 10 }} />
          <TextInput 
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Cari bab, pasal, atau kata kunci..."
            placeholderTextColor="#64748b"
            className="w-full bg-slate-950 p-3 pl-12 text-sm rounded-xl border border-slate-800 focus:border-primary text-white"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={{ position: 'absolute', right: 16, zIndex: 10 }}
            >
              <Ionicons name="close-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {filteredData.length > 0 ? (
          filteredData.map((bab) => {
            const isBabExpanded = searchQuery.length > 0 || expandedBab[bab.id];
            
            return (
              <View key={bab.id} className="mb-4 bg-slate-800/60 rounded-2xl border border-slate-800 overflow-hidden">
                {/* Header Bab */}
                <TouchableOpacity 
                  onPress={() => toggleBab(bab.id)}
                  activeOpacity={0.7}
                  className="flex-row justify-between items-center p-4 bg-slate-800 border-b border-slate-700/50"
                >
                  <View className="flex-1 pr-4">
                    <Text className="text-xs text-gold font-bold uppercase tracking-wider">BAB {bab.nomor}</Text>
                    <Text className="text-white font-bold text-sm leading-5 mt-0.5">{bab.judul}</Text>
                  </View>
                  <Ionicons 
                    name={isBabExpanded ? 'chevron-down' : 'chevron-forward'} 
                    size={20} 
                    color="#94a3b8" 
                  />
                </TouchableOpacity>

                {/* Pasal List */}
                {isBabExpanded && (
                  <View className="p-2 space-y-2">
                    {bab.pasalList.map((pasal) => {
                      const isPasalExpanded = searchQuery.length > 0 || expandedPasal[pasal.id];
                      
                      return (
                        <View 
                          key={pasal.id} 
                          className="bg-slate-900/40 rounded-xl border border-slate-800/80 mb-2 overflow-hidden"
                        >
                          <TouchableOpacity 
                            onPress={() => togglePasal(pasal.id)}
                            activeOpacity={0.7}
                            className="flex-row justify-between items-center p-3"
                          >
                            <Text className="text-slate-200 font-semibold text-xs flex-1">
                              Pasal {pasal.nomor}: {pasal.judul}
                            </Text>
                            <Ionicons 
                              name={isPasalExpanded ? 'remove-circle-outline' : 'add-circle-outline'} 
                              size={16} 
                              color="#8b5cf6" 
                            />
                          </TouchableOpacity>

                          {isPasalExpanded && (
                            <View className="px-3 pb-3 pt-1 border-t border-slate-800/30">
                              <Text className="text-slate-400 text-xs leading-5">
                                {pasal.isi}
                              </Text>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <View className="items-center justify-center py-20 px-8">
            <View className="w-16 h-16 bg-slate-800 rounded-full items-center justify-center mb-4 border border-slate-700">
              <Ionicons name="document-text-outline" size={32} color="#64748b" />
            </View>
            <Text className="text-slate-300 font-bold text-base mb-1">Tidak Ada Hasil Cocok</Text>
            <Text className="text-slate-500 text-xs text-center leading-5">
              Coba gunakan kata pencarian lain seperti &quot;iuran&quot;, &quot;cabang&quot;, &quot;alumni&quot;, atau nomor pasal.
            </Text>
          </View>
        )}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
