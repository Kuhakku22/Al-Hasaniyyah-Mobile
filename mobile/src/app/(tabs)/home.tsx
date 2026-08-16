import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { RefreshControl, ScrollView, StatusBar, Text, TouchableOpacity, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Home() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState(1);
  const [showBalance, setShowBalance] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  const loadProfile = async () => {
    try {
      const storedProfile = await AsyncStorage.getItem('userProfile');
      if (storedProfile) {
        setUserProfile(JSON.parse(storedProfile));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadProfile().finally(() => {
      setRefreshing(false);
    });
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'AL';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userProfile');
    router.replace('/');
  };

  const features = [
    { title: 'Pembayaran', icon: 'card-outline', route: '/infak', color: '#00A39D', bg: 'bg-teal-50' },
    { title: 'Kegiatan', icon: 'calendar', route: '/kegiatan', color: '#f59e0b', bg: 'bg-amber-50' },
    { title: 'Berita', icon: 'newspaper', route: '/berita', color: '#6366f1', bg: 'bg-indigo-50' },
    { title: 'AD/ART', icon: 'document-text', route: '/adart', color: '#8b5cf6', bg: 'bg-violet-50' },
    { title: 'Laporan', icon: 'pie-chart', route: '/laporan', color: '#ec4899', bg: 'bg-pink-50' },
    { title: 'Direktori', icon: 'people', route: '/direktori', color: '#0ea5e9', bg: 'bg-sky-50' },
    { title: 'Loker', icon: 'briefcase', route: '/loker', color: '#f59e0b', bg: 'bg-amber-50' },
    { title: 'Market', icon: 'cart', route: '/marketplace', color: '#ef4444', bg: 'bg-red-50' },
    { title: 'Pustaka', icon: 'library', route: '/perpustakaan', color: '#14b8a6', bg: 'bg-teal-50' },
    { title: 'Konsultasi', icon: 'headset', route: '/konsultasi', color: '#8b5cf6', bg: 'bg-violet-50' },
  ];

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar barStyle="light-content" backgroundColor="#064e3b" />
      
      {/* Absolute Background Layers (BSI Byond Style) */}
      <View className="absolute top-0 left-0 right-0 h-64 bg-emerald-900 rounded-b-[40px]" />
      <View className="absolute top-56 left-0 right-0 h-20 bg-amber-500 opacity-90 rounded-b-[60px] -z-10" />

      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
        >
          {/* Top Header (Logo & Icons) */}
          <View className="flex-row justify-between items-center px-5 pt-2 mb-6">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 flex items-center justify-center">
                <Image source={require('@/assets/images/icon.png')} style={{width: '100%', height: '100%'}} resizeMode="contain" />
              </View>
              <Text className="text-white font-black text-xl tracking-wider">AL HASANIYYAH</Text>
            </View>
            
            <View className="flex-row gap-4">
              <TouchableOpacity onPress={() => router.push('/notifikasi' as any)} className="relative">
                <Ionicons name="notifications-outline" size={26} color="#fff" />
                {notifications > 0 && (
                  <View className="absolute 1 right-0 w-3 h-3 bg-red-500 rounded-full border border-emerald-900" />
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={26} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* User Info */}
          <View className="px-5 mb-6 flex-row items-center gap-3">
            {userProfile?.foto_profil ? (
              <Image source={{ uri: userProfile.foto_profil }} className="w-12 h-12 rounded-full border-2 border-amber-400" />
            ) : (
              <View className="w-12 h-12 rounded-full bg-emerald-700 items-center justify-center border-2 border-emerald-500/50">
                <Text className="text-white font-bold text-lg">
                  {getInitials(userProfile?.nama_lengkap || 'Ahmad Ali')}
                </Text>
              </View>
            )}
            <View>
              <Text className="text-white font-bold text-lg">
                {userProfile?.nama_lengkap || 'Ahmad Ali'}
              </Text>
              <Text className="text-emerald-200 text-xs">
                NIA: {userProfile?.nomor_id_unik || '123456'}
              </Text>
            </View>
          </View>

          {/* Kartu Keanggotaan Alumni (Menggantikan Tampilan Nominal Sensitif) */}
          <View className="px-4 mb-6">
            <View className="bg-white rounded-3xl p-5 shadow-lg elevation-5 overflow-hidden border border-slate-100 relative">
              {/* Ornamen Estetik */}
              <View className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-600/10 rounded-full" />
              <View className="absolute -top-5 -right-5 w-20 h-20 bg-amber-500/15 rounded-full" />
              
              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="shield-checkmark" size={20} color="#059669" />
                  <Text className="text-slate-800 font-bold text-sm">Kartu Keanggotaan Alumni</Text>
                </View>
                <View className="bg-emerald-100 px-3 py-1 rounded-full">
                  <Text className="text-emerald-800 text-[10px] font-bold">Terverifikasi</Text>
                </View>
              </View>

              <Text className="text-slate-400 text-xs mb-3">Pondok Pesantren Dalwa</Text>
              
              <View className="flex-row justify-between items-end border-t border-slate-100 pt-3">
                <View>
                  <Text className="text-slate-500 text-[11px]">Nama Alumni</Text>
                  <Text className="text-slate-900 font-bold text-base">{userProfile?.nama_lengkap || 'Alumni Dalwa'}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-slate-500 text-[11px]">Nomor Induk (NIA)</Text>
                  <Text className="text-emerald-700 font-bold text-base">{userProfile?.nomor_id_unik || '123456'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Circular Menu Grid (4 Columns) */}
          <View className="px-2 mb-6">
            <View className="flex-row flex-wrap justify-start">
              {features.map((feature, index) => (
                <TouchableOpacity 
                  key={index}
                  onPress={() => router.push(feature.route as any)}
                  className="w-[25%] items-center mb-6"
                >
                  <View className={`w-14 h-14 rounded-full ${feature.bg} items-center justify-center mb-2 shadow-sm`}>
                    <Ionicons name={feature.icon as any} size={26} color={feature.color} />
                  </View>
                  <Text className="text-[11px] font-bold text-slate-700 text-center px-1" numberOfLines={1}>
                    {feature.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* E-Wallet / Quick Info Section */}
          <View className="px-5 mb-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-slate-800 font-bold text-sm">Info Penting</Text>
              <TouchableOpacity><Text className="text-amber-600 font-bold text-xs">Atur</Text></TouchableOpacity>
            </View>
            
            <View className="flex-row gap-3">
              <View className="bg-white p-3 rounded-2xl flex-1 shadow-sm border border-slate-200 elevation-2">
                <View className="flex-row items-center gap-2 mb-2">
                  <View className="bg-blue-100 p-1.5 rounded-lg"><Ionicons name="newspaper" size={16} color="#2563eb" /></View>
                  <Text className="font-bold text-slate-800 text-xs">Berita</Text>
                </View>
                <Text className="text-slate-500 text-[10px]">Silaturahmi Nasional 2026 Segera Hadir</Text>
              </View>
              
              <View className="bg-white p-3 rounded-2xl flex-1 shadow-sm border border-slate-200 elevation-2">
                <View className="flex-row items-center gap-2 mb-2">
                  <View className="bg-amber-100 p-1.5 rounded-lg"><Ionicons name="calendar" size={16} color="#d97706" /></View>
                  <Text className="font-bold text-slate-800 text-xs">Agenda</Text>
                </View>
                <Text className="text-slate-500 text-[10px]">Al Hikam - 6 Ags 2026</Text>
              </View>
            </View>
          </View>

          {/* Favorit / Kontak Cepat Section */}
          <View className="px-5 mb-10">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-slate-800 font-bold text-sm">Riwayat Transaksi Terbaru</Text>
              <TouchableOpacity><Text className="text-amber-600 font-bold text-xs">Lihat Semua</Text></TouchableOpacity>
            </View>
            
            <View className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 elevation-2">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-indigo-100 items-center justify-center">
                    <Text className="text-indigo-700 font-bold">IW</Text>
                  </View>
                  <View>
                    <Text className="text-slate-800 font-bold text-sm">Iuran Wajib Juli</Text>
                    <Text className="text-slate-400 text-[10px]">Bank Transfer - Berhasil</Text>
                  </View>
                </View>
                <Text className="text-emerald-600 font-bold text-sm">Rp 25.000</Text>
              </View>
              
              <View className="h-px bg-slate-100 mb-4" />
              
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-emerald-100 items-center justify-center">
                    <Text className="text-emerald-700 font-bold">IF</Text>
                  </View>
                  <View>
                    <Text className="text-slate-800 font-bold text-sm">Infak Beasiswa</Text>
                    <Text className="text-slate-400 text-[10px]">QRIS - Berhasil</Text>
                  </View>
                </View>
                <Text className="text-emerald-600 font-bold text-sm">Rp 100.000</Text>
              </View>
            </View>
          </View>
          
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
