import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/AppHeader';
import { colors } from '../../constants/colors';

export default function Profile() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
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
    loadProfile();
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Apakah Anda yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      { 
        text: 'Keluar', 
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('userProfile');
          router.replace('/');
        }
      }
    ]);
  };

  const menuItems = [
    { icon: 'person-outline', title: 'Edit Profil', route: '#' },
    { icon: 'time-outline', title: 'Riwayat Aktivitas', route: '#' },
    { icon: 'card-outline', title: 'Kartu Anggota Virtual', route: '#' },
    { icon: 'settings-outline', title: 'Pengaturan', route: '#' },
    { icon: 'help-circle-outline', title: 'Pusat Bantuan', route: '#' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <AppHeader title="Profil Saya" />
      
      <ScrollView className="flex-1">
        <View className="bg-white p-6 items-center border-b border-border mb-4">
          <View className="w-24 h-24 rounded-full bg-gray-200 border-4 border-primary/20 items-center justify-center mb-4">
            <Ionicons name="person" size={40} color={colors.textLight} />
          </View>
          <Text className="text-xl font-bold text-text mb-1">
            {userProfile?.nama_lengkap || 'Ahmad Fadillah'}
          </Text>
          <Text className="text-sm text-textLight mb-2">
            {userProfile?.email || (userProfile?.nomor_id_unik ? `nia-${userProfile.nomor_id_unik}@alhasaniyyah.org` : 'ahmad.fadillah@email.com')}
          </Text>
          <View className="flex-row items-center bg-primary/10 px-3 py-1 rounded-full">
            <Ionicons name="location" size={14} color={colors.primary} />
            <Text className="text-primary font-bold text-xs ml-1">
              {userProfile?.alamat_domisili || 'Korda Jakarta'} • Angkatan {userProfile?.angkatan || 2015}
            </Text>
          </View>
        </View>

        <View className="bg-white border-y border-border">
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index}
              className={`flex-row items-center p-4 ${index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <Ionicons name={item.icon as any} size={24} color={colors.textLight} />
              <Text className="flex-1 text-base font-semibold text-text ml-4">{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.border} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          onPress={handleLogout}
          className="mx-4 mt-8 bg-red-50 p-4 rounded-xl flex-row justify-center items-center"
        >
          <Ionicons name="log-out-outline" size={20} color={colors.primaryDark} />
          <Text className="text-red-600 font-bold ml-2">Keluar Aplikasi</Text>
        </TouchableOpacity>

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
