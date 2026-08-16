import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
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

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

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
      
      {/* Absolute Background Layers */}
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

          {/* User Info Header (Tampilan Foto Profil Pojok Atas) */}
          <View className="px-5 mb-6 flex-row items-center gap-3">
            {userProfile?.foto_profil ? (
              <Image 
                source={{ uri: userProfile.foto_profil }} 
                style={{ width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#F59E0B' }}
                resizeMode="cover"
              />
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
                NIA: {userProfile?.nomor_id_unik || '3.35.1426.00007'}
              </Text>
            </View>
          </View>

          {/* Kartu Keanggotaan Alumni */}
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
                <View className="flex-row items-center gap-3">
                  {userProfile?.foto_profil ? (
                    <Image 
                      source={{ uri: userProfile.foto_profil }} 
                      style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#059669' }}
                      resizeMode="cover"
                    />
                  ) : null}
                  <View>
                    <Text className="text-slate-500 text-[11px]">Nama Alumni</Text>
                    <Text className="text-slate-900 font-bold text-base">{userProfile?.nama_lengkap || 'Ahmad Ali'}</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-slate-500 text-[11px]">Nomor Induk (NIA)</Text>
                  <Text className="text-emerald-700 font-bold text-base">{userProfile?.nomor_id_unik || '3.35.1426.00007'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Grid Menu Layanan */}
          <View className="px-4 mb-6">
            <Text className="text-slate-800 font-bold text-base mb-3">Layanan Alumni</Text>
            <View className="flex-row flex-wrap justify-between gap-y-4">
              {features.map((item, index) => (
                <TouchableOpacity 
                  key={index} 
                  onPress={() => router.push(item.route as any)}
                  className="w-[18%] items-center"
                >
                  <View className={`w-12 h-12 rounded-2xl ${item.bg} items-center justify-center mb-1 shadow-sm`}>
                    <Ionicons name={item.icon as any} size={22} color={item.color} />
                  </View>
                  <Text className="text-slate-700 text-[10px] font-semibold text-center leading-tight">
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Banner Info Penting */}
          <View className="px-4 mb-8">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-slate-800 font-bold text-base">Info Penting</Text>
              <TouchableOpacity onPress={() => router.push('/berita' as any)}>
                <Text className="text-amber-600 text-xs font-bold">Lihat Semua</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
              {/* Banner 1 */}
              <TouchableOpacity 
                onPress={() => router.push('/berita' as any)}
                className="w-72 bg-emerald-800 rounded-2xl p-4 mr-3 relative overflow-hidden"
              >
                <View className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-600/30 rounded-full" />
                <View className="bg-amber-400 self-start px-2 py-0.5 rounded text-xs mb-2">
                  <Text className="text-emerald-950 font-extrabold text-[10px]">AGENDA KONTRIBUSI</Text>
                </View>
                <Text className="text-white font-bold text-sm mb-1">Iuran & Infak Alumni 2026</Text>
                <Text className="text-emerald-100 text-xs leading-relaxed">
                  Mari bersinergi mendukung dakwah & pembangunan fasilitas pondok.
                </Text>
              </TouchableOpacity>

              {/* Banner 2 */}
              <TouchableOpacity 
                onPress={() => router.push('/kegiatan' as any)}
                className="w-72 bg-amber-600 rounded-2xl p-4 mr-3 relative overflow-hidden"
              >
                <View className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-400/30 rounded-full" />
                <View className="bg-emerald-900 self-start px-2 py-0.5 rounded text-xs mb-2">
                  <Text className="text-amber-300 font-extrabold text-[10px]">SILATURAHMI</Text>
                </View>
                <Text className="text-white font-bold text-sm mb-1">Reuni Akbar Alumni Dalwa</Text>
                <Text className="text-amber-100 text-xs leading-relaxed">
                  Musyawarah nasional dan silaturahmi alumni lintas angkatan.
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
