import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const INITIAL_ALUMNI_DATA = [
  { nia: "1023001", nama: "Ahmad Baidlowi", angkatan: 2018, wilayah: "Pasuruan", pulau: "Jawa" },
  { nia: "1023002", nama: "M. Zarkasyi", angkatan: 2015, wilayah: "Pontianak", pulau: "Kalimantan" },
  { nia: "1023003", nama: "Fathur Rahman", angkatan: 2020, wilayah: "Bekasi", pulau: "Jawa" },
  { nia: "1023004", nama: "Ali Zainal Abidin", angkatan: 2017, wilayah: "Raci", pulau: "Jawa" },
];

export default function DirektoriScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filteredAlumni = INITIAL_ALUMNI_DATA.filter(al => 
    al.nama.toLowerCase().includes(search.toLowerCase()) || 
    al.wilayah.toLowerCase().includes(search.toLowerCase()) ||
    al.angkatan.toString().includes(search)
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

      <View className="p-4">
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

        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredAlumni.map((al, idx) => (
            <View key={idx} className="p-4 bg-slate-800 rounded-xl border border-slate-700 flex-row justify-between items-center mb-3">
              <View>
                <Text className="font-bold text-white mb-1">{al.nama}</Text>
                <Text className="text-[11px] text-slate-400">Angkatan {al.angkatan} • {al.wilayah}</Text>
              </View>
              <View className="bg-slate-700 px-3 py-1.5 rounded border border-slate-600">
                <Text className="text-[10px] text-slate-300">{al.nia}</Text>
              </View>
            </View>
          ))}
          {filteredAlumni.length === 0 && (
            <Text className="text-center text-slate-500 mt-10">Tidak ditemukan data alumni.</Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
