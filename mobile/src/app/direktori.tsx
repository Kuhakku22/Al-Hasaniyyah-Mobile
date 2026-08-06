import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

interface AlumniData {
  nia: string;
  nama: string;
  angkatan: number;
  wilayah: string;
}

const INITIAL_ALUMNI_DATA: AlumniData[] = [
  { nia: "1023001", nama: "Ahmad Baidlowi", angkatan: 2018, wilayah: "Pasuruan" },
  { nia: "1023002", nama: "M. Zarkasyi", angkatan: 2015, wilayah: "Pontianak" },
  { nia: "1023003", nama: "Fathur Rahman", angkatan: 2020, wilayah: "Bekasi" },
  { nia: "1023004", nama: "Ali Zainal Abidin", angkatan: 2017, wilayah: "Raci" },
];

export default function DirektoriScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [alumniList, setAlumniList] = useState<AlumniData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('alumni')
        .select('nomor_id_unik, nama_lengkap, angkatan, alamat_domisili, kota')
        .eq('status_verifikasi', 'verified')
        .order('nama_lengkap', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedData: AlumniData[] = data.map(al => ({
          nia: al.nomor_id_unik,
          nama: al.nama_lengkap,
          angkatan: al.angkatan || 0,
          wilayah: al.alamat_domisili || al.kota || 'Tidak Diketahui'
        }));
        setAlumniList(formattedData);
      } else {
        setAlumniList(INITIAL_ALUMNI_DATA);
      }
    } catch (e) {
      console.warn("Gagal mengambil data alumni dari Supabase, menggunakan data lokal:", e);
      setAlumniList(INITIAL_ALUMNI_DATA);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, []);

  const filteredAlumni = alumniList.filter(al => 
    al.nama.toLowerCase().includes(search.toLowerCase()) || 
    al.wilayah.toLowerCase().includes(search.toLowerCase()) ||
    al.angkatan.toString().includes(search) ||
    al.nia.includes(search)
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-slate-800">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#94a3b8" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">Direktori Alumni</Text>
      </View>

      <View className="p-4 flex-1">
        <View className="relative justify-center mb-4">
          <Ionicons name="search" size={20} color="#94a3b8" style={{ position: 'absolute', left: 16, zIndex: 10 }} />
          <TextInput 
            value={search}
            onChangeText={setSearch}
            placeholder="Cari nama alumni, angkatan, kota..."
            placeholderTextColor="#64748b"
            className="w-full bg-slate-950 p-4 pl-12 text-sm rounded-xl border border-slate-800 focus:border-emerald-500 text-white"
          />
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center py-20">
            <ActivityIndicator size="large" color="#10b981" />
            <Text className="text-slate-400 text-sm mt-4">Memuat data alumni...</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            {filteredAlumni.map((al, idx) => (
              <View key={idx} className="p-4 bg-slate-800 rounded-xl border border-slate-700 flex-row justify-between items-center mb-3">
                <View className="flex-1 pr-3">
                  <Text className="font-bold text-white mb-1" numberOfLines={1}>{al.nama}</Text>
                  <Text className="text-[11px] text-slate-400" numberOfLines={1}>
                    Angkatan {al.angkatan} • {al.wilayah}
                  </Text>
                </View>
                <View className="bg-slate-700 px-3 py-1.5 rounded border border-slate-600">
                  <Text className="text-[10px] text-slate-300 font-mono">{al.nia}</Text>
                </View>
              </View>
            ))}
            {filteredAlumni.length === 0 && (
              <Text className="text-center text-slate-500 mt-10">Tidak ditemukan data alumni.</Text>
            )}
            <View className="h-10" />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
