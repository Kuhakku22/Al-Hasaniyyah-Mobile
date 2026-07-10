import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/AppHeader';
import { mockAlumni } from '../../data/mockData';
import { colors } from '../../constants/colors';

export default function AlumniDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const alumni = mockAlumni.find(a => a.id === id);

  if (!alumni) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <AppHeader title="Detail Alumni" showBack />
        <View className="flex-1 justify-center items-center">
          <Text className="text-textLight">Alumni tidak ditemukan</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <AppHeader title="Profil Alumni" showBack />
      
      <ScrollView className="flex-1">
        <View className="bg-white p-6 items-center border-b border-border mb-4">
          <Image 
            source={{ uri: alumni.avatar }} 
            className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white shadow-sm mb-4"
          />
          <Text className="text-2xl font-bold text-text mb-1 text-center">{alumni.name}</Text>
          <Text className="text-base text-primary font-semibold mb-2">{alumni.job}</Text>
          
          <View className="flex-row items-center justify-center mt-2">
            <View className="bg-gray-100 px-3 py-1 rounded-full flex-row items-center mr-2">
              <Ionicons name="school" size={14} color={colors.textLight} />
              <Text className="text-xs text-text ml-1">Angkatan {alumni.batch}</Text>
            </View>
            <View className="bg-gray-100 px-3 py-1 rounded-full flex-row items-center">
              <Ionicons name="location" size={14} color={colors.textLight} />
              <Text className="text-xs text-text ml-1">Korda {alumni.korda}</Text>
            </View>
          </View>
        </View>

        <View className="bg-white p-4 border-y border-border mb-4">
          <Text className="text-lg font-bold text-text mb-4">Informasi Kontak</Text>
          
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-3">
              <Ionicons name="logo-whatsapp" size={20} color="#16a34a" />
            </View>
            <View>
              <Text className="text-xs text-textLight">WhatsApp</Text>
              <Text className="text-base font-semibold text-text">{alumni.contact}</Text>
            </View>
          </View>

          {alumni.business && (
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                <Ionicons name="briefcase" size={20} color="#2563eb" />
              </View>
              <View>
                <Text className="text-xs text-textLight">Usaha / Bisnis</Text>
                <Text className="text-base font-semibold text-text">{alumni.business}</Text>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity 
          className="mx-4 bg-primary py-4 rounded-xl items-center flex-row justify-center mb-8"
        >
          <Ionicons name="chatbubble-ellipses" size={20} color={colors.white} />
          <Text className="text-white font-bold text-lg ml-2">Hubungi Alumni</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
