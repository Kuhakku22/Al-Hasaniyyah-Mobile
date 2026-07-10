import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function NotifikasiScreen() {
  const router = useRouter();

  const notifications = [
    { id: 1, title: "Pembayaran Berhasil", body: "Alhamdulillah, infak pembangunan Anda Rp1.800.000 terverifikasi.", time: "1 hari yang lalu", read: false },
    { id: 2, title: "Tagihan Iuran Wajib", body: "Iuran wajib periode Juli 2026 telah diterbitkan.", time: "2 hari yang lalu", read: true }
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-slate-800">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#94a3b8" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">Notifikasi Masuk</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {notifications.map(n => (
          <View key={n.id} className="p-4 bg-slate-800 border border-slate-700 rounded-2xl relative mb-4">
            {!n.read && <View className="absolute top-4 right-4 w-2.5 h-2.5 bg-rose-500 rounded-full" />}
            <Text className="font-bold text-white mb-1 pr-6">{n.title}</Text>
            <Text className="text-xs text-slate-300 leading-5">{n.body}</Text>
            <Text className="text-[10px] text-slate-500 mt-3">{n.time}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
