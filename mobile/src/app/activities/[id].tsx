import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/AppHeader';
import { mockActivities } from '../../data/mockData';

export default function ActivityDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const activity = mockActivities.find(a => a.id === id);

  const [isRegistered, setIsRegistered] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  React.useEffect(() => {
    if (activity) {
      setIsRegistered(activity.registered);
    }
  }, [activity]);

  if (!activity) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900" edges={['top']}>
        <AppHeader title="Detail Kegiatan" showBack />
        <View className="flex-1 justify-center items-center p-4">
          <Ionicons name="alert-circle-outline" size={50} color="#ef4444" />
          <Text className="text-slate-400 mt-4 text-center">Kegiatan tidak ditemukan.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleRegisterToggle = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const nextState = !isRegistered;
      setIsRegistered(nextState);

      if (nextState) {
        Alert.alert(
          'Registrasi Berhasil',
          `Antum telah terdaftar dalam kegiatan "${activity.title}". QR Code check-in akan dikirimkan ke email antum.`,
          [{ text: 'Syukron' }]
        );
      } else {
        Alert.alert(
          'Pendaftaran Dibatalkan',
          `Antum membatalkan pendaftaran untuk kegiatan "${activity.title}".`,
          [{ text: 'OK' }]
        );
      }
    }, 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#166534" />
      <AppHeader title="Detail Agenda Alumni" showBack />

      <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
        {/* Banner Card Graphic */}
        <View className="bg-gradient-to-br from-emerald-950 to-slate-800 p-6 rounded-3xl border border-slate-700/60 items-center justify-center mb-6">
          <View className="w-16 h-16 bg-slate-900 rounded-full items-center justify-center mb-4 border border-slate-700">
            <Ionicons name="calendar" size={32} color="#eab308" />
          </View>
          <Text className="text-white font-black text-xl text-center mb-2 leading-7">{activity.title}</Text>
          <View className="bg-primary/20 px-3 py-1 rounded-full border border-primary/30">
            <Text className="text-emerald-400 text-xs font-bold">Penyelenggara: {activity.organizer}</Text>
          </View>
        </View>

        {/* Schedule & Location Card */}
        <View className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 mb-6">
          <Text className="text-white font-bold text-sm mb-4">Informasi Pelaksanaan</Text>

          <View className="flex-row items-start mb-4">
            <View className="w-8 h-8 rounded-full bg-slate-900 items-center justify-center mr-3 border border-slate-700/80">
              <Ionicons name="time" size={16} color="#94a3b8" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Tanggal & Waktu</Text>
              <Text className="text-white text-xs font-semibold mt-0.5">{activity.date}</Text>
              <Text className="text-slate-400 text-[10px] mt-0.5">Mulai 08:00 WIB s/d Selesai</Text>
            </View>
          </View>

          <View className="flex-row items-start">
            <View className="w-8 h-8 rounded-full bg-slate-900 items-center justify-center mr-3 border border-slate-700/80">
              <Ionicons name="location" size={16} color="#94a3b8" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Lokasi / Tempat</Text>
              <Text className="text-white text-xs font-semibold mt-0.5">{activity.location}</Text>
            </View>
          </View>
        </View>

        {/* Description Card */}
        <View className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50 mb-8">
          <Text className="text-white font-bold text-sm mb-3">Deskripsi Acara:</Text>
          <Text className="text-slate-400 text-xs leading-5">
            {activity.description}{'\n\n'}
            Silaturahmi ini sangat penting guna merapatkan barisan alumni Al Hasaniyyah serta menyelaraskan visi dakwah. Seluruh alumni diimbau untuk hadir secara luring jika tidak berhalangan.
          </Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          onPress={handleRegisterToggle}
          disabled={isProcessing}
          className={`w-full py-4 rounded-xl items-center flex-row justify-center active:opacity-85 shadow-md mb-8 ${
            isRegistered 
              ? 'bg-slate-800 border border-rose-500/50' 
              : 'bg-emerald-600'
          }`}
        >
          {isProcessing ? (
            <Ionicons name="sync-outline" size={20} color="#fff" className="animate-spin" style={{ marginRight: 8 }} />
          ) : isRegistered ? (
            <Ionicons name="close-circle-outline" size={20} color="#f43f5e" style={{ marginRight: 8 }} />
          ) : (
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          )}
          <Text className={`font-bold text-base ${isRegistered ? 'text-rose-400' : 'text-white'}`}>
            {isProcessing ? 'Memproses...' : isRegistered ? 'Batalkan Kehadiran' : 'Daftar & Konfirmasi Hadir'}
          </Text>
        </TouchableOpacity>

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
